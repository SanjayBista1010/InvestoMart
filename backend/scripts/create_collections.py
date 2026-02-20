"""
MongoDB Collections Initialization Script
Creates all enterprise-level collections in the goatfarm database
"""

import os
from pymongo import MongoClient, IndexModel, ASCENDING, DESCENDING
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI')
DATABASE_NAME = os.getenv('MONGO_DB_NAME', 'goatfarm')

def create_collections_and_indexes():
    """Create all collections with proper indexes"""
    try:
        client = MongoClient(MONGO_URI)
        db = client[DATABASE_NAME]
        
        print(f"🔗 Connected to MongoDB Atlas")
        print(f"📂 Database: {DATABASE_NAME}\n")
        
        # Define collections with their indexes
        collections_config = {
            'users': [
                IndexModel([('user_id', ASCENDING)], unique=True),
                IndexModel([('email', ASCENDING)], unique=True),
                IndexModel([('account_status', ASCENDING)]),
            ],
            'livestock': [
                IndexModel([('animal_id', ASCENDING)], unique=True),
                IndexModel([('owner_id', ASCENDING)]),
                IndexModel([('type', ASCENDING), ('status', ASCENDING)]),
                IndexModel([('tag_number', ASCENDING)], unique=True),
            ],
            'health_records': [
                IndexModel([('record_id', ASCENDING)], unique=True),
                IndexModel([('animal_id', ASCENDING), ('date', DESCENDING)]),
                IndexModel([('record_type', ASCENDING)]),
                IndexModel([('next_due_date', ASCENDING)]),
            ],
            'products': [
                IndexModel([('product_id', ASCENDING)], unique=True),
                IndexModel([('category', ASCENDING), ('status', ASCENDING)]),
                IndexModel([('seller_id', ASCENDING)]),
                IndexModel([('featured', DESCENDING), ('created_at', DESCENDING)]),
            ],
            'transactions': [
                IndexModel([('transaction_id', ASCENDING)], unique=True),
                IndexModel([('buyer_id', ASCENDING), ('created_at', DESCENDING)]),
                IndexModel([('seller_id', ASCENDING), ('created_at', DESCENDING)]),
                IndexModel([('status', ASCENDING)]),
            ],
            'user_investments': [
                IndexModel([('investment_id', ASCENDING)], unique=True),
                IndexModel([('user_id', ASCENDING)]),
            ],
            'chatbot_sessions': [
                IndexModel([('session_id', ASCENDING)], unique=True),
                IndexModel([('user_id', ASCENDING), ('started_at', DESCENDING)]),
                IndexModel([('is_active', ASCENDING)]),
            ],
            'chat_messages': [
                IndexModel([('message_id', ASCENDING)], unique=True),
                IndexModel([('session_id', ASCENDING), ('timestamp', ASCENDING)]),
                IndexModel([('role', ASCENDING)]),
            ],
            'chatbot_analytics': [
                IndexModel([('date', DESCENDING)]),
                IndexModel([('period', ASCENDING)]),
            ],
            'video_surveillance': [
                IndexModel([('camera_id', ASCENDING)], unique=True),
                IndexModel([('farm_id', ASCENDING)]),
                IndexModel([('stream_status', ASCENDING)]),
            ],
            'dashboard_analytics': [
                IndexModel([('user_id', ASCENDING), ('date', DESCENDING)]),
            ],
            'price_history': [
                IndexModel([('product_id', ASCENDING), ('date', DESCENDING)]),
                IndexModel([('animal_type', ASCENDING), ('date', DESCENDING)]),
            ],
            'recommendations': [
                IndexModel([('user_id', ASCENDING)]),
                IndexModel([('generated_at', DESCENDING)]),
            ],
        }
        
        print("📊 Creating collections with indexes...\n")
        
        created_count = 0
        for collection_name, indexes in collections_config.items():
            # Create collection if it doesn't exist
            if collection_name not in db.list_collection_names():
                db.create_collection(collection_name)
                print(f"  ✅ Created collection: {collection_name}")
                created_count += 1
            else:
                print(f"  ℹ️  Collection exists: {collection_name}")
            
            # Create indexes
            if indexes:
                db[collection_name].create_indexes(indexes)
                print(f"     └─ Added {len(indexes)} index(es)")
        
        print(f"\n✅ Setup Complete!")
        print(f"   - Total collections: {len(collections_config)}")
        print(f"   - Newly created: {created_count}")
        print(f"\n🎉 Database '{DATABASE_NAME}' is ready for use!\n")
        
        # List all collections
        print("📋 Collections in database:")
        for collection in sorted(db.list_collection_names()):
            count = db[collection].count_documents({})
            print(f"   - {collection} ({count} documents)")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        client.close()

if __name__ == "__main__":
    print("="*60)
    print("MongoDB Collections Initialization")
    print("="*60 + "\n")
    create_collections_and_indexes()
