from rest_framework import viewsets
from .models import Supplier
from .serializers import SupplierSerializer


class SupplierListCreateAPIView(viewsets.ModelViewSet):

    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    ordering_fields = ['name', 'company_name', 'contact_person', 'email', 'phone', 'status']