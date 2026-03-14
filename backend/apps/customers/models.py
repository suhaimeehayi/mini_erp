from django.db import models

class Customer(models.Model):

    name = models.CharField(max_length=255)

    email = models.EmailField(blank=True)

    phone = models.CharField(max_length=20)

    address = models.TextField(blank=True)

    company = models.CharField(max_length=255, blank=True)

    tax_number = models.CharField(max_length=50, blank=True)

    status = models.CharField(max_length=20, default="active")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
