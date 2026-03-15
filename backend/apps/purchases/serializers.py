from rest_framework import serializers

from apps.suppliers.models import Supplier

from .models import PurchaseOrder, PurchaseOrderItem

class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = PurchaseOrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 'total_price']
        read_only_fields = ['id', 'product_name', 'total_price']

class PurchaseOrderSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    items = PurchaseOrderItemSerializer(many=True, read_only=True)
    inventory_received = serializers.BooleanField(read_only=True)

    items_data = PurchaseOrderItemSerializer(many=True, write_only=True, required=False)

    item_product = serializers.IntegerField(write_only=True, required=False)
    item_quantity = serializers.IntegerField(write_only=True, required=False)
    item_unit_price = serializers.DecimalField(max_digits=10, decimal_places=2, write_only=True, required=False)

    class Meta:
        model = PurchaseOrder
        fields = [
            'id',
            'po_number',
            'supplier',
            'supplier_name',
            'order_date',
            'total_amount',
            'status',
            'inventory_received',
            'created_at',
            'updated_at',
            'items',
            'items_data',
            'item_product',
            'item_quantity',
            'item_unit_price',
        ]

    def validate(self, attrs):
        attrs = super().validate(attrs)

        supplier = attrs.get('supplier', getattr(self.instance, 'supplier', None))
        if supplier and supplier.status != 'active':
            raise serializers.ValidationError({
                'supplier': 'Inactive suppliers cannot be used for purchase orders.',
            })

        return attrs

    def _extract_items_data(self, validated_data):
        items_data = validated_data.pop('items_data', [])
        item_product = validated_data.pop('item_product', None)
        item_quantity = validated_data.pop('item_quantity', None)
        item_unit_price = validated_data.pop('item_unit_price', None)

        if items_data:
            return items_data

        if item_product and item_quantity and item_unit_price is not None:
            return [{
                'product': item_product,
                'quantity': item_quantity,
                'unit_price': item_unit_price,
            }]

        raise serializers.ValidationError('At least one purchase order item is required.')

    def _replace_items(self, purchase_order, items_data):
        purchase_order.items.all().delete()
        for item_data in items_data:
            product_value = item_data['product']
            product_id = product_value.id if hasattr(product_value, 'id') else product_value

            PurchaseOrderItem.objects.create(
                purchase_order=purchase_order,
                product_id=product_id,
                quantity=item_data['quantity'],
                unit_price=item_data['unit_price'],
            )

        purchase_order.total_amount = sum(item.total_price for item in purchase_order.items.all())
        purchase_order.save(update_fields=['total_amount'])

    def create(self, validated_data):
        items_data = self._extract_items_data(validated_data)

        purchase_order = PurchaseOrder.objects.create(**validated_data)
        self._replace_items(purchase_order, items_data)

        return purchase_order

    def update(self, instance, validated_data):
        items_data = None
        item_fields_present = any(
            field in self.initial_data
            for field in ['items_data', 'item_product', 'item_quantity', 'item_unit_price']
        )
        if item_fields_present:
            items_data = self._extract_items_data(validated_data)

        instance = super().update(instance, validated_data)

        if items_data is not None:
            self._replace_items(instance, items_data)

        return instance