from rest_framework import serializers
from .models import Inventory

class InventorySerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    sku = serializers.CharField(source='product.sku', read_only=True)
    supplier = serializers.CharField(source='product.supplier.name', read_only=True)
    stock_status = serializers.SerializerMethodField()

    class Meta:
        model = Inventory
        fields = ['id', 'product', 'product_name', 'sku', 'supplier', 'quantity', 'minimum_stock', 'location', 'updated_at', 'stock_status']

    def get_stock_status(self, obj):
        if obj.quantity > obj.minimum_stock:
            return 'In Stock'
        elif obj.quantity > 0:
            return 'Low Stock'
        else:
            return 'Out of Stock'