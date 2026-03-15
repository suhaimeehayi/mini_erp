from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Permission, Role


class AccountsPermissionTests(APITestCase):
	def setUp(self):
		self.view_users_permission = Permission.objects.create(
			name='Can view users',
			codename='view_users',
		)
		self.add_users_permission = Permission.objects.create(
			name='Can add users',
			codename='add_users',
		)
		self.change_products_permission = Permission.objects.create(
			name='Can change products',
			codename='change_products',
		)
		self.admin_role = Role.objects.create(name='Admin', description='Admin role')
		self.admin_role.permissions.add(self.view_users_permission, self.add_users_permission)

		self.admin_user = User.objects.create_user(
			username='admin',
			password='AdminPass123!',
			is_staff=True,
		)
		self.admin_user.userprofile.role = self.admin_role
		self.admin_user.userprofile.save()

		self.normal_user = User.objects.create_user(
			username='employee',
			password='EmployeePass123!',
		)

	def test_non_admin_cannot_access_user_list(self):
		self.client.force_authenticate(user=self.normal_user)

		response = self.client.get('/api/v1/accounts/users/')

		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

	def test_admin_can_create_user_with_direct_permissions(self):
		self.client.force_authenticate(user=self.admin_user)

		response = self.client.post('/api/v1/accounts/users/', {
			'username': 'new_user',
			'email': 'new_user@example.com',
			'password': 'NewUserPass123!',
			'password_confirm': 'NewUserPass123!',
			'first_name': 'New',
			'last_name': 'User',
			'is_active': True,
			'is_staff': False,
			'role': self.admin_role.id,
			'permission_ids': [self.change_products_permission.id],
		}, format='json')

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		created_user = User.objects.get(username='new_user')
		self.assertEqual(
			list(created_user.userprofile.direct_permissions.values_list('id', flat=True)),
			[self.change_products_permission.id],
		)

	def test_me_endpoint_returns_effective_permissions(self):
		self.normal_user.userprofile.role = self.admin_role
		self.normal_user.userprofile.save()
		self.normal_user.userprofile.direct_permissions.add(self.change_products_permission)

		self.client.force_authenticate(user=self.normal_user)

		response = self.client.get('/api/v1/accounts/users/me/')

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertIn('view_users', response.data['effective_permissions'])
		self.assertIn('change_products', response.data['effective_permissions'])

	def test_superuser_is_assigned_admin_role_automatically(self):
		superuser = User.objects.create_superuser(
			username='root_admin',
			email='root@example.com',
			password='RootAdminPass123!',
		)

		superuser.refresh_from_db()

		self.assertIsNotNone(superuser.userprofile.role)
		self.assertEqual(superuser.userprofile.role.name, 'Admin')
