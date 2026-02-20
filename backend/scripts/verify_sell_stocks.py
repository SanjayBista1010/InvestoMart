import requests
import os

BASE_URL = "http://localhost:8000/api"

def verify_sell_stocks():
    # 1. Login/Register
    email = "test_seller@example.com"
    password = "password123"
    
    print(f"1. Authenticating as {email}...")
    auth_resp = requests.post(f"{BASE_URL}/auth/login/", data={'email': email, 'password': password})
    
    if auth_resp.status_code == 401 or auth_resp.status_code == 400:
        print("   User not found, registering...")
        reg_resp = requests.post(f"{BASE_URL}/auth/register/", data={'email': email, 'password': password, 'name': 'Test Seller'})
        if reg_resp.status_code != 201:
            print(f"   Registration failed: {reg_resp.text}")
            return
        token = "Bearer " + reg_resp.json().get('token', 'mock_token_if_jwt_not_returned') 
        # Note: If login/register doesn't return token directly but sets cookie or session, checking that.
        # Based on views.py, it returns 'user' object. It uses session auth (login(request, user)).
        # So we need to use a session object.
    
    session = requests.Session()
    # Login again with session to capture cookies
    login_resp = session.post(f"{BASE_URL}/auth/login/", data={'email': email, 'password': password})
    if login_resp.status_code != 200:
        print(f"   Login failed: {login_resp.text}")
        return
    print("   Login successful.")
    
    # 2. Upload Image
    print("\n2. Uploading test image...")
    # Create dummy image
    with open("test_image.jpg", "wb") as f:
        f.write(os.urandom(1024))
        
    try:
        with open("test_image.jpg", "rb") as f:
            files = {'file': f}
            upload_resp = session.post(f"{BASE_URL}/upload/", files=files)
            
        if upload_resp.status_code == 201:
            image_url = upload_resp.json()['url']
            print(f"   Upload successful: {image_url}")
        else:
            print(f"   Upload failed: {upload_resp.text}")
            return
    finally:
        if os.path.exists("test_image.jpg"):
            os.remove("test_image.jpg")

    # 3. Create Product
    print("\n3. Creating product listing...")
    payload = {
        'category': 'Goat',
        'quantity': 5,
        'current_weight': 25.5,
        'base_price': 15000,
        'image_url': image_url,
        # 'title': 'My Goats', # Optional, should auto-generate
        # 'description': 'Healthy goats', # Optional, should auto-generate
        'location': 'Kathmandu Farm'
    }
    
    # CSRF Token handling for Django session auth
    if 'csrftoken' in session.cookies:
        headers = {'X-CSRFToken': session.cookies['csrftoken']}
    else:
        headers = {}

    create_resp = session.post(f"{BASE_URL}/products/create/", json=payload, headers=headers)
    
    if create_resp.status_code == 201:
        product = create_resp.json()
        print(f"   Product created successfully!")
        print(f"   ID: {product.get('product_id')}")
        print(f"   Title: {product.get('title')}")
        print(f"   Description: {product.get('description')}")
        print(f"   Image: {product.get('image_url')}")
    else:
        print(f"   Product creation failed: {create_resp.text}")

if __name__ == "__main__":
    verify_sell_stocks()
