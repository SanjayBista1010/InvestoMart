from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

# Connect to MongoDB via PyMongo
MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client['goatfarm']

@api_view(['GET'])
@permission_classes([AllowAny])
def global_search(request):
    """
    Modular global search endpoint using PyMongo.
    Natively supports searching deeply nested and dynamic schema objects.
    """
    query = request.query_params.get('q', '').strip()
    if not query or len(query) < 2:
        return Response({'results': []})

    # Case-insensitive regex pattern
    regex_pattern = {"$regex": query, "$options": "i"}

    # Search Products
    # Matches title, description, or category where status is active
    products_cursor = db.products.find({
        "$or": [
            {"title": regex_pattern},
            {"description": regex_pattern},
            {"category": regex_pattern},
            {"name": regex_pattern}
        ],
        "status": {"$ne": "sold"} # exclude sold if needed, or active
    }).limit(10)

    # Search Livestock
    # Matches breed, name, or type
    livestock_cursor = db.livestock.find({
        "$or": [
            {"breed": regex_pattern},
            {"name": regex_pattern},
            {"type": regex_pattern}
        ],
        "status": "active"
    }).limit(10)

    results = []

    for p in products_cursor:
        results.append({
            'id': p.get('product_id', str(p.get('_id'))),
            'type': 'product',
            'title': p.get('title') or p.get('name', 'Unknown Product'),
            'description': p.get('description', '')[:100] + '...',
            'price': float(p.get('current_price', p.get('base_price', 0))),
            'available_quantity': p.get('quantity', 1),
            'image_url': p.get('image_url', ''),
            'category': p.get('category', ''),
            'url': f"/product/{p.get('product_id', '')}"
        })

    for l in livestock_cursor:
        results.append({
            'id': l.get('animal_id', str(l.get('_id'))),
            'type': 'livestock',
            'title': f"{l.get('name') or l.get('breed', 'Unknown')} ({l.get('type', '').capitalize()})",
            'description': f"Breed: {l.get('breed', '')}, Age: {l.get('age_months', 0)} months",
            'price': float(l.get('current_value', l.get('purchase_price', 0))),
            'available_quantity': 1,
            'image_url': '', # Could fetch from related product if needed
            'category': l.get('type', ''),
            'url': f"/livestock/{l.get('animal_id', '')}"
        })

    return Response({'results': results})

