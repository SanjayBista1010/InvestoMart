"""
Run this script to populate your products collection in MongoDB
Save as: setup_products.py in your project root
Run with: python setup_products.py
"""

from pymongo import MongoClient
from bson import ObjectId
from decouple import config
from datetime import datetime

# Connect to MongoDB
MONGO_URI = config('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client['django_project']

# Define products with the exact IDs from your investments
products = [
    {
        '_id': ObjectId('691d7e69b02ebb4e296514a1'),
        'name': 'Gold Bar 10g',
        'description': 'Premium 10 gram gold bar - 24K pure gold',
        'category': 'Precious Metals',
        'current_market_price': 81000,  # NRS per unit
        'unit': 'piece',
        'created_at': datetime.utcnow()
    },
    {
        '_id': ObjectId('691d7e69b02ebb4e296514a2'),
        'name': 'Silver Coin 1oz',
        'description': 'Pure silver coin - 1 troy ounce',
        'category': 'Precious Metals',
        'current_market_price': 55000,  # NRS per unit
        'unit': 'piece',
        'created_at': datetime.utcnow()
    },
    {
        '_id': ObjectId('691d7e69b02ebb4e296514a3'),
        'name': 'Platinum Bar 5g',
        'description': 'Premium 5 gram platinum bar',
        'category': 'Precious Metals',
        'current_market_price': 45000,  # NRS per unit
        'unit': 'piece',
        'created_at': datetime.utcnow()
    },
    {
        '_id': ObjectId('691d7e69b02ebb4e296514a4'),
        'name': 'Copper Ingot 1kg',
        'description': 'High purity copper ingot',
        'category': 'Base Metals',
        'current_market_price': 40000,  # NRS per unit
        'unit': 'kg',
        'created_at': datetime.utcnow()
    },
    {
        '_id': ObjectId('691d7e69b02ebb4e296514a5'),
        'name': 'Diamond 0.5 Carat',
        'description': 'Certified natural diamond',
        'category': 'Gemstones',
        'current_market_price': 22000,  # NRS per unit
        'unit': 'piece',
        'created_at': datetime.utcnow()
    }
]

print("🚀 Setting up products in MongoDB...")

try:
    # Drop existing products to avoid duplicates
    db.products.delete_many({})
    print("🗑️  Cleared existing products")
    
    # Insert new products
    result = db.products.insert_many(products)
    print(f"✅ Inserted {len(result.inserted_ids)} products")
    
    # Verify
    count = db.products.count_documents({})
    print(f"📊 Total products in database: {count}")
    
    # Display all products
    print("\n📦 Products created:")
    for product in db.products.find():
        print(f"  - {product['name']}: NRS {product['current_market_price']:,}")
    
    print("\n✅ Setup complete! Your chatbot should now show product names.")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

finally:
    client.close()