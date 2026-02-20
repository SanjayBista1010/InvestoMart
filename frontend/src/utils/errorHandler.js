/**
 * Frontend error handling utilities
 */
import logger from './logger';

/**
 * Custom error classes
 */
export class APIError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
  }
}

export class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends Error {
  constructor(message, fields = {}) {
    super(message);
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

export class NetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * Global error handler
 */
export const handleError = (error, context = 'Unknown') => {
  logger.error(`Error in ${context}`, error, {
    context,
    type: error.name,
  });

  // Return user-friendly error message
  if (error instanceof APIError) {
    return {
      message: error.message,
      type: 'api',
      status: error.status,
    };
  }

  if (error instanceof AuthenticationError) {
    return {
      message: 'Authentication failed. Please login again.',
      type: 'auth',
    };
  }

  if (error instanceof ValidationError) {
    return {
      message: error.message,
      type: 'validation',
      fields: error.fields,
    };
  }

  if (error instanceof NetworkError) {
    return {
      message: 'Network error. Please check your connection.',
      type: 'network',
    };
  }

  // Generic error
  return {
    message: 'An unexpected error occurred. Please try again.',
    type: 'unknown',
  };
};

/**
 * Axios error handler
 */
export const handleAxiosError = (error, context = 'API Call') => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    logger.error(`API Error in ${context}`, error, {
      status,
      data,
      url: error.config?.url,
    });

    if (status === 401) {
      throw new AuthenticationError(data.error || 'Unauthorized');
    }

    if (status === 400) {
      throw new ValidationError(data.error || 'Validation failed', data.fields);
    }

    throw new APIError(
      data.error || 'Server error',
      status,
      data.code
    );
  } else if (error.request) {
    // Request made but no response
    logger.error(`Network Error in ${context}`, error);
    throw new NetworkError('No response from server');
  } else {
    // Error in request setup
    logger.error(`Request Error in ${context}`, error);
    throw new Error(error.message);
  }
};

/**
 * React Error Boundary error handler
 */
export const handleComponentError = (error, errorInfo) => {
  logger.error('Component Error', error, {
    componentStack: errorInfo.componentStack,
  });
};
