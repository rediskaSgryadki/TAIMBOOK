from django.contrib import admin
from .models import Review

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('author', 'rating', 'created_at')
    search_fields = ('author', 'text')
    list_filter = ('rating', 'created_at')