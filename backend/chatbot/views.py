# chatbot/views.py
import json
import re
import time
import requests
from threading import Thread
from datetime import datetime
from pymongo import MongoClient
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import SessionAuthentication
from data.authentication import SimpleTokenAuthentication
from .ollama_local import OllamaLocal
from .user_utils import get_mongo_user_id, calculate_profit_loss
from .mongo_manager import mongo_manager
from decouple import config

# Initialize Ollama client
ollama_client = OllamaLocal(model_name="qwen3:8b")

OLLAMA_EMBED_URL = "http://localhost:11434/api/embeddings"
OLLAMA_EMBED_MODEL = "qwen3-embedding:0.6b"
MONGO_URI = config('MONGO_URI')
MONGO_DB_NAME = config('MONGO_DB_NAME', default='django_project')
PRODUCTS_COLLECTION_NAME = "products"
VECTOR_INDEX_NAME = "product_embeddings_idx"

def get_query_embedding(text, model_name=OLLAMA_EMBED_MODEL):
    data = {"model": model_name, "prompt": text}
    try:
        response = requests.post(OLLAMA_EMBED_URL, json=data)
        response.raise_for_status()
        return response.json().get("embedding")
    except Exception as e:
        print(f"Error getting embedding: {e}")
        return None

def search_products_via_vector_search(query_text, num_candidates=10, limit=3):
    query_embedding = get_query_embedding(query_text)
    if not query_embedding: return []

    client = MongoClient(MONGO_URI)
    try:
        db = client[MONGO_DB_NAME]
        collection = db[PRODUCTS_COLLECTION_NAME]
        
        # Check if index exists or run pipeline
        # Note: vectorSearch requires Atlas. If local/standard mongo, this pipeline might fail 
        # unless setup correctly. Assuming source setup is Atlas.
        results = collection.aggregate([
            {
                "$vectorSearch": {
                    "index": VECTOR_INDEX_NAME,
                    "path": "embedding",
                    "queryVector": query_embedding,
                    "numCandidates": num_candidates,
                    "limit": limit
                }
            },
            {
                "$project": {
                    "name": 1, "description": 1, "category": 1, "current_market_price": 1, "_id": 0,
                    "score": { "$meta": "vectorSearchScore" }
                }
            }
        ])
        return list(results)
    except Exception as e:
        print(f"Vector search error: {e}")
        return []
    finally:
        client.close()

def format_retrieved_context(docs):
    if not docs: return ""
    lines = ["\n--- RELEVANT PRODUCT INFORMATION ---"]
    for doc in docs:
        lines.append(f"- Product: {doc.get('name')}\n  Desc: {doc.get('description')}\n  Price: NRS {doc.get('current_market_price')}")
    lines.append("--- END ---\n")
    return "\n".join(lines)

def format_portfolio_text(profit_list):
    if not profit_list: return "No investments found."
    lines = []
    for inv in profit_list:
        lines.append(f"{inv['product_name']} (Qty: {inv['quantity']}) - P/L: NRS {inv['profit_loss']:,.0f}")
    return "\n".join(lines)

def generate_portfolio_html_table(profit_list):
    if not profit_list: return ""
    # Simplified HTML generation for brevity; frontend can also render JSON if preferred, 
    # but keeping source logic regarding delivering HTML snippet.
    rows = ""
    for inv in profit_list:
        color = 'green' if inv['profit_loss'] >= 0 else 'red'
        rows += f"<tr><td>{inv['product_name']}</td><td align='right'>{inv['quantity']}</td><td align='right' style='color:{color}'>{inv['profit_loss']:,.0f}</td></tr>"
    return f"<table border='1' width='100%'><thead><tr><th>Asset</th><th>Qty</th><th>P/L</th></tr></thead><tbody>{rows}</tbody></table>"

def generate_products_html_table(products):
    if not products: return ""
    rows = ""
    for p in products:
        rows += f"<tr><td>{p.get('name')}</td><td>{p.get('category')}</td><td align='right'>{p.get('current_market_price')}</td></tr>"
    return f"<table border='1' width='100%'><thead><tr><th>Product</th><th>Category</th><th>Price</th></tr></thead><tbody>{rows}</tbody></table>"

