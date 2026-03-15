from decimal import Decimal

from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import Permission
from apps.products.models import Product
from apps.suppliers.models import Supplier

from .models import PurchaseOrder


class PurchaseOrderApiTests(APITestCase):
	endpoint = '/api/v1/purchase-orders/'

	def setUp(self):
		self.user = User.objects.create_user(username='purchase_tester', password='pass1234')
		self.user.userprofile.direct_permissions.add(
			Permission.objects.create(name='Can add purchase orders', codename='add_purchase_orders'),
			Permission.objects.create(name='Can change purchase orders', codename='change_purchase_orders'),
		)
		self.client.force_authenticate(self.user)
		self.supplier = Supplier.objects.create(
			name='Supplier A',
			company_name='Supplier Co',
			email='suppliera@example.com',
			phone='0811111111',
			address='Bangkok',
		)
		self.product = Product.objects.create(
			name='Paper',
			sku='PAPER-001',
			description='Copy paper',
			price=Decimal('120.00'),
			supplier=self.supplier,
		)

	def test_create_purchase_order_with_items_data(self):
		response = self.client.post(self.endpoint, {
			'supplier': self.supplier.id,
			'order_date': '2026-03-15',
			'status': 'pending',
			'items_data': [
				{
					'product': self.product.id,
					'quantity': 2,
					'unit_price': '120.00',
				},
			],
		}, format='json')

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		purchase_order = PurchaseOrder.objects.get(id=response.data['id'])
		self.assertEqual(purchase_order.items.count(), 1)
		self.assertEqual(purchase_order.total_amount, Decimal('240.00'))

	def test_update_purchase_order_replaces_items_and_total(self):
		purchase_order = PurchaseOrder.objects.create(
			supplier=self.supplier,
			order_date='2026-03-15',
			status='pending',
		)
		purchase_order.items.create(
			product=self.product,
			quantity=1,
			unit_price=Decimal('120.00'),
			total_price=Decimal('120.00'),
		)
		purchase_order.save()

		response = self.client.put(f'{self.endpoint}{purchase_order.id}/', {
			'supplier': self.supplier.id,
			'order_date': '2026-03-16',
			'status': 'received',
			'items_data': [
				{
					'product': self.product.id,
					'quantity': 3,
					'unit_price': '150.00',
				},
			],
		}, format='json')

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		purchase_order.refresh_from_db()
		self.assertEqual(purchase_order.items.count(), 1)
		self.assertEqual(purchase_order.total_amount, Decimal('450.00'))

	def test_create_purchase_order_rejects_inactive_supplier(self):
		self.supplier.status = 'inactive'
		self.supplier.save(update_fields=['status'])

		response = self.client.post(self.endpoint, {
			'supplier': self.supplier.id,
			'order_date': '2026-03-15',
			'status': 'pending',
			'items_data': [
				{
					'product': self.product.id,
					'quantity': 2,
					'unit_price': '120.00',
				},
			],
		}, format='json')

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertEqual(response.data['supplier'][0], 'Inactive suppliers cannot be used for purchase orders.')
