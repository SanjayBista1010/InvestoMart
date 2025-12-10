# chatbot/user_utils.py
from django.contrib.auth.models import User
from .mongo_manager import mongo_manager

def get_mongo_user_id(django_user):
    """Get MongoDB user ID for a Django user"""
    if not django_user or not django_user.is_authenticated:
        return None
    
    # Try to get from MongoDB
    mongo_id = mongo_manager.get_user_mongo_id(django_user.id)
    
    if mongo_id:
        return mongo_id
    
    # If not found, check if user exists in MongoDB auth_user
    try:
        mongo_manager.connect()
        auth_user = mongo_manager.db['auth_user'].find_one({'username': django_user.username})
        
        if auth_user:
            return str(auth_user['_id'])
        else:
            # Create a corresponding entry in MongoDB
            user_data = {
                'id': django_user.id,
                'username': django_user.username,
                'email': django_user.email,
                'first_name': django_user.first_name,
                'last_name': django_user.last_name,
                'is_active': django_user.is_active,
                'date_joined': django_user.date_joined
            }
            
            result = mongo_manager.db['auth_user'].insert_one(user_data)
            return str(result.inserted_id)
            
    except Exception as e:
        print(f"❌ Error in get_mongo_user_id: {e}")
        return None