def detect_sentiment_and_intent(text):
    """Lightweight keyword-based sentiment and intent detection"""
    text = text.lower()
    
    # Sentiment
    sentiment = 'neutral'
    pos_words = ['good', 'great', 'awesome', 'thank', 'help', 'excellent', 'happy', 'yes', 'profit']
    neg_words = ['bad', 'poor', 'wrong', 'error', 'fail', 'loss', 'expensive', 'no', 'slow']
    
    pos_score = sum(1 for word in pos_words if word in text)
    neg_score = sum(1 for word in neg_words if word in text)
    
    if pos_score > neg_score: sentiment = 'positive'
    elif neg_score > pos_score: sentiment = 'negative'
    
    # Intent
    intent = 'general'
    intents = {
        'investment': ['invest', 'portfolio', 'buy', 'sell', 'roi', 'profit', 'loss', 'share'],
        'market_price': ['price', 'cost', 'market', 'how much', 'value'],
        'livestock_advice': ['goat', 'chicken', 'buffalo', 'cow', 'breed', 'feed', 'farm'],
        'health_advice': ['sick', 'health', 'vaccine', 'medicine', 'vet', 'disease'],
        'support': ['help', 'contact', 'problem', 'fix', 'error']
    }
    
    for category, keywords in intents.items():
        if any(k in text for k in keywords):
            intent = category
            break
            
    return sentiment, intent

def health_check(request):
    return JsonResponse({'status': 'ok', 'message': 'Chatbot backend is reachable'})

