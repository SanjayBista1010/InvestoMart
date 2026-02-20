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
from data.views import user_profile

User = get_user_model()

def test_profile_update():
    user = User.objects.first()
    if not user:
        print("No user found.")
        return

    print(f"Testing Profile Update for user: {user.username}")
    print(f"Current Name: {user.get_full_name()}")

    factory = APIRequestFactory()
    
    # Test Update
    new_name = "Jane Updated Doe"
    print(f"Updating name to: {new_name}")
    request = factory.put('/api/auth/profile/', {'name': new_name}, format='json')
    request.user = user
    
    response = user_profile(request)
    print(f"Update Status: {response.status_code}")
    if response.status_code == 200:
        user.refresh_from_db()
        print(f"Updated Name from DB: {user.get_full_name()}")
        print(f"Response Data: {response.data}")
    else:
        print(f"Update failed: {response.data}")

if __name__ == "__main__":
    test_profile_update()
