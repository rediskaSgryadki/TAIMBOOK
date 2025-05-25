from rest_framework import serializers
from .models import Entry
from emotions.models import Emotion
import logging

logger = logging.getLogger(__name__)

class EntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Entry
        fields = [
            'id', 'title', 'content', 'html_content', 'text_color', 
            'font_size', 'text_align', 'is_bold', 'is_underline', 
            'is_strikethrough', 'list_type', 'location', 'cover_image', 
            'date', 'created_at', 'updated_at', 'hashtags', 'is_public'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        try:
            logger.debug(f"Entry data: {validated_data}")
            # Remove html_content from validated_data since it's just a source field
            validated_data.pop('html_content', None)
            return Entry.objects.create(**validated_data)
        except Exception as e:
            logger.error(f"Error creating entry: {str(e)}")
            raise serializers.ValidationError(f"Error creating entry: {str(e)}")

    def update(self, instance, validated_data):
        # Handle cover image update separately if present
        cover_image = validated_data.pop('cover_image', None)
        if cover_image is not None:
            instance.cover_image = cover_image

        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Convert content to HTML if it's not already
        if 'html_content' in representation and not representation['html_content']:
            representation['html_content'] = instance.content
        return representation

class EmotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Emotion
        fields = ['id', 'emotion_type', 'timestamp']
