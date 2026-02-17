/**
 * Base API Service Utility
 * Provides common functionality for all API services
 * Standardizes error handling, logging, and request cancellation
 */

import { getErrorMessage, isCanceledError } from '../../utils/errorHandler.js';
import { logger } from '../../utils/logger.js';

/**
 * Base service configuration
 */
export const baseServiceConfig = {
  /**
   * Wraps an API call with standardized error handling and logging
   * @param {Function} apiCall - The API call function to execute
   * @param {string} serviceName - Name of the service (for logging)
   * @param {string} operationName - Name of the operation (for logging)
   * @param {Object} options - Additional options
   * @param {AbortSignal} [options.signal] - Optional AbortSignal for request cancellation
   * @param {Function} [options.onError] - Custom error handler
   * @returns {Promise<any>} The API response
   */
  executeRequest: async (apiCall, serviceName, operationName, options = {}) => {
    const { signal, onError, logResponse = true } = options;

    try {
      const result = await apiCall(signal);
      
      if (logResponse) {
        logger.debug(`${serviceName}.${operationName} - Success:`, result);
      }
      
      return result;
    } catch (error) {
      // Don't log canceled requests as errors
      if (isCanceledError(error)) {
        throw error; // Re-throw abort errors without logging
      }

      // Use custom error handler if provided
      if (onError) {
        return onError(error);
      }

      // Standard error handling
      logger.error(`${serviceName}.${operationName} - Error:`, error);
      
      // Re-throw the original error to preserve all properties (response, status, code, etc.)
      // This allows callers to access the full error structure
      throw error;
    }
  },

  /**
   * Creates a request config object with signal support
   * @param {AbortSignal} [signal] - Optional AbortSignal
   * @param {Object} [additionalConfig] - Additional axios config
   * @returns {Object} Axios request config
   */
  createRequestConfig: (signal, additionalConfig = {}) => {
    return {
      ...(signal && { signal }),
      ...additionalConfig
    };
  },

  /**
   * Removes undefined values from an object (useful for API payloads)
   * @param {Object} obj - Object to clean
   * @returns {Object} Cleaned object
   */
  removeUndefined: (obj) => {
    const cleaned = { ...obj };
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === undefined) {
        delete cleaned[key];
      }
    });
    return cleaned;
  }
};

/**
 * Service decorator for consistent error handling
 * Can be used to wrap service methods if needed
 */
export const withErrorHandling = (serviceMethod, serviceName, methodName) => {
  return async (...args) => {
    try {
      return await serviceMethod(...args);
    } catch (error) {
      if (isCanceledError(error)) {
        throw error;
      }
      logger.error(`${serviceName}.${methodName} - Error:`, error);
      throw new Error(getErrorMessage(error));
    }
  };
};

