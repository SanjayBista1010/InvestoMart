# chatbot/views.py
import json
import re # Import re for regex operations
from decimal import Decimal
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .ollama_local import OllamaLocal
from .user_utils import get_mongo_user_id, calculate_profit_loss
from .mongo_manager import mongo_manager

# Initialize Ollama client
ollama_client = OllamaLocal(model_name="qwen3:8b")


def format_portfolio_text(profit_list):
    """Convert profit/loss list into readable string using NRS."""
    if not profit_list:
        print("   📊 format_portfolio_text: No profits found, returning 'no investments' message.")
        return "You have no investments yet."

    lines = []
    total_investment = 0
    total_current = 0
    total_profit = 0

    for inv in profit_list:
        investment = float(inv.get('total_investment', 0))
        current = float(inv.get('current_value', 0))
        profit_loss = float(inv.get('profit_loss', 0))
        pct_change = float(inv.get('percentage_change', 0))

        line = f"{inv['product_name']} - Qty: {inv['quantity']} | Bought: NRS {investment:,.0f} | Current: NRS {current:,.0f} | Profit/Loss: NRS {profit_loss:,.0f} ({pct_change:.2f}%)"
        lines.append(line)
        print(f"   📊 format_portfolio_text: Added line - {line}")

        total_investment += investment
        total_current += current
        total_profit += profit_loss

    total_pct = (total_profit / total_investment * 100) if total_investment else 0
    total_line = f"\nTOTAL - Investment: NRS {total_investment:,.0f}, Current: NRS {total_current:,.0f}, Profit/Loss: NRS {total_profit:,.0f} ({total_pct:.2f}%)"
    lines.append(total_line)
    print(f"   📊 format_portfolio_text: Added total line - {total_line}")

    result = "\n".join(lines)
    print(f"   📊 format_portfolio_text: Returning formatted text (length {len(result)}): {result[:200]}...") # Log first 200 chars
    return result

def generate_portfolio_structured_data(profit_list):
    """Generate structured data for portfolio table."""
    if not profit_list:
        return {"headers": ["Asset", "Qty", "Bought (NRS)", "Current (NRS)", "Profit/Loss (NRS)", "% Return"],
                "rows": []}

    rows = []
    total_investment = 0
    total_current = 0
    total_profit = 0

    for inv in profit_list:
        investment = float(inv.get('total_investment', 0))
        current = float(inv.get('current_value', 0))
        profit_loss = float(inv.get('profit_loss', 0))
        pct_change = float(inv.get('percentage_change', 0))

        rows.append([
            inv['product_name'],
            inv['quantity'],
            f"{investment:,.0f}",
            f"{current:,.0f}",
            f"{profit_loss:,.0f}",
            f"{pct_change:.2f}%"
        ])

        total_investment += investment
        total_current += current
        total_profit += profit_loss

    total_pct = (total_profit / total_investment * 100) if total_investment else 0

    # Add total row
    rows.append([
        "**TOTAL**",
        "-",
        f"**NRS {total_investment:,.0f}**",
        f"**NRS {total_current:,.0f}**",
        f"**NRS {total_profit:,.0f}**",
        f"**{total_pct:.2f}%**"
    ])

    return {
        "headers": ["Asset", "Qty", "Bought (NRS)", "Current (NRS)", "Profit/Loss (NRS)", "% Return"],
        "rows": rows
    }


