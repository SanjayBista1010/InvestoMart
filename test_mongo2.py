# test_mongo2.py
import pymongo
from pymongo import MongoClient

MONGO_URI = "mongodb+srv://SanjayBista1010:twitter1010@cluster0.on67wuv.mongodb.net/mydatabase?retryWrites=true&w=majority"

try:
    client = MongoClient(MONGO_URI)
    
    # Check django_project database
    db1 = client['django_project']
    collections1 = db1.list_collection_names()
    print(f"📂 Collections in 'django_project': {collections1}")
    
    # Check mydatabase
    db2 = client['mydatabase']  
    collections2 = db2.list_collection_names()
    print(f"📂 Collections in 'mydatabase': {collections2}")
    
    # Look for your collections
    target_collections = ['chat_history', 'products', 'price_history', 'user_activities', 'user_investments']
    
    for collection in target_collections:
        if collection in collections1:
            count = db1[collection].count_documents({})
            print(f"  📊 {collection} in django_project: {count} documents")
        elif collection in collections2:
            count = db2[collection].count_documents({})
            print(f"  📊 {collection} in mydatabase: {count} documents")
        else:
            print(f"  ❌ {collection}: Not found in either database")
            
except Exception as e:
    print(f"❌ Error: {e}")