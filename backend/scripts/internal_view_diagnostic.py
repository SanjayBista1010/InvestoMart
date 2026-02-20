import sys
import types
import os

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
# ---------------------------------------------
import sys
import json
import django
from django.test import RequestFactory
from django.contrib.auth import get_user_model

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'investomart.settings')
django.setup()

from chatbot.views import chatbot_api

def test_chatbot_view_internally():
    print("--- Internal View Diagnostic ---")
    factory = RequestFactory()
    User = get_user_model()
    
    # Mock a request
    payload = {"message": "hi", "session_id": "TEST_SESSION"}
    request = factory.post('/api/chatbot/api/', 
                          data=json.dumps(payload), 
                          content_type='application/json')
    
    # Mock a user (optional but good to test)
    try:
        user = User.objects.first()
        if not user:
             user = User.objects.create_user(username='testdiag', password='123')
        request.user = user
        print(f"Testing with user: {user.username}")
    except Exception as e:
        print(f"User mock failed (using Anonymous): {e}")
        from django.contrib.auth.models import AnonymousUser
        request.user = AnonymousUser()

    try:
        print("Calling chatbot_api directly...")
        response = chatbot_api(request)
        print(f"Response Status: {response.status_code}")
        print(f"Response Content: {response.content.decode()[:200]}...")
        if response.status_code == 200:
            print("✅ Internal View Test PASSED")
        else:
            print("❌ Internal View Test FAILED")
    except Exception as e:
        import traceback
        print(f"💥 View CRASHED: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    test_chatbot_view_internally()
