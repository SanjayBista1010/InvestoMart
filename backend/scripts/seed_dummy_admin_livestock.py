import os
import django
import sys
from decimal import Decimal
import uuid
from datetime import date, timedelta

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'investomart.settings')
django.setup()

from django.contrib.auth import get_user_model
from data.models import Livestock, Product

User = get_user_model()

def run():
    print("Starting to add dummy livestock for admin...")
    
    # Try to find the admin user. Often username is 'admin' or ID 1.
    try:
        admin_user = User.objects.get(username='admin')
    except User.DoesNotExist:
        try:
            admin_user = User.objects.get(is_superuser=True)
            print(f"Found superuser: {admin_user.username}")
        except User.DoesNotExist:
            print("No admin user found. Creating one...")
            admin_user = User.objects.create_superuser('admin', 'admin@example.com', 'adminpass123')
            admin_user.user_id = 'USR-ADMIN'
            admin_user.save()

    livestock_data = [
        # Goats
        {
            'type': 'goat', 'breed': 'Boer', 'name': 'Billy',
            'weight': 45.5, 'price': 15000, 'age_months': 12, 'gender': 'male'
        },
        {
            'type': 'goat', 'breed': 'Jamunapari', 'name': 'Nanny',
            'weight': 35.0, 'price': 12000, 'age_months': 18, 'gender': 'female'
        },
        # Chickens
        {
            'type': 'chicken', 'breed': 'Local', 'name': 'Batch A',
            'weight': 1.5, 'price': 1500, 'age_months': 6, 'gender': 'female', 'quantity': 50
        },
        {
            'type': 'chicken', 'breed': 'Giriraja', 'name': 'Batch B',
            'weight': 2.0, 'price': 1800, 'age_months': 8, 'gender': 'male', 'quantity': 20
        },
        # Buffalos
        {
            'type': 'buffalo', 'breed': 'Murrah', 'name': 'Big Boy',
            'weight': 500.0, 'price': 85000, 'age_months': 36, 'gender': 'male'
        },
        {
            'type': 'buffalo', 'breed': 'Local', 'name': 'Milky',
            'weight': 450.0, 'price': 75000, 'age_months': 48, 'gender': 'female'
        }
    ]

    for data in livestock_data:
        animal_id = f"ANI-{uuid.uuid4().hex[:8].upper()}"
        birth_date = date.today() - timedelta(days=data['age_months'] * 30)
        
        # Create Livestock
        animal = Livestock.objects.create(
            animal_id=animal_id,
            type=data['type'],
            breed=data['breed'],
            name=data['name'],
            tag_number=f"TAG-{uuid.uuid4().hex[:6].upper()}",
            birth_date=birth_date,
            gender=data['gender'],
            owner=admin_user,
            purchase_date=date.today() - timedelta(days=30),
            purchase_price=Decimal(str(data['price'] * 0.8)),
            current_value=Decimal(str(data['price'])),
            current_weight=Decimal(str(data['weight'])),
            farm_id='Admin Farm',
            status='active'
        )
        print(f"Created Livestock: {animal.type} - {animal.breed}")

        # Create corresponding Product listing
        product_id = f"PROD-{uuid.uuid4().hex[:8].upper()}"
        Product.objects.create(
            product_id=product_id,
            animal=animal,
            title=f"{data['breed']} {data['type'].capitalize()}",
            description=f"Healthy {data['breed']} {data['type']}. Weight: {data['weight']}kg.",
            category=data['type'],
            base_price=Decimal(str(data['price'])),
            current_price=Decimal(str(data['price'])),
            seller=admin_user,
            farm_id='Admin Farm',
            location='Main Farm Location',
            quantity=data.get('quantity', 1),
            status='active'
        )
        print(f"Created Product Listing for {animal.type}")

    print("Successfully added dummy livestock data!")

if __name__ == '__main__':
    run()
