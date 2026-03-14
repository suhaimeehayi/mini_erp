from decimal import Decimal

from rest_framework import serializers
from .models import SalesOrder, SalesOrderItem
from apps.inventory.models import Inventory

class SalesOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = SalesOrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 'total_price']

class SalesOrderItemDataSerializer(serializers.Serializer):
    product = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)

class SalesOrderSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    items = SalesOrderItemSerializer(many=True, read_only=True)

    # For creation with multiple items
    items_data = SalesOrderItemDataSerializer(many=True, write_only=True, required=False)

    class Meta:
        model = SalesOrder
        fields = ['id', 'order_id', 'customer', 'customer_name', 'date', 'total', 'status', 'inventory_deducted', 'created_at', 'updated_at', 'items', 'items_data']

    def create(self, validated_data):
        items_data = validated_data.pop('items_data', [])

        # Validate inventory availability before creating the order
        for item_data in items_data:
            try:
                inventory = Inventory.objects.get(product_id=item_data['product'])
            except Inventory.DoesNotExist:
                raise serializers.ValidationError(
                    f"No inventory record found for product ID {item_data['product']}"
                )

            if inventory.quantity < item_data['quantity']:
                raise serializers.ValidationError(
                    f"Insufficient inventory for product {inventory.product.name}. "
                    f"Available: {inventory.quantity}, Requested: {item_data['quantity']}"
                )

        sales_order = SalesOrder.objects.create(**validated_data)

        for item_data in items_data:
            SalesOrderItem.objects.create(
                sales_order=sales_order,
                product_id=item_data['product'],
                quantity=item_data['quantity'],
                unit_price=item_data['unit_price']
            )

        # Update total after creating items
        total = sum(item.total_price for item in sales_order.items.all())
        max_total = Decimal('99999999.99')
        if total > max_total:
            raise serializers.ValidationError(
                f"Total exceeds allowed maximum ({max_total}). Please lower quantities or unit prices."
            )
        sales_order.total = total
        sales_order.save(update_fields=['total'])

        # Deduct inventory immediately when the order is created
        try:
            sales_order.deduct_inventory()
        except ValueError as e:
            raise serializers.ValidationError(str(e))

        return sales_order

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items_data', None)
        instance = super().update(instance, validated_data)
        
        if items_data is not None:
            # Clear existing items and add new ones
            instance.items.all().delete()
            for item_data in items_data:
                SalesOrderItem.objects.create(
                    sales_order=instance,
                    product_id=item_data['product'],
                    quantity=item_data['quantity'],
                    unit_price=item_data['unit_price']
                )
            # Update total after creating items
            instance.total = sum(item.total_price for item in instance.items.all())
            instance.save(update_fields=['total'])
        
        return instance