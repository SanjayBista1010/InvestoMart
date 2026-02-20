
import os
import django
import sys
import types
from django.core.management import call_command

# Configure Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'investomart.settings')

# --- PATCHES FOR PYTHON 3.13 COMPATIBILITY ---

# 1. Patch cgi module
if 'cgi' not in sys.modules:
    cgi = types.ModuleType('cgi')
    cgi.parse_header = lambda line: (line, {})
    sys.modules['cgi'] = cgi

# 2. Patch django.utils.http for urlquote
import django.utils.http
if not hasattr(django.utils.http, 'urlquote'):
    from urllib.parse import quote as urlquote
    django.utils.http.urlquote = urlquote

# 3. Patch django.utils.encoding for force_text (sometimes needed)
import django.utils.encoding
if not hasattr(django.utils.encoding, 'force_text'):
    django.utils.encoding.force_text = django.utils.encoding.force_str

# --- START DJANGO ---

django.setup()

def run_setup():
    print("🚀 Starting Database Setup...")
    
    try:
        # 1. Make migrations
        print("📁 Making migrations for 'data' app...")
        call_command('makemigrations', 'data')
        
        # 2. Apply migrations
        print("🗄️  Applying migrations...")
        call_command('migrate')
        
        # 3. Create Admin User
        print("👤 Creating Admin User...")
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
            print(f"✅ Superuser '{username}' updated/reset successfully!")
            
        print("\n✨ Setup completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Error during setup: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run_setup()
