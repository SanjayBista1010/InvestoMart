import pymongo
from pymongo import MongoClient
from datetime import datetime
from decouple import config

class MongoDBManager:
    def __init__(self):
        self.mongo_uri = config('MONGO_URI', default=None)
        if not self.mongo_uri:
            print("❌ MONGO_URI missing in environment variables!")
        self.db_name = config('MONGO_DB_NAME', default='investomart')
        self.client = None
        self.db = None

    def connect(self):
        """Connect to MongoDB"""
        if self.client is None:
            self.client = MongoClient(self.mongo_uri)
            self.db = self.client[self.db_name]
        return self.db

    # -------------------------------
    # Chat messages
    # -------------------------------
    def save_chat_message(self, user_id, user_message, bot_response, message_type='GENERAL'):
        """Save a chat message to chat_history"""
        self.connect()
        doc = {
            'user_id': str(user_id),  # always store as string
            'user_message': user_message,
            'bot_response': bot_response,
            'timestamp': datetime.utcnow(),
            'message_type': message_type
        }
        result = self.db['chat_history'].insert_one(doc)
        return str(result.inserted_id)

    # -------------------------------
    # User investments
    # -------------------------------
    def get_user_investments(self, django_user_id):
        """Fetch investments for a given Django user ID"""
        self.connect()

        # Get MongoDB user _id from auth_user
        auth_user = self.db['auth_user'].find_one({'id': django_user_id})
        if not auth_user:
            print(f"⚠️ No MongoDB auth_user found for Django ID {django_user_id}")
            return []

        mongo_user_id = str(auth_user['_id'])  # ensure string type

        # Fetch user's investments
        investments_cursor = self.db['user_investments'].find({'user_id': mongo_user_id})
        investments = []
        for inv in investments_cursor:
            # Fetch product info
            product = self.db['products'].find_one({'_id': inv['product_id']})
            product_name = product['name'] if product else "Unknown Product"

            investments.append({
                'product_name': product_name,
                'quantity': inv.get('quantity', 0),
                'purchase_price': inv.get('purchase_price', 0),
                'current_value': inv.get('current_value', 0),
                'total_investment': inv.get('total_investment', 0),
                'purchase_date': inv.get('purchase_date')
            })

        return investments

    # -------------------------------
    # Get MongoDB user ID
    # -------------------------------
    def get_user_mongo_id(self, django_user_id):
        """Return MongoDB _id for a Django user if exists"""
        self.connect()
        auth_user = self.db['auth_user'].find_one({'id': django_user_id})
        if auth_user:
            return str(auth_user['_id'])
        return None

# -------------------------------
# Singleton instance
# -------------------------------
mongo_manager = MongoDBManager()
