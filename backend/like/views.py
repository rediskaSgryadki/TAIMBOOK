from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Like
from .serializers import LikeSerializer
from entries.models import Entry
from rest_framework.permissions import IsAuthenticated, AllowAny

# Create your views here.

class LikeToggleAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, entry_id):
        entry = get_object_or_404(Entry, id=entry_id)
        like, created = Like.objects.get_or_create(user=request.user, entry=entry)
        if not created:
            like.delete()
            return Response({'liked': False, 'count': entry.likes.count()})
        return Response({'liked': True, 'count': entry.likes.count()})

class LikeCountAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, entry_id):
        entry = get_object_or_404(Entry, id=entry_id)
        return Response({'count': entry.likes.count()})
