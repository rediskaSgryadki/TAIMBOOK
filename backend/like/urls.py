from django.urls import path
from .views import LikeToggleAPIView, LikeCountAPIView

urlpatterns = [
    path('<int:entry_id>/toggle/', LikeToggleAPIView.as_view(), name='like-toggle'),
    path('<int:entry_id>/count/', LikeCountAPIView.as_view(), name='like-count'),
] 