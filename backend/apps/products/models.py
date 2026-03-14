from django.db import models
from apps.suppliers.models import Supplier
import uuid


class Product(models.Model):

    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100, unique=True, blank=True)

    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):

        if not self.sku:
            self.sku = "SKU-" + str(uuid.uuid4())[:8]

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name