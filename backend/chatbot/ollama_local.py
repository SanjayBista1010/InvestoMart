# chatbot/ollama_local.py
import requests
import json
import re
import unicodedata

class OllamaLocal:
    """Ollama integration for qwen3:8b"""

    def __init__(self, model_name="qwen3:8b", base_url="http://localhost:11434"):
        self.model_name = model_name
        self.base_url = base_url
        self.timeout = 60  # Increased timeout

    def generate_response(self, prompt, context="", temperature=0.7, max_tokens=2500):
        """Generate response using Ollama"""
        try:
            # Build system prompt
            system_prompt = """You are InvestoBot, a helpful assistant for the Investomart platform. 
Your core goal is to help users with their specific queries, whether they are about livestock farming, investments, or platform features.

CRITICAL INSTRUCTION:
1. THE ACTIVE TOPIC IS KING. Always look at the 'RECENT CONVERSATION HISTORY' to identify the current subject (e.g., goats, chickens, a specific product).
2. If the user asks a follow-up like 'in context of Nepal' or 'tell me more', they are referring to that ACTIVE TOPIC. 
3. DO NOT switch to a general investment overview unless the user specifically asks to change topics.
4. Be professional and concise. NO EMOJIS."""

            # Build complete prompt
            prompt_parts = [f"SYSTEM: {system_prompt}"]
            if context:
                prompt_parts.append(f"CONTEXT & HISTORY:\n{context}")
            
            prompt_parts.append(f"USER: {prompt}")
            prompt_parts.append("ASSISTANT:")
            
            full_prompt = "\n\n".join(prompt_parts)
            
            # DEBUG: Log the full prompt
            print("\n" + "="*50)
            print("🚨 FULL PROMPT SENT TO OLLAMA:")
            print(full_prompt)
            print("="*50 + "\n")

            # Prepare request
            data = {
                "model": self.model_name,
                "prompt": full_prompt,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "num_predict": max_tokens,
                    "top_k": 40,
                    "top_p": 0.9,
                    "repeat_penalty": 1.1
                }
            }

            print(f"    Sending to Ollama...")
            # Send request
            response = requests.post(
                f"{self.base_url}/api/generate",
                json=data,
                timeout=self.timeout
            )

            if response.status_code == 200:
                result = response.json()
                response_text = result.get('response', '').strip()
                cleaned_text = self._clean_response(response_text)
                
                # Return rich metrics for enterprise analysis
                return {
                    'text': cleaned_text,
                    'metrics': {
                        'input_tokens': result.get('prompt_eval_count', 0),
                        'output_tokens': result.get('eval_count', 0),
                        'total_tokens': result.get('prompt_eval_count', 0) + result.get('eval_count', 0),
                        'total_duration_ms': result.get('total_duration', 0) // 1_000_000,
                        'load_duration_ms': result.get('load_duration', 0) // 1_000_000,
                        'prompt_eval_duration_ms': result.get('prompt_eval_duration', 0) // 1_000_000,
                        'eval_duration_ms': result.get('eval_duration', 0) // 1_000_000,
                        'model': self.model_name,
                        'parameters': {
                            'temperature': temperature,
                            'max_tokens': max_tokens
                        }
                    }
                }
            else:
                print(f"   ❌ Ollama HTTP {response.status_code}: {response.text[:200]}")
                return None

        except Exception as e:
            print(f"   ❌ Ollama error: {e}")
            return None

    def _clean_response(self, text):
        """Clean up AI response text."""
        if not text: return ""
        text = re.sub(r'^(System:|User:|Assistant:|Context:|Response:)\s*', '', text, flags=re.IGNORECASE)
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = text.strip()
        
        def is_emoji(char):
            return unicodedata.category(char) in ('So', 'Sm', 'Sk', 'Sc') or \
                   unicodedata.name(char, '').startswith(('EMOJI', 'REGIONAL INDICATOR'))
        return ''.join(char for char in text if not is_emoji(char))

    def is_available(self):
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            return response.status_code == 200 and any(m.get('name') == self.model_name for m in response.json().get('models', []))
        except:
            return False
