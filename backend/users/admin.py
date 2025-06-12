from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User
from django.utils.html import format_html
from emotions.models import Emotion
from django.utils import timezone
from collections import defaultdict
from django.db.models.functions import TruncMonth
from django.db.models import Count

# Регистрируем кастомную модель
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    def profile_photo_tag(self, obj):
        if obj.profile_photo:
            return format_html('<img src="{}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;" />', obj.profile_photo.url)
        return ""
    profile_photo_tag.short_description = 'Фото'

    def monthly_emotions(self, obj):
        # Получаем все эмоции пользователя
        emotions = Emotion.objects.filter(user=obj)
        # Группируем по месяцу и типу эмоции
        monthly = (
            emotions
            .annotate(month=TruncMonth('timestamp'))
            .values('month', 'emotion_type')
            .annotate(count=Count('id'))
            .order_by('-month')
        )
        # Собираем данные по месяцам
        stats_by_month = defaultdict(lambda: {'joy': 0, 'sadness': 0, 'neutral': 0})
        for row in monthly:
            month = row['month']
            emotion_type = row['emotion_type']
            count = row['count']
            stats_by_month[month][emotion_type] = count
        # Формируем HTML-таблицу
        html = '<table style="border-collapse:collapse;width:100%;margin-top:10px;">'
        html += '<tr><th style="border:1px solid #ccc;padding:4px;">Месяц</th><th style="border:1px solid #ccc;padding:4px;">Радость</th><th style="border:1px solid #ccc;padding:4px;">Грусть</th><th style="border:1px solid #ccc;padding:4px;">Нейтральный</th></tr>'
        for month in sorted(stats_by_month.keys(), reverse=True):
            m = month.strftime('%B %Y')
            joy = stats_by_month[month]['joy']
            sadness = stats_by_month[month]['sadness']
            neutral = stats_by_month[month]['neutral']
            html += f'<tr><td style="border:1px solid #ccc;padding:4px;">{m}</td><td style="border:1px solid #ccc;padding:4px;">{joy}</td><td style="border:1px solid #ccc;padding:4px;">{sadness}</td><td style="border:1px solid #ccc;padding:4px;">{neutral}</td></tr>'
        html += '</table>'
        return format_html(html)
    monthly_emotions.short_description = 'Эмоции по месяцам'

    list_display = ('username', 'email', 'is_staff', 'is_active', 'pin_code', 'profile_photo_tag')
    list_filter = ('is_staff', 'is_active',)
    search_fields = ('username', 'email',)
    ordering = ('username',)
    
    readonly_fields = ('profile_photo_tag', 'monthly_emotions')
    fieldsets = (
        (None, {'fields': ('username', 'password', 'profile_photo', 'monthly_emotions')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'pin_code', 'remind_pin')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'pin_code', 'remind_pin', 'profile_photo'),
        }),
    )