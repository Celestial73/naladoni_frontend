/**
 * Centralized error handling utilities
 * Provides consistent error handling across the application
 */

/**
 * Extracts error message from various error formats
 * @param {Error|Object} error - Error object or response
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (!error) {
    return 'An unexpected error occurred';
  }

  // Axios error response with detailed message
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Axios error response with error field
  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  // Axios error response with detail field
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }

  // HTTP status code messages
  if (error.response?.status) {
    const statusMessages = {
      400: 'Invalid request. Please check your input.',
      401: 'Authentication required. Please log in again.',
      403: 'You do not have permission to perform this action.',
      404: 'The requested resource was not found.',
      500: 'Server error. Please try again later.',
      502: 'Service temporarily unavailable. Please try again later.',
      503: 'Service unavailable. Please try again later.',
    };
    if (statusMessages[error.response.status]) {
      return statusMessages[error.response.status];
    }
  }

  // Network error
  if (isNetworkError(error)) {
    return 'Network error. Please check your connection and try again.';
  }

  // Standard Error object
  if (error.message) {
    return error.message;
  }

  // String error
  if (typeof error === 'string') {
    return error;
  }

  // Fallback
  return 'An unexpected error occurred';
};

/**
 * Checks if error is an authentication error (401)
 * @param {Error|Object} error - Error object
 * @returns {boolean}
 */
export const isAuthError = (error) => {
  return error?.response?.status === 401;
};

/**
 * Checks if error is a forbidden error (403)
 * @param {Error|Object} error - Error object
 * @returns {boolean}
 */
export const isForbiddenError = (error) => {
  return error?.response?.status === 403;
};

/**
 * Checks if error is a network error
 * @param {Error|Object} error - Error object
 * @returns {boolean}
 */
export const isNetworkError = (error) => {
  return !error?.response && error?.request;
};

/**
 * Checks if error is a canceled request (AbortController cancellation)
 * Canceled requests are expected during navigation and should not be logged as errors
 * @param {Error|Object} error - Error object
 * @returns {boolean}
 */
export const isCanceledError = (error) => {
  if (!error) return false;
  
  // Axios canceled error codes (most reliable check)
  if (error.code === 'ERR_CANCELED' || error.code === 'ECONNABORTED') {
    return true;
  }
  
  // Error names
  if (error.name === 'AbortError' || error.name === 'CanceledError') {
    return true;
  }
  
  // Check if axios request was aborted (check signal before message)
  if (error.config?.signal?.aborted) {
    return true;
  }
  
  // Error message patterns (case-insensitive, partial match)
  const errorMessage = error.message?.toLowerCase() || '';
  if (errorMessage.includes('canceled') || 
      errorMessage.includes('cancelled') || 
      errorMessage.includes('aborted') ||
      errorMessage === 'canceled' ||
      errorMessage === 'cancelled') {
    return true;
  }
  
  // Check getErrorMessage result as fallback (in case error structure is transformed)
  const transformedMessage = getErrorMessage(error)?.toLowerCase() || '';
  if (transformedMessage.includes('canceled') || 
      transformedMessage.includes('cancelled') || 
      transformedMessage.includes('aborted')) {
    return true;
  }
  
  return false;
};

/**
 * Checks if error is a server error (5xx)
 * @param {Error|Object} error - Error object
 * @returns {boolean}
 */
export const isServerError = (error) => {
  const status = error?.response?.status;
  return status >= 500 && status < 600;
};

/**
 * Checks if error is a client error (4xx)
 * @param {Error|Object} error - Error object
 * @returns {boolean}
 */
export const isClientError = (error) => {
  const status = error?.response?.status;
  return status >= 400 && status < 500;
};

/**
 * Gets user-friendly error message based on error type
 * This is a convenience function that combines getErrorMessage with error type checking
 * @param {Error|Object} error - Error object
 * @returns {string} User-friendly error message
 */
export const getUserFriendlyErrorMessage = (error) => {
  if (isCanceledError(error)) {
    return null; // Canceled errors should not be shown to users
  }

  if (isNetworkError(error)) {
    return 'Network error. Please check your connection and try again.';
  }

  if (isAuthError(error)) {
    return 'Your session has expired. Please log in again.';
  }

  if (isForbiddenError(error)) {
    return 'You do not have permission to perform this action.';
  }

  return getErrorMessage(error);
};

/**
 * Handles error consistently - extracts message and optionally logs it
 * @param {Error|Object} error - Error object
 * @param {Object} options - Options for error handling
 * @param {boolean} options.log - Whether to log the error (default: true)
 * @param {Function} options.logger - Custom logger function
 * @returns {string} User-friendly error message
 */
export const handleError = (error, options = {}) => {
  const { log = true, logger = console.error } = options;

  if (isCanceledError(error)) {
    // Don't log or show canceled errors
    return null;
  }

  const message = getUserFriendlyErrorMessage(error);

  if (log && message) {
    logger('Error:', {
      message,
      error,
      status: error?.response?.status,
      url: error?.config?.url,
    });
  }

  return message;
};

