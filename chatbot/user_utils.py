from django.contrib.auth.models import User
from .mongo_manager import mongo_manager
from bson import ObjectId
from decimal import Decimal


def get_mongo_user_id(django_user):
    """
    Get MongoDB user _id for a Django user.
    If the user doesn't exist in MongoDB, create it.
    """
    if not django_user or not django_user.is_authenticated:
        return None
    
    try:
        mongo_manager.connect()
        
        # Try to find by Django ID
        auth_user = mongo_manager.db['auth_user'].find_one({'id': django_user.id})
        
        if auth_user and '_id' in auth_user:
            return str(auth_user['_id'])
        
        # Try by username if not found
        auth_user = mongo_manager.db['auth_user'].find_one({'username': django_user.username})
        
        if auth_user and '_id' in auth_user:
            return str(auth_user['_id'])
        
        # Create new Mongo entry if not found
        user_data = {
            'id': django_user.id,
            'username': django_user.username,
            'email': django_user.email,
            'first_name': django_user.first_name,
            'last_name': django_user.last_name,
            'is_active': django_user.is_active,
            'date_joined': django_user.date_joined.isoformat() if django_user.date_joined else None,
            'last_login': django_user.last_login.isoformat() if django_user.last_login else None
        }
        
        result = mongo_manager.db['auth_user'].insert_one(user_data)
        print(f"Created MongoDB user entry for {django_user.username}")
        return str(result.inserted_id)
        
    except Exception as e:
        print(f"Error in get_mongo_user_id: {e}")
        return None


def get_django_user_from_mongo_id(mongo_user_id):
    """
    Get Django user object from MongoDB user _id.
    """
    try:
        mongo_manager.connect()
        obj_id = ObjectId(mongo_user_id) if not isinstance(mongo_user_id, ObjectId) else mongo_user_id
        
        auth_user = mongo_manager.db['auth_user'].find_one({'_id': obj_id})
        
        if auth_user:
            # Try by Django ID
            if 'id' in auth_user:
                try:
                    return User.objects.get(id=auth_user['id'])
                except User.DoesNotExist:
                    pass
            
            # Fallback to username
            if 'username' in auth_user:
                try:
                    return User.objects.get(username=auth_user['username'])
                except User.DoesNotExist:
                    pass
        
        return None
        
    except Exception as e:
        print(f"Error getting Django user: {e}")
        return None


def calculate_profit_loss(mongo_user_id, mongo_manager):
    """
    Calculate profit/loss for all investments of a user.
    Returns list of dicts with product names included.
    """
    try:
        mongo_manager.connect()
        
        # Convert to ObjectId if needed
        if isinstance(mongo_user_id, str):
            obj_id = ObjectId(mongo_user_id)
        else:
            obj_id = mongo_user_id
        
        # Fetch user investments
        investments = list(mongo_manager.db['user_investments'].find({'user_id': obj_id}))
        
        print(f"Found {len(investments)} investments for user {mongo_user_id}")
        
        result = []
        
        for inv in investments:
            purchase = Decimal(str(inv.get('total_investment', 0)))
            current = Decimal(str(inv.get('current_value', 0)))
            profit_loss = current - purchase
            pct_change = round(float((profit_loss / purchase * 100) if purchase else 0), 2)
            
            # Fetch product name from products collection
            product_id = inv.get('product_id')
            product_name = 'Unknown Product'
            
            if product_id:
                product = mongo_manager.db['products'].find_one({'_id': product_id})
                if product:
                    product_name = product.get('name', 'Unknown Product')
                    print(f"Found product: {product_name}")
                else:
                    print(f"Product not found for ID: {product_id}")
            
            result.append({
                'product_name': product_name,
                'product_id': str(product_id) if product_id else None,
                'quantity': inv.get('quantity', 0),
                'total_investment': float(purchase),
                'current_value': float(current),
                'profit_loss': float(profit_loss),
                'percentage_change': pct_change,
                'purchase_date': inv.get('purchase_date')
            })
        
        return result
        
    except Exception as e:
        print(f"Error calculating profit/loss: {e}")
        import traceback
        traceback.print_exc()
        return []