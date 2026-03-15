from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.serializers import ValidationError

from apps.accounts.permissions import HasAssignedPermission
from .models import SalesOrder
from .serializers import SalesOrderSerializer

class SalesOrderViewSet(viewsets.ModelViewSet):
    queryset = SalesOrder.objects.all().order_by('-created_at')
    serializer_class = SalesOrderSerializer
    permission_classes = [IsAuthenticated, HasAssignedPermission]
    permission_codename_map = {
        'list': 'view_sales_orders',
        'retrieve': 'view_sales_orders',
        'create': 'add_sales_orders',
        'update': 'change_sales_orders',
        'partial_update': 'change_sales_orders',
        'destroy': 'delete_sales_orders',
        'change_status': 'change_sales_orders',
    }

    def get_queryset(self):
        return SalesOrder.objects.select_related('customer').prefetch_related('items__product').order_by('-created_at')

    def perform_destroy(self, instance):
        if instance.status == SalesOrder.STATUS_DELIVERED:
            raise ValidationError('Delivered sales orders cannot be deleted.')
        super().perform_destroy(instance)

    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        """Change the status of a sales order with workflow validation."""
        sales_order = self.get_object()
        new_status = request.data.get('status')

        if not new_status:
            return Response({'error': 'Status is required'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(sales_order, data={'status': new_status}, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
