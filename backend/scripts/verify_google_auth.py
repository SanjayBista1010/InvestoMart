import requests

try:
    response = requests.post('http://127.0.0.1:8000/api/auth/google/', json={})
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 400 and response.json().get('error') == 'No token provided':
        print("✅ Endpoint verified successfully!")
    else:
        print("❌ Endpoint verification failed.")

except Exception as e:
    print(f"❌ Connection failed: {e}")