@api_view(['GET'])
@permission_classes([AllowAny])
def get_product_by_id(request, product_id):
    """Fetch a single product by its product_id using PyMongo"""
    try:
        p = db.products.find_one({"product_id": product_id})
        if not p:
            return Response({'error': 'Product not found'}, status=404)
            
        # Optional: Fetch related livestock info if available
        related_animal = None
        if p.get('animal_id'):
            related_animal = db.livestock.find_one({"animal_id": p.get('animal_id')})

        result = {
            'id': p.get('product_id', str(p.get('_id'))),
            'type': 'product',
            'title': p.get('title') or p.get('name', 'Unknown Product'),
            'description': p.get('description', ''),
            'price': float(p.get('current_price', p.get('base_price', 0))),
            'available_quantity': p.get('quantity', 1),
            'image_url': p.get('image_url', ''),
            'category': p.get('category', ''),
            'status': p.get('status', 'active'),
            'location': p.get('location', ''),
            'tags': p.get('tags', ''),
            'base_price': float(p.get('base_price', 0)),
            'roi_estimate': p.get('roi_estimate'),
            'risk_level': p.get('risk_level'),
            'seller_id': p.get('seller_id'),
            'created_at': p.get('created_at'),
            'farm_id': p.get('farm_id', ''),
            # Include related animal data if found
            'animal_details': None
        }
        
        if related_animal:
            result['animal_details'] = {
                'breed': related_animal.get('breed'),
                'age_months': related_animal.get('age_months'),
                'weight': related_animal.get('current_weight'),
                'health_status': related_animal.get('health_status'),
                'gender': related_animal.get('gender')
            }
            
        return Response(result)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_livestock_by_id(request, animal_id):
    """Fetch a single livestock record by its animal_id using PyMongo"""
    try:
        l = db.livestock.find_one({"animal_id": animal_id})
        if not l:
            return Response({'error': 'Livestock not found'}, status=404)
            
        result = {
            'id': l.get('animal_id', str(l.get('_id'))),
            'type': 'livestock',
            'title': f"{l.get('name') or l.get('breed', 'Unknown')} ({l.get('type', '').capitalize()})",
            'description': f"Breed: {l.get('breed', '')}, Age: {l.get('age_months', 0)} months",
            'price': float(l.get('current_value', l.get('purchase_price', 0))),
            'available_quantity': 1,
            'image_url': '', # Background logic can fetch if needed
            'category': l.get('type', ''),
            'breed': l.get('breed'),
            'status': l.get('status', 'active'),
            'location': l.get('location', ''),
            'age_months': l.get('age_months'),
            'weight': l.get('current_weight'),
            'health_status': l.get('health_status'),
            'gender': l.get('gender'),
            'tag_number': l.get('tag_number'),
            'farm_id': l.get('farm_id'),
            'owner_id': l.get('owner_id'),
            'purchase_date': l.get('purchase_date')
        }
        return Response(result)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def explore_livestock(request):
    """
    Fetch livestock and products for the Buy Stocks page.
    Supports optional ?category= filter (e.g. 'goat', 'chicken', 'buffalo').
    """
    category_filter = request.query_params.get('category', '').strip().lower()
    
    results = []

    # Query setup
    product_query = {"status": {"$ne": "sold"}}
    livestock_query = {"status": "active"}

    if category_filter and category_filter != 'all':
        # Apply regex filter to categories/types
        regex = {"$regex": f"^{category_filter}$", "$options": "i"}
        product_query["category"] = regex
        livestock_query["type"] = regex

    try:
        # Fetch matching active products
        products_cursor = db.products.find(product_query).limit(50)
        for p in products_cursor:
            results.append({
                'id': p.get('product_id', str(p.get('_id'))),
                'type': 'product',
                'title': p.get('title') or p.get('name', 'Unknown Product'),
                'description': p.get('description', '')[:100] + '...',
                'price': float(p.get('current_price', p.get('base_price', 0))),
                'available_quantity': p.get('quantity', 1),
                'image_url': p.get('image_url', ''),
                'category': p.get('category', ''),
                # Map properties for generic ProductCard usage
                'animalType': p.get('category', '').capitalize(),
                'age': 'N/A',
                'weight': 'N/A',
                'health': 'N/A',
                'use': 'Product/Asset',
                'url': f"/product/{p.get('product_id', '')}"
            })

        # Fetch matching active livestock
        livestock_cursor = db.livestock.find(livestock_query).limit(50)
        for l in livestock_cursor:
            results.append({
                'id': l.get('animal_id', str(l.get('_id'))),
                'type': 'livestock',
                'title': f"{l.get('name') or l.get('breed', 'Unknown')} ({l.get('type', '').capitalize()})",
                'description': f"Breed: {l.get('breed', '')}",
                'price': float(l.get('current_value', l.get('purchase_price', 0))),
                'available_quantity': 1,
                'image_url': '',
                'category': l.get('type', ''),
                # Farm specific stats for the grid card
                'animalType': l.get('type', '').capitalize(),
                'age': f"{l.get('age_months', 0)} Months",
                'weight': f"{l.get('current_weight', 0)} kg",
                'health': l.get('health_status', 'Unknown').capitalize(),
                'use': 'Farming/Breeding',
                'url': f"/livestock/{l.get('animal_id', '')}"
            })
            
        return Response({'results': results})
    except Exception as e:
        return Response({'error': str(e)}, status=500)
