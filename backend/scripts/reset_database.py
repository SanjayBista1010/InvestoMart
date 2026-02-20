"""
MongoDB Atlas Database Reset Script
Drops all existing collections from MongoDB Atlas cloud database
"""

import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv('MONGO_URI')
DATABASE_NAME = os.getenv('MONGO_DB_NAME', 'django_project')

def drop_all_collections():
    """Drop all collections in the MongoDB Atlas database"""
    try:
        # Connect to MongoDB Atlas
        client = MongoClient(MONGO_URI)
        db = client[DATABASE_NAME]
        
        # Test connection
        client.admin.command('ping')
        print(f"✅ Connected to MongoDB Atlas!")
        print(f"📂 Database: {DATABASE_NAME}\n")
        
        # Get all collection names
        collections = db.list_collection_names()
        
        if not collections:
            print("ℹ️  No collections found. Database is already empty.")
            return True
        
        print(f"Found {len(collections)} collections:")
        for collection in collections:
            count = db[collection].count_documents({})
            print(f"  - {collection} ({count} documents)")
        
        # Ask for confirmation
        print("\n" + "="*60)
        confirm = input("⚠️  WARNING: This will delete ALL data! Type 'YES' to confirm: ")
        
        if confirm != 'YES':
            print("❌ Operation cancelled.")
            return False
        
        # Drop each collection
        print("\n🗑️  Dropping collections...\n")
        for collection in collections:
            db[collection].drop()
            print(f"  ✅ Dropped: {collection}")
        
        print(f"\n✅ Successfully dropped all {len(collections)} collections!")
        print("🎉 Database is now clean and ready for new schema.\n")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        client.close()

if __name__ == "__main__":
    print("="*60)
    print("MongoDB Atlas Database Reset Script")
    print("="*60 + "\n")
    drop_all_collections()
