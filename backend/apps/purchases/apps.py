from django.apps import AppConfig


class PurchasesConfig(AppConfig):
    name = 'apps.purchases'

    def ready(self):
        import apps.purchases.signals
