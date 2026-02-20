import os
import sys
import django

# Ensure the backend directory is in the path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'investomart.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from data.views import create_product_listing
from data.authentication import SimpleTokenAuthentication

User = get_user_model()

def test_auth():
    # Create or get a test user
    user, created = User.objects.get_or_create(
        username='testuser',
        defaults={'email': 'test@example.com', 'user_id': 'TEST-001'}
    )
    if created:
        user.set_password('password123')
        user.save()
        
    token = f"{user.id}-{user.username}"
    print(f"Testing with token: {token}")
    
    factory = APIRequestFactory()
    
    # Test with valid token
    request = factory.post('/api/products/create/', {
        'category': 'Goat',
        'base_price': 5000,
        'quantity': 1
    }, format='json', HTTP_AUTHORIZATION=f'Bearer {token}')
    
    # Manually check authentication
    auth = SimpleTokenAuthentication()
    try:
        auth_result = auth.authenticate(request)
        if auth_result:
            auth_user, _ = auth_result
            print(f"Authentication SUCCESS: User {auth_user.username} authenticated.")
            assert auth_user == user
        else:
            print("Authentication FAILED: Returns None")
            sys.exit(1)
    except Exception as e:
        print(f"Authentication ERROR: {e}")
        sys.exit(1)

    print("\nSUCCESS: Custom authentication is working.")

if __name__ == "__main__":
    test_auth()
