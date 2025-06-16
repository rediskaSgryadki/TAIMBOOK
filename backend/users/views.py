from django.shortcuts import render
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer, PinCodeSerializer, VerifyPinSerializer, DontRemindSerializer, ChangePasswordSerializer
from .models import User
from rest_framework.decorators import api_view, permission_classes

# Create your views here.

class UserRegistrationView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'has_pin': user.has_pin(),
            },
            'token': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

class UserLoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'has_pin': user.has_pin(),
            },
            'token': str(refresh.access_token),
        })

class UserMeView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class SetPinView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PinCodeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            user.pin_code = serializer.validated_data['pin_code']
            user.save()
            return Response({'message': 'Пин-код успешно изменен.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyPinView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = VerifyPinSerializer(data=request.data)
        if serializer.is_valid():
            if request.user.pin_code == serializer.validated_data['pin_code']:
                return Response({'status': 'success'})
            return Response({'error': 'Invalid pin code'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DontRemindView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = DontRemindSerializer(data=request.data)
        if serializer.is_valid():
            request.user.remind_pin = serializer.validated_data['remind_pin']
            request.user.save()
            return Response({'status': 'success'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'status': 'success'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_by_username(request):
    username = request.query_params.get('username')
    if not username:
        return Response({'detail': 'username parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = User.objects.get(username=username)
        serializer = UserSerializer(user, context={'request': request})
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response({'detail': f'User with username {username} not found'}, status=status.HTTP_404_NOT_FOUND)
