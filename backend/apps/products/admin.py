from django.contrib import admin
from .models import Product


class ProductAdmin(admin.ModelAdmin):

    list_display = ("name", "sku", "price", "supplier", "created_at")

    search_fields = ("name", "sku")

    list_filter = ("supplier",)


admin.site.register(Product, ProductAdmin)