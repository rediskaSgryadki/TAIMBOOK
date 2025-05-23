from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmotionViewSet

router = DefaultRouter()
router.register(r'', EmotionViewSet, basename='emotions')

urlpatterns = [
    path('stats/<str:period>/', EmotionViewSet.as_view({'get': 'get_emotion_stats'})),
    path('', include(router.urls)),
]
