from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'author', 'text', 'rating', 'created_at']
        extra_kwargs = {
            'author': {'required': False, 'allow_blank': True},
            'text': {'required': True},
            'rating': {'required': True}
        }

    def validate_rating(self, value):
        if not isinstance(value, int) or not 1 <= value <= 5:
            raise serializers.ValidationError("Рейтинг должен быть целым числом от 1 до 5")
        return value

    def validate(self, data):
        if not data.get('text', '').strip():
            raise serializers.ValidationError({"text": "Текст отзыва не может быть пустым"})
        return data