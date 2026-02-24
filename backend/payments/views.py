from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from pymongo import MongoClient
import os
import uuid
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client['goatfarm']

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_payment(request):
    """
    Processes a payment for a (potentially multi-item) cart.
    Accepts either a single item_id or an array of items.
    """
    try:
        data = request.data
        amount = float(data.get('amount', 0))
        payment_method = data.get('payment_method', 'esewa')
        items = data.get('items', [])

        # Support legacy single-item calls too
        if not items and data.get('item_id'):
            items = [{
                'item_id': data.get('item_id'),
                'item_type': data.get('item_type', 'product'),
                'quantity': 1,
                'unit_price': amount
            }]

        if not items or amount <= 0:
            return Response({'error': 'Invalid request: no items or zero amount'}, status=400)

        # Validate stock and availability
        for item in items:
            item_id = item.get('item_id')
            item_type = item.get('item_type', 'product')
            qty = int(item.get('quantity', 1))
            
            if item_type == 'product':
                product = db.products.find_one({"$or": [{"product_id": item_id}, {"_id": item_id}]})
                if not product or product.get('status') == 'sold':
                    return Response({'error': f"Product {item_id} is unavailable."}, status=400)
                available = int(product.get('quantity', 1))
                if qty > available:
                    return Response({'error': f"Only {available} items available for Product {item_id}."}, status=400)
            elif item_type == 'livestock':
                animal = db.livestock.find_one({"$or": [{"animal_id": item_id}, {"_id": item_id}]})
                if not animal or animal.get('status') != 'active':
                    return Response({'error': f"Livestock {item_id} is unavailable."}, status=400)
                if qty > 1:
                    return Response({'error': f"Only 1 livestock available for {item_id}."}, status=400)

        transaction_id = f"TRX-{uuid.uuid4().hex[:8].upper()}"

        transaction = {
            'transaction_id': transaction_id,
            'type': 'purchase',
            'status': 'completed',
            'buyer_id': getattr(request.user, 'user_id', str(request.user.id)),
            'items': items,
            'item_count': len(items),
            'subtotal': amount,
            'total_amount': amount,
            'currency': 'NPR',
            'payment_method': payment_method,
            'payment_date': datetime.utcnow(),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }

        db.transactions.insert_one(transaction)

        # Update stock and notify
        for item in items:
            item_id = item.get('item_id')
            item_type = item.get('item_type', 'product')
            qty = int(item.get('quantity', 1))
            
            seller_id = None
            item_name = "Item"
            
            if item_type == 'product':
                product = db.products.find_one({"$or": [{"product_id": item_id}, {"_id": item_id}]})
                if product:
                    seller_id = product.get('seller_id') or product.get('seller')
                    item_name = product.get('title') or product.get('name') or "Product"
                
                db.products.update_one(
                    {"$or": [{"product_id": item_id}, {"_id": item_id}]},
                    {"$inc": {"quantity": -qty}}
                )
                db.products.update_one(
                    {"$or": [{"product_id": item_id}, {"_id": item_id}], "quantity": {"$lte": 0}},
                    {"$set": {"status": "sold"}}
                )
            elif item_type == 'livestock':
                animal = db.livestock.find_one({"$or": [{"animal_id": item_id}, {"_id": item_id}]})
                if animal:
                    seller_id = animal.get('owner_id') or animal.get('seller_id') or animal.get('seller')
                    item_name = animal.get('name') or animal.get('breed') or "Livestock"
                
                db.livestock.update_one(
                    {"$or": [{"animal_id": item_id}, {"_id": item_id}]},
                    {"$set": {"status": "sold"}}
                )

            # Notify seller
            buyer_uid = str(getattr(request.user, 'user_id', request.user.id))
            if seller_id and str(seller_id) != buyer_uid:
                db.notifications.insert_one({
                    "user_id": str(seller_id),
                    "message": f"Your {item_type} '{item_name}' was just purchased!",
                    "type": "sold",
                    "related_item_id": str(item_id),
                    "is_read": False,
                    "created_at": datetime.utcnow()
                })

        # Notify buyer
        buyer_id = str(getattr(request.user, 'user_id', request.user.id))
        db.notifications.insert_one({
            "user_id": buyer_id,
            "message": f"Successfully purchased {len(items)} items for Rs. {amount}.",
            "type": "purchase",
            "transaction_id": transaction_id,
            "is_read": False,
            "created_at": datetime.utcnow()
        })

        return Response({
            'message': 'Payment processed successfully',
            'transaction_id': transaction_id,
            'status': 'success'
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)

