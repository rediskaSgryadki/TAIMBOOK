from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Review(models.Model):
    author = models.CharField(max_length=100, blank=True, default='Аноним')
    text = models.TextField()
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review by {self.author} (Rating: {self.rating})"

    def display_name(self):
        return self.author

    class Meta:
        ordering = ['-created_at']