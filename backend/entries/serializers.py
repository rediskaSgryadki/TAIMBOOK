from rest_framework import serializers
from .models import Entry
import logging

logger = logging.getLogger(__name__)

class EntrySerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = Entry
        fields = [
            'id', 'title', 'content', 'text_color',
            'font_size', 'text_align', 'is_bold', 'is_underline', 
            'is_strikethrough', 'list_type', 'location', 'cover_image', 
            'date', 'created_at', 'updated_at', 'hashtags', 'is_public',
            'author',
            'comments_count',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_author(self, obj):
        user = obj.user
        request = self.context.get('request')
        photo_url = None
        if user.profile_photo:
            if request:
                photo_url = request.build_absolute_uri(user.profile_photo.url)
            else:
                photo_url = user.profile_photo.url
        return {
            'id': user.id,
            'username': user.username,
            'name': user.username,
            'photo': photo_url
        }

    def get_comments_count(self, obj):
        return obj.comments.count()

    def create(self, validated_data):
        try:
            logger.debug(f"Entry create validated_data: {validated_data}")
            return Entry.objects.create(**validated_data)
        except Exception as e:
            logger.error(f"Error creating entry: {str(e)}")
            raise serializers.ValidationError(f"Error creating entry: {str(e)}")

    def update(self, instance, validated_data):
        cover_image = validated_data.pop('cover_image', None)
        if cover_image is not None:
            instance.cover_image = cover_image

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        # ❗ УДАЛИ вот это, если хочешь, чтобы `content` возвращался на фронт
        # representation.pop('content', None)

        return representation
