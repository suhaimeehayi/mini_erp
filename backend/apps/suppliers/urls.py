from rest_framework.routers import DefaultRouter
from .views import SupplierListCreateAPIView

router = DefaultRouter()
router.register(r'suppliers', SupplierListCreateAPIView)

urlpatterns = router.urls
