from rest_framework.routers import DefaultRouter
from .views import CustomerListCreateAPIView

router = DefaultRouter()
router.register(r'customers', CustomerListCreateAPIView)

urlpatterns = router.urls
