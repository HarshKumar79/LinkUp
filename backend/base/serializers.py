from rest_framework import serializers
from .models import Myuser, Post

from rest_framework import serializers

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Myuser
        fields = ['username', 'email', 'first_name', 'last_name', 'password']

    def create(self, validated_data):
        # Create a new Myuser instance without saving yet
        user = Myuser(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
        )

        # Set the password using set_password method
        user.set_password(validated_data['password'])

        # Save the user instance
        user.save()

        # Return the created user
        return user


class MyUserProfileSerializer(serializers.ModelSerializer):

    follower_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()

    class Meta:
        model = Myuser
        fields = ['username', 'bio', 'profile_image', 'follower_count', 'following_count']

    def get_follower_count(self, obj):
        return obj.followers.count()
        
    def get_following_count(self, obj):
        return obj.following.count() 
    
class PostSerializer(serializers.ModelSerializer): 

    username = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    formatted_date = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    class Meta:
        model = Post
        fields = ['id','username', 'description', 'formatted_date', 'likes', 'like_count',  'image_url']
    
    def get_username(self, obj):
        return obj.user.username
    
    def get_like_count(self, obj):
        return obj.likes.count()
    
    def get_formatted_date(self, obj):  
        return obj.created_at.strftime("%d %b %y")
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.image.url)
        return None
    
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Myuser
        fields = ['username', 'bio', 'email', 'profile_image', 'first_name', 'last_name']