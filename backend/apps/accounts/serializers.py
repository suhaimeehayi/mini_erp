from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Role, Permission, UserProfile, UserActivityLog

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'name', 'codename', 'description', 'created_at']

class RoleSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)
    permission_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        default=list,
    )

    class Meta:
        model = Role
        fields = ['id', 'name', 'description', 'permissions', 'permission_ids', 'created_at', 'updated_at']

    def create(self, validated_data):
        permission_ids = validated_data.pop('permission_ids', [])
        role = Role.objects.create(**validated_data)
        role.permissions.set(permission_ids)
        return role

    def update(self, instance, validated_data):
        permission_ids = validated_data.pop('permission_ids', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if permission_ids is not None:
            instance.permissions.set(permission_ids)
        return instance

class UserProfileSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.name', read_only=True)
    direct_permissions = PermissionSerializer(many=True, read_only=True)
    direct_permission_ids = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['id', 'role', 'role_name', 'direct_permissions', 'direct_permission_ids', 'phone', 'address', 'date_of_birth', 'avatar', 'is_active', 'created_at', 'updated_at']

    def get_direct_permission_ids(self, obj):
        return list(obj.direct_permissions.values_list('id', flat=True))

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    role_name = serializers.SerializerMethodField()
    role_id = serializers.SerializerMethodField()
    role_permissions = serializers.SerializerMethodField()
    direct_permissions = serializers.SerializerMethodField()
    direct_permission_ids = serializers.SerializerMethodField()
    effective_permissions = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'is_active',
            'is_staff',
            'is_superuser',
            'date_joined',
            'profile',
            'role_id',
            'role_name',
            'role_permissions',
            'direct_permissions',
            'direct_permission_ids',
            'effective_permissions',
        ]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

    def _get_profile(self, obj):
        try:
            return obj.userprofile
        except User.userprofile.RelatedObjectDoesNotExist:
            return None

    def _get_resolved_role(self, obj):
        profile = self._get_profile(obj)
        role = getattr(profile, 'role', None)

        if role:
            return role

        if obj.is_staff or obj.is_superuser:
            return Role.objects.filter(name='Admin').first()

        return None

    def get_role_name(self, obj):
        role = self._get_resolved_role(obj)
        if role:
            return role.name

        if obj.is_staff or obj.is_superuser:
            return 'Admin'

        return None

    def get_role_id(self, obj):
        role = self._get_resolved_role(obj)
        return role.id if role else None

    def get_role_permissions(self, obj):
        role = self._get_resolved_role(obj)
        if not role:
            return []
        return list(role.permissions.values_list('codename', flat=True))

    def get_direct_permissions(self, obj):
        profile = self._get_profile(obj)
        if not profile:
            return []
        return list(profile.direct_permissions.values('id', 'name', 'codename', 'description'))

    def get_direct_permission_ids(self, obj):
        profile = self._get_profile(obj)
        if not profile:
            return []
        return list(profile.direct_permissions.values_list('id', flat=True))

    def get_effective_permissions(self, obj):
        role_permissions = set(self.get_role_permissions(obj))
        profile = self._get_profile(obj)
        if profile:
            role_permissions.update(profile.direct_permissions.values_list('codename', flat=True))
        return sorted(role_permissions)

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    role = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    permission_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        default=list,
    )

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'password_confirm',
            'first_name',
            'last_name',
            'is_active',
            'is_staff',
            'role',
            'permission_ids',
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        role_id = validated_data.pop('role', None)
        permission_ids = validated_data.pop('permission_ids', [])
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        profile = user.userprofile
        if role_id:
            profile.role_id = role_id
        profile.save()
        if permission_ids:
            profile.direct_permissions.set(permission_ids)
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    role = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    permission_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        default=list,
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'is_active', 'is_staff', 'role', 'permission_ids']

    def update(self, instance, validated_data):
        role_id = validated_data.pop('role', None)
        permission_ids = validated_data.pop('permission_ids', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        profile = instance.userprofile
        if role_id is not None:
            profile.role_id = role_id
        profile.save()
        if permission_ids is not None:
            profile.direct_permissions.set(permission_ids)
        return instance

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs

class UserActivityLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = UserActivityLog
        fields = ['id', 'user', 'user_name', 'action', 'model_name', 'object_id', 'description', 'ip_address', 'user_agent', 'timestamp']