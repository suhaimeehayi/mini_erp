from django.db import models
from django.db.models.functions import Lower

from apps.suppliers.models import Supplier


class Product(models.Model):

    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100)

    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                Lower('name'),
                Lower('sku'),
                name='products_product_name_sku_ci_unique',
            ),
        ]

    def __str__(self):
        return self.name