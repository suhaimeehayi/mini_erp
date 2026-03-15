from django.db import migrations, models
import django.db.models.functions.text


def deduplicate_product_names(apps, schema_editor):
    Product = apps.get_model('products', 'Product')
    products = Product.objects.all().order_by('name', 'id')
    seen_names = {}

    for product in products:
        normalized_name = product.name.strip().lower()
        seen_names[normalized_name] = seen_names.get(normalized_name, 0) + 1

        if seen_names[normalized_name] == 1:
            continue

        suffix = product.sku.strip() if product.sku else f'ID-{product.pk}'
        product.name = f'{product.name} ({suffix})'
        product.save(update_fields=['name'])


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0002_alter_product_sku'),
    ]

    operations = [
        migrations.RunPython(deduplicate_product_names, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='product',
            name='sku',
            field=models.CharField(max_length=100, unique=True),
        ),
        migrations.AddConstraint(
            model_name='product',
            constraint=models.UniqueConstraint(
                django.db.models.functions.text.Lower('name'),
                name='products_product_name_ci_unique',
            ),
        ),
        migrations.AddConstraint(
            model_name='product',
            constraint=models.UniqueConstraint(
                django.db.models.functions.text.Lower('sku'),
                name='products_product_sku_ci_unique',
            ),
        ),
    ]