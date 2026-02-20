"""
Custom middleware for exception handling and logging
"""
import logging
import traceback
from django.http import JsonResponse
from .exceptions import InvestmentException

logger = logging.getLogger(__name__)


class ExceptionHandlingMiddleware:
    """Middleware to handle exceptions globally"""
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_exception(self, request, exception):
        """Handle exceptions and return appropriate JSON responses"""
        
        # Log the exception
        logger.error(
            f"Exception occurred: {type(exception).__name__}",
            extra={
                'path': request.path,
                'method': request.method,
                'user': request.user.username if request.user.is_authenticated else 'Anonymous',
                'exception': str(exception),
                'traceback': traceback.format_exc()
            }
        )

        # Handle custom exceptions
        if isinstance(exception, InvestmentException):
            return JsonResponse({
                'error': exception.message,
                'code': exception.code or 'INVESTMENT_ERROR'
            }, status=400)

        # Handle generic exceptions
        return JsonResponse({
            'error': 'An unexpected error occurred',
            'code': 'INTERNAL_ERROR'
        }, status=500)


class RequestLoggingMiddleware:
    """Middleware to log all incoming requests"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.logger = logging.getLogger('request_logger')

    def __call__(self, request):
        # Log request
        self.logger.info(
            f"Request: {request.method} {request.path}",
            extra={
                'method': request.method,
                'path': request.path,
                'user': request.user.username if request.user.is_authenticated else 'Anonymous',
                'ip': self.get_client_ip(request)
            }
        )

        response = self.get_response(request)

        # Log response
        self.logger.info(
            f"Response: {response.status_code}",
            extra={
                'status_code': response.status_code,
                'path': request.path
            }
        )

        return response

    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
