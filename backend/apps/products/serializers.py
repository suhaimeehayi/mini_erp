from rest_framework import serializers

from apps.suppliers.models import Supplier
from apps.suppliers.serializers import SupplierSerializer

from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    supplier = SupplierSerializer(read_only=True)
    supplier_id = serializers.PrimaryKeyRelatedField(
        queryset=Supplier.objects.all(),
        source='supplier',
        write_only=True,
    )
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'sku',
            'description',
            'price',
            'supplier',
            'supplier_id',
            'supplier_name',
            'created_at',
        ]

    def validate_name(self, value):
        return value.strip()

    def validate_sku(self, value):
        normalized_sku = value.strip()

        if not normalized_sku:
            raise serializers.ValidationError('SKU is required.')

        return normalized_sku

    def validate(self, attrs):
        attrs = super().validate(attrs)

        name = attrs.get('name', getattr(self.instance, 'name', '')).strip()
        sku = attrs.get('sku', getattr(self.instance, 'sku', '')).strip()
        supplier = attrs.get('supplier', getattr(self.instance, 'supplier', None))

        if supplier and supplier.status != 'active':
            raise serializers.ValidationError({
                'supplier_id': 'Inactive suppliers cannot be used for products.',
            })

        if not name or not sku:
            return attrs

        queryset = Product.objects.filter(name__iexact=name, sku__iexact=sku)

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            error_message = 'Product name and SKU combination already exists.'
            raise serializers.ValidationError({
                'name': error_message,
                'sku': error_message,
            })

        return attrs