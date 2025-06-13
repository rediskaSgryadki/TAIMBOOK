from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from .models import Entry
from .serializers import EntrySerializer
from users.models import User  # Импортируем кастомную модель User
import logging
import traceback
from datetime import datetime
from django.db.models import Q
import os
from django.conf import settings


logger = logging.getLogger(__name__)

# Create your views here.

class EntryViewSet(viewsets.ModelViewSet):
    serializer_class = EntrySerializer

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'public' or self.action == 'public_by_user':
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Entry.objects.filter(user=self.request.user).order_by('-created_at')
        return Entry.objects.none()

    @action(detail=False, methods=['get'])
    def public(self, request):
        """
        Возвращает все публичные записи всех пользователей.
        """
        try:
            entries = Entry.objects.filter(is_public=True).select_related('user').order_by('-created_at')
            serializer = self.get_serializer(entries, many=True, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error fetching all public entries: {str(e)}")
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_create(self, serializer):
        try:
            # Проверяем, что пользователь существует в базе данных
            user_id = self.request.user.id
            logger.info(f"Creating entry for user: {self.request.user.username}, ID: {user_id}")
            
            try:
                # Получаем объект пользователя напрямую из модели User
                user = User.objects.get(id=user_id)
                logger.info(f"Found user for create entry: {user.username}, ID: {user.id}")
                serializer.save(user=user)
            except User.DoesNotExist:
                logger.error(f"User with ID {user_id} does not exist")
                raise ValueError(f"User with ID {user_id} does not exist")
        except Exception as e:
            logger.error(f"Error in perform_create: {str(e)}")
            logger.error(traceback.format_exc())
            raise

    def create(self, request, *args, **kwargs):
        try:
            logger.debug(f"Request data: {request.data}")
            logger.info(f"Date from request: {request.data.get('date')}")
            logger.info(f"User creating entry: {request.user.username}, ID: {request.user.id}")
            
            # Получаем всех пользователей из базы (для диагностики)
            all_users = User.objects.all()
            logger.info(f"All users in database: {', '.join([f'{u.id}({u.username})' for u in all_users[:10]])}")
            
            # Создаем копию данных для модификации
            data = request.data.copy()
            
            # Преобразуем дату в правильный формат
            date_str = data.get('date')
            if date_str:
                try:
                    date = datetime.strptime(date_str, '%Y-%m-%d').date()
                    data['date'] = date
                    logger.info(f"Parsed date for create: {date}")
                except ValueError:
                    return Response(
                        {"detail": "Invalid date format. Use YYYY-MM-DD"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Создаем сериализатор с обновленными данными
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            
            try:
                self.perform_create(serializer)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except ValueError as ve:
                logger.error(f"Value error in create: {str(ve)}")
                return Response(
                    {"detail": str(ve)},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
        except Exception as e:
            logger.error(f"Error in create: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {
                    "detail": str(e),
                    "traceback": traceback.format_exc(),
                    "user_id": request.user.id if request.user else None
                }, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def last(self, request):
        try:
            last_entry = self.get_queryset().first()
            if last_entry:
                serializer = self.get_serializer(last_entry)
                return Response(serializer.data)
            return Response(None)
        except Exception as e:
            logger.error(f"Error fetching last entry: {str(e)}")
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def by_date(self, request):
        try:
            date_str = request.query_params.get('date')
            logger.info(f"Received date parameter: {date_str}")
            
            if not date_str:
                return Response(
                    {"detail": "Date parameter is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                date = datetime.strptime(date_str, '%Y-%m-%d').date()
                logger.info(f"Parsed date: {date}")
            except ValueError:
                return Response(
                    {"detail": "Invalid date format. Use YYYY-MM-DD"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            entries = self.get_queryset().filter(
                Q(date=date) | Q(created_at__date=date)
            ).order_by('-created_at')
            
            logger.info(f"Found {entries.count()} entries for date {date}")
            logger.info(f"Query: {entries.query}")

            serializer = self.get_serializer(entries, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error fetching entries by date: {str(e)}")
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def public_by_user(self, request):
        try:
            user_id = request.query_params.get('user_id')
            if not user_id:
                return Response(
                    {"detail": "user_id parameter is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response(
                    {"detail": f"User with ID {user_id} does not exist"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Get only public entries for the specified user
            entries = Entry.objects.filter(user=user, is_public=True).order_by('-created_at')
            logger.info(f"Found {entries.count()} public entries for user {user.username}")
            
            serializer = self.get_serializer(entries, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error fetching public entries: {str(e)}")
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CoverListView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        covers_dir = os.path.join(settings.MEDIA_ROOT, 'covers')
        covers = []
        if os.path.exists(covers_dir):
            for fname in os.listdir(covers_dir):
                if fname.lower().endswith(('.jpg', '.jpeg', '.png')):
                    covers.append(f'/media/covers/{fname}')
        return Response(covers)
