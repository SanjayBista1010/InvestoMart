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
            print(f"🔌 [MONGO] Connecting to URI: {self.mongo_uri[:25]}... DB: {self.db_name}")
            try:
                self.client = MongoClient(self.mongo_uri)
                self.db = self.client[self.db_name]
                # Trigger a command to verify connection
                self.client.admin.command('ping')
                print("✅ [MONGO] Connection Successful!")
            except Exception as e:
                print(f"❌ [MONGO] Connection FAILED: {e}")
                self.client = None
                self.db = None
        return self.db

    def save_chat_message(self, user_django_id, user_message, bot_response, metrics=None, session_id=None, sentiment='neutral', intent='general'):
        print(f"💾 [MONGO] Attempting to save message... Session: {session_id}")
        self.connect()
        if not self.db:
            print("❌ [MONGO] Skipping save - No Database Connection")
            return session_id
        
        try:
            # Link to enterprise user_id if possible
            if user_django_id != "anonymous":
                auth_user = self.db['auth_user'].find_one({'id': user_django_id})
                mongo_user_id = str(auth_user['_id']) if auth_user else "anonymous"
            else:
                mongo_user_id = "anonymous"
            
            # Generate or use existing session
            if not session_id:
                # Simple session management: Use latest active session or create new
                latest_session = self.db['chatbot_sessions'].find_one(
                    {'user_id': mongo_user_id}, 
                    sort=[('started_at', pymongo.DESCENDING)]
                )
                if latest_session and (datetime.utcnow() - latest_session['last_activity']).seconds < 3600:
                    session_id = latest_session['session_id']
                else:
                    # Generate a temporary title from first message or standard default
                    session_id = f"SESSION_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
                    title = (user_message[:30] + '...') if len(user_message) > 30 else user_message
                    
                    self.db['chatbot_sessions'].insert_one({
                        'session_id': session_id,
                        'user_id': mongo_user_id,
                        'title': title,
                        'started_at': datetime.utcnow(),
                        'last_activity': datetime.utcnow(),
                        'total_messages': 0,
                        'total_tokens_used': 0,
                        'total_cost': 0,
                        'is_active': True
                    })
                    print(f"🆕 [MONGO] Created new session with title: {title}")

            # Calculate cost (Placeholder: $0.03 per 1k tokens)
            tokens = metrics.get('total_tokens', 0) if metrics else 0
            cost = (tokens / 1000) * 0.03
            
            # Save message to enterprise collection
            message_doc = {
                'message_id': f"MSG_{datetime.utcnow().strftime('%y%m%d%H%M%S%f')}",
                'session_id': session_id,
                'role': 'user', # In this design, we store user and assistant as separate logic or combined
                'content': user_message, # User message
                'timestamp': datetime.utcnow(),
            }
            self.db['chat_messages'].insert_one(message_doc)
            
            # Save assistant response with metrics
            assistant_doc = {
                'message_id': f"MSG_{datetime.utcnow().strftime('%y%m%d%H%M%S%f')}_bot",
                'session_id': session_id,
                'role': 'assistant',
                'content': bot_response,
                'timestamp': datetime.utcnow(),
                'input_tokens': metrics.get('input_tokens', 0) if metrics else 0,
                'output_tokens': metrics.get('output_tokens', 0) if metrics else 0,
                'total_tokens': tokens,
                'response_time_ms': metrics.get('total_duration_ms', 0) if metrics else 0,
                'cost': cost,
                'model': metrics.get('model', 'unknown') if metrics else 'unknown',
                'sentiment': sentiment,
                'intent': intent,
                'context_size': metrics.get('input_tokens', 0) # approximation
            }
            self.db['chat_messages'].insert_one(assistant_doc)
            
            # Update session aggregates
            self.db['chatbot_sessions'].update_one(
                {'session_id': session_id},
                {
                    '$inc': {
                        'total_messages': 2,
                        'total_tokens_used': tokens,
                        'total_cost': cost
                    },
                    '$set': {
                        'last_activity': datetime.utcnow(),
                        'primary_topic': intent
                    }
                }
            )
            print(f"✅ [MONGO] Successfully saved messages to session {session_id}")
            return session_id

        except Exception as e:
            print(f"❌ [MONGO] Error in save_chat_message: {e}")
            import traceback
            traceback.print_exc()
            return session_id

    def get_chat_history(self, session_id, limit=6):
        """Retrieve recent chat history for context"""
        print(f"[MONGO] Fetching history for session: '{session_id}'")
        if not session_id: return []
        self.connect()
        # Find last N messages for this session
        cursor = self.db['chat_messages'].find(
            {'session_id': session_id},
            sort=[('timestamp', pymongo.DESCENDING)],
            limit=limit
        )
        
        # Sort back to chronological order (most recent at bottom)
        messages = list(cursor)
        print(f"[MONGO] Found {len(messages)} raw messages in DB.")
        messages.reverse()
        
        history = []
        for msg in messages:
            role = "Assistant" if msg.get('role') == 'assistant' else "User"
            history.append(f"[{role}]: {msg.get('content')}")
        
        print(f"[MONGO] Successfully formatted {len(history)} history lines.")
        return history

    def get_user_sessions(self, django_user_id):
        """Fetch all sessions for a specific user"""
        self.connect()
        if not self.db: return []
        
        # Link to enterprise user_id
        auth_user = self.db['auth_user'].find_one({'id': django_user_id})
        mongo_user_id = str(auth_user['_id']) if auth_user else "anonymous"
        
        if mongo_user_id == "anonymous":
            return []

        cursor = self.db['chatbot_sessions'].find(
            {'user_id': mongo_user_id},
            sort=[('last_activity', pymongo.DESCENDING)]
        )
        
        sessions = []
        for s in cursor:
            sessions.append({
                'session_id': s.get('session_id'),
                'title': s.get('title', 'Untitled Chat'),
                'last_activity': s.get('last_activity').isoformat() if s.get('last_activity') else None,
                'total_messages': s.get('total_messages', 0)
            })
        return sessions

    def update_session_title(self, session_id, new_title):
        """Update the title of a specific chat session."""
        print(f"[MONGO] Attempting to update title for session: {session_id} to '{new_title}'")
        self.connect()
        if not self.db:
            print("❌ [MONGO] Skipping title update - No Database Connection")
            return False
        
        try:
            result = self.db['chatbot_sessions'].update_one(
                {'session_id': session_id},
                {'$set': {'title': new_title}}
            )
            if result.matched_count > 0:
                print(f"✅ [MONGO] Successfully updated title for session {session_id}")
                return True
            else:
                print(f"⚠️ [MONGO] Session {session_id} not found for title update.")
                return False
        except Exception as e:
            print(f"❌ [MONGO] Error updating session title: {e}")
            import traceback
            traceback.print_exc()
            return False

    def get_full_session_messages(self, session_id):
        """Retrieve ALL messages for a session to hydrate the UI"""
        self.connect()
        if not self.db: return []
        
        cursor = self.db['chat_messages'].find(
            {'session_id': session_id},
            sort=[('timestamp', pymongo.ASCENDING)]
        )
        
        messages = []
        for msg in cursor:
            messages.append({
                'text': msg.get('content'),
                'sender': 'bot' if msg.get('role') == 'assistant' else 'user',
                'timestamp': msg.get('timestamp').isoformat() if msg.get('timestamp') else None
            })
        return messages

    def get_user_investments(self, django_user_id):
        self.connect()
        auth_user = self.db['auth_user'].find_one({'id': django_user_id})
        if not auth_user: return []

        mongo_user_id = str(auth_user['_id'])
        investments_cursor = self.db['user_investments'].find({'user_id': mongo_user_id})
        investments = []
        for inv in investments_cursor:
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

mongo_manager = MongoDBManager()
