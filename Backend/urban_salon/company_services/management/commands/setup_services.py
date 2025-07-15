from django.core.management.base import BaseCommand
from company_services.models import ServiceCategory, Service, ServiceRequest, Payment, RatingReview
from base.models import Users
from django.utils import timezone
import random

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

        # --- DUMMY USERS ---
        try:
            client = Users.objects.get(username='client_user')
            provider = Users.objects.get(username='regular_user')
        except Users.DoesNotExist:
            self.stdout.write(self.style.ERROR('Required users not found. Please run setup_roles_and_users first.'))
            return

        # --- DUMMY SERVICE REQUESTS, PAYMENTS, RATINGS ---
        all_services = list(Service.objects.all())
        locations = ['Downtown Salon', 'Uptown Branch', 'City Center']
        statuses = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED']
        for i in range(3):
            service = random.choice(all_services)
            status = statuses[-1] if i == 2 else random.choice(statuses)  # Ensure at least one COMPLETED
            sr, created = ServiceRequest.objects.get_or_create(
                client=client,
                service=service,
                scheduled_datetime=timezone.now() + timezone.timedelta(days=i),
                location=locations[i % len(locations)],
                status=status,
                assigned_provider=provider,
                defaults={'created_by': client.username}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created ServiceRequest {sr}'))
            else:
                self.stdout.write(self.style.WARNING(f'ServiceRequest {sr} already exists'))

            # Payment only for completed
            if sr.status == 'COMPLETED':
                payment, created = Payment.objects.get_or_create(
                    service_request=sr,
                    defaults={
                        'amount': service.price,
                        'payment_status': 'SUCCESS',
                        'payment_mode': 'Credit Card',
                        'created_by': client.username
                    }
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f'Created Payment {payment}'))
                else:
                    self.stdout.write(self.style.WARNING(f'Payment {payment} already exists'))

                # RatingReview for completed
                rating, created = RatingReview.objects.get_or_create(
                    service_request=sr,
                    defaults={
                        'rating': random.randint(3, 5),
                        'review': f'Great service {i+1}',
                        'created_by': client.username
                    }
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f'Created RatingReview {rating}'))
                else:
                    self.stdout.write(self.style.WARNING(f'RatingReview {rating} already exists')) 