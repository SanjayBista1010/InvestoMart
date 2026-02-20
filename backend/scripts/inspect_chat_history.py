import pymongo
from pymongo import MongoClient
from decouple import config
import json

mongo_uri = config('MONGO_URI', default=None)
db_name = config('MONGO_DB_NAME', default='investomart')
client = MongoClient(mongo_uri)
db = client[db_name]

print("--- Recent Sessions ---")
sessions = list(db['chatbot_sessions'].find().sort('last_activity', -1).limit(5))
for s in sessions:
    print(f"Session: {s.get('session_id')}, User: {s.get('user_id')}, Messages: {s.get('total_messages')}")
    
    messages = list(db['chat_messages'].find({'session_id': s.get('session_id')}).sort('timestamp', 1))
    print(f"  Messages found: {len(messages)}")
    for m in messages:
        print(f"    [{m.get('role')}]: {m.get('content')[:50]}...")
    print("-" * 30)
