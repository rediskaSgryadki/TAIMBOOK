from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EntryViewSet, CoverListView

router = DefaultRouter()
router.register(r'entries', EntryViewSet, basename='entry')

urlpatterns = [
    path('', include(router.urls)),
    path('covers/', CoverListView.as_view(), name='cover-list'),
]
