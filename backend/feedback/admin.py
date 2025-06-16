from django.contrib import admin
from .models import Feedback

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('user', 'email', 'subject', 'created_at')
    search_fields = ('email', 'subject', 'message')
    list_filter = ('created_at',)
    readonly_fields = ('user', 'email', 'subject', 'message', 'created_at') 