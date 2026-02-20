"""
Enterprise Data Seeding Script
Populates MongoDB with realistic dummy data for dashboard (excludes chatbot data)
"""

import os
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime, timedelta
import random
from bson import ObjectId

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI')
DB_NAME = os.getenv('MONGO_DB_NAME', 'goatfarm')

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# Sample data generation helpers
def random_date(start_days_ago, end_days_ago=0):
    """Generate random date within range"""
    start = datetime.now() - timedelta(days=start_days_ago)
    end = datetime.now() - timedelta(days=end_days_ago)
    return start + (end - start) * random.random()

def seed_users():
    """Create sample users"""
    # Standard Django PBKDF2 hash for password 'admin123'
    # pbkdf2_sha256$870000$salt$hash...
    # For demo purposes, we can use a pre-calculated hash
    demo_hash = "pbkdf2_sha256$870000$Z9o9o9o9o9o9$C9o9o9o9o9o9o9o9o9o9o9o9o9o9o9o9o9o9o9o9o9o=" 

    users = [
        {
            'user_id': 'USR001',
            'email': 'john.investor@email.com',
            'username': 'john_investor',
            'password_hash': demo_hash,
            'first_name': 'John',
            'last_name': 'Smith',
            'phone': '+1234567890',
            'kyc_status': 'verified',
            'account_status': 'active',
            'total_invested': 125000,
            'portfolio_value': 145000,
            'created_at': random_date(180),
        },
        {
            'user_id': 'USR002',
            'email': 'sarah.trader@email.com',
            'username': 'sarah_trader',
            'password_hash': demo_hash,
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'phone': '+1234567891',
            'kyc_status': 'verified',
            'account_status': 'active',
            'total_invested': 85000,
            'portfolio_value': 92000,
            'created_at': random_date(150),
        },
        {
            'user_id': 'USR003',
            'email': 'demo@goatfarm.com',
            'username': 'demo_user',
            'password_hash': demo_hash,
            'first_name': 'Demo',
            'last_name': 'User',
            'phone': '+1234567892',
            'kyc_status': 'verified',
            'account_status': 'active',
            'total_invested': 50000,
            'portfolio_value': 58000,
            'created_at': random_date(90),
        },
        {
            'user_id': 'ADM001',
            'email': 'admin@goatfarm.com',
            'username': 'admin',
            'password_hash': demo_hash,
            'first_name': 'System',
            'last_name': 'Admin',
            'phone': '+1234567899',
            'kyc_status': 'verified',
            'account_status': 'active',
            'roles': ['admin', 'manager'],
            'created_at': random_date(365),
        }
    ]
    
    result = db.users.insert_many(users)
    print(f"✅ Created {len(result.inserted_ids)} users")
    return users

def seed_livestock(users):
    """Create sample livestock"""
    livestock_data = []
    animal_types = [
        {'type': 'goat', 'breeds': ['Boer', 'Nubian', 'Alpine'], 'base_price': 800},
        {'type': 'chicken', 'breeds': ['Rhode Island Red', 'Leghorn', 'Plymouth Rock'], 'base_price': 50},
        {'type': 'buffalo', 'breeds': ['Murrah', 'Nili-Ravi', 'Surti'], 'base_price': 2500},
        {'type': 'cow', 'breeds': ['Holstein', 'Jersey', 'Angus'], 'base_price': 1500},
    ]
    
    animal_id_counter = 1
    for user in users[:2]:  # First 2 users own animals
        for animal_type in animal_types:
            for i in range(random.randint(3, 8)):
                purchase_date = random_date(180, 30)
                age_months = (datetime.now() - purchase_date).days // 30
                
                livestock = {
                    'animal_id': f"{animal_type['type'].upper()[:3]}{animal_id_counter:03d}",
                    'type': animal_type['type'],
                    'breed': random.choice(animal_type['breeds']),
                    'owner_id': user['user_id'],
                    'tag_number': f"TAG{animal_id_counter:04d}",
                    'gender': random.choice(['male', 'female']),
                    'birth_date': purchase_date - timedelta(days=random.randint(180, 900)),
                    'age_months': age_months,
                    'purchase_date': purchase_date,
                    'purchase_price': animal_type['base_price'] + random.randint(-100, 300),
                    'current_value': animal_type['base_price'] + random.randint(100, 500),
                    'current_weight': random.randint(40, 150) if animal_type['type'] != 'chicken' else random.randint(2, 5),
                    'health_status': random.choice(['healthy'] * 8 + ['sick', 'quarantine']),
                    'status': 'active',
                    'farm_id': 'FARM001',
                    'pen_number': f"PEN-{random.randint(1, 20)}",
                    'last_checkup': random_date(45, 5),
                    'next_checkup': datetime.now() + timedelta(days=random.randint(15, 60)),
                    'created_at': purchase_date,
                }
                livestock_data.append(livestock)
                animal_id_counter += 1
    
    result = db.livestock.insert_many(livestock_data)
    print(f"✅ Created {len(result.inserted_ids)} livestock")
    return livestock_data

