import cloudinary
import cloudinary.uploader
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

@api_view(['POST'])
@permission_classes([AllowAny]) # Review: Should be IsAuthenticated in production
def upload_image(request):
    """
    Upload an image to Cloudinary and return the URL.
    Expects 'file' in request.FILES.
    """
    if 'file' not in request.FILES:
        return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

    file_obj = request.FILES['file']
    
    try:
        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(file_obj)
        
        # Get secure URL
        image_url = upload_result.get('secure_url')
        public_id = upload_result.get('public_id')
        
        return Response({
            'message': 'Image uploaded successfully',
            'url': image_url,
            'public_id': public_id
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Cloudinary upload failed: {str(e)}")
        return Response({'error': 'Image upload failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
