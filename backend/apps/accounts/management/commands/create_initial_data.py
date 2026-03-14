from django.core.management.base import BaseCommand
from apps.accounts.models import Role, Permission

class Command(BaseCommand):
    help = 'Create initial roles and permissions'

    def handle(self, *args, **options):
        # Create permissions
        permissions_data = [
            {'name': 'Can view users', 'codename': 'view_users'},
            {'name': 'Can add users', 'codename': 'add_users'},
            {'name': 'Can change users', 'codename': 'change_users'},
            {'name': 'Can delete users', 'codename': 'delete_users'},
            {'name': 'Can view roles', 'codename': 'view_roles'},
            {'name': 'Can add roles', 'codename': 'add_roles'},
            {'name': 'Can change roles', 'codename': 'change_roles'},
            {'name': 'Can delete roles', 'codename': 'delete_roles'},
            {'name': 'Can view products', 'codename': 'view_products'},
            {'name': 'Can add products', 'codename': 'add_products'},
            {'name': 'Can change products', 'codename': 'change_products'},
            {'name': 'Can delete products', 'codename': 'delete_products'},
            {'name': 'Can view sales orders', 'codename': 'view_sales_orders'},
            {'name': 'Can add sales orders', 'codename': 'add_sales_orders'},
            {'name': 'Can change sales orders', 'codename': 'change_sales_orders'},
            {'name': 'Can delete sales orders', 'codename': 'delete_sales_orders'},
            {'name': 'Can view purchase orders', 'codename': 'view_purchase_orders'},
            {'name': 'Can add purchase orders', 'codename': 'add_purchase_orders'},
            {'name': 'Can change purchase orders', 'codename': 'change_purchase_orders'},
            {'name': 'Can delete purchase orders', 'codename': 'delete_purchase_orders'},
            {'name': 'Can view inventory', 'codename': 'view_inventory'},
            {'name': 'Can add inventory', 'codename': 'add_inventory'},
            {'name': 'Can change inventory', 'codename': 'change_inventory'},
            {'name': 'Can delete inventory', 'codename': 'delete_inventory'},
            {'name': 'Can view customers', 'codename': 'view_customers'},
            {'name': 'Can add customers', 'codename': 'add_customers'},
            {'name': 'Can change customers', 'codename': 'change_customers'},
            {'name': 'Can delete customers', 'codename': 'delete_customers'},
            {'name': 'Can view suppliers', 'codename': 'view_suppliers'},
            {'name': 'Can add suppliers', 'codename': 'add_suppliers'},
            {'name': 'Can change suppliers', 'codename': 'change_suppliers'},
            {'name': 'Can delete suppliers', 'codename': 'delete_suppliers'},
        ]

        for perm_data in permissions_data:
            Permission.objects.get_or_create(
                codename=perm_data['codename'],
                defaults=perm_data
            )

        # Create roles
        roles_data = [
            {
                'name': 'Admin',
                'description': 'Full access to all features',
                'permissions': ['view_users', 'add_users', 'change_users', 'delete_users',
                              'view_roles', 'add_roles', 'change_roles', 'delete_roles',
                              'view_products', 'add_products', 'change_products', 'delete_products',
                              'view_sales_orders', 'add_sales_orders', 'change_sales_orders', 'delete_sales_orders',
                              'view_purchase_orders', 'add_purchase_orders', 'change_purchase_orders', 'delete_purchase_orders',
                              'view_inventory', 'add_inventory', 'change_inventory', 'delete_inventory',
                              'view_customers', 'add_customers', 'change_customers', 'delete_customers',
                              'view_suppliers', 'add_suppliers', 'change_suppliers', 'delete_suppliers']
            },
            {
                'name': 'Manager',
                'description': 'Management access with limited user control',
                'permissions': ['view_users', 'add_users', 'change_users',
                              'view_products', 'add_products', 'change_products', 'delete_products',
                              'view_sales_orders', 'add_sales_orders', 'change_sales_orders', 'delete_sales_orders',
                              'view_purchase_orders', 'add_purchase_orders', 'change_purchase_orders', 'delete_purchase_orders',
                              'view_inventory', 'change_inventory',
                              'view_customers', 'add_customers', 'change_customers', 'delete_customers',
                              'view_suppliers', 'add_suppliers', 'change_suppliers', 'delete_suppliers']
            },
            {
                'name': 'Sales',
                'description': 'Sales team access',
                'permissions': ['view_products', 'view_sales_orders', 'add_sales_orders', 'change_sales_orders',
                              'view_customers', 'add_customers', 'change_customers']
            },
            {
                'name': 'Purchasing',
                'description': 'Purchasing team access',
                'permissions': ['view_products', 'view_purchase_orders', 'add_purchase_orders', 'change_purchase_orders',
                              'view_suppliers', 'add_suppliers', 'change_suppliers', 'view_inventory']
            },
            {
                'name': 'Warehouse',
                'description': 'Warehouse staff access',
                'permissions': ['view_products', 'view_inventory', 'change_inventory',
                              'view_purchase_orders', 'change_purchase_orders', 'view_sales_orders']
            },
        ]

        for role_data in roles_data:
            role, created = Role.objects.get_or_create(
                name=role_data['name'],
                defaults={'description': role_data['description']}
            )
            if created:
                permissions = Permission.objects.filter(codename__in=role_data['permissions'])
                role.permissions.set(permissions)

        self.stdout.write(self.style.SUCCESS('Successfully created initial roles and permissions'))