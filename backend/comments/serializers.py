from rest_framework import serializers
from .models import Comment

class CommentSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    class Meta:
        model = Comment
        fields = ['id', 'text', 'created_at', 'author']

    def get_author(self, obj):
        user = obj.user
        photo_url = user.profile_photo.url if hasattr(user, 'profile_photo') and user.profile_photo else None
        request = self.context.get('request')
        if photo_url and request:
            photo_url = request.build_absolute_uri(photo_url)
        return {
            'name': user.username,
            'photo': photo_url
        } 