@csrf_exempt
def chatbot_api(request):
    """Chatbot API endpoint with Ollama and portfolio support."""
    print("🤖 chatbot_api: Request received.")
    if request.method != 'POST':
        print("❌ chatbot_api: Not a POST request.")
        return JsonResponse({'error': 'POST only'}, status=405)

    try:
        data = json.loads(request.body)
        message = data.get('message', '').strip()
        print(f"💬 chatbot_api: User message: '{message}'")

        if not message:
            print("❌ chatbot_api: Empty message received.")
            return JsonResponse({'response': 'Please type a message.'})

        # Build context for AI
        context = "You are InvestoBot, a helpful investment assistant for InvestoMart platform. DO NOT use emojis. "
        portfolio_text = ""
        portfolio_structured_data = None # Initialize variable

        # Add portfolio data if user is authenticated
        if request.user.is_authenticated:
            print(f"👤 chatbot_api: Authenticated user: {request.user.username}")
            mongo_id = get_mongo_user_id(request.user)

            if mongo_id:
                print(f"🔑 chatbot_api: MongoDB ID found: {mongo_id}")
                profits = calculate_profit_loss(mongo_id, mongo_manager)

                # Fetch product names from MongoDB
                mongo_manager.connect()
                for inv in profits:
                    if 'product_name' not in inv or inv['product_name'] == 'Unknown Product':
                        print(f"⚠️ chatbot_api: Missing product name for investment {inv.get('product_id')}")

                portfolio_text = format_portfolio_text(profits)
                print(f"📊 chatbot_api: Portfolio text generated (length {len(portfolio_text)}).")

                # Check if the message is asking for details that should include a table
                if any(word in message.lower() for word in ['breakdown', 'details', 'table', 'full', 'profit', 'loss', 'portfolio']):
                    print("📈 chatbot_api: Message contains keywords for table, generating structured data...")
                    portfolio_structured_data = generate_portfolio_structured_data(profits)
                    print("📈 chatbot_api: Structured data generated successfully.")
            else:
                portfolio_text = "You have no investments yet."
                print("⚠️ chatbot_api: No MongoDB ID found for user.")

            context += f"\n\nCurrent user: {request.user.username}\nUser's portfolio summary:\n{portfolio_text}"
        else:
            print("👤 chatbot_api: User is not authenticated.")
            context += "\n\nUser is not logged in. Provide general investment information only."

        # Call Ollama AI
        print("🤖 chatbot_api: Calling Ollama...")
        print(f"📝 chatbot_api: Context length: {len(context)} chars")
        try:
            response_text = ollama_client.generate_response(
                prompt=message,
                context=context,
                temperature=0.7,
                max_tokens=1200
            )

            if response_text:
                print(f"✅ chatbot_api: Ollama response received (length {len(response_text)}): {response_text[:150]}...") # Log first 150 chars
            else:
                print("⚠️ chatbot_api: Ollama returned empty/None response.")
                response_text = "Sorry, I couldn't generate a response right now."

        except Exception as e:
            print(f"❌ chatbot_api: Error calling Ollama: {e}")
            import traceback
            traceback.print_exc()
            response_text = "Sorry, there was an issue connecting to the AI service."

        # Fallback if Ollama fails or returns empty
        if not response_text or response_text.strip() == "":
            print("🔄 chatbot_api: Using fallback response.")
            if any(word in message.lower() for word in ['portfolio', 'investment', 'show my', 'profit', 'loss']):
                response_text = f"Here's your portfolio summary:\n\n{portfolio_text}\n\nYou can ask me specific questions about your investments!"
            elif 'gold' in message.lower():
                response_text = "Gold is currently trading around NRS 81,000 per 10g. Would you like to know about your gold investments?"
            else:
                response_text = "I'm your investment assistant! You can ask me about your portfolio, gold prices, or investment recommendations."

        # --- MODIFICATION: Include structured data in the JSON response if available ---
        response_data = {
            'response': response_text, # Send the AI response text
            'success': True
        }

        if portfolio_structured_data:
            response_data['portfolio_table_data'] = portfolio_structured_data # Send the structured data separately
            print("📝 chatbot_api: Included structured portfolio data in JSON response.")

        # --- END MODIFICATION ---

        # Save to chat history
        if request.user.is_authenticated:
            try:
                mongo_manager.save_chat_message(
                    user_id=request.user.id,
                    user_message=message,
                    bot_response=response_text, # Save the text part only
                    message_type='GENERAL'
                )
                print("💾 chatbot_api: Chat message saved to history.")
            except Exception as e:
                print(f"⚠️ chatbot_api: Failed to save chat: {e}")

        print(f"📤 chatbot_api: Sending JSON response (response length {len(response_text)}).")
        return JsonResponse(response_data) # Send the combined JSON response

    except json.JSONDecodeError:
        print("❌ chatbot_api: Error decoding JSON from request body.")
        return JsonResponse({'response': "Invalid request format."}, status=400)
    except Exception as e:
        print(f"❌ chatbot_api: Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'response': "Oops! Something went wrong. Please try again."}, status=500)


def chatbot_widget(request):
    """Render chatbot widget template"""
    print("💬 chatbot_widget: Rendering widget template.")
    return render(request, 'chatbot/widget.html')


def test_ollama(request):
    """Test endpoint to verify Ollama is working"""
    print("🧪 test_ollama: Testing Ollama connection...")
    try:
        response = ollama_client.generate_response(
            prompt="Hello! Please respond with exactly: 'Ollama is working correctly.'",
            context="",
            temperature=0.5,
            max_tokens=50
        )

        if response:
            print(f"✅ test_ollama: Success - {response}")
            return JsonResponse({
                'status': 'success',
                'response': response,
                'ollama_working': True
            })
        else:
            print("❌ test_ollama: Ollama returned empty response.")
            return JsonResponse({
                'status': 'error',
                'response': "Ollama not responding - check if 'ollama serve' is running",
                'ollama_working': False
            }, status=503)

    except Exception as e:
        print(f"❌ test_ollama: Error: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({
            'status': 'error',
            'response': f"Ollama exception: {str(e)}",
            'ollama_working': False
        }, status=503)
