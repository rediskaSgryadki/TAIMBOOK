from django.urls import path, include
from .views import EmotionViewSet

urlpatterns = [
    path('', EmotionViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('stats/<str:period>/', EmotionViewSet.as_view({'get': 'get_emotion_stats'})),
    path('stats/by_month/', EmotionViewSet.as_view({'get': 'get_monthly_stats'})),
    path('stats/current_month/', EmotionViewSet.as_view({'get': 'get_current_month_stats'})),
    path('stats/all_time/', EmotionViewSet.as_view({'get': 'get_all_time_stats'})),
    path('stats/last_month/', EmotionViewSet.as_view({'get': 'get_last_month_stats'})),
]
