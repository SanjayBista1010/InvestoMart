"""
Nepal Specific Livestock Seeding Script
Populates MongoDB with realistic dummy data for native/popular breeds in Nepal.
"""

import os
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime, timedelta
import random

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI')
DB_NAME = os.getenv('MONGO_DB_NAME', 'django_project') # Based on your views.py fallback to django_project or goatfarm
if not MONGO_URI:
    print("❌ MONGO_URI missing in environment variables!")
    exit(1)

client = MongoClient(MONGO_URI)
# In investomart settings.py, MONGODB_NAME = os.getenv('MONGO_DB_NAME', 'goatfarm')
db = client['goatfarm']

def random_date(start_days_ago, end_days_ago=0):
    start = datetime.now() - timedelta(days=start_days_ago)
    end = datetime.now() - timedelta(days=end_days_ago)
    return start + (end - start) * random.random()

def get_or_create_users():
    users = list(db.users.find({}))
    if not users:
        print("No users found. Creating dummy users...")
        demo_hash = "pbkdf2_sha256$870000$Z9o9o9o9o9o9$C9o9o9o9o9o9o9o9o9o9o9o9o9o9o9o9o9o9o9o9o9o=" 
        users_docs = [
            {
                'user_id': 'NEP001',
                'email': 'farmer.ram@nepal.com',
                'username': 'ram_bdr',
                'password_hash': demo_hash,
                'first_name': 'Ram',
                'last_name': 'Bahadur',
                'phone': '+9779841000001',
                'kyc_status': 'verified',
                'account_status': 'active',
                'total_invested': 500000,
                'portfolio_value': 650000,
                'created_at': random_date(365),
            },
            {
                'user_id': 'NEP002',
                'email': 'sita.devi@nepal.com',
                'username': 'sita_devi',
                'password_hash': demo_hash,
                'first_name': 'Sita',
                'last_name': 'Devi',
                'phone': '+9779841000002',
                'kyc_status': 'verified',
                'account_status': 'active',
                'total_invested': 300000,
                'portfolio_value': 350000,
                'created_at': random_date(200),
            }
        ]
        db.users.insert_many(users_docs)
        return list(db.users.find({}))
    return users

def seed_nepal_livestock(users):
    """Create sample livestock specific to Nepal"""
    livestock_data = []
    
    # Prices in NPR approx
    animal_types = [
        {'type': 'goat', 'breeds': ['Khari', 'Terai', 'Sinhal', 'Chyangra', 'Jamunapari Cross', 'Boer Cross'], 'base_price': 18000},
        {'type': 'chicken', 'breeds': ['Sakini', 'Ghanti Khuile', 'Pwakh Ulte', 'Kuroiler', 'Giriraja'], 'base_price': 1500},
        {'type': 'buffalo', 'breeds': ['Lime', 'Parkote', 'Gaddi', 'Murrah Cross'], 'base_price': 90000},
    ]
    
    # Get max existing animal ID
    existing_animals = list(db.livestock.find({}, {"animal_id": 1}))
    animal_id_counter = len(existing_animals) + 1
    
    locations = ['Kavrepalanchok', 'Chitwan', 'Pokhara', 'Ilam', 'Surkhet', 'Dhading', 'Nuwakot', 'Sindhuli']
    
    for i in range(40): # Generate 40 animals
        user = random.choice(users)
        animal_type = random.choice(animal_types)
        purchase_date = random_date(365, 30)
        age_months = (datetime.now() - purchase_date).days // 30
        
        # Adjust weight and price based on type
        if animal_type['type'] == 'goat':
            weight = random.randint(15, 60)
            price_variance = random.randint(-4000, 8000)
        elif animal_type['type'] == 'chicken':
            weight = random.uniform(1.0, 4.5)
            price_variance = random.randint(-300, 1000)
        else: # buffalo
            weight = random.randint(250, 600)
            price_variance = random.randint(-15000, 40000)
            
        livestock = {
            'animal_id': f"{animal_type['type'].upper()[:3]}{animal_id_counter:04d}",
            'type': animal_type['type'],
            'breed': random.choice(animal_type['breeds']),
            'owner_id': user.get('user_id', str(user['_id'])),
            'tag_number': f"NPL-TAG{animal_id_counter:04d}",
            'gender': random.choice(['male', 'female']),
            'birth_date': purchase_date - timedelta(days=random.randint(180, 700)),
            'age_months': age_months,
            'purchase_date': purchase_date,
            'purchase_price': animal_type['base_price'] + price_variance - random.randint(100, 1000),
            'current_value': animal_type['base_price'] + price_variance,
            'current_weight': round(weight, 2),
            'health_status': random.choice(['healthy'] * 7 + ['sick', 'quarantine', 'pregnant']),
            'status': 'active',
            'farm_id': f"NPL-FARM-{random.randint(1, 10)}",
            'location': random.choice(locations),
            'pen_number': f"PEN-{random.randint(1, 15)}",
            'last_checkup': random_date(45, 5),
            'next_checkup': datetime.now() + timedelta(days=random.randint(15, 60)),
            'created_at': purchase_date,
            'origin': 'Nepal'
        }
        livestock_data.append(livestock)
        animal_id_counter += 1
    
    if livestock_data:
        result = db.livestock.insert_many(livestock_data)
        print(f"✅ Created {len(result.inserted_ids)} Nepal-specific livestock records")
    return livestock_data

