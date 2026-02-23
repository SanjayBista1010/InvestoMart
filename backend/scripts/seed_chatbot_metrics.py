"""
Seed realistic chatbot interaction metrics into MongoDB for admin dashboard demo.
Usage: python scripts/seed_chatbot_metrics.py
"""
import sys
import os
import django
import random
import uuid
from datetime import datetime, timedelta

# Setup Django project path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'investomart.settings')
django.setup()

from chatbot.mongo_manager import mongo_manager

mongo_manager.connect()
db = mongo_manager.db

if not db:
    print("❌ Failed to connect to MongoDB!")
    sys.exit(1)

print("✅ Connected to MongoDB!")

# Configuration
DAYS_BACK = 30
intents = ['investment', 'market_price', 'livestock_advice', 'health_advice', 'support', 'general']
sentiments = ['positive', 'neutral', 'negative']
sample_questions = [
    "How much is a healthy buffalo worth?",
    "What is the current market price for goats?",
    "How do I take care of my livestock this winter?",
    "Can I see my portfolio returns?",
    "How many animals should I buy?",
    "Show me price trends for chickens",
    "What vaccines should I give my goats?",
    "Help me calculate my investment returns",
    "I need urgent help with my animals",
    "What livestock should I invest in?",
]

print(f"📦 Seeding {DAYS_BACK} days of chatbot metrics...")

for day_offset in range(DAYS_BACK, -1, -1):
    target_date = datetime.utcnow() - timedelta(days=day_offset)

    # Vary message count by day (simulate traffic patterns)
    base = random.randint(3, 18)
    weekend_factor = 0.5 if target_date.weekday() >= 5 else 1.0
    daily_messages = max(1, int(base * weekend_factor))

    for _ in range(daily_messages):
        hour = random.randint(7, 22)
        minute = random.randint(0, 59)
        ts = target_date.replace(hour=hour, minute=minute, second=0, microsecond=0)

        intent = random.choice(intents)
        sentiment = random.choices(sentiments, weights=[0.55, 0.35, 0.10])[0]
        user_msg = random.choice(sample_questions)
        bot_response = f"[Sample AI Response] Based on current market data, here is a comprehensive answer to your question about {intent}. I can confirm the information is relevant to your query."

        wall_clock_ms = random.randint(800, 9500)
        total_tokens = random.randint(150, 900)
        output_tokens = random.randint(80, 400)
        input_tokens = total_tokens - output_tokens

        msg_id = f"SEED_{uuid.uuid4().hex}"

        # Save user message
        db['chat_messages'].insert_one({
            'message_id': msg_id + '_user',
            'session_id': f"SEEDED_SESSION_{ts.strftime('%Y%m%d')}",
            'role': 'user',
            'content': user_msg,
            'timestamp': ts,
            'message_length': len(user_msg),
            'word_count': len(user_msg.split()),
            'sentiment': sentiment,
            'intent': intent,
            'error': False,
        })

        # Save bot response with metrics
        db['chat_messages'].insert_one({
            'message_id': msg_id + '_bot',
            'session_id': f"SEEDED_SESSION_{ts.strftime('%Y%m%d')}",
            'role': 'assistant',
            'content': bot_response,
            'timestamp': ts,
            'wall_clock_ms': wall_clock_ms,
            'ollama_duration_ms': wall_clock_ms - 200,
            'prompt_eval_ms': random.randint(100, 600),
            'eval_ms': random.randint(300, 3000),
            'load_duration_ms': random.randint(10, 50),
            'input_tokens': input_tokens,
            'output_tokens': output_tokens,
            'total_tokens': total_tokens,
            'tokens_per_second': round(output_tokens / (wall_clock_ms / 1000), 1),
            'message_length': len(bot_response),
            'word_count': len(bot_response.split()),
            'user_message_length': len(user_msg),
            'user_word_count': len(user_msg.split()),
            'cost_usd': round((total_tokens / 1000) * 0.03, 6),
            'model': 'qwen3:8b',
            'sentiment': sentiment,
            'intent': intent,
            'error': False,
        })

# Seed a few sessions for session count
for i in range(15):
    ts = datetime.utcnow() - timedelta(days=random.randint(0, DAYS_BACK))
    db['chatbot_sessions'].insert_one({
        'session_id': f"SEEDED_SESSION_{i}_{ts.strftime('%Y%m%d%H%M%S')}",
        'user_id': 'seeded_user',
        'title': random.choice(sample_questions)[:30] + '...',
        'started_at': ts,
        'last_activity': ts + timedelta(minutes=random.randint(5, 45)),
        'total_messages': random.randint(4, 20),
        'total_tokens_used': random.randint(500, 5000),
        'total_cost': round(random.uniform(0.01, 0.15), 4),
        'avg_response_time_ms': random.randint(1200, 6000),
        'error_count': 0,
        'is_active': False,
    })

total = db['chat_messages'].count_documents({'role': 'assistant', 'error': False})
sessions = db['chatbot_sessions'].count_documents({})
print(f"✅ Done! Total assistant messages in DB: {total}")
print(f"✅ Total sessions in DB: {sessions}")
