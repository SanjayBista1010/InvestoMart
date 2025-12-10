# inspect_data.py
import pymongo
from pymongo import MongoClient

MONGO_URI = "mongodb+srv://SanjayBista1010:twitter1010@cluster0.on67wuv.mongodb.net/django_project?retryWrites=true&w=majority"

client = MongoClient(MONGO_URI)
db = client['django_project']

print("🔍 INSPECTING YOUR DATABASE STRUCTURE:\n")

# Check each collection structure
collections_to_check = [
    'chat_history', 
    'products', 
    'price_history', 
    'user_activities', 
    'user_investments'
]

for collection_name in collections_to_check:
    print(f"\n{'='*50}")
    print(f"📊 Collection: {collection_name}")
    print(f"{'='*50}")
    
    try:
        collection = db[collection_name]
        count = collection.count_documents({})
        print(f"Total documents: {count}")
        
        if count > 0:
            sample = collection.find_one()
            print("Sample document structure:")
            for key, value in sample.items():
                print(f"  {key}: {type(value).__name__} = {str(value)[:50]}")
    except Exception as e:
        print(f"Error: {e}")