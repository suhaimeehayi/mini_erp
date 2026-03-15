from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from apps.inventory.models import Inventory

from .models import SalesOrder, SalesOrderItem

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

    def _should_deduct_inventory(self, status_value):
        return status_value == SalesOrder.STATUS_DELIVERED

    def _get_status_after_update(self, attrs):
        if self.instance is None:
            return attrs.get('status', SalesOrder.STATUS_PENDING)
        return attrs.get('status', self.instance.status)

    def _get_items_for_inventory_validation(self, items_data):
        if items_data is not None:
            return items_data

        if self.instance is None:
            return []

        return [
            {
                'product': item.product_id,
                'quantity': item.quantity,
                'unit_price': item.unit_price,
            }
            for item in self.instance.items.all()
        ]

    def _validate_inventory(self, items_data):
        for item_data in items_data:
            try:
                inventory = Inventory.objects.get(product_id=item_data['product'])
            except Inventory.DoesNotExist as exc:
                raise serializers.ValidationError(
                    f"No inventory record found for product ID {item_data['product']}"
                ) from exc

            if inventory.quantity < item_data['quantity']:
                raise serializers.ValidationError(
                    f"Insufficient inventory for product {inventory.product.name}. "
                    f"Available: {inventory.quantity}, Requested: {item_data['quantity']}"
                )

    def validate(self, attrs):
        instance = self.instance
        next_status = self._get_status_after_update(attrs)
        items_data = attrs.get('items_data')
        customer = attrs.get('customer', getattr(instance, 'customer', None))

        if customer and customer.status != 'active':
            raise serializers.ValidationError({
                'customer': 'Inactive customers cannot be used for sales orders.',
            })

        if instance and instance.status == SalesOrder.STATUS_DELIVERED:
            raise serializers.ValidationError('Delivered sales orders cannot be modified.')

        if instance and next_status != instance.status and not instance.can_change_status_to(next_status):
            raise serializers.ValidationError(
                {'status': f'Invalid status transition from {instance.status} to {next_status}'}
            )

        if instance and items_data is not None and instance.inventory_deducted:
            raise serializers.ValidationError(
                {'items_data': 'Cannot replace items after inventory has already been deducted.'}
            )

        if self._should_deduct_inventory(next_status):
            self._validate_inventory(self._get_items_for_inventory_validation(items_data))

        return attrs

    def _replace_items(self, sales_order, items_data):
        sales_order.items.all().delete()
        for item_data in items_data:
            SalesOrderItem.objects.create(
                sales_order=sales_order,
                product_id=item_data['product'],
                quantity=item_data['quantity'],
                unit_price=item_data['unit_price'],
            )

        total = sum(item.total_price for item in sales_order.items.all())
        max_total = Decimal('99999999.99')
        if total > max_total:
            raise serializers.ValidationError(
                f"Total exceeds allowed maximum ({max_total}). Please lower quantities or unit prices."
            )

        sales_order.total = total
        sales_order.save(update_fields=['total'])

    def create(self, validated_data):
        items_data = validated_data.pop('items_data', [])

        with transaction.atomic():
            sales_order = SalesOrder.objects.create(**validated_data)
            self._replace_items(sales_order, items_data)

            if self._should_deduct_inventory(sales_order.status):
                try:
                    sales_order.deduct_inventory()
                except ValueError as exc:
                    raise serializers.ValidationError(str(exc)) from exc

        return sales_order

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items_data', None)

        with transaction.atomic():
            instance = super().update(instance, validated_data)

            if items_data is not None:
                self._replace_items(instance, items_data)

            if self._should_deduct_inventory(instance.status) and not instance.inventory_deducted:
                try:
                    instance.deduct_inventory()
                except ValueError as exc:
                    raise serializers.ValidationError(str(exc)) from exc

        return instance