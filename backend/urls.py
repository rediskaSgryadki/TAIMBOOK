from django.urls import path
from reviews.views import ReviewListCreate

urlpatterns = [
    path('api/reviews/', ReviewListCreate.as_view(), name='review-list-create'),
] 