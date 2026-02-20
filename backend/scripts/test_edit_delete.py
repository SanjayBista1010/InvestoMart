import os
import sys
import django
import uuid

# Ensure the backend directory is in the path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'investomart.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from data.views import update_product_listing, delete_product_listing, create_product_listing
from data.models import Product

User = get_user_model()

def test_edit_delete():
    user = User.objects.first()
    if not user:
        print("No user found.")
        return

    factory = APIRequestFactory()
    
    # 1. Create a temporary product
    print("Creating temporary product...")
    prod_id = f"TEST-{uuid.uuid4().hex[:6].upper()}"
    request_data = {
        'product_id': prod_id,
        'category': 'Goat',
        'quantity': 10,
        'base_price': 5000,
        'currency': 'NPR'
    }
    request = factory.post('/api/products/create/', request_data, format='json')
    request.user = user
    create_product_listing(request)
    
    product = Product.objects.get(product_id=prod_id)
    print(f"Product created: {product.product_id}")

    # 2. Test Update
    print(f"Testing Update for {prod_id}...")
    update_data = {'quantity': 15, 'base_price': 6000}
    request = factory.put(f'/api/products/update/{prod_id}/', update_data, format='json')
    request.user = user
    
    response = update_product_listing(request, product_id=prod_id)
    print(f"Update Status: {response.status_code}")
    if response.status_code == 200:
        product.refresh_from_db()
        print(f"Updated quantity: {product.quantity}, Updated price: {product.base_price}")
    else:
        print(f"Update failed: {response.data}")

    # 3. Test Delete
    print(f"Testing Delete for {prod_id}...")
    request = factory.delete(f'/api/products/delete/{prod_id}/')
    request.user = user
    
    response = delete_product_listing(request, product_id=prod_id)
    print(f"Delete Status: {response.status_code}")
    if response.status_code == 200:
        exists = Product.objects.filter(product_id=prod_id).exists()
        print(f"Product exists after delete: {exists}")
    else:
        print(f"Delete failed: {response.data}")

if __name__ == "__main__":
    test_edit_delete()
