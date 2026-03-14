from django.db import models
from apps.products.models import Product

class Inventory(models.Model):

    product = models.OneToOneField(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=0)
    minimum_stock = models.IntegerField(default=0)
    location = models.CharField(max_length=255)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.product.name