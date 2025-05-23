from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import UserRegistrationView, UserLoginView, UserMeView, SetPinView, VerifyPinView, DontRemindView

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', UserMeView.as_view(), name='me'),
    path('set-pin/', SetPinView.as_view(), name='set-pin'),
    path('verify-pin/', VerifyPinView.as_view(), name='verify-pin'),
    path('dont-remind/', DontRemindView.as_view(), name='dont-remind'),
] 