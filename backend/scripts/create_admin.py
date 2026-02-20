
import os
import django
from django.conf import settings

# Configure Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'investomart.settings')

# Hack to fix urlquote and cgi for Python 3.13
import django.utils.http
if not hasattr(django.utils.http, 'urlquote'):
    from urllib.parse import quote as urlquote
    django.utils.http.urlquote = urlquote

import sys
import types
if 'cgi' not in sys.modules:
    cgi = types.ModuleType('cgi')
    cgi.parse_header = lambda line: (line, {})
    sys.modules['cgi'] = cgi

django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

username = 'admin'
email = 'admin@goatfarm.com'
password = 'admin123'

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username, email, password)
    print(f"✅ Superuser '{username}' created successfully!")
else:
    user = User.objects.get(username=username)
    user.set_password(password)
    user.is_superuser = True
    user.is_staff = True
    user.save()
    print(f"✅ Superuser '{username}' updated successfully!")
