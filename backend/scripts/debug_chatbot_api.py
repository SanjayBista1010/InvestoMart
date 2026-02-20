
import os
import sys
import json
import types

# Standard patches for Python 3.13
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
    if not hasattr(django.utils.http, 'parse_header_parameters'):
        def parse_header_parameters(line):
            if not line: return '', {}
            parts = [p.strip() for p in line.split(';')]
            key = parts[0]
            params = {k.strip(): v.strip().strip('"') for p in parts[1:] if '=' in p for k, v in [p.split('=', 1)]}
            return key, params
        django.utils.http.parse_header_parameters = parse_header_parameters
except:
    pass

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'investomart.settings')

import django
django.setup()

from django.test import RequestFactory
from chatbot.views import chatbot_api

def test_api():
    factory = RequestFactory()
    data = {'message': 'What are the best breeds of goats for dairy production?'}
    request = factory.post('/api/chatbot/api/', data=json.dumps(data), content_type='application/json')
    
    # Mock unauthenticated user
    from django.contrib.auth.models import AnonymousUser
    request.user = AnonymousUser()

    print("🚀 Triggering chatbot_api...")
    try:
        response = chatbot_api(request)
        print(f"Status: {response.status_code}")
        print(f"Body: {response.content.decode()}")
    except Exception as e:
        print(f"💥 Caught Crash: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_api()
