# chatbot/ollama_local.py - UPDATED VERSION

import requests
import json
import re
import unicodedata # Import this library to handle Unicode characters (including emojis)

class OllamaLocal:
    """Ollama integration for qwen3:8b"""

    def __init__(self, model_name="qwen3:8b", base_url="http://localhost:11434"):
        self.model_name = model_name
        self.base_url = base_url
        self.timeout = 60  # Increased timeout

    def generate_response(self, prompt, context="", temperature=0.7, max_tokens=500):
        """Generate response using Ollama"""
        try:
            # Build system prompt
            system_prompt = """You are InvestoBot, a helpful investment assistant.
Always provide clear, concise answers. DO NOT use any emojis in your responses.
Keep responses under 200 words unless more detail is specifically requested."""

            # Build complete prompt with better formatting
            if context:
                full_prompt = f"{system_prompt}\n\n{context}\n\nUser Question: {prompt}\n\nAssistant Response:"
            else:
                full_prompt = f"{system_prompt}\n\nUser Question: {prompt}\n\nAssistant Response:"

            # Prepare request
            data = {
                "model": self.model_name,
                "prompt": full_prompt,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "num_predict": max_tokens, # Use the passed max_tokens value
                    "top_k": 40,
                    "top_p": 0.9,
                    "repeat_penalty": 1.1
                }
            }

            print(f"    Sending to Ollama...")
            print(f"    Prompt length: {len(full_prompt)} chars")

            # Send request
            response = requests.post(
                f"{self.base_url}/api/generate",
                json=data,
                timeout=self.timeout
            )

            if response.status_code == 200:
                result = response.json()
                response_text = result.get('response', '').strip()

                # Debug: Show raw response
                print(f"    Raw response: '{response_text[:100]}...'")

                # Clean up response (remove emojis and other artifacts)
                response_text = self._clean_response(response_text)

                if not response_text or len(response_text) < 5:
                    print(f"   ⚠️ Response too short or empty: '{response_text}'")
                    return None

                print(f"   ✅ Cleaned response ({len(response_text)} chars): {response_text[:100]}...")
                return response_text
            else:
                print(f"   ❌ Ollama HTTP {response.status_code}: {response.text[:200]}")
                return None

        except requests.exceptions.Timeout:
            print("   ⏰ Ollama timeout (60s exceeded)")
            return None
        except requests.exceptions.ConnectionError:
            print("    Cannot connect to Ollama - is 'ollama serve' running?")
            return None
        except Exception as e:
            print(f"   ❌ Ollama error: {e}")
            import traceback
            traceback.print_exc()
            return None

    def _clean_response(self, text):
        """Clean up AI response text, removing emojis and common artifacts."""
        if not text:
            return ""

        # Remove common AI artifacts
        text = re.sub(r'^(System:|User:|Assistant:|Context:|Response:)\s*', '', text, flags=re.IGNORECASE)

        # Remove repeated newlines
        text = re.sub(r'\n{3,}', '\n\n', text)

        # Strip leading/trailing whitespace
        text = text.strip()

        # Remove emojis using unicodedata
        # This function checks if a character's category is one of the emoji-related categories
        def is_emoji(char):
            return unicodedata.category(char) in ('So', 'Sm', 'Sk', 'Sc') or \
                   unicodedata.name(char, '').startswith(('EMOJI', 'REGIONAL INDICATOR'))

        # Filter out emoji characters
        cleaned_text = ''.join(char for char in text if not is_emoji(char))

        return cleaned_text

    def is_available(self):
        """Check if Ollama is running and model is available"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                models = response.json().get('models', [])
                for model in models:
                    if model.get('name') == self.model_name:
                        return True
            return False
        except:
            return False # Return False if there's an error checking availability
