"""
MongoDB Connection Utility
Provides direct MongoDB Atlas connection for the application
"""

import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI')
DB_NAME = os.getenv('MONGO_DB_NAME', 'goatfarm')

# Create MongoDB client
client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# Collection references
users_collection = db['users']
livestock_collection = db['livestock']
health_records_collection = db['health_records']
products_collection = db['products']
transactions_collection = db['transactions']
chatbot_sessions_collection = db['chatbot_sessions']
chat_messages_collection = db['chat_messages']
dashboard_analytics_collection = db['dashboard_analytics']
price_history_collection = db['price_history']
surveillance_collection = db['video_surveillance']
investments_collection = db['user_investments']
recommendations_collection = db['recommendations']

def get_db():
    """Get database instance"""
    return db

def get_collection(name):
    """Get collection by name"""
    return db[name]
