from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Emotion
from .serializers import EmotionSerializer
from django.utils import timezone
from datetime import timedelta
from users.models import User  # Импортируем пользовательскую модель напрямую
import logging
import traceback

# Настройка логирования
logger = logging.getLogger(__name__)

# Create your views here.

class EmotionViewSet(viewsets.ModelViewSet):
    queryset = Emotion.objects.all()
    serializer_class = EmotionSerializer

    def get_queryset(self):
        user = self.request.user
        return Emotion.objects.filter(user=user)

    def create(self, request, *args, **kwargs):
        try:
            # Логирование информации о пользователе
            logger.info(f"Попытка создать эмоцию. Пользователь: {request.user}, ID: {request.user.id}, Аутентифицирован: {request.user.is_authenticated}")
            
            # Получаем все пользователей из базы и логируем их ID
            all_users = User.objects.all()
            logger.info(f"Пользователи в базе: {', '.join([str(u.id) for u in all_users])}")
            
            user = request.user
            emotion_type = request.data.get('emotion_type')
            
            logger.info(f"Тип эмоции: {emotion_type}")
            
            # Проверка существования пользователя
            try:
                # Проверяем, что пользователь существует в базе - используем пользовательскую модель User
                user_exists = User.objects.filter(id=user.id).exists()
                logger.info(f"Пользователь существует в базе: {user_exists}")
                
                if not user_exists:
                    logger.warning(f"Пользователь с ID {user.id} не найден в базе данных")
                    return Response({
                        'error': 'Пользователь не найден',
                        'user_id': user.id,
                        'available_user_ids': [u.id for u in User.objects.all()[:10]]
                    }, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                logger.error(f"Ошибка при проверке пользователя: {str(e)}")
                logger.error(traceback.format_exc())
                return Response({'error': f'Ошибка при проверке пользователя: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            if emotion_type not in ['joy', 'sadness', 'neutral']:
                logger.warning(f"Недопустимый тип эмоции: {emotion_type}")
                return Response({'error': 'Invalid emotion type'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                # Логирование перед созданием записи
                logger.info(f"Создаем запись эмоции для пользователя {user.id}")
                
                # Получаем явно пользователя из модели User
                user_obj = User.objects.get(id=user.id)
                logger.info(f"Получен пользователь: ID={user_obj.id}, username={user_obj.username}")
                
                # Создаем запись с явно указанным пользователем
                emotion = Emotion(user=user_obj, emotion_type=emotion_type)
                emotion.save()
                logger.info(f"Запись эмоции создана: ID {emotion.id}")
                
                serializer = self.get_serializer(emotion)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                logger.error(f"Ошибка при сохранении эмоции: {str(e)}")
                logger.error(traceback.format_exc())
                return Response({
                    'error': f'Ошибка при сохранении эмоции: {str(e)}',
                    'user_id': user.id,
                    'emotion_type': emotion_type,
                    'traceback': traceback.format_exc()
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            logger.error(f"Непредвиденная ошибка: {str(e)}")
            logger.error(traceback.format_exc())
            return Response({
                'error': f'Произошла непредвиденная ошибка: {str(e)}',
                'traceback': traceback.format_exc()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_emotion_stats(self, request, period):
        user = request.user
        now = timezone.now()
        
        if period == 'day':
            start_date = now - timedelta(days=1)
        elif period == 'week':
            start_date = now - timedelta(weeks=1)
        else:  # month
            start_date = now - timedelta(days=30)
            
        emotions = Emotion.objects.filter(user=user, timestamp__gte=start_date)
        
        stats = {
            'joy': emotions.filter(emotion_type='joy').count(),
            'sadness': emotions.filter(emotion_type='sadness').count(),
            'neutral': emotions.filter(emotion_type='neutral').count()
        }
        
        return Response(stats)
