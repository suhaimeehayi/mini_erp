from django.db import models, transaction
from apps.products.models import Product

class Inventory(models.Model):

    product = models.OneToOneField(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=0)
    minimum_stock = models.IntegerField(default=0)
    location = models.CharField(max_length=255)

    updated_at = models.DateTimeField(auto_now=True)

    @property
    def stock_status(self):
        if self.quantity > self.minimum_stock:
            return 'In Stock'
        if self.quantity > 0:
            return 'Low Stock'
        return 'Out of Stock'

    @property
    def is_low_stock(self):
        return self.quantity <= self.minimum_stock

    def adjust_quantity(self, delta, movement_type, reference='', note=''):
        if delta == 0:
            return self.quantity

        new_quantity = self.quantity + delta
        if new_quantity < 0:
            raise ValueError(
                f'Insufficient inventory for {self.product.name}. '
                f'Available: {self.quantity}, Requested: {abs(delta)}'
            )

        with transaction.atomic():
            self.quantity = new_quantity
            self.save(update_fields=['quantity', 'updated_at'])
            InventoryMovement.objects.create(
                inventory=self,
                product=self.product,
                movement_type=movement_type,
                quantity_change=delta,
                quantity_after=new_quantity,
                reference=reference,
                note=note,
            )

        return new_quantity

    def __str__(self):
        return self.product.name


class InventoryMovement(models.Model):
    MOVEMENT_TYPE_CHOICES = [
        ('purchase', 'Purchase'),
        ('sale', 'Sale'),
        ('adjustment', 'Adjustment'),
        ('initial', 'Initial Stock'),
    ]

    inventory = models.ForeignKey(Inventory, on_delete=models.CASCADE, related_name='movements')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='inventory_movements')
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPE_CHOICES)
    quantity_change = models.IntegerField()
    quantity_after = models.IntegerField()
    reference = models.CharField(max_length=50, blank=True)
    note = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at', '-id']

    def __str__(self):
        return f'{self.product.name} {self.movement_type} {self.quantity_change}'