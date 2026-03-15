from django.db.models import F
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from apps.accounts.permissions import HasAssignedPermission
from .models import Inventory, InventoryMovement
from .serializers import InventorySerializer, InventoryMovementSerializer

class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    permission_classes = [HasAssignedPermission]
    permission_codename_map = {
        'list': 'view_inventory',
        'retrieve': 'view_inventory',
        'create': 'add_inventory',
        'update': 'change_inventory',
        'partial_update': 'change_inventory',
        'destroy': 'delete_inventory',
        'low_stock': 'view_inventory',
        'movements': 'view_inventory',
    }
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['product__name', 'product__sku']
    ordering_fields = ['product__name', 'product__sku', 'product__supplier__name', 'quantity', 'minimum_stock', 'updated_at']

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        low_stock_items = self.filter_queryset(
            self.get_queryset().filter(quantity__lte=F('minimum_stock')).order_by('quantity', 'product__name')
        )
        serializer = self.get_serializer(low_stock_items, many=True)
        return Response({
            'count': low_stock_items.count(),
            'results': serializer.data,
        })

    @action(detail=False, methods=['get'])
    def movements(self, request):
        queryset = InventoryMovement.objects.select_related('product', 'inventory')
        product_id = request.query_params.get('product')
        if product_id:
            queryset = queryset.filter(product_id=product_id)

        page = self.paginate_queryset(queryset)
        serializer = InventoryMovementSerializer(page if page is not None else queryset, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)
