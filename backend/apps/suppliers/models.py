from django.db import models

from django.db import models


class Supplier(models.Model):

    name = models.CharField(max_length=255)

    company_name = models.CharField(max_length=255, blank=True)

    contact_person = models.CharField(max_length=255, blank=True)

    email = models.EmailField(blank=True)

    phone = models.CharField(max_length=20)

    address = models.TextField(blank=True)

    tax_number = models.CharField(max_length=50, blank=True)

    website = models.URLField(blank=True)

    status = models.CharField(
        max_length=20,
        choices=[
            ("active","Active"),
            ("inactive","Inactive")
        ],
        default="active"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
