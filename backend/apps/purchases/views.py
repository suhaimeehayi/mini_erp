from rest_framework import viewsets
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from apps.accounts.permissions import HasAssignedPermission

from .models import PurchaseOrder
from .serializers import PurchaseOrderSerializer

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all().select_related('supplier').prefetch_related('items', 'items__product').order_by('-created_at')
    serializer_class = PurchaseOrderSerializer
    permission_classes = [IsAuthenticated, HasAssignedPermission]
    permission_codename_map = {
        'list': 'view_purchase_orders',
        'retrieve': 'view_purchase_orders',
        'create': 'add_purchase_orders',
        'update': 'change_purchase_orders',
        'partial_update': 'change_purchase_orders',
        'destroy': 'delete_purchase_orders',
    }
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['po_number', 'supplier__name', 'items__product__name']
    ordering_fields = ['po_number', 'order_date', 'total_amount', 'status', 'created_at', 'supplier__name']
    filterset_fields = ['status', 'supplier']
