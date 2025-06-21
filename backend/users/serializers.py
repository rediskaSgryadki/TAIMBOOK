from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User  # Changed to import our custom User model
from emotions.models import Emotion
from django.db.models.functions import TruncMonth
from django.db.models import Count
from collections import defaultdict
from django.contrib.auth import authenticate

class UserSerializer(serializers.ModelSerializer):
    profile_photo = serializers.ImageField(required=False, allow_null=True)
    profile_photo_url = serializers.SerializerMethodField()
    monthly_emotions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'has_pin', 'profile_photo', 'profile_photo_url', 'monthly_emotions')
        read_only_fields = ('id', 'has_pin', 'profile_photo_url', 'monthly_emotions')

    def get_profile_photo_url(self, obj):
        if obj.profile_photo:
            # Assuming your Django development server is running on localhost:8000
            # and MEDIA_URL is set to '/media/'
            request = self.context.get('request')
            if request: # Check if request context is available
                return request.build_absolute_uri(obj.profile_photo.url)
            return obj.profile_photo.url # Fallback to relative URL if request is not available
        return None

    def get_monthly_emotions(self, obj):
        emotions = Emotion.objects.filter(user=obj)
        monthly = (
            emotions
            .annotate(month=TruncMonth('timestamp'))
            .values('month', 'emotion_type')
            .annotate(count=Count('id'))
            .order_by('-month')
        )
        stats_by_month = defaultdict(lambda: {'joy': 0, 'sadness': 0, 'neutral': 0})
        for row in monthly:
            month = row['month']
            emotion_type = row['emotion_type']
            count = row['count']
            stats_by_month[month][emotion_type] = count
        result = []
        for month in sorted(stats_by_month.keys(), reverse=True):
            m = month.strftime('%B %Y')
            result.append({
                'month': m,
                'joy': stats_by_month[month]['joy'],
                'sadness': stats_by_month[month]['sadness'],
                'neutral': stats_by_month[month]['neutral'],
            })
        return result

    def update(self, instance, validated_data):
        # Handle profile photo update separately if present
        profile_photo = validated_data.pop('profile_photo', None)
        if profile_photo is not None:
            instance.profile_photo = profile_photo

        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

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
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)  # Changed from username to email
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        user = authenticate(email=email, password=password)
        if not user:
            raise serializers.ValidationError('Неверный email или пароль.')
        attrs['user'] = user
        return attrs

class PinCodeSerializer(serializers.Serializer):
    old_pin = serializers.CharField(max_length=4, min_length=4, required=False)
    pin_code = serializers.CharField(max_length=4, min_length=4, required=True)
    confirm_pin = serializers.CharField(max_length=4, min_length=4, required=True)

    def validate(self, attrs):
        user = self.context['request'].user

        if user.pin_code:
            if 'old_pin' not in attrs or attrs['old_pin'] != user.pin_code:
                raise serializers.ValidationError({"old_pin": "Старый пин-код неверен"})
        elif 'old_pin' in attrs:
            raise serializers.ValidationError({"old_pin": "У вас нет текущего пин-кода для изменения"})

        if attrs['pin_code'] != attrs['confirm_pin']:
            raise serializers.ValidationError({"pin_code": "Пин-коды не совпадают"})
            
        return attrs

class VerifyPinSerializer(serializers.Serializer):
    pin_code = serializers.CharField(max_length=4, min_length=4, required=True)

class DontRemindSerializer(serializers.Serializer):
    remind_pin = serializers.BooleanField(default=False)

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Старый пароль неверен.')
        return value 
