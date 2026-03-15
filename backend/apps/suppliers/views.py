from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

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