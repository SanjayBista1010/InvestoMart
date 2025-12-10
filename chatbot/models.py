# chatbot/models.py - CLEAN VERSION
from django.db import models
from django.contrib.auth.models import User

class ChatMessage(models.Model):
    """Store chat messages"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')
    user_message = models.TextField()
    bot_response = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    message_type = models.CharField(max_length=50, default='GENERAL')
    
    class Meta:
        db_table = 'chat_history'  # This tells Django to use your MongoDB collection
    
    def __str__(self):
        return f"{self.user.username if self.user else 'Anonymous'}: {self.user_message[:50]}"

class Product(models.Model):
    """Product information"""
    name = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=100)
    current_market_price = models.DecimalField(max_digits=15, decimal_places=2)
    
    class Meta:
        db_table = 'products'
    
    def __str__(self):
        return self.name

# Let's keep it simple for now. We'll add more models after migrations work.