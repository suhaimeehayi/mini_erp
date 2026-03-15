from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import Permission
from apps.products.models import Product
from apps.sales.models import SalesOrder
from apps.suppliers.models import Supplier
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

	def test_delete_customer_used_in_sales_order_is_blocked(self):
		user = User.objects.create_user(username='customer_delete_guard', password='pass1234')
		user.userprofile.direct_permissions.add(
			Permission.objects.create(name='Can delete customers', codename='delete_customers'),
		)
		self.client.force_authenticate(user)

		supplier = Supplier.objects.create(
			name='Supplier A',
			company_name='Supplier Co',
			email='supplier@example.com',
			phone='0812345678',
			address='Bangkok',
		)
		customer = Customer.objects.create(
			name='Acme Customer',
			email='customer@example.com',
			phone='0812345678',
			address='Bangkok',
			company='Acme Co',
			tax_number='TAX-001',
			status='active',
		)
		product = Product.objects.create(
			name='Widget',
			sku='W-001',
			description='Widget',
			price='100.00',
			supplier=supplier,
		)
		sales_order = SalesOrder.objects.create(
			customer=customer,
			date='2026-03-15',
			status='pending',
		)
		sales_order.items.create(
			product=product,
			quantity=1,
			unit_price='100.00',
			total_price='100.00',
		)

		response = self.client.delete(f'{self.endpoint}{customer.id}/')

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertEqual(response.data[0], 'This customer is used in sales orders and cannot be deleted.')
