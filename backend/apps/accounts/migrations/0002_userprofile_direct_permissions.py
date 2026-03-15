from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='direct_permissions',
            field=models.ManyToManyField(blank=True, related_name='user_profiles', to='accounts.permission'),
        ),
    ]