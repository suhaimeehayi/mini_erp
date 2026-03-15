from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import PurchaseOrder
from apps.inventory.models import Inventory

@receiver(post_save, sender=PurchaseOrder)
def update_inventory_on_purchase_order(sender, instance, created, **kwargs):
    if not created and instance.status == 'received' and not instance.inventory_received:
        # Increase inventory for each item
        for item in instance.items.all():
            try:
                inventory = Inventory.objects.get(product=item.product)
                inventory.adjust_quantity(
                    item.quantity,
                    movement_type='purchase',
                    reference=instance.po_number,
                    note=f'Purchase order {instance.po_number}',
                )
            except Inventory.DoesNotExist:
                # Handle case where inventory doesn't exist
                pass
        instance.inventory_received = True
        instance.save(update_fields=['inventory_received'])