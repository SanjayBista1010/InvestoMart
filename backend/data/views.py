from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db import DatabaseError
from django.utils import timezone
from datetime import datetime, timedelta
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
from django.core.exceptions import ValidationError
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth

from collections import defaultdict
import uuid
from django.core.mail import send_mail
from django.conf import settings

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
        
        # Enforce KYC Trade Barrier
        if request.user.kyc_status != 'verified' and not request.user.is_superuser:
            logger.warning(f"Blocked product creation attempt for unverified user {request.user.id}")
            return Response(
                {'error': 'Forbidden', 'message': 'You must complete KYC verification before listing items.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        data['seller'] = request.user.id
        
        # Generate product_id if not present
        if 'product_id' not in data:
            data['product_id'] = f"PROD-{uuid.uuid4().hex[:8].upper()}"
            
        # Determine status (default pending for admin approval)
        if 'status' not in data or data['status'] == 'active':
            data['status'] = 'pending'
            
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_kyc(request):
    try:
        user = request.user
        logger.info(f"KYC submission attempt for user {user.id}")
        
        # Only allow submission if not already verified
        if user.kyc_status == 'verified':
            return Response({'error': 'KYC is already verified'}, status=status.HTTP_400_BAD_REQUEST)
            
        data = request.data
        
        # Validate required fields
        required_fields = [
            'citizenship_no', 'pan_no', 'temp_address', 'perm_address',
            'citizenship_front_url', 'citizenship_back_url', 'pan_url'
        ]
        
        missing = [f for f in required_fields if not data.get(f)]
        if missing:
            return Response({
                'error': 'Missing required KYC fields',
                'details': f"Please provide: {', '.join(missing)}"
            }, status=status.HTTP_400_BAD_REQUEST)
            
        # Update user profile
        user.citizenship_no = data['citizenship_no']
        user.pan_no = data['pan_no']
        user.temp_address = data['temp_address']
        user.perm_address = data['perm_address']
        user.citizenship_front_url = data['citizenship_front_url']
        user.citizenship_back_url = data['citizenship_back_url']
        user.pan_url = data['pan_url']
        
        user.kyc_status = 'pending'
        user.kyc_submitted_at = timezone.now()
        user.save()
        
        logger.info(f"KYC submitted successfully for user {user.id}")
        return Response({'message': 'KYC submitted successfully and is pending admin approval'})
        
    except Exception as e:
        logger.exception(f"Error submitting KYC for user {request.user.id}: {str(e)}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
                'avatar': picture,
                'kyc_status': user.kyc_status,
                'is_email_verified': user.is_email_verified
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
                    'kyc_status': user.kyc_status,
                    'is_email_verified': user.is_email_verified
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
        
        # Email Verification Token Generation
        token = str(uuid.uuid4())
        user.email_verification_token = token
        user.is_email_verified = False
        user.save()
        
        # Send Verification Email (to Backend Console)
        verification_url = f"http://localhost:5173/verify-email?token={token}"
        send_mail(
            subject='Verify your InvestoMart Account',
            message=f'Welcome {user.username}! Please verify your email by clicking: {verification_url}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        
        login(request, user)
        logger.info(f"User {user.username} registered successfully. Verification email sent.")
        
        # Generate token
        token = f"{user.id}-{user.username}"
        
        return Response({
            'message': 'Registration successful',
            'token': token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'name': user.get_full_name() or user.username,
                'kyc_status': user.kyc_status,
                'is_email_verified': user.is_email_verified
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
@permission_classes([AllowAny])
def verify_email(request):
    try:
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        user = User.objects.filter(email_verification_token=token).first()
        if not user:
            return Response({'error': 'Invalid or expired verification token'}, status=status.HTTP_400_BAD_REQUEST)
            
        user.is_email_verified = True
        user.email_verification_token = '' # Clear the token
        user.save()
        
        logger.info(f"User {user.username} successfully verified their email.")
        return Response({'message': 'Email verified successfully!'}, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.exception(f"Error resolving email verification: {str(e)}")
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
            'cooldown_days': 90,
            'kyc_status': user.kyc_status,
            'is_email_verified': user.is_email_verified,
            'is_superuser': user.is_superuser
        })
    
    except Exception as e:
        logger.exception(f"Error in user_profile view: {str(e)}")
        return Response({'error': 'Failed to process profile request'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def platform_analytics_summary(request):
    """
    Returns platform-wide e-commerce analytics for the admin/platform dashboard.
    Restricted to superusers/admins.
    """
    if not request.user.is_superuser and request.user.username != 'admin':
        return Response({'success': False, 'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

    try:
        from .mongodb_client import db
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        # 1. Total active listings
        active_products_count = db.products.count_documents({"status": {"$ne": "sold"}})
        active_livestock_count = db.livestock.count_documents({"status": "active"})
        
        # 2. Revenue and Orders (last 30 days)
        recent_txs = list(db.transactions.find({
            "status": "completed",
            "payment_date": {"$gte": thirty_days_ago}
        }))
        
        total_revenue = sum(float(tx.get('total_amount', 0)) for tx in recent_txs)
        total_orders = len(recent_txs)
        
        # Aggregate daily revenue
        daily_revenue_map = {}
        for i in range(30, -1, -1):
            d = (timezone.now() - timedelta(days=i)).strftime('%b %d')
            daily_revenue_map[d] = 0

        product_sales_freq = {}
        
        for tx in recent_txs:
            dt = tx.get('payment_date')
            if dt:
                day_str = dt.strftime('%b %d')
                if day_str in daily_revenue_map:
                    daily_revenue_map[day_str] += float(tx.get('total_amount', 0))
            
            # Aggregate product sales
            for item in tx.get('items', []):
                if item.get('item_type', 'product') == 'product':
                    item_id = item.get('item_id')
                    qty = int(item.get('quantity', 1))
                    product_sales_freq[item_id] = product_sales_freq.get(item_id, 0) + qty
                    
        daily_revenue_chart = [{'name': k, 'revenue': v} for k, v in daily_revenue_map.items()]
        
        # 3. Top Selling Commodities
        top_selling_commodities = []
        sorted_products = sorted(product_sales_freq.items(), key=lambda x: x[1], reverse=True)[:5]
        
        for p_id, count in sorted_products:
            prod = db.products.find_one({"$or": [{"product_id": p_id}, {"_id": p_id}]})
            title = prod.get('title') or prod.get('name') or "Unknown Product" if prod else "Unknown Product"
            top_selling_commodities.append({
                "id": str(p_id),
                "name": title,
                "sales": count
            })
            
        # 4. Most Popular Livestock (by views)
        popular_livestock = []
        popular_cursor = db.livestock.find({"status": "active"}).sort("views", -1).limit(5)
        
        for l in popular_cursor:
            title = f"{l.get('name') or l.get('breed', 'Unknown')} ({l.get('type', '').capitalize()})"
            popular_livestock.append({
                "id": l.get('animal_id', str(l.get('_id'))),
                "name": title,
                "views": l.get('views', 0)
            })

        return Response({
            'success': True,
            'data': {
                'total_revenue': total_revenue,
                'total_orders': total_orders,
                'active_listings': active_products_count + active_livestock_count,
                'daily_revenue': daily_revenue_chart,
                'top_commodities': top_selling_commodities,
                'popular_livestock': popular_livestock
            }
        })
    except Exception as e:
        logger.error(f"Platform Analytics Error: {str(e)}")
        return Response({'success': False, 'error': 'Failed to load platform analytics'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_notifications(request):
    """
    Fetch all notifications for the authenticated user from MongoDB.
    """
    try:
        from .mongodb_client import db
        user_id = str(getattr(request.user, 'user_id', request.user.id))
        
        # Fetch notifications sorted by newest first
        cursor = db.notifications.find({"user_id": user_id}).sort("created_at", -1).limit(50)
        
        notifications = []
        for notif in cursor:
            notifications.append({
                'id': str(notif.get('_id')),
                'message': notif.get('message'),
                'type': notif.get('type'),
                'is_read': notif.get('is_read', False),
                'created_at': notif.get('created_at'),
                'related_item_id': notif.get('related_item_id'),
                'transaction_id': notif.get('transaction_id')
            })
            
        return Response({'success': True, 'notifications': notifications})
    except Exception as e:
        logger.error(f"Failed to fetch notifications: {str(e)}")
        return Response({'success': False, 'error': str(e)}, status=500)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    """
    Mark a specific notification as read.
    """
    try:
        from .mongodb_client import db
        from bson.objectid import ObjectId
        
        user_id = str(getattr(request.user, 'user_id', request.user.id))
        
        result = db.notifications.update_one(
            {"_id": ObjectId(notification_id), "user_id": user_id},
            {"$set": {"is_read": True}}
        )
        
        if result.modified_count > 0:
            return Response({'success': True})
        return Response({'success': False, 'error': 'Notification not found or already read'}, status=404)
        
    except Exception as e:
        logger.error(f"Failed to mark notification as read: {str(e)}")
        return Response({'success': False, 'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def broadcast_notification(request):
    """
    Admin-only endpoint to explicitly broadcast a notification to all users on the platform.
    """
    if not (request.user.is_superuser or request.user.username == 'admin'):
        return Response({'success': False, 'error': 'Unauthorized'}, status=403)
        
    try:
        from .mongodb_client import db
        from django.contrib.auth import get_user_model
        
        User = get_user_model()
        message = request.data.get('message')
        notif_type = request.data.get('type', 'system')
        
        if not message:
            return Response({'success': False, 'error': 'Message is required'}, status=400)
            
        # Get all distinct user IDs from the SQL database
        all_user_ids = list(User.objects.values_list('id', flat=True))
        
        if not all_user_ids:
            return Response({'success': False, 'error': 'No users found'}, status=400)
            
        # Create a bulk list of notification documents
        timestamp = datetime.utcnow()
        notifications = []
        
        for uid in all_user_ids:
            notifications.append({
                "user_id": str(uid),
                "message": message,
                "type": notif_type,
                "is_read": False,
                "created_at": timestamp,
                "is_broadcast": True
            })
            
        # Bulk Insert
        if notifications:
            result = db.notifications.insert_many(notifications)
            return Response({
                'success': True, 
                'message': f'Broadcast sent to {len(result.inserted_ids)} users.',
                'notipients_count': len(result.inserted_ids)
            })
            
        return Response({'success': False, 'error': 'Failed to prepare broadcasts.'}, status=500)
        
    except Exception as e:
        logger.error(f"Broadcast Failed: {str(e)}")
        return Response({'success': False, 'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile_summary(request):
    """
    Returns aggregated portfolio value, holdings grouped by typing, and a history of transactions.
    """
    try:
        from .mongodb_client import db
        user = request.user
        user_id_str = str(getattr(user, 'user_id', user.id))
        
        # 1. Fetch User's Active Livestock Portfolio
        active_livestock = list(db.livestock.find({
            "owner": user.username,
            "status": "active"
        }))
        
        portfolio_value = 0
        holdings_map = {}
        
        for animal in active_livestock:
            current_val = float(animal.get('current_value', animal.get('purchase_price', 0)))
            portfolio_value += current_val
            
            # Group by type (e.g., Goats, Chickens, Buffalos)
            a_type = str(animal.get('type', 'Other')).capitalize()
            # Standardize plurals to match frontend expectations
            if not a_type.endswith('s'):
                if a_type == 'Buffalo': a_type = 'Buffalos'
                elif a_type != 'Other': a_type += 's'
                
            if a_type not in holdings_map:
                holdings_map[a_type] = {'count': 0, 'value': 0}
            
            holdings_map[a_type]['count'] += 1
            holdings_map[a_type]['value'] += current_val
            
        holdings = []
        for h_type, data in holdings_map.items():
            holdings.append({
                'type': h_type,
                'count': data['count'],
                'value': data['value']
            })
            
        # 2. Fetch User's Transaction History
        raw_transactions = list(db.transactions.find({
            "$or": [
                {"buyer_id": user_id_str},
                {"seller_id": user_id_str}
            ]
        }).sort("payment_date", -1).limit(50)) # Get latest 50
        
        transactions = []
        for idx, tx in enumerate(raw_transactions):
            is_seller = str(tx.get('seller_id')) == user_id_str
            t_type = 'Income' if is_seller else 'Expense'
            
            # Extract basic item info (assume one main item per transaction for display)
            items = tx.get('items', [])
            if not items: continue
            
            main_item = items[0]
            item_type = main_item.get('item_type', 'product')
            item_name = main_item.get('name', 'Unknown Item')
            
            # Determine icons based on string matching
            icon = '📦'
            icon_bg = 'bg-gray-100'
            animal_label = item_name
            
            if item_type == 'livestock':
                animal_lower = item_name.lower()
                if 'goat' in animal_lower: 
                    icon, icon_bg = '🐐', 'bg-orange-100'
                    animal_label = 'Goat'
                elif 'chicken' in animal_lower: 
                    icon, icon_bg = '🐔', 'bg-blue-100'
                    animal_label = 'Chicken'
                elif 'buffalo' in animal_lower: 
                    icon, icon_bg = '🐃', 'bg-pink-100'
                    animal_label = 'Buffalo'
                elif 'cow' in animal_lower: 
                    icon, icon_bg = '🐄', 'bg-purple-100'
                    animal_label = 'Cow'
                elif 'sheep' in animal_lower: 
                    icon, icon_bg = '🐑', 'bg-gray-200'
                    animal_label = 'Sheep'
            else:
                icon_bg = 'bg-green-100'
                
            # Date formatting (e.g. Sep 9, 2024, 04:30pm)
            date_obj = tx.get('payment_date')
            formatted_date = date_obj.strftime("%b %d, %Y, %I:%M%p").lower() if isinstance(date_obj, datetime) else str(date_obj)
            
            transactions.append({
                'id': str(tx.get('_id')) or str(idx),
                'date': formatted_date,
                'type': t_type,
                'animal': animal_label,
                'icon': icon,
                'iconBg': icon_bg,
                'qty': main_item.get('quantity', 1),
                'price': float(tx.get('total_amount', main_item.get('price', 0))),
                'status': str(tx.get('status', 'Completed')).capitalize()
            })
            
        return Response({
            'success': True,
            'portfolio_value': portfolio_value,
            'holdings': holdings,
            'transactions': transactions
        })
        
    except Exception as e:
        logger.error(f"Profile API Error: {str(e)}")
        return Response({'success': False, 'error': 'Failed to load profile summary'}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pending_approvals(request):
    """
    Fetch all pending KYC applications and pending product/livestock listings for Admin.
    """
    if not (request.user.is_superuser or request.user.username == 'admin'):
        return Response({'error': 'Unauthorized. Admin access required.'}, status=403)
        
    try:
        from .mongodb_client import db
        
        # 1. Pending KYC Users (SQLite mapped via PyMongo or just query Django models)
        # Assuming KYC status is stored in the Django User model (data.User)
        pending_kyc_users = list(User.objects.filter(kyc_status='pending').values(
            'id', 'username', 'email', 'first_name', 'last_name', 'phone', 'created_at'
        ))
        
        kyc_approvals = [{
            'id': u['id'],
            'type': 'kyc',
            'title': f"KYC: {u['first_name']} {u['last_name']} ({u['username']})",
            'subtitle': f"Email: {u['email']} | Phone: {u['phone']}",
            'date': u['created_at'].strftime("%b %d, %Y") if u['created_at'] else 'Unknown'
        } for u in pending_kyc_users]
        
        # 2. Pending Products (PyMongo)
        raw_products = list(db.products.find({"status": "pending"}).sort("created_at", -1))
        product_approvals = [{
            'id': p.get('product_id', str(p.get('_id'))),
            'type': 'product',
            'title': f"Listing: {p.get('title')}",
            'subtitle': f"Category: {p.get('category')} | Price: {p.get('current_price')} {p.get('currency', 'USD')}",
            'seller_id': p.get('seller_id'),
            'date': p.get('created_at').strftime("%b %d, %Y") if isinstance(p.get('created_at'), datetime) else str(p.get('created_at', 'Unknown'))
        } for p in raw_products]
        
        return Response({
            'success': True,
            'approvals': kyc_approvals + product_approvals
        })
        
    except Exception as e:
        logger.error(f"Error fetching pending approvals: {str(e)}")
        return Response({'success': False, 'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_approval_action(request):
    """
    Handle Approve/Reject actions for KYC and Items.
    Payload: {"type": "kyc"|"product", "id": "...", "action": "approve"|"reject"}
    """
    if not (request.user.is_superuser or request.user.username == 'admin'):
        return Response({'error': 'Unauthorized. Admin access required.'}, status=403)
        
    try:
        item_type = request.data.get('type')
        item_id = request.data.get('id')
        action = request.data.get('action') # 'approve' or 'reject'
        
        if not all([item_type, item_id, action]):
            return Response({'error': 'Missing required fields'}, status=400)
            
        from .mongodb_client import db
        
        if item_type == 'kyc':
            user = User.objects.get(id=item_id)
            user.kyc_status = 'verified' if action == 'approve' else 'rejected'
            user.save()
            
        elif item_type == 'product':
            new_status = 'active' if action == 'approve' else 'rejected'
            db.products.update_one(
                {"product_id": item_id},
                {"$set": {"status": new_status, "updated_at": datetime.now()}}
            )
            
            # Optional: if it rejected, we might want to notify the seller
            # We already have a Notification model logic we could trigger here
            
        return Response({
            'success': True, 
            'message': f"{item_type.upper()} {item_id} successfully {action}d."
        })
        
    except User.DoesNotExist:
        return Response({'success': False, 'error': 'User not found for KYC'}, status=404)
    except Exception as e:
        logger.error(f"Error processing approval: {str(e)}")
        return Response({'success': False, 'error': str(e)}, status=500)

