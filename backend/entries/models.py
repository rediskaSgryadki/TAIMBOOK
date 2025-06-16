from django.db import models
from users.models import User  # Импортируем пользовательскую модель напрямую

class Entry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='entries')
    title = models.CharField(max_length=200, default='Без названия')
    content = models.TextField(default='')  # Простой текст для поиска
    text_color = models.CharField(max_length=7, default='#000000')  # Цвет текста в формате HEX
    font_size = models.CharField(max_length=10, default='16px')  # Размер шрифта
    text_align = models.CharField(max_length=10, default='left')  # Выравнивание текста
    is_bold = models.BooleanField(default=False)  # Жирный текст
    is_underline = models.BooleanField(default=False)  # Подчеркнутый текст
    is_strikethrough = models.BooleanField(default=False)  # Зачеркнутый текст
    list_type = models.CharField(max_length=10, null=True, blank=True)  # Тип списка (unordered/ordered)
    location = models.JSONField(null=True, blank=True)  # Местоположение в формате JSON
    cover_image = models.ImageField(upload_to='entries/covers/', null=True, blank=True)
    date = models.DateField(null=True, blank=True)  # Дата записи
    hashtags = models.TextField(null=True, blank=True)  # Хэштеги через запятую
    is_public = models.BooleanField(default=False)  # Флаг публичности записи
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Entries'

    def __str__(self):
        return f"{self.title} - {self.user.username}"
