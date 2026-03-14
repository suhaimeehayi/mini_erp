from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PermissionViewSet, RoleViewSet, UserViewSet, UserProfileViewSet, UserActivityLogViewSet

router = DefaultRouter()
router.register(r'permissions', PermissionViewSet)
router.register(r'roles', RoleViewSet)
router.register(r'users', UserViewSet)
router.register(r'profiles', UserProfileViewSet)
router.register(r'activity-logs', UserActivityLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
]