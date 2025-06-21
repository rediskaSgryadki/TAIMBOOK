from django.urls import path
from .views import CommentListCreateAPIView

urlpatterns = [
    path('<int:entry_id>/', CommentListCreateAPIView.as_view(), name='comment-list-create'),
] 