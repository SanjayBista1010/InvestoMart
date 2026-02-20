# embed_products.py
import os
import sys
import requests
from pymongo import MongoClient
from decouple import config
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'investomart.settings') # Adjusted to 'investomart.settings'
django.setup()

OLLAMA_EMBED_URL = "http://localhost:11434/api/embeddings"
OLLAMA_MODEL = "qwen3-embedding:0.6b"
MONGO_URI = config('MONGO_URI')
MONGO_DB_NAME = config('MONGO_DB_NAME', default='django_project')
PRODUCTS_COLLECTION = "products"

def get_ollama_embedding(text):
    try:
        res = requests.post(OLLAMA_EMBED_URL, json={"model": OLLAMA_MODEL, "prompt": text})
        res.raise_for_status()
        return res.json().get("embedding")
    except Exception as e:
        print(f"Embedding error: {e}")
        return None

def main():
    client = MongoClient(MONGO_URI)
    db = client[MONGO_DB_NAME]
    col = db[PRODUCTS_COLLECTION]
    
    docs = col.find({"embedding": {"$exists": False}})
    print(f"Found {col.count_documents({'embedding': {'$exists': False}})} docs to embed.")
    
    for doc in docs:
        text = f"{doc.get('name', '')} {doc.get('description', '')} {doc.get('category', '')}"
        if not text.strip(): continue
        
        emb = get_ollama_embedding(text)
        if emb:
            col.update_one({'_id': doc['_id']}, {'$set': {'embedding': emb}})
            print(f"Updated {doc.get('name')}")
            
    client.close()

if __name__ == "__main__":
    main()
