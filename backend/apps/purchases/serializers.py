from rest_framework import serializers
from .models import PurchaseOrder, PurchaseOrderItem

class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = PurchaseOrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 'total_price']

class PurchaseOrderSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    items = PurchaseOrderItemSerializer(many=True, read_only=True)

    # For creation
    item_product = serializers.IntegerField(write_only=True)
    item_quantity = serializers.IntegerField(write_only=True)
    item_unit_price = serializers.DecimalField(max_digits=10, decimal_places=2, write_only=True)

    class Meta:
        model = PurchaseOrder
        fields = ['id', 'po_number', 'supplier', 'supplier_name', 'order_date', 'total_amount', 'status', 'created_at', 'updated_at', 'items', 'item_product', 'item_quantity', 'item_unit_price']

    def create(self, validated_data):
        item_product = validated_data.pop('item_product')
        item_quantity = validated_data.pop('item_quantity')
        item_unit_price = validated_data.pop('item_unit_price')

        purchase_order = PurchaseOrder.objects.create(**validated_data)

        PurchaseOrderItem.objects.create(
            purchase_order=purchase_order,
            product_id=item_product,
            quantity=item_quantity,
            unit_price=item_unit_price
        )

        return purchase_order