def seed_health_records(livestock_list):
    """Create vaccination and health records"""
    health_records = []
    record_id_counter = 1
    
    vaccines = ['PPR Vaccine', 'Foot & Mouth', 'Deworming', 'Brucellosis', 'Rabies']
    
    for animal in livestock_list[:30]:  # First 30 animals have health records
        num_records = random.randint(2, 5)
        for i in range(num_records):
            record_date = random_date(120, 10)
            record = {
                'record_id': f"HR{record_id_counter:04d}",
                'animal_id': animal['animal_id'],
                'record_type': random.choice(['vaccination', 'checkup', 'treatment']),
                'date': record_date,
                'vet_name': random.choice(['Dr. Smith', 'Dr. Johnson', 'Dr. Williams']),
                'vaccine_name': random.choice(vaccines),
                'dose_number': random.randint(1, 3),
                'vaccination_status': random.choice(['completed'] * 7 + ['due_soon', 'overdue']),
                'next_due_date': record_date + timedelta(days=random.randint(60, 180)),
                'total_cost': random.randint(50, 300),
                'notes': f"Routine vaccination for {animal['type']}",
                'created_at': record_date,
            }
            health_records.append(record)
            record_id_counter += 1
    
    result = db.health_records.insert_many(health_records)
    print(f"✅ Created {len(result.inserted_ids)} health records")
    return health_records

def seed_products(livestock_list):
    """Create products for sale"""
    products = []
    product_id_counter = 1
    
    for animal in livestock_list[:15]:  # First 15 animals listed for sale
        product = {
            'product_id': f"PROD{product_id_counter:04d}",
            'animal_id': animal['animal_id'],
            'title': f"Premium {animal['breed']} {animal['type'].title()} - {animal['age_months']} months",
            'description': f"Healthy {animal['gender']} {animal['type']} ready for investment. Excellent health status.",
            'category': animal['type'],
            'base_price': animal['current_value'],
            'current_price': animal['current_value'] * random.uniform(0.95, 1.15),
            'seller_id': animal['owner_id'],
            'status': random.choice(['active'] * 8 + ['reserved', 'sold']),
            'views': random.randint(50, 500),
            'favorites': random.randint(5, 50),
            'featured': random.choice([True, False]),
            'location': 'Farm District, Region 5',
            'roi_estimate': random.randint(15, 35),
            'risk_level': random.choice(['low'] * 5 + ['medium'] * 3 + ['high']),
            'created_at': random_date(60, 5),
        }
        products.append(product)
        product_id_counter += 1
    
    result = db.products.insert_many(products)
    print(f"✅ Created {len(result.inserted_ids)} products")
    return products