from datetime import datetime
@api_view(['POST'])
@authentication_classes([SimpleTokenAuthentication, SessionAuthentication])
@permission_classes([AllowAny]) # Allow anonymous but save if auth
def chatbot_api(request):
    print("\n" + "="*50)
    print(f"🚨 CHATBOT API CALLED: {request.method} {request.path}")
    print(f"🚨 Request Content-Type: {request.headers.get('Content-Type')}")
    if request.method != 'POST': 
        print("🚨 Rejected: Not a POST request")
        return JsonResponse({'error': 'POST only'}, status=405)
    
    try:
        print("🚨 Reading request body...")
        raw_body = request.body
        print(f"🚨 Raw body length: {len(raw_body)}")
        data = json.loads(raw_body)
        message = data.get('message', '').strip()
        session_id = data.get('session_id')
        print(f"\n[API] Processing Message: '{message}'")
        print(f"[API] Content-Type: {request.headers.get('Content-Type')}")
        print(f"[API] Session ID from Frontend: '{session_id}'")
        
        if not message: return JsonResponse({'response': 'Please type a message.'})
        
        # Detect sentiment and intent
        print("DEBUG: Detecting sentiment/intent...")
        sentiment, intent = detect_sentiment_and_intent(message)
        print(f"DEBUG: sentiment={sentiment}, intent={intent}")
        
        # Basic context initialization
        context = ""
        portfolio_data = None
        retrieved_products = []
        
        # Capture necessary data
        print("DEBUG: Checking request.user...")
        user_authenticated = request.user.is_authenticated
        user_obj = request.user if user_authenticated else None
        print(f"DEBUG: user_authenticated={user_authenticated}, user={user_obj}")
        
        # Synchronous Retrieval (safer on Python 3.13 with limited patching)
        if user_authenticated:
            try:
                mid = get_mongo_user_id(user_obj)
                if mid: 
                    print(f"DEBUG: Found Mongo User ID: {mid}")
                    portfolio_data = calculate_profit_loss(mid, mongo_manager)
            except Exception as e:
                print(f"DEBUG: Portfolio fetch error: {e}")

        try:
            keywords = ['price', 'find', 'search', 'cost', 'buy']
            if any(k in message.lower() for k in keywords):
                retrieved_products = search_products_via_vector_search(message)
                print(f"DEBUG: Vector search found {len(retrieved_products)} products")
        except Exception as e:
            print(f"DEBUG: Vector search error: {e}")
        
        # Build Dynamic Context
        context_parts = []
        
        # 1. User Intent (High-level guide)
        if intent != 'general':
            context_parts.append(f"### USER INTENT\nThe user appears to be asking about: {intent}")
        
        # 2. Conversation History (Active Thread)
        history = []
        if session_id:
            try:
                print(f"DEBUG: Calling mongo_manager.get_chat_history for '{session_id}'...")
                history = mongo_manager.get_chat_history(session_id, limit=6)
                print(f"DEBUG: Retrieved {len(history)} lines of history.")
            except Exception as e:
                print(f"DEBUG: CRITICAL History fetch error: {e}")

        if history:
            context_parts.append("### RECENT CONVERSATION HISTORY\n" + "\n".join(history))

        # 3. Technical Knowledge (Portfolio & Products)
        tech_context = []
        if portfolio_data:
            summary = ", ".join([f"{i['product_name']} ({i['quantity']})" for i in portfolio_data[:5]])
            tech_context.append(f"User Portfolio: {summary}")
        
        if retrieved_products:
            tech_context.append(format_retrieved_context(retrieved_products))
            
        if tech_context:
            context_parts.append("### SUPPLEMENTARY DATA\n" + "\n".join(tech_context))
            
        # Combine all context
        context = "\n\n".join(context_parts)
            
        # Call Ollama with metrics capture
        print(f"DEBUG: Querying Ollama with structured context...")
        ollama_response = ollama_client.generate_response(message, context)
        
        if not ollama_response:
            return JsonResponse({'response': "Sorry, I couldn't generate a response."}, status=200)

        response_text = ollama_response.get('text', '')
        metrics = ollama_response.get('metrics', {})
        
        # Post-process (Tables)
        final_output = response_text
        if 'portfolio' in message.lower() and portfolio_data:
            final_output += "|||TABLE|||" + generate_portfolio_html_table(portfolio_data)
        elif retrieved_products and any(k in message.lower() for k in ['price', 'find']):
            final_output += "|||TABLE|||" + generate_products_html_table(retrieved_products)
            
        # Save History to Enterprise Collections
        new_session_id = session_id
        user_id_to_save = user_obj.id if (user_obj and user_authenticated) else "anonymous"
            
        print(f"DEBUG: Saving message. UserID: {user_id_to_save}, SessionID: {session_id}")
        
        try:
            new_session_id = mongo_manager.save_chat_message(
                user_id_to_save, 
                message, 
                final_output, 
                metrics=metrics,
                session_id=session_id,
                sentiment=sentiment,
                intent=intent
            )
            print(f"DEBUG: Message saved. New SessionID: {new_session_id}")
        except Exception as e:
            print(f"DEBUG: Error in save_chat_message: {e}")
            
        return JsonResponse({
            'response': final_output, 
            'success': True,
            'session_id': new_session_id,
            'metrics': metrics if settings.DEBUG else None
        })

    except Exception as e:
        import traceback
        error_msg = f"CRITICAL VIEW ERROR: {e}\n{traceback.format_exc()}"
        print("!"*30)
        print(error_msg)
        print("!"*30)
        try:
            with open("chatbot_crash.log", "a") as f:
                f.write(f"\n--- {datetime.now()} ---\n{error_msg}\n")
        except:
            pass

@api_view(['GET'])
@authentication_classes([SimpleTokenAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def list_sessions(request):
    """List all chat sessions for the authenticated user"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required', 'sessions': []}, status=401)
    
    try:
        sessions = mongo_manager.get_user_sessions(request.user.id)
        return JsonResponse({'sessions': sessions})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
@api_view(['POST'])
@authentication_classes([SimpleTokenAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def update_session_title(request, session_id):
    """Update session title via API"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    try:
        data = json.loads(request.body)
        title = data.get('title')
        if not title:
            return JsonResponse({'error': 'Title is required'}, status=400)
            
        success = mongo_manager.update_session_title(session_id, title)
        return JsonResponse({'success': success})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
@authentication_classes([SimpleTokenAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def get_session_messages(request, session_id):
    """Retrieve full message history for a specific session"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    try:
        # Security: Verify session belongs to user
        # In a production app, we'd check if the session's user_id matches request.user
        # For now, fetching full history
        messages = mongo_manager.get_full_session_messages(session_id)
        return JsonResponse({'messages': messages})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
