from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/emotions/', include('emotions.urls')),
    path('api/users/', include('users.urls')),
    path('api/', include('entries.urls')),
    path('api/reviews/', include('reviews.urls')),
    path('api/like/', include('like.urls')),
    path('api/comments/', include('comments.urls')),
    path('api/feedback/', include('feedback.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
