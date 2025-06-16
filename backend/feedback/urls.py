from django.urls import path
from .views import FeedbackCreateView

urlpatterns = [
    path('feedback/create/', FeedbackCreateView.as_view(), name='feedback-create'),
] 