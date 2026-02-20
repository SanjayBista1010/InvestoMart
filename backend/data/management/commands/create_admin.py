"""
Management command to create a Django user from MongoDB admin data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates admin user in Django from MongoDB data'

    def handle(self, *args, **options):
        # Admin details from MongoDB
        username = 'admin'
        email = 'admin@goatfarm.com'
        password = 'admin123'
        first_name = 'System'
        last_name = 'Admin'
        user_id = 'ADM001'

        # Check if user exists
        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f'User "{username}" already exists. Updating password...'))
            user = User.objects.get(username=username)
            user.set_password(password)
            user.email = email
            user.first_name = first_name
            user.last_name = last_name
            user.user_id = user_id
            user.is_staff = True
            user.is_superuser = True
            user.kyc_status = 'verified'
            user.account_status = 'active'
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Updated user "{username}"'))
        else:
            # Create new user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )
            user.user_id = user_id
            user.is_staff = True
            user.is_superuser = True
            user.kyc_status = 'verified'
            user.account_status = 'active'
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Created admin user "{username}"'))

        self.stdout.write(self.style.SUCCESS(f'Username: {username}'))
        self.stdout.write(self.style.SUCCESS(f'Email: {email}'))
        self.stdout.write(self.style.SUCCESS(f'Password: {password}'))
        self.stdout.write(self.style.SUCCESS('✅ Admin user is ready!'))
