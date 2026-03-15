from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import Permission
from apps.inventory.models import Inventory, InventoryMovement
from apps.products.models import Product
from apps.suppliers.models import Supplier


class InventoryFeatureTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='inventory_tester', password='pass1234')
        self.user.userprofile.direct_permissions.add(
            Permission.objects.create(name='Can view inventory', codename='view_inventory'),
            Permission.objects.create(name='Can change inventory', codename='change_inventory'),
        )
        self.client.force_authenticate(self.user)
        self.supplier = Supplier.objects.create(name='Supplier A', phone='0000000000', address='Bangkok')
        self.product = Product.objects.create(name='Widget', sku='W-001', price=10, supplier=self.supplier)
        self.inventory = Inventory.objects.get(product=self.product)
        self.inventory.quantity = 3
        self.inventory.minimum_stock = 5
        self.inventory.location = 'A1'
        self.inventory.save(update_fields=['quantity', 'minimum_stock', 'location', 'updated_at'])

    def test_low_stock_endpoint_returns_low_stock_items(self):
        response = self.client.get('/api/v1/inventory/low_stock/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['product_name'], 'Widget')

    def test_inventory_update_creates_adjustment_movement(self):
        response = self.client.put(
            f'/api/v1/inventory/{self.inventory.id}/',
            {
                'product': self.product.id,
                'quantity': 8,
                'minimum_stock': 5,
                'location': 'A1',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        movement = InventoryMovement.objects.filter(movement_type='adjustment').latest('id')
        self.assertEqual(movement.quantity_change, 5)
        self.assertEqual(movement.quantity_after, 8)
