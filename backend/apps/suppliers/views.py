from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.serializers import ValidationError

from apps.accounts.permissions import HasAssignedPermission
from .models import Supplier
from .serializers import SupplierSerializer


class SupplierListCreateAPIView(viewsets.ModelViewSet):

    queryset = Supplier.objects.all().order_by('name', 'id')
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated, HasAssignedPermission]
    permission_codename_map = {
        'list': 'view_suppliers',
        'retrieve': 'view_suppliers',
        'create': 'add_suppliers',
        'update': 'change_suppliers',
        'partial_update': 'change_suppliers',
        'destroy': 'delete_suppliers',
    }
    ordering_fields = ['name', 'company_name', 'contact_person', 'email', 'phone', 'status']

    def perform_destroy(self, instance):
        if instance.product_set.exists() or instance.purchaseorder_set.exists():
            raise ValidationError('This supplier is used in products or purchase orders and cannot be deleted.')

        super().perform_destroy(instance)