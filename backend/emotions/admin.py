from django.contrib import admin
from .models import Emotion

@admin.register(Emotion)
class EmotionAdmin(admin.ModelAdmin):
    list_display = ('user', 'emotion_type', 'timestamp')
    list_filter = ('emotion_type', 'timestamp')
    search_fields = ('user__username',)
    ordering = ('-timestamp',)
    date_hierarchy = 'timestamp'
