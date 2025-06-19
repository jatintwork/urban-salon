from django.core.management.base import BaseCommand
from company_services.models import ServiceCategory, Service

class Command(BaseCommand):
    help = 'Creates default service categories and services'

    def handle(self, *args, **kwargs):
        # Define service categories and their services
        services_data = {
            'Hair Services': [
                {'name': 'Haircut & Styling', 'price': 30.00, 'duration': 45},
                {'name': 'Hair Coloring', 'price': 60.00, 'duration': 120},
                {'name': 'Hair Treatment', 'price': 45.00, 'duration': 60},
                {'name': 'Hair Extensions', 'price': 150.00, 'duration': 180},
            ],
            'Nail Services': [
                {'name': 'Manicure', 'price': 25.00, 'duration': 45},
                {'name': 'Pedicure', 'price': 35.00, 'duration': 60},
                {'name': 'Nail Art', 'price': 20.00, 'duration': 30},
                {'name': 'Gel Nails', 'price': 40.00, 'duration': 90},
            ],
            'Spa & Massage': [
                {'name': 'Swedish Massage', 'price': 70.00, 'duration': 60},
                {'name': 'Deep Tissue Massage', 'price': 85.00, 'duration': 60},
                {'name': 'Hot Stone Massage', 'price': 95.00, 'duration': 90},
                {'name': 'Facial Treatment', 'price': 65.00, 'duration': 60},
            ],
            'Beauty Packages': [
                {'name': 'Bridal Package', 'price': 200.00, 'duration': 240},
                {'name': 'Party Makeup', 'price': 80.00, 'duration': 90},
                {'name': 'Full Body Treatment', 'price': 150.00, 'duration': 180},
                {'name': 'Skin Care Package', 'price': 120.00, 'duration': 120},
            ]
        }

        # Create categories and services
        for category_name, services in services_data.items():
            category, created = ServiceCategory.objects.get_or_create(
                name=category_name,
                defaults={'description': f'Various {category_name.lower()} offered at our salon'}
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'Successfully created category "{category_name}"'))
            else:
                self.stdout.write(self.style.WARNING(f'Category "{category_name}" already exists'))

            # Create services for this category
            for service_data in services:
                service, created = Service.objects.get_or_create(
                    name=service_data['name'],
                    category=category,
                    defaults={
                        'price': service_data['price'],
                        'duration_minutes': service_data['duration'],
                        'description': f'Professional {service_data["name"].lower()} service'
                    }
                )
                
                if created:
                    self.stdout.write(self.style.SUCCESS(
                        f'Successfully created service "{service_data["name"]}" in category "{category_name}"'
                    ))
                else:
                    self.stdout.write(self.style.WARNING(
                        f'Service "{service_data["name"]}" already exists in category "{category_name}"'
                    )) 