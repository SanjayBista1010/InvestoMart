import os
from dotenv import load_dotenv
from pymongo import MongoClient
import sys

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.env'))

MONGODB_URI = os.getenv('MONGO_URI')
MONGODB_NAME = os.getenv('MONGO_DB_NAME')

if not MONGODB_URI or not MONGODB_NAME:
    print("Error: MONGO_URI or MONGO_DB_NAME not found in .env file.")
    sys.exit(1)

# List of collections required for the InvestoMart/GoatFarm platform
# based on the previous schema dump analysis
REQUIRED_COLLECTIONS = [
    "auth_user",
    "chat_messages",
    "chatbot_analytics",
    "chatbot_sessions",
    "dashboard_analytics",
    "health_records",
    "livestock",
    "price_history",
    "products",
    "recommendations",
    "transactions",
    "user_investments",
    "users",
    "video_surveillance"
]

import certifi

def initialize_database():
    try:
        print(f"Connecting to MongoDB Atlas...")
        print(f"Target Database: {MONGODB_NAME}")
        
        import ssl
        client = MongoClient(MONGODB_URI, tls=True, tlsAllowInvalidCertificates=True, ssl_cert_reqs=ssl.CERT_NONE)
        db = client[MONGODB_NAME]
        
        # Test connection
        client.admin.command('ping')
        print("Connected successfully!\n")
        
        existing_collections = db.list_collection_names()
        
        created_count = 0
        for collection_name in REQUIRED_COLLECTIONS:
            if collection_name not in existing_collections:
                print(f"Creating collection: {collection_name}...")
                db.create_collection(collection_name)
                created_count += 1
            else:
                print(f"Collection already exists: {collection_name}")
                
        print(f"\nInitialization complete! Added {created_count} new collections out of {len(REQUIRED_COLLECTIONS)} total required.")
        
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    initialize_database()
