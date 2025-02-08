from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import get_user_profile_data,CustomTokenObtainPairView,CustomTokenRefreshView, register, authenticated, toggleFollow, get_users_posts, toggleLike, create_post, get_posts, search_users, update_user_details, logout, delete_post



urlpatterns = [
    path('user_data/<str:pk>/', get_user_profile_data),
    path('token/', CustomTokenObtainPairView.as_view()),
    path('token/refresh/', CustomTokenRefreshView.as_view()),
    path('register/', register),
    path('authenticated/', authenticated),
    path('toggle_follow/', toggleFollow),
    path('posts/<str:pk>/', get_users_posts),
    path('toggle_like/',toggleLike),
    path('create_post/',create_post),
    path('get_posts/',get_posts),
    path('search/',search_users),
    path('update_user/',update_user_details),
    path('logout/',logout),
    path('delete_post/<int:post_id>/', delete_post)


] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
