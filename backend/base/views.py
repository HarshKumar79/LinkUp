from rest_framework.response import Response
from .serializers import MyUserProfileSerializer, UserRegisterSerializer, PostSerializer, CommentSerializer, NotificationSerializer
from .models import Myuser,Post, Comments, Notification
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.shortcuts import get_object_or_404
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def authenticated(request):
    return Response('authenticated!')

@api_view(['POST'])
def register(request):
    serializer = UserRegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors)


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        
        try:
            response = super().post(request, *args, **kwargs)
            tokens = response.data

            access_token = tokens['access']
            refresh_token = tokens['refresh']
            username = request.data['username']

            try:
                user = Myuser.objects.get(username=username)
            except Myuser.DoesNotExist:
                return Response({'error':'user does not exist'})

            res = Response()

            res.data = {"success":True,
                        "user": {
                            "username":user.username,
                            "bio":user.bio,
                            "email":user.email,
                            "first_name": user.first_name,
                            "last_name":user.last_name
                            }
                        }

            res.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )

            res.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )

            return res
        
        except:
            return Response({'success':False})


class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        try:

            refresh_token = request.COOKIES.get('refresh_token')
            request.data['refresh'] = refresh_token
            
            response= super().post(request, *args, **kwargs)
            tokens = response.data

            access_token = tokens['access']

            res = Response()

            res.data = {"success":True}

            res.set_cookie(
                key ='access_token',
                value=access_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )
            
            return res
        except:
            return Response({"success":False})



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile_data(request, pk):
    try:
        user = Myuser.objects.get(username=pk)
        
        serializer = MyUserProfileSerializer(user, many=False)
        
        following = False

        if request.user in user.followers.all():
            following = True

        return Response({**serializer.data, 'is_our_profile': request.user.username == user.username, 'following':following})
    
    except Myuser.DoesNotExist:
        # Handle the case where the user does not exist
        return Response({'error': 'User does not exist'}, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        # Handle any other unexpected errors
        return Response({'error': f'Error getting user data: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggleFollow(request):
    try:
        if 'username' not in request.data:
            return Response({'error': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        my_user = Myuser.objects.get(username=request.user.username)
        user_to_follow = Myuser.objects.get(username=request.data['username'])

        if my_user in user_to_follow.followers.all():
            user_to_follow.followers.remove(my_user)
            return Response({'now_following': False}, status=status.HTTP_200_OK)
        else:
            user_to_follow.followers.add(my_user)
            return Response({'now_following': True}, status=status.HTTP_200_OK)

    except Myuser.DoesNotExist:
        return Response({'error': 'User does not exist'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Error following user: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_users_posts(request, pk):

    try:
        user = Myuser.objects.get(username=pk)
        my_user = Myuser.objects.get(username=request.user.username)
    except Myuser.DoesNotExist:
        return Response({'error':'user does not exist'})
    
    posts = user.posts.all().order_by('-created_at')

    serializer = PostSerializer(posts, many=True, context={'request': request})

    data = []

    for post in serializer.data:
        new_post = {}

        if my_user.username not in post['likes']:
            new_post =  {**post, 'liked':True}
        else:
            new_post = {**post, 'liked':False}
        data.append(new_post)

    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggleLike(request):
    post_id = request.data.get('id')
    post = Post.objects.get(id=post_id)
    user = request.user

    if user in post.likes.all():
        post.likes.remove(user)
        now_liked = False
    else:
        post.likes.add(user)
        now_liked = True
        # Notify post owner
        notification = Notification(
            user=post.user,
            message=f"{user.username} liked your post",
            data={'post_id': post_id}
        )
        notification.save()
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'user_{post.user.username}',
            {
                'type': 'send_notification',
                'message': notification.message,
                'data': notification.data,
                'id': notification.id
            }
        )
    return Response({'now_liked': now_liked})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_post(request):
    try:
        data = request.data

        description = data.get('description', '').strip()

        image = request.FILES.get('image')

        if not description:
            return Response({"error": "Description is required."}, status=400)

        if len(description) < 5:  # Optional: minimum length check for description
            return Response({"error": "Description must be at least 5 characters long."}, status=400)

        try:
            user = Myuser.objects.get(username=request.user.username)
        except Myuser.DoesNotExist:
            return Response({'error': 'User not found.'}, status=404)
        
        # Create the post
        post = Post.objects.create(
            user=user,
            description=description,
            image=image  # Assuming your model has an 'image' field
        )

        # Serialize the post and return response
        serializer = PostSerializer(post, context={'request': request})

        return Response(serializer.data, status=201)  # Return a 201 status for successful creation
    
    except Exception as e:
        return Response({"error": f"Error creating post: {str(e)}"}, status=500)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_posts(request):

    try:
        my_user = Myuser.objects.get(username=request.user.username)
    except Myuser.DoesNotExist:
        return Response({'error':'user does not exist'})

    posts = Post.objects.all().order_by('-created_at')

    paginator = PageNumberPagination()
    paginator.page_size = 10

    result_page = paginator.paginate_queryset(posts, request)
    serializer = PostSerializer(result_page, many=True, context={'request': request})

    data = []

    for post in serializer.data:
        new_post = {}

        if my_user.username in post['likes']:
            new_post = {**post, 'liked':True}
        else:
            new_post = {**post, 'liked':False}
        data.append(new_post)

    return paginator.get_paginated_response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_users(request):
    query = request.query_params.get('query', '')
    users = Myuser.objects.filter(username__icontains=query)
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])  # Image upload के लिए जरूरी
def update_user_details(request):
    user = request.user  # सीधे authenticated user का उपयोग करें
    data = request.data.copy()  # QueryDict को mutable बनाएं
    
    # File upload handle करने के लिए
    if 'profile_image' in request.FILES:
        data['profile_image'] = request.FILES['profile_image']

    serializer = UserSerializer(
        instance=user, 
        data=data, 
        partial=True,
        context={'request': request}  # Image URL पूरा बनाने के लिए
    )

    if serializer.is_valid():
        serializer.save()
        return Response({
            **serializer.data,
            "success": True,
            "message": "Profile updated successfully"
        }, status=200)
    
    return Response({
        "errors": serializer.errors,
        "success": False,
        "message": "Update failed"
    }, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    
    try:
        res = Response()
        res.data = {"success":True}
        res.delete_cookie('access_token', path='/', samesite='None')
        res.delete_cookie('refresh_token', path='/', samesite='None')
        return res

    except:
        return Response({"success":False})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_post(request, post_id):
    try:
        post = Post.objects.filter(id=post_id).first()

        if not post:
            return Response({'error': f'Post with ID {post_id} not found'}, status=status.HTTP_404_NOT_FOUND)

        if post.user != request.user:
            return Response({'error': 'You can only delete your own posts'}, status=status.HTTP_403_FORBIDDEN)

        post.delete()
        return Response({'success': True, 'message': f'Post with ID {post_id} deleted successfully'}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_comment(request):
    post_id = request.data.get('post_id')
    comment_text = request.data.get('comment')
    parent_id = request.data.get('parent_id')
    try:
        post = Post.objects.get(id=post_id)
        comment = Comments(
            user=request.user,
            post=post,
            comment=comment_text,
            parent_id=parent_id if parent_id else None
        )
        comment.save()

        # Create and send notification
        notification = Notification(
            user=post.user,
            message=f"{request.user.username} commented on your post: '{comment_text[:50]}'",
            data={'post_id': post_id, 'comment_id': comment.id}
        )
        notification.save()

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'user_{post.user.username}',
            {
                'type': 'send_notification',
                'message': notification.message,
                'data': notification.data,
                'id': notification.id
            }
        )

        serializer = CommentSerializer(comment, context={'request': request})
        return Response(serializer.data)
    except Post.DoesNotExist:
        return Response({'error': 'Post not found'}, status=404)
    
@api_view(['GET'])
def get_comments(request, post_id):
    try:
        comments = Comments.objects.filter(post_id=post_id, parent__isnull=True).prefetch_related('replies')
        serializer = CommentSerializer(comments, many=True, context={'request': request})
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
    
@api_view(['GET'])
@permission_classes([AllowAny])
def get_post(request, post_id):  # Removed @permission_classes([IsAuthenticated])
    try:
        post = Post.objects.get(id=post_id)
        serializer = PostSerializer(post, context={'request': request})
        data = serializer.data
        # Add 'liked' field only if the user is authenticated
        if request.user.is_authenticated:
            try:
                my_user = Myuser.objects.get(username=request.user.username)
                data['liked'] = my_user.username in data['likes']
            except Myuser.DoesNotExist:
                data['liked'] = False  # Fallback if user doesn’t exist (shouldn’t happen)
        else:
            data['liked'] = False  # Default for unauthenticated users
        return Response(data)
    except Post.DoesNotExist:
        return Response({'error': 'Post not found'}, status=404)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggleLikeComment(request, comment_id):  # Fixed typo in URL name
    try:
        comment = Comments.objects.get(id=comment_id)
        if request.user in comment.likes.all():
            comment.likes.remove(request.user)
            liked = False
        else:
            comment.likes.add(request.user)
            liked = True
        return Response({'liked': liked, 'comment_like_count': comment.likes.count()})
    except Comments.DoesNotExist:
        return Response({'error': 'Comment not found'}, status=404)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)