import sys
import types
import os

# Add current directory to path
sys.path.append(os.getcwd())

# --- PATCHES FOR PYTHON 3.13 COMPATIBILITY ---
try:
    import cgi
except ImportError:
    cgi = types.ModuleType('cgi')
    def parse_header(line):
        if not line: return '', {}
        parts = [p.strip() for p in line.split(';')]
        key = parts[0]
        params = {k.strip(): v.strip().strip('"') for p in parts[1:] if '=' in p for k, v in [p.split('=', 1)]}
        return key, params
    cgi.parse_header = parse_header
    sys.modules['cgi'] = cgi

try:
    import django.utils.http
    if not hasattr(django.utils.http, 'urlquote'):
        from urllib.parse import quote as urlquote
        django.utils.http.urlquote = urlquote
    if not hasattr(django.utils.http, 'urlunquote'):
        from urllib.parse import unquote as urlunquote
        django.utils.http.urlunquote = urlunquote
    if not hasattr(django.utils.http, 'parse_header_parameters'):
        def parse_header_parameters(line):
            if not line: return '', {}
            parts = [p.strip() for p in line.split(';')]
            key = parts[0]
            params = {k.strip(): v.strip().strip('"') for p in parts[1:] if '=' in p for k, v in [p.split('=', 1)]}
            return key, params
        django.utils.http.parse_header_parameters = parse_header_parameters
except (ImportError, AttributeError, Exception):
    pass
# ---------------------------------------------

import os
import django
import json
from django.test import RequestFactory
from datetime import datetime

# Configure Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'investomart.settings')
django.setup()

from chatbot.views import chatbot_api
from chatbot.mongo_manager import mongo_manager
from django.contrib.auth import get_user_model

def verify_metrics():
    print("Starting Chatbot Metrics Verification...")
    
    # 1. Setup Mock User
    User = get_user_model()
    # Clean up any existing test user to avoid conflicts
    User.objects.filter(username='test_user').delete()
    
    user = User.objects.create_user(
        username='test_user', 
        email='test@demo.com',
        user_id='USR_TEST_001'
    )
    
    # 2. Mock Request
    factory = RequestFactory()
    data = {
        'message': 'I want to invest in some healthy goats and check their prices.',
        'session_id': None
    }
    request = factory.post('/api/chatbot/api/', data=json.dumps(data), content_type='application/json')
    request.user = user
    
    # 3. Call API
    print("Calling Chatbot API...")
    response = chatbot_api(request)
    
    if response.status_code == 200:
        res_data = json.loads(response.content)
        print(f"API Response successful!")
        session_id = res_data.get('session_id')
        print(f"Session ID: {session_id}")
        
        # 4. Verify MongoDB
        print("Verifying MongoDB Data...")
        db = mongo_manager.connect()
        
        # Check Session
        session = db['chatbot_sessions'].find_one({'session_id': session_id})
        if session:
            print(f"Session record found!")
            print(f"   - Total Messages: {session.get('total_messages')}")
            print(f"   - Total Tokens: {session.get('total_tokens_used')}")
            print(f"   - Total Cost: ${session.get('total_cost'):.4f}")
            print(f"   - Topic: {session.get('title')}")
        else:
            print("Session record NOT found!")
            
        # Check Messages
        messages = list(db['chat_messages'].find({'session_id': session_id}))
        print(f"Found {len(messages)} messages in session.")
        
        bot_msg = next((m for m in messages if m['role'] == 'assistant'), None)
        if bot_msg:
            print(f"Assistant metrics captured:")
            print(f"   - Sentiment: {bot_msg.get('sentiment')}")
            print(f"   - Intent: {bot_msg.get('intent')}")
            print(f"   - Input Tokens: {bot_msg.get('input_tokens')}")
            print(f"   - Output Tokens: {bot_msg.get('output_tokens')}")
            print(f"   - Response Time: {bot_msg.get('response_time_ms')}ms")
            # print(f"   - Model: {bot_msg.get('model')}")
        else:
            print("Assistant message NOT found!")
            
        print("\nVerification Complete!")
    else:
        print(f"❌ API Call failed with status {response.status_code}")
        print(response.content)

if __name__ == "__main__":
    verify_metrics()
