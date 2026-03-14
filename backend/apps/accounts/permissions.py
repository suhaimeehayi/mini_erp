from rest_framework.permissions import BasePermission

class IsAdminOrManager(BasePermission):
    """
    Custom permission to only allow admins or managers to access.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.is_staff or request.user.is_superuser or
             (hasattr(request.user, 'userprofile') and
              request.user.userprofile.role and
              request.user.userprofile.role.name in ['Admin', 'Manager']))
        )

class IsOwnerOrAdmin(BasePermission):
    """
    Custom permission to only allow owners or admins to edit.
    """
    def has_object_permission(self, request, view, obj):
        # Allow admins to do anything
        if request.user.is_staff or request.user.is_superuser:
            return True

        # Allow users to access their own profile
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return obj == request.user