def seed_nepal_products(livestock_list):
    """Create products for sale based on Nepal livestock"""
    products = []
    
    existing_prods = list(db.products.find({}, {"product_id": 1}))
    product_id_counter = len(existing_prods) + 1
    
    for animal in livestock_list[:25]:  # Put 25 animals up for sale
        
        if animal['type'] == 'goat':
            desc = f"Healthy {animal['breed']} Khasi/Bakhra from {animal['location']}. Best for meat or breeding. Weight is around {animal['current_weight']}kg."
        elif animal['type'] == 'chicken':
            desc = f"Local {animal['breed']} Kukhura from {animal['location']}. Pure free-range, raised organically."
        else:
            desc = f"High yielding {animal['breed']} Bhaisi from {animal['location']}. Great milk production capacity and very healthy."
            
        product = {
            'product_id': f"NPL-PROD{product_id_counter:04d}",
            'animal_id': animal['animal_id'],
            'title': f"Pure {animal['breed']} {animal['type'].title()} from {animal['location']}",
            'description': desc,
            'name': f"Pure {animal['breed']} {animal['type'].title()} from {animal['location']}", # added name field which chatbot vector search uses
            'category': animal['type'],
            'base_price': animal['current_value'],
            'current_price': animal['current_value'] * random.uniform(1.0, 1.15),
            'current_market_price': animal['current_value'] * random.uniform(1.0, 1.15), # added current_market_price
            'seller_id': animal['owner_id'],
            'status': random.choice(['active'] * 4 + ['sold']),
            'views': random.randint(100, 1500),
            'favorites': random.randint(10, 200),
            'featured': random.choice([True, False]),
            'location': animal['location'],
            'roi_estimate': random.randint(12, 35),
            'risk_level': random.choice(['low', 'medium']),
            'created_at': random_date(30, 1),
            'origin': 'Nepal'
        }
        products.append(product)
        product_id_counter += 1
    
    if products:
        result = db.products.insert_many(products)
        print(f"✅ Created {len(result.inserted_ids)} Nepal-specific products")
    return products

def main():
    print("="*60)
    print("🇳🇵 Seeding GoatFarm Database with Nepal Specific Livestock Data")
    print("="*60 + "\n")
    
    users = get_or_create_users()
    livestock = seed_nepal_livestock(users)
    products = seed_nepal_products(livestock)
    
    print("\n" + "="*60)
    print("🎉 Nepal specific data seeding complete!")
    print("="*60)

if __name__ == "__main__":
    main()
    client.close()
