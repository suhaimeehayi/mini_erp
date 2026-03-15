from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import Permission
from .models import Customer


class CustomerApiTests(APITestCase):
	endpoint = '/api/v1/customers/'

	def test_create_customer_and_list_results(self):
		user = User.objects.create_user(username='customer_tester', password='pass1234')
		user.userprofile.direct_permissions.add(
			Permission.objects.create(name='Can add customers', codename='add_customers'),
			Permission.objects.create(name='Can view customers', codename='view_customers'),
		)
		self.client.force_authenticate(user)

		create_response = self.client.post(
			self.endpoint,
			{
				'name': 'Acme Customer',
				'email': 'customer@example.com',
				'phone': '0812345678',
				'address': 'Bangkok',
				'company': 'Acme Co',
				'tax_number': 'TAX-001',
				'status': 'active',
			},
			format='json',
		)

		self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(Customer.objects.count(), 1)

		list_response = self.client.get(self.endpoint)

		self.assertEqual(list_response.status_code, status.HTTP_200_OK)
		self.assertEqual(list_response.data['count'], 1)
		self.assertEqual(list_response.data['results'][0]['name'], 'Acme Customer')

	def test_update_customer_status(self):
		user = User.objects.create_user(username='customer_editor', password='pass1234')
		user.userprofile.direct_permissions.add(
			Permission.objects.create(name='Can change customers', codename='change_customers'),
		)
		self.client.force_authenticate(user)

		customer = Customer.objects.create(
			name='Acme Customer',
			email='customer@example.com',
			phone='0812345678',
			address='Bangkok',
			company='Acme Co',
			tax_number='TAX-001',
			status='active',
		)

		response = self.client.put(
			f'{self.endpoint}{customer.id}/',
			{
				'name': customer.name,
				'email': customer.email,
				'phone': customer.phone,
				'address': customer.address,
				'company': customer.company,
				'tax_number': customer.tax_number,
				'status': 'inactive',
			},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		customer.refresh_from_db()
		self.assertEqual(customer.status, 'inactive')
