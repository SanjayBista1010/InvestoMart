# chatbot/views.py
import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .ollama_local import OllamaLocal
from .user_utils import get_mongo_user_id, calculate_profit_loss
from .mongo_manager import mongo_manager

ollama_client = OllamaLocal(model_name="qwen3:8b")

def format_portfolio_text(profit_list):
    if not profit_list:
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
        
        lines.append(
            f"{inv['product_name']} - Qty: {inv['quantity']} | "
            f"Bought: NRS {investment:,.0f} | Current: NRS {current:,.0f} | "
            f"Profit/Loss: NRS {profit_loss:,.0f} ({pct_change:.2f}%)"
        )
        
        total_investment += investment
        total_current += current
        total_profit += profit_loss
    
    total_pct = (total_profit / total_investment * 100) if total_investment else 0
    lines.append(
        f"\nTOTAL - Investment: NRS {total_investment:,.0f}, Current: NRS {total_current:,.0f}, "
        f"Profit/Loss: NRS {total_profit:,.0f} ({total_pct:.2f}%)"
    )
    
    return "\n".join(lines)

def generate_portfolio_html_table(profit_list):
    if not profit_list:
        return ""
    
    html = '<div style="margin-top:15px;overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:13px;background:#fff;border:1px solid #ddd;border-radius:8px;">'
    html += '<thead><tr style="background:#f5f5f5;">'
    html += '<th style="padding:8px;text-align:left;border-bottom:1px solid #eee;">Asset</th>'
    html += '<th style="padding:8px;text-align:left;border-bottom:1px solid #eee;">Qty</th>'
    html += '<th style="padding:8px;text-align:left;border-bottom:1px solid #eee;">Bought</th>'
    html += '<th style="padding:8px;text-align:left;border-bottom:1px solid #eee;">Current</th>'
    html += '<th style="padding:8px;text-align:left;border-bottom:1px solid #eee;">Profit/Loss</th>'
    html += '<th style="padding:8px;text-align:left;border-bottom:1px solid #eee;">Return</th>'
    html += '</tr></thead><tbody>'
    
    total_investment = 0
    total_current = 0
    total_profit = 0
    
    for inv in profit_list:
        investment = float(inv.get('total_investment', 0))
        current = float(inv.get('current_value', 0))
        profit_loss = float(inv.get('profit_loss', 0))
        pct_change = float(inv.get('percentage_change', 0))
        
        html += f'<tr style="border-bottom:1px solid #eee;"><td style="padding:8px;">{inv["product_name"]}</td><td style="padding:8px;">{inv["quantity"]}</td><td style="padding:8px;">NRS {investment:,.0f}</td><td style="padding:8px;">NRS {current:,.0f}</td><td style="padding:8px;">NRS {profit_loss:,.0f}</td><td style="padding:8px;">{pct_change:.2f}%</td></tr>'
        
        total_investment += investment
        total_current += current
        total_profit += profit_loss
    
    total_pct = (total_profit / total_investment * 100) if total_investment else 0
    html += f'<tr style="background:#e6f7ff;font-weight:bold;"><td style="padding:8px;">TOTAL</td><td style="padding:8px;">-</td><td style="padding:8px;">NRS {total_investment:,.0f}</td><td style="padding:8px;">NRS {total_current:,.0f}</td><td style="padding:8px;">NRS {total_profit:,.0f}</td><td style="padding:8px;">{total_pct:.2f}%</td></tr>'
    html += '</tbody></table></div>'
    
    return html

@csrf_exempt
def chatbot_api(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST only'}, status=405)
    
    try:
        data = json.loads(request.body)
        message = data.get('message', '').strip()
        
        if not message:
            return JsonResponse({'response': 'Please type a message.'})
        
        context = "You are InvestoBot, a helpful investment assistant. DO NOT use emojis. Be concise."
        portfolio_text = ""
        portfolio_html = ""
        
        if request.user.is_authenticated:
            # --- NEW: Fetch user's full name ---
            user_full_name = f"{request.user.first_name} {request.user.last_name}".strip()
            # --- END NEW ---
            
            mongo_id = get_mongo_user_id(request.user)
            
            if mongo_id:
                profits = calculate_profit_loss(mongo_id, mongo_manager)
                portfolio_text = format_portfolio_text(profits)
                
                # Generate table for portfolio queries
                if any(word in message.lower() for word in ['portfolio', 'show', 'investment', 'profit', 'loss']):
                    portfolio_html = generate_portfolio_html_table(profits)
            else:
                portfolio_text = "You have no investments yet."
            
            # --- NEW: Include the full name in the context ---
            user_context_parts = []
            if user_full_name:
                 user_context_parts.append(f"User's full name: {user_full_name}.")
            user_context_parts.append(f"User's username: {request.user.username}.")
            user_context_parts.append(f"Portfolio:\n{portfolio_text}")
            
            context += f"\n\n" + "\n".join(user_context_parts)
            # --- END NEW ---
        
        # Call Ollama
        try:
            response_text = ollama_client.generate_response(
                prompt=message,
                context=context,
                temperature=0.7,
                max_tokens=800
            )
            
            if not response_text:
                response_text = "Here's your portfolio information."
        except Exception as e:
            print(f"Ollama error: {e}")
            response_text = "Here's your portfolio information."
        
        # Combine response with HTML table
        if portfolio_html:
            final_response = response_text + "|||TABLE|||" + portfolio_html
        else:
            final_response = response_text
        
        # Save to history
        if request.user.is_authenticated:
            try:
                mongo_manager.save_chat_message(
                    user_id=request.user.id,
                    user_message=message,
                    bot_response=final_response,
                    message_type='GENERAL'
                )
            except Exception as e:
                print(f"Failed to save: {e}")
        
        return JsonResponse({
            'response': final_response,
            'success': True
        })
    
    except Exception as e:
        print(f"Error: {e}")
        return JsonResponse({
            'response': "Sorry, something went wrong.",
            'success': False
        }, status=500)

def chatbot_widget(request):
    return render(request, 'chatbot/widget.html')
