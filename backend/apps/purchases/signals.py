from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import PurchaseOrder
from apps.inventory.models import Inventory

@receiver(post_save, sender=PurchaseOrder)
def update_inventory_on_purchase_order(sender, instance, created, **kwargs):
    if not created and instance.status == 'received':
        # Increase inventory for each item
        for item in instance.items.all():
            try:
                inventory = Inventory.objects.get(product=item.product)
                inventory.quantity += item.quantity
                inventory.save()
            except Inventory.DoesNotExist:
                # Handle case where inventory doesn't exist
                pass