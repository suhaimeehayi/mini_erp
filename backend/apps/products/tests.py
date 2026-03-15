from decimal import Decimal

from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import Permission
from apps.suppliers.models import Supplier

from .models import Product


class ProductApiTests(APITestCase):
	endpoint = '/api/v1/products/'

	def setUp(self):
		self.user = User.objects.create_user(username='tester', password='pass1234')
		self.user.userprofile.direct_permissions.add(
			Permission.objects.create(name='Can add products', codename='add_products'),
		)
		self.client.force_authenticate(self.user)
		self.supplier = Supplier.objects.create(
			name='Main Supplier',
			company_name='Main Supplier Co',
			email='supplier@example.com',
			phone='0812345678',
			address='Bangkok',
		)

	def test_create_product_requires_manual_sku(self):
		response = self.client.post(self.endpoint, {
			'name': 'Keyboard',
			'sku': '',
			'description': 'Mechanical keyboard',
			'price': '1500.00',
			'supplier_id': self.supplier.id,
		}, format='json')

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertEqual(response.data['sku'][0], 'This field may not be blank.')

	def test_create_product_allows_duplicate_name_with_different_sku(self):
		Product.objects.create(
			name='Keyboard',
			sku='KB-001',
			description='Mechanical keyboard',
			price=Decimal('1500.00'),
			supplier=self.supplier,
		)

		response = self.client.post(self.endpoint, {
			'name': 'keyboard',
			'sku': 'KB-002',
			'description': 'Another keyboard',
			'price': '1750.00',
			'supplier_id': self.supplier.id,
		}, format='json')

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)

	def test_create_product_allows_duplicate_sku_with_different_name(self):
		Product.objects.create(
			name='Keyboard',
			sku='KB-001',
			description='Mechanical keyboard',
			price=Decimal('1500.00'),
			supplier=self.supplier,
		)

		response = self.client.post(self.endpoint, {
			'name': 'Mouse',
			'sku': 'kb-001',
			'description': 'Wireless mouse',
			'price': '950.00',
			'supplier_id': self.supplier.id,
		}, format='json')

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)

	def test_create_product_rejects_duplicate_name_and_sku_pair_case_insensitive(self):
		Product.objects.create(
			name='Keyboard',
			sku='KB-001',
			description='Mechanical keyboard',
			price=Decimal('1500.00'),
			supplier=self.supplier,
		)

		response = self.client.post(self.endpoint, {
			'name': 'keyboard',
			'sku': 'kb-001',
			'description': 'Another keyboard',
			'price': '1750.00',
			'supplier_id': self.supplier.id,
		}, format='json')

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertEqual(response.data['name'][0], 'Product name and SKU combination already exists.')
		self.assertEqual(response.data['sku'][0], 'Product name and SKU combination already exists.')
