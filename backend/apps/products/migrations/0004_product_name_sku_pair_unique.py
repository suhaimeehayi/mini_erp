from django.db import migrations, models
import django.db.models.functions.text


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0003_enforce_unique_name_and_manual_sku'),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name='product',
            name='products_product_name_ci_unique',
        ),
        migrations.RemoveConstraint(
            model_name='product',
            name='products_product_sku_ci_unique',
        ),
        migrations.AlterField(
            model_name='product',
            name='sku',
            field=models.CharField(max_length=100),
        ),
        migrations.AddConstraint(
            model_name='product',
            constraint=models.UniqueConstraint(
                django.db.models.functions.text.Lower('name'),
                django.db.models.functions.text.Lower('sku'),
                name='products_product_name_sku_ci_unique',
            ),
        ),
    ]