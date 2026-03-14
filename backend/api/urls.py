from django.urls import path, include

from apps.products.views import ProductViewSet
from apps.customers.views import CustomerListCreateAPIView
from apps.suppliers.views import SupplierListCreateAPIView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [

    path('v1/', include('apps.products.urls')),

    path('v1/', include('apps.customers.urls')),

    path('v1/', include('apps.suppliers.urls')),

    path('v1/', include('apps.sales.urls')),

    path('v1/', include('apps.purchases.urls')),

    path('v1/accounts/', include('apps.accounts.urls')),

    path('v1/inventory/', include('apps.inventory.urls')),

    # path("customers/", CustomerListCreateAPIView.as_view()),

    # path("suppliers/", SupplierListCreateAPIView.as_view()),

    path('v1/auth/login/', TokenObtainPairView.as_view()),

    path('v1/auth/refresh/', TokenRefreshView.as_view()),

]