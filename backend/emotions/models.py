from django.db import models
from django.conf import settings
from users.models import User  # Импортируем пользовательскую модель напрямую

class Emotion(models.Model):
    EMOTION_CHOICES = [
        ('joy', 'Радость'),
        ('sadness', 'Грусть'),
        ('neutral', 'Нейтральный'),
    ]
    # Используем явную ссылку на модель User вместо settings.AUTH_USER_MODEL
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='emotions')
    emotion_type = models.CharField(max_length=10, choices=EMOTION_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.emotion_type} at {self.timestamp}"

    class Meta:
        ordering = ['-timestamp']
