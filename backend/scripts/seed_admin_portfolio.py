import os
from datetime import datetime, timedelta
import random
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv('MONGO_URI')
DB_NAME = os.getenv('MONGO_DB_NAME', 'goatfarm')
client = MongoClient(MONGO_URI)
db = client[DB_NAME]

def random_date(start_days_ago, end_days_ago=0):
    start = datetime.now() - timedelta(days=start_days_ago)
    end = datetime.now() - timedelta(days=end_days_ago)
    return start + (end - start) * random.random()

def seed_admin_portfolio():
    admin_id_str = 'ADM001'
    admin_username = 'admin'

    print(f"Generating portfolio for {admin_username} (ID: {admin_id_str})")

    # 1. Clean existing dummy admin livestock and transactions
    db.livestock.delete_many({"owner": admin_username})
    db.transactions.delete_many({"$or": [{"buyer_id": admin_id_str}, {"seller_id": admin_id_str}, {"buyer_id": "1"}, {"seller_id": "1"}]})

    animal_types = [
        {'type': 'goat', 'breeds': ['Boer', 'Khari', 'Jamunapari'], 'base_price': 18000, 'icon': '🐐'},
        {'type': 'chicken', 'breeds': ['Kuroiler', 'Giriraja'], 'base_price': 1500, 'icon': '🐔'},
        {'type': 'buffalo', 'breeds': ['Murrah', 'Lime'], 'base_price': 90000, 'icon': '🐃'},
    ]

    # Generate active livestock holdings
    livestock_data = []
    
    # Let's say Admin owns 50 Goats, 200 Chickens, 8 Buffalos
    # Instead of creating 258 individual docs, we'll create the actual docs for the portfolio aggregation
    # The portfolio view aggregates the sum of `current_value` matching "owner"
    def add_livestock(a_type, count, base_value):
        nonlocal livestock_data
        for i in range(count):
            livestock_data.append({
                'animal_id': f"ADM-{a_type['type'].upper()[:3]}-{i}",
                'tag_number': f"ADM-TAG-{a_type['type'].upper()[:3]}-{i}-{random.randint(1000, 9999)}",
                'type': a_type['type'],
                'breed': random.choice(a_type['breeds']),
                'owner': admin_username,
                'owner_id': admin_id_str,
                'status': 'active',
                'purchase_price': base_value,
                'current_value': base_value * random.uniform(1.0, 1.2), # Slight appreciation
                'created_at': random_date(180, 10),
                'origin': 'Admin Seeding'
            })

    # Let's insert a reasonable count so it looks impressive but not memory heavy
    add_livestock(animal_types[0], 25, 20000) # 25 Goats
    add_livestock(animal_types[1], 150, 1200) # 150 Chickens
    add_livestock(animal_types[2], 5, 85000)  # 5 Buffalos
    
    if livestock_data:
        db.livestock.insert_many(livestock_data)
        print(f"Inserted {len(livestock_data)} active animals into Admin Portfolio.")

    # Generate transactions history
    transactions_data = []
    
    for i in range(30): # 30 Transactions
        is_seller = random.choice([True, False])
        a_type = random.choice(animal_types)
        
        buyer_id = 'SOME_OTHER_ID' if is_seller else admin_id_str
        seller_id = admin_id_str if is_seller else 'SOME_OTHER_ID'
        
        qty = random.randint(1, 10) if a_type['type'] != 'chicken' else random.randint(20, 100)
        total_amount = qty * a_type['base_price'] * random.uniform(0.9, 1.1)
        
        txn_date = random_date(90)
        
        transactions_data.append({
            'transaction_id': f"TXN-ADM-{random.randint(100000, 999999)}",
            'buyer_id': buyer_id,
            'seller_id': seller_id,
            'status': 'completed',
            'payment_date': txn_date,
            'total_amount': total_amount,
            'items': [{
                'item_type': 'livestock',
                'name': f"{random.choice(a_type['breeds'])} {a_type['type'].capitalize()}",
                'quantity': qty,
                'price': total_amount / qty
            }]
        })
        
    if transactions_data:
        db.transactions.insert_many(transactions_data)
        print(f"Inserted {len(transactions_data)} transactions into Admin history.")


if __name__ == "__main__":
    seed_admin_portfolio()
