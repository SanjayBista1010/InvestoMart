# chatbot/context_processors.py - SIMPLIFIED
from .models import ChatMessage

def chatbot_context(request):
    """Make chatbot available on all pages"""
    context = {
        'chatbot_enabled': True,
        'chatbot_user': request.user if request.user.is_authenticated else None,
    }
    
    # Get recent messages for authenticated users
    if request.user.is_authenticated:
        recent_messages = ChatMessage.objects.filter(
            user=request.user
        ).order_by('-timestamp')[:5]
        context['recent_messages'] = recent_messages
    else:
        context['recent_messages'] = []
    
    return context