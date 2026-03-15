from collections.abc import Iterable

from django.contrib.auth.models import User
from rest_framework.permissions import BasePermission

def is_admin_account(user):
    if not user or not user.is_authenticated:
        return False

    if user.is_superuser:
        return True

    try:
        profile = user.userprofile
    except User.userprofile.RelatedObjectDoesNotExist:
        profile = None

    return bool(profile and profile.role and profile.role.name == 'Admin')


def get_effective_permission_codenames(user):
    if not user or not user.is_authenticated:
        return set()

    if user.is_superuser:
        return {'*'}

    try:
        profile = user.userprofile
    except User.userprofile.RelatedObjectDoesNotExist:
        profile = None

    if not profile:
        return set()

    permission_codenames = set()

    if profile.role_id:
        permission_codenames.update(
            profile.role.permissions.values_list('codename', flat=True)
        )

    permission_codenames.update(
        profile.direct_permissions.values_list('codename', flat=True)
    )

    return permission_codenames


def has_permission_codename(user, *codenames):
    if not codenames:
        return True

    effective_permissions = get_effective_permission_codenames(user)
    if '*' in effective_permissions:
        return True

    return any(codename in effective_permissions for codename in codenames)


class HasAssignedPermission(BasePermission):
    message = 'You do not have permission to perform this action.'

    def _get_required_codenames(self, view):
        permission_codename_map = getattr(view, 'permission_codename_map', {})
        required_permissions = permission_codename_map.get(getattr(view, 'action', None))

        if required_permissions is None:
            return ()

        if isinstance(required_permissions, str):
            return (required_permissions,)

        if isinstance(required_permissions, Iterable):
            return tuple(required_permissions)

        return (required_permissions,)

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        required_codenames = self._get_required_codenames(view)
        if not required_codenames:
            return True

        return has_permission_codename(request.user, *required_codenames)

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class IsAdminAccount(BasePermission):
    """Allow access only to admin accounts."""

    def has_permission(self, request, view):
        return is_admin_account(request.user)

class IsOwnerOrAdmin(BasePermission):
    """
    Custom permission to only allow owners or admins to edit.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if has_permission_codename(request.user, 'view_users', 'change_users', 'delete_users'):
            return True

        # Allow users to access their own profile
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return obj == request.user