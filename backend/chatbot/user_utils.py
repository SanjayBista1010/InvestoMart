from django.contrib.auth.models import User
from .mongo_manager import mongo_manager
from bson import ObjectId
from decimal import Decimal

def get_mongo_user_id(django_user):
    if not django_user or not django_user.is_authenticated:
        return None
    
    try:
        mongo_manager.connect()
        # Try finding by Django ID first, then username
        auth_user = mongo_manager.db['auth_user'].find_one({'id': django_user.id})
        if auth_user: return str(auth_user['_id'])
        
        auth_user = mongo_manager.db['auth_user'].find_one({'username': django_user.username})
        if auth_user: return str(auth_user['_id'])
        
        # Create if not exists
        user_data = {
            'id': django_user.id,
            'username': django_user.username,
            'email': django_user.email,
            'first_name': django_user.first_name,
            'last_name': django_user.last_name,
            'is_active': django_user.is_active,
        }
        result = mongo_manager.db['auth_user'].insert_one(user_data)
        return str(result.inserted_id)
    except Exception as e:
        print(f"Error in get_mongo_user_id: {e}")
        return None

def calculate_profit_loss(mongo_user_id, mongo_manager):
    try:
        mongo_manager.connect()
        obj_id = ObjectId(mongo_user_id) if isinstance(mongo_user_id, str) else mongo_user_id
        investments = list(mongo_manager.db['user_investments'].find({'user_id': obj_id}))
        
        result = []
        for inv in investments:
            purchase = Decimal(str(inv.get('total_investment', 0)))
            current = Decimal(str(inv.get('current_value', 0)))
            profit_loss = current - purchase
            pct_change = round(float((profit_loss / purchase * 100) if purchase else 0), 2)
            
            product_id = inv.get('product_id')
            product_name = 'Unknown Product'
            if product_id:
                product = mongo_manager.db['products'].find_one({'_id': product_id})
                if product: product_name = product.get('name', 'Unknown Product')
            
            result.append({
                'product_name': product_name,
                'quantity': inv.get('quantity', 0),
                'total_investment': float(purchase),
                'current_value': float(current),
                'profit_loss': float(profit_loss),
                'percentage_change': pct_change
            })
        return result
    except Exception as e:
        print(f"Error calculating profit/loss: {e}")
        return []