def seed_transactions(users, products):
    """Create transaction history"""
    transactions = []
    txn_id_counter = 1
    
    for i in range(25):  # 25 transactions
        buyer = random.choice(users)
        product = random.choice(products)
        txn_date = random_date(90, 1)
        
        transaction = {
            'transaction_id': f"TXN{txn_id_counter:05d}",
            'type': random.choice(['purchase'] * 7 + ['sale', 'dividend']),
            'status': random.choice(['completed'] * 8 + ['pending', 'processing']),
            'buyer_id': buyer['user_id'],
            'buyer_name': f"{buyer['first_name']} {buyer['last_name']}",
            'product_id': product['product_id'],
            'subtotal': product['current_price'],
            'tax': product['current_price'] * 0.05,
            'platform_fee': product['current_price'] * 0.02,
            'total_amount': product['current_price'] * 1.07,
            'currency': 'USD',
            'payment_method': random.choice(['card', 'bank_transfer', 'wallet']),
            'payment_date': txn_date,
            'created_at': txn_date,
        }
        transactions.append(transaction)
        txn_id_counter += 1
    
    result = db.transactions.insert_many(transactions)
    print(f"✅ Created {len(result.inserted_ids)} transactions")
    return transactions

def seed_dashboard_analytics(users, livestock_list):
    """Create daily dashboard analytics"""
    analytics = []
    
    for user in users[:2]:  # First 2 users
        user_livestock = [l for l in livestock_list if l['owner_id'] == user['user_id']]
        
        # Last 30 days of data
        for days_ago in range(30):
            date = datetime.now() - timedelta(days=days_ago)
            
            analytics_record = {
                'user_id': user['user_id'],
                'date': date,
                'total_animals': len(user_livestock),
                'goats_count': len([l for l in user_livestock if l['type'] == 'goat']),
                'chickens_count': len([l for l in user_livestock if l['type'] == 'chicken']),
                'buffalos_count': len([l for l in user_livestock if l['type'] == 'buffalo']),
                'cows_count': len([l for l in user_livestock if l['type'] == 'cow']),
                'healthy_count': len([l for l in user_livestock if l['health_status'] == 'healthy']),
                'sick_count': len([l for l in user_livestock if l['health_status'] == 'sick']),
                'total_invested': user['total_invested'],
                'current_value': user['portfolio_value'],
                'profit_loss': user['portfolio_value'] - user['total_invested'],
                'roi_percentage': ((user['portfolio_value'] - user['total_invested']) / user['total_invested']) * 100,
                'milk_liters': random.randint(50, 150),
                'eggs_count': random.randint(100, 300),
                'created_at': date,
            }
            analytics.append(analytics_record)
    
    result = db.dashboard_analytics.insert_many(analytics)
    print(f"✅ Created {len(result.inserted_ids)} analytics records")

def main():
    """Main seeding function"""
    print("="*60)
    print("🌱 Seeding GoatFarm Database with Enterprise Data (Excluding Chatbot)")
    print("="*60 + "\n")
    
    # Clear existing data
    print("🗑️  Clearing existing data...")
    for collection in db.list_collection_names():
        db[collection].delete_many({})
    print("✅ Cleared\n")
    
    print("📊 Generating data...\n")
    
    users = seed_users()
    livestock = seed_livestock(users)
    health_records = seed_health_records(livestock)
    products = seed_products(livestock)
    transactions = seed_transactions(users, products)
    seed_dashboard_analytics(users, livestock)
    
    print("\n" + "="*60)
    print("🎉 Database seeding complete!")
    print("="*60)
    print("\n📋 Summary:")
    print(f"   Users: {db.users.count_documents({})}")
    print(f"   Livestock: {db.livestock.count_documents({})}")
    print(f"   Health Records: {db.health_records.count_documents({})}")
    print(f"   Products: {db.products.count_documents({})}")
    print(f"   Transactions: {db.transactions.count_documents({})}")
    print(f"   Dashboard Analytics: {db.dashboard_analytics.count_documents({})}")
    print("\n✅ Dashboard is ready for development!\n")

if __name__ == "__main__":
    main()
    client.close()
