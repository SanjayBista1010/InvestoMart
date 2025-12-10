# test_mongo.py
import pymongo
from pymongo import MongoClient
import os

# Your MongoDB Atlas URI
MONGO_URI = "mongodb+srv://SanjayBista1010:twitter1010@cluster0.on67wuv.mongodb.net/mydatabase?retryWrites=true&w=majority"

try:
    # Connect to MongoDB
    client = MongoClient(MONGO_URI)
    
    # Test the connection
    client.admin.command('ping')
    print("✅ MongoDB Atlas Connected Successfully!")
    
    # List databases
    databases = client.list_database_names()
    print(f"📁 Databases: {databases}")
    
    if 'mydatabase' in databases:
        db = client['mydatabase']
        collections = db.list_collection_names()
        print(f"📂 Collections in 'mydatabase': {collections}")
        
        # Check auth_user collection
        if 'auth_user' in collections:
            users_count = db.auth_user.count_documents({})
            print(f"👥 Users in auth_user: {users_count}")
            
            # Show first user
            first_user = db.auth_user.find_one()
            if first_user:
                print(f"📋 Sample user: {first_user.get('username', 'No username')}")
    
except Exception as e:
    print(f"❌ MongoDB Connection Error: {e}")