from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import SalesOrder

@receiver(post_save, sender=SalesOrder)
def handle_sales_order_status_change(sender, instance, created, **kwargs):
    if created:
        return  # Skip for new orders

    if not instance.items.exists():
        return
    
    # Check if status changed to shipped or delivered
    if instance.status in ['shipped', 'delivered'] and not instance.inventory_deducted:
        try:
            instance.deduct_inventory()
        except ValueError as e:
            # Log error or handle insufficient inventory
            # For now, we can leave it as is, or perhaps revert status
            pass