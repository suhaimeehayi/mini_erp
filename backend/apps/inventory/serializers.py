from rest_framework import serializers
from .models import Inventory, InventoryMovement


class InventoryMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    movement_type_display = serializers.CharField(source='get_movement_type_display', read_only=True)

    class Meta:
        model = InventoryMovement
        fields = [
            'id',
            'inventory',
            'product',
            'product_name',
            'movement_type',
            'movement_type_display',
            'quantity_change',
            'quantity_after',
            'reference',
            'note',
            'created_at',
        ]

class InventorySerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    sku = serializers.CharField(source='product.sku', read_only=True)
    supplier = serializers.CharField(source='product.supplier.name', read_only=True)
    stock_status = serializers.SerializerMethodField()
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Inventory
        fields = [
            'id',
            'product',
            'product_name',
            'sku',
            'supplier',
            'quantity',
            'minimum_stock',
            'location',
            'updated_at',
            'stock_status',
            'is_low_stock',
        ]

    def get_stock_status(self, obj):
        return obj.stock_status

    def create(self, validated_data):
        inventory = super().create(validated_data)
        if inventory.quantity > 0:
            InventoryMovement.objects.create(
                inventory=inventory,
                product=inventory.product,
                movement_type='initial',
                quantity_change=inventory.quantity,
                quantity_after=inventory.quantity,
                reference=f'INV-{inventory.id}',
                note='Initial stock created',
            )
        return inventory

    def update(self, instance, validated_data):
        previous_quantity = instance.quantity
        inventory = super().update(instance, validated_data)
        quantity_delta = inventory.quantity - previous_quantity

        if quantity_delta != 0:
            InventoryMovement.objects.create(
                inventory=inventory,
                product=inventory.product,
                movement_type='adjustment',
                quantity_change=quantity_delta,
                quantity_after=inventory.quantity,
                reference=f'INV-{inventory.id}',
                note='Manual inventory update',
            )

        return inventory