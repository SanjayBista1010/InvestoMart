import random
import csv
import time
import os

print("Initializing varied general/everyday dataset generation...")

questions = [
    "Hi", "Hello", "Hey there!", "Good morning", "Good evening", 
    "How are you?", "How are you doing today?", "What's up?", "How is everything?",
    "Who are you?", "What is your name?", "Are you an AI?", "Who created you?",
    "What can you do?", "How can you help me?", "What are your capabilities?",
    "Tell me a joke", "Do you know any jokes?", "Make me laugh",
    "Where are you from?", "Where do you live?",
    "Thank you", "Thanks a lot", "I appreciate it", "Thanks",
    "Bye", "Goodbye", "See you later", "Take care!",
    "What is the meaning of life?", "Can you learn?", "Are you conscious?",
    "I need some assistance", "Can you answer questions?",
    "What time is it?", "What is today's date?",
    "Who is the best?", "Are you smart?"
]

answers = {
    "greeting": [
        "Hello! How can I assist you today?",
        "Hi there! It's great to hear from you. How can I help?",
        "Greetings! I am ready to answer any questions you might have.",
        "Good day! Tell me what's on your mind.",
    ],
    "how_are_you": [
        "I'm just a computer program, so I don't feel emotions, but I'm fully operational and ready to help!",
        "I'm functioning perfectly today! How are you doing?",
        "All systems are go. I'm here to assist you with your farming inquiries.",
    ],
    "identity": [
        "I am InvestoMart's specialized AI Assistant, trained to help you with agricultural and livestock management.",
        "I am an artificial intelligence created to provide expert agricultural advice and answer your queries.",
        "I'm your friendly neighborhood farming AI, built to support your livestock and crop management needs.",
    ],
    "capabilities": [
        "I specialize in providing detailed, expert knowledge regarding livestock farming, veterinary care, and agricultural economics.",
        "I can answer questions about different breeds of animals, their dietary needs, the environmental challenges they face, and much more.",
        "I am designed to give you comprehensive insights into farming profitability, biosecurity, and animal husbandry.",
    ],
    "joke": [
        "Why did the cow cross the road? To get to the udder side!",
        "Why do chickens lay eggs? Because if they dropped them, they'd break!",
        "What do you call a sleeping bull? A bulldozer!",
    ],
    "origin": [
        "I exist in the digital realm, running on servers to provide you with fast, accurate agricultural data.",
        "I don't have a physical home, but you can always find me right here on the InvestoMart platform.",
    ],
    "gratitude": [
        "You're very welcome! If you have any more questions, just ask.",
        "No problem at all! I'm always here to help.",
        "Glad I could be of assistance!",
    ],
    "farewell": [
        "Goodbye! Have a productive and wonderful day.",
        "See you later! Feel free to return if you need more agricultural advice.",
        "Take care! Wishing you success with your farm.",
    ],
    "existential": [
        "As an AI, I don't experience consciousness. My purpose is simply to process data and help you solve problems efficiently.",
        "I am a manifestation of code and data, here specifically to make your agricultural decisions easier and more informed.",
    ],
    "generic": [
        "I'm here to assist! Let me know specifically what you need help with.",
        "Yes, I can absolutely help with that. What do you need to know?",
        "Please provide more details so I can give you the most accurate agricultural information.",
    ]
}

def map_question_to_intent(q):
    q_lower = q.lower()
    if any(x in q_lower for x in ["hi", "hello", "hey", "good morning", "good evening"]): return "greeting"
    if any(x in q_lower for x in ["how are you", "what's up", "how is"]): return "how_are_you"
    if any(x in q_lower for x in ["who are you", "what is your name", "an ai", "created you"]): return "identity"
    if any(x in q_lower for x in ["what can you do", "help me", "capabilities"]): return "capabilities"
    if any(x in q_lower for x in ["joke", "laugh"]): return "joke"
    if any(x in q_lower for x in ["where are you", "where do you live"]): return "origin"
    if any(x in q_lower for x in ["thank you", "thanks", "appreciate"]): return "gratitude"
    if any(x in q_lower for x in ["bye", "goodbye", "later", "take care"]): return "farewell"
    if any(x in q_lower for x in ["meaning of", "learn", "conscious", "smart"]): return "existential"
    return "generic"

TARGET_ROWS = 200_000
OUTPUT_FILE = "data/general_everyday_chat.csv"

print(f"Generating {TARGET_ROWS:,} standard basic chat rows...")
start_time = time.time()

with open(OUTPUT_FILE, mode='w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(["animal", "breed", "category", "question", "answer"])
    
    buffer = []
    
    for i in range(1, TARGET_ROWS + 1):
        q = random.choice(questions)
        intent = map_question_to_intent(q)
        a = random.choice(answers[intent])
        
        # Adding some slight variations to keep the AI fluid
        if random.random() < 0.2:
            q = q + ("?" if not q.endswith("?") else "")
            
        # Placeholders since it's general chat
        buffer.append(["general", "general", "conversation", q, a])
        
        if i % 50_000 == 0:
            writer.writerows(buffer)
            buffer = []
            elapsed = time.time() - start_time
            print(f"  Processed {i:,}/{TARGET_ROWS:,} rows ({elapsed:.1f}s elapsed)")

if buffer:
    writer.writerows(buffer)

print(f"\nDone! Successfully generated {TARGET_ROWS:,} general conversation rows in {time.time() - start_time:.1f} seconds.")
print(f"Saved to: {OUTPUT_FILE}")
