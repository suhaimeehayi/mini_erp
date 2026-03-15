from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import Permission
from apps.products.models import Product
from .models import Supplier


class SupplierApiTests(APITestCase):
	endpoint = '/api/v1/suppliers/'

	def test_create_supplier_and_list_results(self):
		user = User.objects.create_user(username='supplier_tester', password='pass1234')
		user.userprofile.direct_permissions.add(
			Permission.objects.create(name='Can add suppliers', codename='add_suppliers'),
			Permission.objects.create(name='Can view suppliers', codename='view_suppliers'),
		)
		self.client.force_authenticate(user)

		create_response = self.client.post(
			self.endpoint,
			{
				'name': 'Supplier A',
				'company_name': 'Supplier Co',
				'contact_person': 'Jane Doe',
				'email': 'supplier@example.com',
				'phone': '0899999999',
				'address': 'Bangkok',
				'tax_number': 'SUP-001',
				'website': 'https://example.com',
				'status': 'active',
			},
			format='json',
		)

		self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(Supplier.objects.count(), 1)

		list_response = self.client.get(self.endpoint)

		self.assertEqual(list_response.status_code, status.HTTP_200_OK)
		self.assertEqual(list_response.data['count'], 1)
		self.assertEqual(list_response.data['results'][0]['name'], 'Supplier A')

	def test_update_supplier_status(self):
		user = User.objects.create_user(username='supplier_editor', password='pass1234')
		user.userprofile.direct_permissions.add(
			Permission.objects.create(name='Can change suppliers', codename='change_suppliers'),
		)
		self.client.force_authenticate(user)

		supplier = Supplier.objects.create(
			name='Supplier A',
			company_name='Supplier Co',
			contact_person='Jane Doe',
			email='supplier@example.com',
			phone='0899999999',
			address='Bangkok',
			tax_number='SUP-001',
			website='https://example.com',
			status='active',
		)

		response = self.client.put(
			f'{self.endpoint}{supplier.id}/',
			{
				'name': supplier.name,
				'company_name': supplier.company_name,
				'contact_person': supplier.contact_person,
				'email': supplier.email,
				'phone': supplier.phone,
				'address': supplier.address,
				'tax_number': supplier.tax_number,
				'website': supplier.website,
				'status': 'inactive',
			},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		supplier.refresh_from_db()
		self.assertEqual(supplier.status, 'inactive')

	def test_delete_supplier_used_in_products_is_blocked(self):
		user = User.objects.create_user(username='supplier_delete_guard', password='pass1234')
		user.userprofile.direct_permissions.add(
			Permission.objects.create(name='Can delete suppliers', codename='delete_suppliers'),
		)
		self.client.force_authenticate(user)

		supplier = Supplier.objects.create(
			name='Supplier A',
			company_name='Supplier Co',
			contact_person='Jane Doe',
			email='supplier@example.com',
			phone='0899999999',
			address='Bangkok',
			tax_number='SUP-001',
			website='https://example.com',
			status='active',
		)
		Product.objects.create(
			name='Paper',
			sku='PAPER-001',
			description='Copy paper',
			price='120.00',
			supplier=supplier,
		)

		response = self.client.delete(f'{self.endpoint}{supplier.id}/')

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertEqual(response.data[0], 'This supplier is used in products or purchase orders and cannot be deleted.')
