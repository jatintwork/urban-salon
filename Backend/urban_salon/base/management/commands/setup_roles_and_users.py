from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from base.models import Users, Role, UserRoleMapping

class Command(BaseCommand):
    help = 'Creates default roles and users'

    def handle(self, *args, **kwargs):
        # Create roles
        roles = {
            'admin': 'Administrator with full access',
            'client': 'Client with booking and service access',
            'user': 'Regular user with basic access',
            'guest': 'Guest with limited access'
        }

        created_roles = {}
        for role_name, description in roles.items():
            role, created = Role.objects.get_or_create(
                name=role_name,
                defaults={'role_desc': description}
            )
            created_roles[role_name] = role
            if created:
                self.stdout.write(self.style.SUCCESS(f'Successfully created role "{role_name}"'))
            else:
                self.stdout.write(self.style.WARNING(f'Role "{role_name}" already exists'))

        # Create users
        users_data = [
            {
                'username': 'admin_user',
                'email': 'admin@example.com',
                'password': 'admin123',
                'role': 'admin'
            },
            {
                'username': 'client_user',
                'email': 'client@example.com',
                'password': 'client123',
                'role': 'client'
            },
            {
                'username': 'regular_user',
                'email': 'user@example.com',
                'password': 'user123',
                'role': 'user'
            },
            {
                'username': 'guest_user',
                'email': 'guest@example.com',
                'password': 'guest123',
                'role': 'guest'
            }
        ]

        for user_data in users_data:
            user, created = Users.objects.get_or_create(
                username=user_data['username'],
                defaults={
                    'email': user_data['email'],
                    'password': make_password(user_data['password']),
                    'is_active': True
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'Successfully created user "{user_data["username"]}"'))
            else:
                self.stdout.write(self.style.WARNING(f'User "{user_data["username"]}" already exists'))

            # Map user to role
            UserRoleMapping.objects.get_or_create(
                user=user,
                role=created_roles[user_data['role']]
            )
            self.stdout.write(self.style.SUCCESS(f'Mapped user "{user_data["username"]}" to role "{user_data["role"]}"')) 