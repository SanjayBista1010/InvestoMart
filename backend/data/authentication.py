from rest_framework import authentication
from rest_framework import exceptions
from django.contrib.auth import get_user_model

User = get_user_model()

class SimpleTokenAuthentication(authentication.BaseAuthentication):
    """
    Custom authentication for the Simple Token scheme (user_id-username).
    Expected header: Authorization: Bearer <user_id>-<username>
    """
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            return None

        try:
            # Handle "Bearer <token>"
            parts = auth_header.split()
            if parts[0].lower() != 'bearer' or len(parts) != 2:
                return None
            
            token = parts[1]
            
            # Split user_id and username
            # Note: We use split('-', 1) in case username contains a hyphen
            if '-' not in token:
                return None
                
            user_id, username = token.split('-', 1)
            
            user = User.objects.get(id=user_id, username=username)
            
            if not user.is_active:
                raise exceptions.AuthenticationFailed('User inactive or deleted.')
                
            return (user, None)
            
        except (User.DoesNotExist, ValueError, IndexError):
            return None
        except Exception as e:
            # Optional: log other exceptions
            return None
