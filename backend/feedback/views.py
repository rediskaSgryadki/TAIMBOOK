from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .mailgun import send_feedback_email

class FeedbackView(APIView):
    def post(self, request):
        email = request.data.get('email', '')
        message = request.data.get('message', '')
        if not message:
            return Response({'error': 'Message is required.'}, status=status.HTTP_400_BAD_REQUEST)
        success = send_feedback_email(email, message)
        if success:
            return Response({'success': True})
        else:
            return Response({'error': 'Failed to send email.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 