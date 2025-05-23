from rest_framework import generics, permissions
from .models import Review
from .serializers import ReviewSerializer
import logging

logger = logging.getLogger(__name__)

class ReviewListCreateView(generics.ListCreateAPIView):
    queryset = Review.objects.order_by('-created_at')
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        try:
            logger.info('Creating new review with data: %s', self.request.data)
            # Убедимся, что author не None
            author = self.request.data.get('author', '').strip() or 'Аноним'
            serializer.save(author=author)
            logger.info('Review created successfully')
        except Exception as e:
            logger.error('Error creating review: %s', str(e), exc_info=True)
            raise serializers.ValidationError(str(e))

class ReviewListCreate(generics.ListCreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        try:
            logger.info('Creating new review with data: %s', self.request.data)
            instance = serializer.save()
            logger.info('Review created successfully: %s', instance.id)
        except Exception as e:
            logger.error('Error creating review: %s', str(e), exc_info=True)
            raise