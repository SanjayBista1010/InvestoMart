from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import Q
from .models import Product, Livestock
from .serializers import ProductSerializer, LivestockSerializer # Assuming these exist

@api_view(['GET'])
@permission_classes([AllowAny])
def global_search(request):
    query = request.query_params.get('q', '')
    if not query or len(query) < 2:
        return Response({'results': []})

    # Search Products
    products = Product.objects.filter(
        Q(title__icontains=query) | 
        Q(description__icontains=query) | 
        Q(category__icontains=query)
    ).filter(status='active')[:10]

    # Search Livestock
    livestock = Livestock.objects.filter(
        Q(breed__icontains=query) | 
        Q(name__icontains=query) | 
        Q(type__icontains=query)
    ).filter(status='active')[:10]

    results = []

    for p in products:
        results.append({
            'id': p.product_id,
            'type': 'product',
            'title': p.title,
            'description': p.description[:100] + '...',
            'price': float(p.current_price),
            'image_url': p.image_url,
            'category': p.category,
            'url': f'/product/{p.product_id}'
        })

    for l in livestock:
        results.append({
            'id': l.animal_id,
            'type': 'livestock',
            'title': f"{l.name or l.breed} ({l.type.capitalize()})",
            'description': f"Breed: {l.breed}, Age: {l.birth_date}",
            'price': float(l.current_value),
            'image_url': '', # Background logic can fetch if needed
            'category': l.type,
            'url': f'/livestock/{l.animal_id}'
        })

    return Response({'results': results})
