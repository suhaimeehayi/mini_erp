from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.accounts.permissions import HasAssignedPermission
from .models import Customer
from .serializers import CustomerSerializer


class CustomerListCreateAPIView(viewsets.ModelViewSet):

    queryset = Customer.objects.all().order_by('name', 'id')
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated, HasAssignedPermission]
    permission_codename_map = {
        'list': 'view_customers',
        'retrieve': 'view_customers',
        'create': 'add_customers',
        'update': 'change_customers',
        'partial_update': 'change_customers',
        'destroy': 'delete_customers',
    }