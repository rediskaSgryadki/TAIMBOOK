from django.shortcuts import render
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer, PinCodeSerializer, VerifyPinSerializer, DontRemindSerializer
from .models import User

# Create your views here.

class UserRegistrationView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            try:
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
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            user = authenticate(email=email, password=password)
            
            if user:
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
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
        serializer = PinCodeSerializer(data=request.data)
        if serializer.is_valid():
            request.user.pin_code = serializer.validated_data['pin_code']
            request.user.save()
            return Response({'status': 'success'})
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
