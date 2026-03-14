# from django_filters.rest_framework import DjangoFilterBackend
# from rest_framework import generics, filters
# from .models import Product
# from .serializers import ProductSerializer


# class ProductListCreateAPIView(generics.ListCreateAPIView):

#     queryset = Product.objects.all()
#     serializer_class = ProductSerializer

#     filter_backends = [
#         DjangoFilterBackend,
#         filters.SearchFilter
#     ]

#     filterset_fields = ["supplier"]

#     search_fields = ["name", "sku"]


# class ProductDetailAPIView(generics.RetrieveUpdateDestroyAPIView):

#     queryset = Product.objects.all()
#     serializer_class = ProductSerializer

from rest_framework import viewsets
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Product
from .serializers import ProductSerializer
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
class ProductViewSet(viewsets.ModelViewSet):

    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [SearchFilter]
    permission_classes = [IsAuthenticated]

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter
    ]

    search_fields = ["name", "sku"]

    filterset_fields = ["price", "supplier"]

    ordering_fields = ["name", "sku", "description", "price", "supplier__name", "created_at"]