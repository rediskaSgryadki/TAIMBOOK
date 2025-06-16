from rest_framework import generics, permissions
from .models import Feedback
from .serializers import FeedbackSerializer

class FeedbackCreateView(generics.CreateAPIView):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.AllowAny] # Allow unauthenticated feedback

    def perform_create(self, serializer):
        # If user is authenticated, assign them to the feedback
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save() 