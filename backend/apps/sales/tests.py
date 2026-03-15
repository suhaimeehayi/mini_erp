from decimal import Decimal

from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import Permission
from apps.customers.models import Customer
from apps.inventory.models import Inventory, InventoryMovement
from apps.products.models import Product
from apps.suppliers.models import Supplier

from .models import SalesOrder


class SalesOrderApiTests(APITestCase):
	endpoint = '/api/v1/sales-orders/'

	def setUp(self):
		self.user = User.objects.create_user(username='sales_tester', password='pass1234')
		self.user.userprofile.direct_permissions.add(
			Permission.objects.create(name='Can add sales orders', codename='add_sales_orders'),
			Permission.objects.create(name='Can change sales orders', codename='change_sales_orders'),
		)
		self.client.force_authenticate(self.user)
		self.customer = Customer.objects.create(
			name='Customer A',
			email='customer@example.com',
			phone='0811111111',
			address='Bangkok',
			company='Customer Co',
			tax_number='CUS-001',
		)
		self.supplier = Supplier.objects.create(
			name='Supplier A',
			company_name='Supplier Co',
			email='supplier@example.com',
			phone='0822222222',
			address='Bangkok',
		)
		self.product = Product.objects.create(
			name='Widget',
			sku='W-001',
			description='Widget',
			price=Decimal('100.00'),
			supplier=self.supplier,
		)
		self.inventory = Inventory.objects.get(product=self.product)
		self.inventory.quantity = 10
		self.inventory.minimum_stock = 2
		self.inventory.location = 'A1'
		self.inventory.save(update_fields=['quantity', 'minimum_stock', 'location', 'updated_at'])

	def test_create_shipped_sales_order_deducts_inventory(self):
		response = self.client.post(
			self.endpoint,
			{
				'customer': self.customer.id,
				'date': '2026-03-15',
				'status': 'shipped',
				'items_data': [
					{
						'product': self.product.id,
						'quantity': 3,
						'unit_price': '100.00',
					},
				],
			},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.inventory.refresh_from_db()
		self.assertEqual(self.inventory.quantity, 7)

		sales_order = SalesOrder.objects.get(id=response.data['id'])
		self.assertTrue(sales_order.inventory_deducted)

		movement = InventoryMovement.objects.filter(movement_type='sale').latest('id')
		self.assertEqual(movement.quantity_change, -3)
		self.assertEqual(movement.quantity_after, 7)

	def test_change_status_endpoint_rejects_invalid_transition(self):
		sales_order = SalesOrder.objects.create(
			customer=self.customer,
			date='2026-03-15',
			status='pending',
		)
		sales_order.items.create(
			product=self.product,
			quantity=1,
			unit_price=Decimal('100.00'),
			total_price=Decimal('100.00'),
		)
		sales_order.save()

		response = self.client.post(
			f'{self.endpoint}{sales_order.id}/change_status/',
			{'status': 'delivered'},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertEqual(
			response.data['error'],
			'Invalid status transition from pending to delivered',
		)
