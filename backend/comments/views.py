from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Comment
from entries.models import Entry
from users.models import User
from django.shortcuts import get_object_or_404

from rest_framework import serializers
from .serializers import CommentSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny

class CommentSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    class Meta:
        model = Comment
        fields = ['id', 'text', 'created_at', 'author']

    def get_author(self, obj):
        user = obj.user
        photo_url = user.profile_photo.url if hasattr(user, 'profile_photo') and user.profile_photo else None
        request = self.context.get('request')
        if photo_url and request:
            photo_url = request.build_absolute_uri(photo_url)
        return {
            'name': user.username,
            'photo': photo_url
        }

class CommentListCreateAPIView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    def get(self, request, entry_id):
        entry = get_object_or_404(Entry, id=entry_id)
        comments = entry.comments.select_related('user').all()
        serializer = CommentSerializer(comments, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request, entry_id):
        entry = get_object_or_404(Entry, id=entry_id)
        serializer = CommentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            Comment.objects.create(
                user=request.user,
                entry=entry,
                text=serializer.validated_data['text']
            )
            return self.get(request, entry_id)
        return Response(serializer.errors, status=400)
