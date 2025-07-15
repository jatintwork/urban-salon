from django.apps import AppConfig


class CompanyServicesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'company_services'

    def ready(self):
        import company_services.signals
