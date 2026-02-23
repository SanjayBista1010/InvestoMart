from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db import DatabaseError
from django.utils import timezone
from datetime import timedelta
import logging
from .serializers import *
from .models import *
from .exceptions import (
    AuthenticationException,
    RegistrationException,
    DataNotFoundException,
    ValidationException,
    DatabaseException
)
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# Initialize logger
logger = logging.getLogger(__name__)

# Existing views with error handling...
# Existing views with error handling...
# Enterprise Data Views will be added here

import uuid

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_products(request):
    try:
        logger.info(f"Fetching product listings for user {request.user.id}")
        products = Product.objects.filter(seller=request.user).order_by('-created_at')
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
    except Exception as e:
        logger.exception("Error fetching user products")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_product_listing(request, product_id):
    try:
        logger.info(f"Updating product listing {product_id} for user {request.user.id}")
        try:
            product = Product.objects.get(product_id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
            
        # Security: verify ownership
        if product.seller != request.user:
            logger.warning(f"Unauthorized update attempt on {product_id} by user {request.user.id}")
            return Response({'error': 'You do not have permission to edit this listing'}, status=status.HTTP_403_FORBIDDEN)
            
        partial = request.method == 'PATCH'
        serializer = ProductSerializer(product, data=request.data, partial=partial)
        
        if serializer.is_valid():
            # Ensure seller doesn't change
            serializer.save(seller=request.user)
            logger.info(f"Product listing {product_id} updated successfully")
            return Response(serializer.data)
        else:
            return Response({'error': 'Validation failed', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.exception(f"Error updating product listing {product_id}")
        return Response({'error': 'Internal server error', 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_product_listing(request, product_id):
    try:
        logger.info(f"Deleting product listing {product_id} for user {request.user.id}")
        try:
            product = Product.objects.get(product_id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
            
        # Security: verify ownership
        if product.seller != request.user:
            logger.warning(f"Unauthorized delete attempt on {product_id} by user {request.user.id}")
            return Response({'error': 'You do not have permission to delete this listing'}, status=status.HTTP_403_FORBIDDEN)
            
        product.delete()
        logger.info(f"Product listing {product_id} deleted successfully")
        return Response({'message': 'Listing deleted successfully'}, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.exception(f"Error deleting product listing {product_id}")
        return Response({'error': 'Internal server error', 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_product_listing(request):
    try:
        logger.info(f"Creating product listing for user {request.user.id}", extra={
            'user_id': request.user.id,
            'event': 'create_listing_attempt',
            'data_keys': list(request.data.keys())
        })

        data = request.data.copy()
        data['seller'] = request.user.id
        
        # Generate product_id if not present
        if 'product_id' not in data:
            data['product_id'] = f"PROD-{uuid.uuid4().hex[:8].upper()}"
            
        # Determine status (default active)
        if 'status' not in data:
            data['status'] = 'active'
            
        # Set defaults if missing (mapping from form to model)
        if 'current_price' not in data and 'base_price' in data:
            data['current_price'] = data['base_price']
            
        # Auto-generate title/description if missing but we have type
        if 'category' in data and 'title' not in data:
            qty = data.get('quantity', 1)
            data['title'] = f"{qty} x {data['category']}"
            
        if 'description' not in data:
            weight = data.get('current_weight', 'N/A')
            data['description'] = f"Selling {data.get('category', 'Livestock')}. Weight: {weight}"
            
        # Default location to "Farm" if not provided
        if 'location' not in data:
            data['location'] = "On Farm"

        serializer = ProductSerializer(data=data)
        if serializer.is_valid():
            product = serializer.save()
            logger.info(f"Product listing created successfully: {product.product_id}", extra={
                'user_id': request.user.id,
                'product_id': product.product_id,
                'event': 'create_listing_success'
            })
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            logger.warning("Product listing validation failed", extra={
                'user_id': request.user.id,
                'errors': serializer.errors,
                'event': 'create_listing_validation_error'
            })
            return Response({'error': 'Validation failed', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.exception("Unexpected error creating product listing", extra={
            'user_id': request.user.id,
            'error': str(e),
            'event': 'create_listing_exception'
        })
        return Response({'error': 'Internal server error', 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Authentication views with error handling
@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    try:
        token = request.data.get('token')
        logger.info("Received Google Auth request")
        
        if not token:
            return Response({'error': 'No token provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify token
        try:
            id_info = id_token.verify_oauth2_token(token, google_requests.Request())
            
            # Check for generic client ID usage if needed, but for now allow any
            # if id_info['aud'] != YOUR_CLIENT_ID: raise ValueError('Could not verify audience.')
            
            email = id_info.get('email')
            name = id_info.get('name', '')
            picture = id_info.get('picture', '')
            
            logger.info(f"Google Auth Verified: {email}")
            
        except ValueError as e:
            logger.error(f"Invalid Google Token: {e}")
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

        # Get or Create User
        try:
            user = User.objects.get(email=email)
            logger.info(f"Google Login: Existing user {user.username}")
        except User.DoesNotExist:
            logger.info(f"Google Login: Creating new user for {email}")
            username = email.split('@')[0]
            counter = 1
            original_username = username
            while User.objects.filter(username=username).exists():
                username = f"{original_username}{counter}"
                counter += 1
                
            user = User.objects.create_user(
                username=username,
                email=email,
                password=None # Unusable password
            )
            
            if name:
                name_parts = name.split(' ', 1)
                user.first_name = name_parts[0]
                if len(name_parts) > 1:
                    user.last_name = name_parts[1]
            
            # Save profile pic if user model supports it (requires custom user model logic)
            # data.User has avatar_url
            if hasattr(user, 'avatar_url'):
                user.avatar_url = picture
                
            user.save()

        login(request, user)
        
        # Generate token
        token = f"{user.id}-{user.username}"
        
        return Response({
            'message': 'Google login successful',
            'token': token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'name': user.get_full_name() or user.username,
                'avatar': picture
            }
        })

    except Exception as e:
        logger.exception(f"Unexpected error during Google Auth: {str(e)}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def user_login(request):
    try:
        identifier = request.data.get('email') or request.data.get('username')  # Accept either
        password = request.data.get('password')
        
        logger.info(f"Login attempt for: {identifier}")
        
        if not identifier or not password:
            logger.warning(f"Login failed: Missing credentials")
            raise ValidationException("Username/Email and password are required")
        
        # Try to find user by email or username
        user = None
        try:
            # First try email
            if '@' in identifier:
                user_obj = User.objects.get(email=identifier)
                user = authenticate(username=user_obj.username, password=password)
            else:
                # Try username
                user = authenticate(username=identifier, password=password)
        except User.DoesNotExist:
            logger.warning(f"Login failed: User not found for {identifier}")
            user = None
        
        if user is not None:
            login(request, user)
            logger.info(f"User {user.username} logged in successfully")
            
            # Generate a simple token (user_id-username for now)
            # In production, use proper JWT library
            token = f"{user.id}-{user.username}"
            
            return Response({
                'message': 'Login successful',
                'token': token,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'name': user.get_full_name() or user.username,
                    'is_superuser': user.is_superuser,
                    'is_staff': user.is_staff,
                }
            })
        else:
            logger.warning(f"Login failed: Invalid credentials for {identifier}")
            raise AuthenticationException("Invalid credentials")
    
    except ValidationException as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    except AuthenticationException as e:
        return Response({'error': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
    
    except Exception as e:
        logger.exception(f"Unexpected error during login: {str(e)}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def user_register(request):
    try:
        email = request.data.get('email')
        password = request.data.get('password')
        name = request.data.get('name', '')
        
        logger.info(f"Registration attempt for email: {email}")
        
        if not email or not password:
            logger.warning(f"Registration failed: Missing credentials for {email}")
            raise ValidationException("Email and password are required")
        
        if User.objects.filter(email=email).exists():
            logger.warning(f"Registration failed: Email {email} already exists")
            raise RegistrationException("Email already registered")
        
        # Create username from email
        username = email.split('@')[0]
        counter = 1
        original_username = username
        while User.objects.filter(username=username).exists():
            username = f"{original_username}{counter}"
            counter += 1
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        
        if name:
            name_parts = name.split(' ', 1)
            user.first_name = name_parts[0]
            if len(name_parts) > 1:
                user.last_name = name_parts[1]
            user.save()
        
        login(request, user)
        logger.info(f"User {user.username} registered successfully")
        
        # Generate token
        token = f"{user.id}-{user.username}"
        
        return Response({
            'message': 'Registration successful',
            'token': token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'name': user.get_full_name() or user.username
            }
        }, status=status.HTTP_201_CREATED)
    
    except ValidationException as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    except RegistrationException as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    except DatabaseError as e:
        logger.error(f"Database error during registration: {str(e)}")
        return Response({'error': 'Failed to create user'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    except Exception as e:
        logger.exception(f"Unexpected error during registration: {str(e)}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def user_logout(request):
    try:
        username = request.user.username
        logout(request)
        logger.info(f"User {username} logged out successfully")
        return Response({'message': 'Logout successful'})
    
    except Exception as e:
        logger.exception(f"Error during logout: {str(e)}")
        return Response({'error': 'Logout failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard_summary(request):
    try:
        user = request.user
        logger.info(f"Fetching dashboard summary for user: {user.username}")

        products = Product.objects.filter(seller=user, status__in=['active', 'reserved'])

        totals = {
            'goat': {'count': 0, 'value': 0.0, 'feed': 0.0, 'water': 0.0},
            'chicken': {'count': 0, 'value': 0.0, 'feed': 0.0, 'water': 0.0},
            'buffalo': {'count': 0, 'value': 0.0, 'feed': 0.0, 'water': 0.0},
            'other': {'count': 0, 'value': 0.0, 'feed': 0.0, 'water': 0.0}
        }

        for p in products:
            cat = p.category.lower()
            qty = p.quantity
            # For batches (like chickens), the price might be per batch or per unit. 
            # In seed_dummy, base_price=1500 and qty=50. Usually we list total batch price as base_price. 
            # But let's assume current_price is per unit, so total is current_price * qty
            # Wait, in seed_dummy, it says: price=1500 (Batch A), qty=50.
            # If price is 1500 per batch, then value is 1500. 
            # Let's check how the UI calculates earlier: "Chickens (600 x NPR 400) = 240,000". So UI assumes price is per unit.
            # Let's assume current_price is per unit for the dashboard calculation.
            value = float(p.current_price) * qty
            
            # Map category to our expected keys
            if 'goat' in cat:
                target_cat = 'goat'
                feed_multiplier = 1.5
                water_multiplier = 4.0
            elif 'chicken' in cat or 'poultry' in cat:
                target_cat = 'chicken'
                feed_multiplier = 0.15
                water_multiplier = 0.3
            elif 'buffalo' in cat:
                target_cat = 'buffalo'
                feed_multiplier = 15.0
                water_multiplier = 45.0
            else:
                target_cat = 'other'
                feed_multiplier = 2.0
                water_multiplier = 5.0

            totals[target_cat]['count'] += qty
            totals[target_cat]['value'] += value
            totals[target_cat]['feed'] += (feed_multiplier * qty)
            totals[target_cat]['water'] += (water_multiplier * qty)

        total_value = sum(t['value'] for t in totals.values())

        # Build Chart Data Variants
        from dateutil.relativedelta import relativedelta
        import calendar

        now = timezone.now()
        chart_data_variants = {
            'week': [],
            'month': [],
            '6months': [],
            'year': []
        }

        def get_cumulative_val(end_date):
            return sum(
                float(p.current_price) * p.quantity 
                for p in products 
                if p.created_at <= end_date
            )

        # 1. Week (Last 7 days)
        for i in range(6, -1, -1):
            target_date = now - timedelta(days=i)
            end_of_day = target_date.replace(hour=23, minute=59, second=59)
            val = get_cumulative_val(end_of_day)
            chart_data_variants['week'].append({
                'name': target_date.strftime('%a'), # Mon, Tue
                'value': val
            })

        # 2. Month (Last 4 weeks roughly, or let's do 4 data points for a cleaner chart: week 1, 2, 3, 4 of the last 30 days)
        # Actually 1 point every 5 days for the last 30 days makes a good curve
        for i in range(5, -1, -1):
            target_date = now - timedelta(days=i*6)
            end_of_day = target_date.replace(hour=23, minute=59, second=59)
            val = get_cumulative_val(end_of_day)
            chart_data_variants['month'].append({
                'name': target_date.strftime('%b %d'), # Oct 15
                'value': val
            })

        # 3. 6 Months (Last 6 months)
        for i in range(5, -1, -1):
            target_date = now - relativedelta(months=i)
            end_of_target_month = target_date.replace(
                day=calendar.monthrange(target_date.year, target_date.month)[1],
                hour=23, minute=59, second=59
            )
            val = get_cumulative_val(end_of_target_month)
            chart_data_variants['6months'].append({
                'name': target_date.strftime('%b'), # Jan, Feb
                'value': val
            })

        # 4. Year (Last 12 months)
        for i in range(11, -1, -1):
            target_date = now - relativedelta(months=i)
            end_of_target_month = target_date.replace(
                day=calendar.monthrange(target_date.year, target_date.month)[1],
                hour=23, minute=59, second=59
            )
            val = get_cumulative_val(end_of_target_month)
            chart_data_variants['year'].append({
                'name': target_date.strftime('%b'), # Jan, Feb
                'value': val
            })

        return Response({
            'animals': {
                'goats': totals['goat']['count'],
                'chickens': totals['chicken']['count'],
                'buffalos': totals['buffalo']['count'],
                'others': totals['other']['count'],
                'total': sum(t['count'] for t in totals.values())
            },
            'financials': {
                'total_farm_value': total_value,
                'breakdown': {
                    'goats': totals['goat']['value'],
                    'chickens': totals['chicken']['value'],
                    'buffalos': totals['buffalo']['value'],
                    'others': totals['other']['value']
                }
            },
            'resources': {
                'feed': {
                    'goats': totals['goat']['feed'],
                    'chickens': totals['chicken']['feed'],
                    'buffalos': totals['buffalo']['feed']
                },
                'water': {
                    'goats': totals['goat']['water'],
                    'chickens': totals['chicken']['water'],
                    'buffalos': totals['buffalo']['water']
                }
            },
            'chart_data': chart_data_variants
        })

    except Exception as e:
        logger.exception(f"Error getting dashboard summary: {str(e)}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    try:
        user = request.user
        logger.info(f"Profile access/update for user: {user.username}")

        now = timezone.now()
        cooldown_period = timedelta(days=90)

        if request.method in ['PUT', 'PATCH']:
            name = request.data.get('name')
            if name is not None and name.strip() != user.get_full_name():
                # Check cooldown
                if user.last_name_change:
                    elapsed = now - user.last_name_change
                    if elapsed < cooldown_period:
                        remaining = cooldown_period - elapsed
                        return Response({
                            'error': 'Name change cooldown active',
                            'days_remaining': remaining.days
                        }, status=status.HTTP_400_BAD_REQUEST)

                # Update name
                name_parts = name.strip().split(' ', 1)
                user.first_name = name_parts[0]
                user.last_name = name_parts[1] if len(name_parts) > 1 else ''
                user.last_name_change = now
                user.save()
                logger.info(f"Profile updated for user: {user.username}")

        next_allowed = None
        if user.last_name_change:
            next_allowed = user.last_name_change + cooldown_period

        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'name': user.get_full_name() or user.username,
            'last_name_change': user.last_name_change,
            'next_allowed_change': next_allowed,
            'cooldown_days': 90
        })
    
    except Exception as e:
        logger.exception(f"Error in user_profile view: {str(e)}")
        return Response({'error': 'Failed to process profile request'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
