import os
import sys
import django
from rest_framework.test import APIRequestFactory
from django.contrib.auth import get_user_model

# Ensure the backend directory is in the path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'investomart.settings')
django.setup()

from data.views import create_product_listing

User = get_user_model()

def reproduce_error():
    user = User.objects.first()
    if not user:
        user = User.objects.create_user(username='testuser_repro', email='test@repro.com', password='password123')
    
    factory = APIRequestFactory()
    data = {
        'category': 'Goat',
        'base_price': '5000',
        'quantity': '1',
        'current_weight': '25'
    }
    
    request = factory.post('/api/products/create/', data, format='json')
    request.user = user  # Manually set user for the view
    
    print("Attempting to create product listing...")
    try:
        response = create_product_listing(request)
        print(f"Status Code: {response.status_code}")
        print(f"Response Data: {response.data}")
    except Exception as e:
        import traceback
        print("CRASHED during view execution:")
        traceback.print_exc()

if __name__ == "__main__":
    reproduce_error()
