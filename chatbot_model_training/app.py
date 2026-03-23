import torch
import torch.nn.functional as F
from flask import Flask, request, jsonify
from flask_cors import CORS
from tokenizers import Tokenizer
from model import GPTConfig, SimpleLLM

app = Flask(__name__)
# Enable CORS for the frontend React app
CORS(app)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print("Initializing Tokenizer and Model architecture...")
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
    ckpt = torch.load("weights/simple_llm_best.pt", map_location=device)
    if "model_state" in ckpt:
        model.load_state_dict(ckpt["model_state"])
    else:
        model.load_state_dict(ckpt)
    print("Model weights successfully loaded!")
except Exception as e:
    print(f"Warning: Model weights not loaded. Error: {e}")

model.eval()

def generate_text(prompt, max_gen_len=200, temperature=0.8):
    # Prepare the input
    input_ids = torch.tensor([tokenizer.encode(prompt).ids], dtype=torch.long).to(device)
    
    with torch.no_grad():
        for _ in range(max_gen_len):
            if input_ids.size(1) >= max_length:
                break
            outputs = model(input_ids)
            next_token_logits = outputs[:, -1, :] / temperature
            
            # Sample next token probabilistically (multinomial instead of greedy)
            probs = F.softmax(next_token_logits, dim=-1)
            next_token = torch.multinomial(probs, num_samples=1)
            
            input_ids = torch.cat([input_ids, next_token], dim=-1)
            
            # Stop if we hit EOS or answer end tag
            if next_token.item() == eos_token_id:
                break
                
    # Decode only the generated text portion, or decode all and parse
    generated_text = tokenizer.decode(input_ids[0].tolist())
    return generated_text

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_query = data.get("prompt", "")
    
    # Inject structure so the model completes the answer based on its sequential training format.
    formatted_prompt = f"<question>{user_query}</question> <answer>"
    
    response_text = generate_text(formatted_prompt)
    
    # Extract the portion inside <answer>...</answer> tags
    final_answer = response_text
    if "<answer>" in final_answer:
        final_answer = final_answer.split("<answer>")[-1].strip()
        if "</answer>" in final_answer:
            final_answer = final_answer.split("</answer>")[0].strip()
            
    return jsonify({
        "response": final_answer, 
        "raw_model_completion": response_text
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5005) # Running on 5005 to avoid clash with other APIs
