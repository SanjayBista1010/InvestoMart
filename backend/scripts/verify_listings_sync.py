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
from data.views import get_user_products

User = get_user_model()

def test_fetch_listings():
    user = User.objects.first()
    if not user:
        print("No user found to test with.")
        return

    factory = APIRequestFactory()
    request = factory.get('/api/products/my/')
    request.user = user

    print(f"Testing fetch listings for user: {user.username}")
    try:
        response = get_user_products(request)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print(f"Successfully fetched {len(response.data)} listings.")
            for item in response.data:
                print(f" - {item['product_id']}: {item['title']} ({item['status']})")
        else:
            print(f"Failed to fetch listings: {response.data}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_fetch_listings()
