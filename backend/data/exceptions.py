"""
Custom exceptions for the investment platform
"""

class InvestmentException(Exception):
    """Base exception for investment-related errors"""
    def __init__(self, message, code=None):
        self.message = message
        self.code = code
        super().__init__(self.message)


class AuthenticationException(InvestmentException):
    """Raised when authentication fails"""
    pass


class RegistrationException(InvestmentException):
    """Raised when user registration fails"""
    pass


class DataNotFoundException(InvestmentException):
    """Raised when requested data is not found"""
    pass


class ValidationException(InvestmentException):
    """Raised when data validation fails"""
    pass


class DatabaseException(InvestmentException):
    """Raised when database operations fail"""
    pass
