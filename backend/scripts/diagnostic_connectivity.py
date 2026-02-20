import requests
import json
import socket
import time

def test_connectivity():
    print("--- Diagnostic Script Running ---")
    
    # 1. Check if something is listening on 8000
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.connect(('127.0.0.1', 8000))
        print("✅ Success: Port 8000 is open.")
        s.close()
    except ConnectionRefusedError:
        print("❌ Error: Port 8000 is NOT listening. Did you start the server?")
        return

    # 2. Test OPTIONS request (Preflight)
    headers = {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type',
    }
    try:
        print("Sending OPTIONS request...")
        r = requests.options('http://127.0.0.1:8000/api/chatbot/api/', headers=headers)
        print(f"OPTIONS Status: {r.status_code}")
        print(f"Allow-Origin: {r.headers.get('Access-Control-Allow-Origin')}")
    except Exception as e:
        print(f"❌ OPTIONS Error: {e}")

    # 3. Test POST request (Actual Call)
    payload = {"message": "hi"}
    headers = {
        'Origin': 'http://localhost:5173',
        'Content-Type': 'application/json'
    }
    try:
        print("\nSending POST request...")
        r = requests.post('http://127.0.0.1:8000/api/chatbot/api/', json=payload, headers=headers)
        print(f"POST Status: {r.status_code}")
        print(f"Response Body: {r.text[:200]}...")
    except Exception as e:
        print(f"❌ POST Error: {e}")

if __name__ == "__main__":
    test_connectivity()
