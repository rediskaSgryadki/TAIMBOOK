from rest_framework import serializers
from .models import Feedback

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = [
            'id',
            'user',
            'email',
            'subject',
            'message',
            'created_at',
        ]
        read_only_fields = ('id', 'user', 'created_at')

    def validate(self, data):
        # Ensure either a user is authenticated or an email is provided
        request = self.context.get('request')
        if request and not request.user.is_authenticated:
            if not data.get('email'):
                raise serializers.ValidationError({'email': 'Email is required for unauthenticated feedback.'})
        return data

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
        # If email is not provided by an authenticated user, set it to None explicitly
        if request and request.user.is_authenticated and not validated_data.get('email'):
            validated_data['email'] = None
        return super().create(validated_data) 