from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User  # Changed to import our custom User model

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'has_pin')
        read_only_fields = ('id', 'has_pin')

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name')
        extra_kwargs = {
            'password': {'write_only': True},
            'password2': {'write_only': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "This email is already in use."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)  # Changed from username to email
    password = serializers.CharField(required=True, write_only=True)

class PinCodeSerializer(serializers.Serializer):
    pin_code = serializers.CharField(max_length=4, min_length=4, required=True)
    confirm_pin = serializers.CharField(max_length=4, min_length=4, required=True)

    def validate(self, attrs):
        if attrs['pin_code'] != attrs['confirm_pin']:
            raise serializers.ValidationError({"pin_code": "Pin codes do not match"})
        return attrs

class VerifyPinSerializer(serializers.Serializer):
    pin_code = serializers.CharField(max_length=4, min_length=4, required=True)

class DontRemindSerializer(serializers.Serializer):
    remind_pin = serializers.BooleanField(default=False) 