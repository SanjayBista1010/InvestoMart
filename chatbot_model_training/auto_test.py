import torch
import torch.nn.functional as F
from tokenizers import Tokenizer
from model import GPTConfig, SimpleLLM

print("Loading test environment...")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
tokenizer = Tokenizer.from_file("tokenizer/tokenizer.json")
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
except Exception as e:
    print(f"Failed to load weights: {e}")
    exit(1)

model.eval()

def generate(prompt, is_general=False):
    # Inject structure if it's agricultural (since the model learned <question> and <answer> tags)
    if not is_general:
        formatted_prompt = f"<question>{prompt}</question> <answer>"
    else:
        formatted_prompt = prompt
        
    input_ids = torch.tensor([tokenizer.encode(formatted_prompt).ids], dtype=torch.long).to(device)
    
    with torch.no_grad():
        for _ in range(150):
            outputs = model(input_ids)
            next_token_logits = outputs[:, -1, :] / 0.8
            probs = F.softmax(next_token_logits, dim=-1)
            next_token = torch.multinomial(probs, num_samples=1)
            input_ids = torch.cat([input_ids, next_token], dim=-1)
            if next_token.item() == eos_token_id:
                break
                
    response = tokenizer.decode(input_ids[0].tolist())
    
    # Clean up formatting sequence tags
    if "<answer>" in response:
        response = response.split("<answer>")[-1].strip()
    if "</answer>" in response:
        response = response.split("</answer>")[0].strip()
        
    return response.strip()

test_prompts = [
    ("Hello, who are you?", True),
    ("Tell me a joke", True),
    ("What are the primary characteristics of the Leghorn chicken?", False),
    ("How suitable is the Boer goat for agricultural farming in Nepal?", False)
]

print("\n--- Automatic Model Verification ---")
for q, is_gen in test_prompts:
    print(f"User: {q}")
    ans = generate(q, is_general=is_gen)
    print(f"Chatbot: {ans}\n")
    print("-" * 50)
