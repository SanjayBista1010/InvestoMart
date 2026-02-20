import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000/api/chatbot/api/"

def send_msg(msg, session_id=None):
    print(f"\n>>> Sending: {msg} (Session: {session_id})")
    payload = {"message": msg}
    if session_id:
        payload["session_id"] = session_id
    
    start_time = time.time()
    response = requests.post(BASE_URL, json=payload)
    duration = time.time() - start_time
    
    if response.status_code == 200:
        data = response.json()
        print(f"<<< Received (in {duration:.2f}s): {data.get('response')[:100]}...")
        return data.get('session_id')
    else:
        print(f"!!! Error {response.status_code}: {response.text}")
        return None

print("--- DIAGNOSTIC START ---")
# Turn 1
sid = send_msg("What are the best dairy goats?")
# Turn 2
if sid:
    send_msg("in context of nepal", session_id=sid)
    # Turn 3
    send_msg("for other purposes as well", session_id=sid)
print("\n--- DIAGNOSTIC END ---")
