from django.db import migrations, models


def remap_sales_order_statuses(apps, schema_editor):
    SalesOrder = apps.get_model('sales', 'SalesOrder')

    SalesOrder.objects.filter(status='confirmed').update(status='paid')
    SalesOrder.objects.filter(status='shipped').update(status='shipping')


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0003_salesorder_inventory_deducted_and_more'),
    ]

    operations = [
        migrations.RunPython(remap_sales_order_statuses, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='salesorder',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending', 'Pending'),
                    ('paid', 'Paid'),
                    ('shipping', 'Shipping'),
                    ('delivered', 'Delivered'),
                    ('cancelled', 'Cancelled'),
                ],
                default='pending',
                max_length=20,
            ),
        ),
    ]