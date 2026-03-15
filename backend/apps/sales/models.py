from django.db import models
from apps.customers.models import Customer
from apps.products.models import Product

class SalesOrderItem(models.Model):
    sales_order = models.ForeignKey('SalesOrder', on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    def save(self, *args, **kwargs):
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.product.name} x {self.quantity}'

class SalesOrder(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_PAID = 'paid'
    STATUS_SHIPPING = 'shipping'
    STATUS_DELIVERED = 'delivered'
    STATUS_CANCELLED = 'cancelled'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_PAID, 'Paid'),
        (STATUS_SHIPPING, 'Shipping'),
        (STATUS_DELIVERED, 'Delivered'),
        (STATUS_CANCELLED, 'Cancelled'),
    ]

    order_id = models.CharField(max_length=20, unique=True, blank=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    date = models.DateField()
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    inventory_deducted = models.BooleanField(default=False)  # Track if inventory has been deducted
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.order_id:
            # Generate auto order number like SO-001, SO-002, etc.
            last_order = SalesOrder.objects.order_by('-id').first()
            if last_order and last_order.id:
                next_id = last_order.id + 1
            else:
                next_id = 1
            self.order_id = f'SO-{next_id:03d}'
        super().save(*args, **kwargs)
        # Calculate total from items after saving (when we have a primary key)
        if self.pk:  # Only calculate if instance is saved
            self.total = sum(item.total_price for item in self.items.all())
            super().save(update_fields=['total'])

    def deduct_inventory(self):
        """Deduct inventory for all items in the order."""
        if self.inventory_deducted:
            return  # Already deducted
        from apps.inventory.models import Inventory
        for item in self.items.all():
            try:
                inventory = Inventory.objects.get(product=item.product)
                inventory.adjust_quantity(
                    -item.quantity,
                    movement_type='sale',
                    reference=self.order_id,
                    note=f'Sales order {self.order_id}',
                )
            except Inventory.DoesNotExist:
                raise ValueError(f"No inventory record for {item.product.name}")
        self.inventory_deducted = True
        self.save(update_fields=['inventory_deducted'])

    def can_change_status_to(self, new_status):
        """Validate status workflow transitions."""
        valid_transitions = {
            self.STATUS_PENDING: [self.STATUS_PAID, self.STATUS_CANCELLED],
            self.STATUS_PAID: [self.STATUS_SHIPPING, self.STATUS_CANCELLED],
            self.STATUS_SHIPPING: [self.STATUS_DELIVERED],
            self.STATUS_DELIVERED: [],
            self.STATUS_CANCELLED: [],
        }
        return new_status in valid_transitions.get(self.status, [])

    def change_status(self, new_status):
        """Change status with validation and inventory handling."""
        if not self.can_change_status_to(new_status):
            raise ValueError(f"Invalid status transition from {self.status} to {new_status}")

        self.status = new_status
        self.save(update_fields=['status'])

        if new_status == self.STATUS_DELIVERED and not self.inventory_deducted:
            self.deduct_inventory()

    def __str__(self):
        return f'{self.order_id} - {self.customer.name}'
