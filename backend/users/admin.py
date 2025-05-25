from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User
from django.utils.html import format_html

# Регистрируем кастомную модель
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    def profile_photo_tag(self, obj):
        if obj.profile_photo:
            return format_html('<img src="{}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;" />', obj.profile_photo.url)
        return ""
    profile_photo_tag.short_description = 'Фото'

    list_display = ('username', 'email', 'is_staff', 'is_active', 'pin_code', 'profile_photo_tag')
    list_filter = ('is_staff', 'is_active',)
    search_fields = ('username', 'email',)
    ordering = ('username',)
    
    fieldsets = (
        (None, {'fields': ('username', 'password', 'profile_photo')}),
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