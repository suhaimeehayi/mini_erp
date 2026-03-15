from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from .models import Role, Permission, UserProfile, UserActivityLog
from .serializers import (
    RoleSerializer, PermissionSerializer, UserSerializer,
    UserCreateSerializer, UserUpdateSerializer, UserProfileSerializer,
    ChangePasswordSerializer, UserActivityLogSerializer
)
from .permissions import (
    HasAssignedPermission,
    IsAdminAccount,
    IsOwnerOrAdmin,
    has_permission_codename,
    is_admin_account,
)


def create_activity_log(user, action, description, model_name="", object_id=None, request=None):
    UserActivityLog.objects.create(
        user=user,
        action=action,
        model_name=model_name,
        object_id=object_id,
        description=description,
        ip_address=request.META.get('REMOTE_ADDR') if request else None,
        user_agent=request.META.get('HTTP_USER_AGENT', '') if request else '',
    )

class PermissionViewSet(viewsets.ModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated, HasAssignedPermission]
    permission_codename_map = {
        'list': ('view_users', 'add_users', 'change_users', 'view_roles', 'add_roles', 'change_roles'),
        'retrieve': ('view_users', 'add_users', 'change_users', 'view_roles', 'add_roles', 'change_roles'),
    }

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdminAccount()]
        return super().get_permissions()

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all().prefetch_related('permissions')
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated, HasAssignedPermission]
    permission_codename_map = {
        'list': ('view_roles', 'add_roles', 'change_roles', 'view_users', 'add_users', 'change_users'),
        'retrieve': ('view_roles', 'add_roles', 'change_roles', 'view_users', 'add_users', 'change_users'),
        'create': 'add_roles',
        'update': 'change_roles',
        'partial_update': 'change_roles',
        'destroy': 'delete_roles',
    }

    def perform_create(self, serializer):
        role = serializer.save()
        create_activity_log(
            self.request.user,
            'create',
            f'Created role {role.name}',
            model_name='Role',
            object_id=role.id,
            request=self.request,
        )

    def perform_update(self, serializer):
        role = serializer.save()
        create_activity_log(
            self.request.user,
            'update',
            f'Updated role {role.name}',
            model_name='Role',
            object_id=role.id,
            request=self.request,
        )

    def perform_destroy(self, instance):
        role_name = instance.name
        role_id = instance.id
        instance.delete()
        create_activity_log(
            self.request.user,
            'delete',
            f'Deleted role {role_name}',
            model_name='Role',
            object_id=role_id,
            request=self.request,
        )

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().select_related('userprofile', 'userprofile__role').prefetch_related('userprofile__role__permissions', 'userprofile__direct_permissions').order_by('-date_joined')
    permission_classes = [IsAuthenticated, HasAssignedPermission]
    permission_codename_map = {
        'list': 'view_users',
        'retrieve': 'view_users',
        'create': 'add_users',
        'update': 'change_users',
        'partial_update': 'change_users',
        'destroy': 'delete_users',
        'me': None,
        'change_password': None,
    }

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def change_password(self, request, pk=None):
        user = self.get_object()
        serializer = ChangePasswordSerializer(data=request.data)

        if serializer.is_valid():
            # Check if user can change password (owner or admin)
            if request.user != user and not has_permission_codename(request.user, 'change_users'):
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

            if not user.check_password(serializer.validated_data['old_password']):
                return Response({'error': 'Old password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(serializer.validated_data['new_password'])
            user.save()

            # Log activity
            UserActivityLog.objects.create(
                user=request.user,
                action='password_change',
                description=f'Changed password for user {user.username}'
            )

            return Response({'message': 'Password changed successfully'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        user = serializer.save()
        create_activity_log(
            self.request.user,
            'create',
            f'Created user {user.username}',
            model_name='User',
            object_id=user.id,
            request=self.request,
        )

    def perform_update(self, serializer):
        user = serializer.save()
        create_activity_log(
            self.request.user,
            'update',
            f'Updated user {user.username}',
            model_name='User',
            object_id=user.id,
            request=self.request,
        )

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        if user == request.user:
            return Response({'detail': 'You cannot delete your own account.'}, status=status.HTTP_400_BAD_REQUEST)

        username = user.username
        user_id = user.id
        response = super().destroy(request, *args, **kwargs)
        create_activity_log(
            request.user,
            'delete',
            f'Deleted user {username}',
            model_name='User',
            object_id=user_id,
            request=request,
        )
        return response

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all().select_related('user', 'role').prefetch_related('direct_permissions')
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        if has_permission_codename(self.request.user, 'view_users', 'change_users'):
            return UserProfile.objects.all()
        return UserProfile.objects.filter(user=self.request.user)

class UserActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UserActivityLog.objects.all()
    serializer_class = UserActivityLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if has_permission_codename(self.request.user, 'view_users', 'change_users', 'delete_users'):
            return UserActivityLog.objects.all()
        return UserActivityLog.objects.filter(user=self.request.user)
