from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.
class Myuser(AbstractUser):
    username = models.CharField(max_length=50, unique=True, primary_key=True)
    bio = models.CharField(max_length=500)
    profile_image = models.ImageField(upload_to='profile_image/', blank=True, null=True)
    followers = models.ManyToManyField('self', symmetrical=False, related_name='following', blank=True)

    def __str__(self):
        return self.username 
    
class Post(models.Model):
    user = models.ForeignKey(Myuser, on_delete=models.CASCADE, related_name='posts')
    description = models.CharField(max_length=400)
    created_at = models.DateField(auto_now_add=True)
    likes = models.ManyToManyField(Myuser, related_name='post_likes', blank=True)
    image = models.ImageField(upload_to='post_images/', null=True, blank=True)  # Add the ImageField

class Comments(models.Model):
    user = models.ForeignKey(Myuser, on_delete=models.CASCADE, related_name='comments')
    comment = models.CharField(max_length=400)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    created_at = models.DateField(auto_now_add=True)
    likes = models.ManyToManyField(Myuser, related_name='comment_likes', blank=True)