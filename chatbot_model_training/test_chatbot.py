import torch
import torch.nn.functional as F
import sys
from tokenizers import Tokenizer
from model import GPTConfig, SimpleLLM

print("Initializing AI Chatbot Environment...")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

try:
    tokenizer = Tokenizer.from_file("tokenizer/tokenizer.json")
except:
    print("Error: Could not find tokenizer.json. Please ensure you are running this in the chatbot_model_training folder.")
    sys.exit(1)

eos_token_id = tokenizer.token_to_id("</s>")
max_length = 128

config = GPTConfig(
    vocab_size=tokenizer.get_vocab_size(),
    hidden_size=256,
    num_hidden_layers=4,
    num_attention_heads=4,
    intermediate_size=512,
    max_position_embeddings=max_length
)

model = SimpleLLM(config).to(device)

try:
    ckpt = torch.load("weights/simple_llm_final.pt", map_location=device)
    if "model_state" in ckpt:
        model.load_state_dict(ckpt["model_state"])
    else:
        model.load_state_dict(ckpt)
    print("Model weights successfully loaded on " + str(device).upper() + "!")
except Exception as e:
    print(f"Error loading model weights: {e}")
    sys.exit(1)

model.eval()

def generate(prompt):
    # Auto-detect general vs agricultural context
    is_general = any(word in prompt.lower() for word in ['hello', 'hi', 'how', 'who', 'joke', 'name', 'bye'])
    
    if is_general:
        formatted_prompt = prompt
    else:
        formatted_prompt = f"<question>{prompt}</question> <answer>"
        
    input_ids = torch.tensor([tokenizer.encode(formatted_prompt).ids], dtype=torch.long).to(device)
    
    with torch.no_grad():
        for _ in range(150):
            if input_ids.size(1) >= max_length:
                break
            outputs = model(input_ids)
            next_token_logits = outputs[:, -1, :] / 0.8
            probs = F.softmax(next_token_logits, dim=-1)
            next_token = torch.multinomial(probs, num_samples=1)
            
            input_ids = torch.cat([input_ids, next_token], dim=-1)
            
            if next_token.item() == eos_token_id:
                break
                
    response = tokenizer.decode(input_ids[0].tolist())
    
    # Strip structure tags from generation
    if "<answer>" in response:
        response = response.split("<answer>")[-1].strip()
    if "</answer>" in response:
        response = response.split("</answer>")[0].strip()
        
    # Prevent model echoing prompt on generic questions
    if response.startswith(prompt):
        response = response[len(prompt):].strip()
        
    return response

print("\n" + "="*60)
print("  InvestoMart Local AI Chatbot Test Terminal")
print("="*60)
print("- Type 'quit' or 'exit' to end the session.")
print("- Try asking general questions: 'Who are you?' or 'Tell me a joke'")
print("- Try asking livestock questions: 'What are the primary characteristics of the Holstein cow?'\n")

while True:
    try:
        user_input = input("You: ")
        if user_input.lower().strip() in ['quit', 'exit']:
            print("Session ended.")
            break
            
        if not user_input.strip():
            continue
            
        answer = generate(user_input)
        print(f"\nAI: {answer}\n")
    except KeyboardInterrupt:
        print("\nSession ended.")
        break
