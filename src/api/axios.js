import axios from 'axios';
import { logger } from '../utils/logger.js';
import { getErrorMessage, isAuthError, isForbiddenError, isCanceledError } from '../utils/errorHandler.js';

// Use environment variable - required in all environments
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
    throw new Error('VITE_API_BASE_URL environment variable is required');
}

const axiosInstance = axios.create({
    baseURL: `${BASE_URL}/v1`
});

export const axiosPrivate = axios.create({
    baseURL: `${BASE_URL}/v1`,
    headers: { 'Content-Type': 'application/json' }
});

// Store auth getter function for private interceptors
let getAuthState = null;

/**
 * Setup request interceptors for public axios instance
 * Only registers once (singleton pattern)
 */
let publicInterceptorsSetup = false;
export const setupPublicInterceptors = () => {
    if (publicInterceptorsSetup) {
        return;
    }

    // Request interceptor
    axiosInstance.interceptors.request.use(
        config => {
            // Add ngrok-skip-browser-warning header to bypass ngrok warning page
            if (!config.headers['ngrok-skip-browser-warning']) {
                config.headers['ngrok-skip-browser-warning'] = 'true';
            }
            
            logger.info('Public API Request:', {
                url: config.url,
                method: config.method?.toUpperCase(),
                baseURL: config.baseURL
            });
            
            return config;
        },
        (error) => {
            logger.error('Public API Request Error:', error);
            return Promise.reject(error);
        }
    );

    // Response interceptor for error handling
    axiosInstance.interceptors.response.use(
        (response) => {
            logger.info('Public API Response:', {
                url: response.config.url,
                method: response.config.method?.toUpperCase(),
                status: response.status
            });
            return response;
        },
        (error) => {
            // Log canceled requests (abort errors) for visibility
            if (isCanceledError(error)) {
                console.log('🚫 Public API Request Aborted:', {
                    url: error.config?.url,
                    method: error.config?.method?.toUpperCase(),
                    reason: 'Request aborted (likely due to navigation)'
                });
                logger.debug('Public API Request Canceled:', {
                    url: error.config?.url,
                    method: error.config?.method?.toUpperCase(),
                    reason: 'Request aborted (likely due to navigation)'
                });
                return Promise.reject(error);
            }
            
            logger.error('Public API Response Error:', getErrorMessage(error));
            
            if (isAuthError(error)) {
                // Handle 401 - could redirect to login
                logger.warn('Authentication error - user may need to re-authenticate');
            }
            
            return Promise.reject(error);
        }
    );

    publicInterceptorsSetup = true;
};

/**
 * Setup request and response interceptors for private axios instance
 * Only registers once (singleton pattern)
 * @param {Function} getAuth - Function to get current auth state
 */
let privateInterceptorsSetup = false;
export const setupPrivateInterceptors = (getAuth) => {
    // Store the auth getter function
    if (getAuth) {
        getAuthState = getAuth;
    }

    if (privateInterceptorsSetup) {
        return;
    }

    // Request interceptor
    axiosPrivate.interceptors.request.use(
        config => {
            // Get latest auth state dynamically
            const auth = getAuthState?.();
            
            // Add initData to Authorization header if available
            if (auth?.initData && !config.headers['Authorization']) {
                config.headers['Authorization'] = `Bearer ${auth.initData}`;
            }
            
            // Add ngrok-skip-browser-warning header to bypass ngrok warning page
            if (!config.headers['ngrok-skip-browser-warning']) {
                config.headers['ngrok-skip-browser-warning'] = 'true';
            }
            
            logger.info('Private API Request:', {
                url: config.url,
                method: config.method?.toUpperCase(),
                baseURL: config.baseURL
            });
            
            return config;
        },
        (error) => {
            logger.error('Private API Request Error:', error);
            return Promise.reject(error);
        }
    );

    // Response interceptor for error handling
    axiosPrivate.interceptors.response.use(
        (response) => {
            logger.info('Private API Response:', {
                url: response.config.url,
                method: response.config.method?.toUpperCase(),
                status: response.status
            });
            return response;
        },
        (error) => {
            // Log canceled requests (abort errors) for visibility
            if (isCanceledError(error)) {
                console.log('🚫 Private API Request Aborted:', {
                    url: error.config?.url,
                    method: error.config?.method?.toUpperCase(),
                    reason: 'Request aborted (likely due to navigation)'
                });
                logger.debug('Private API Request Canceled:', {
                    url: error.config?.url,
                    method: error.config?.method?.toUpperCase(),
                    reason: 'Request aborted (likely due to navigation)'
                });
                return Promise.reject(error);
            }
            
            logger.error('Private API Response Error:', getErrorMessage(error));
            
            if (isAuthError(error)) {
                // Handle 401 - clear auth and potentially redirect
                logger.warn('Authentication error - clearing auth state');
                // Could dispatch logout action here
            }
            
            if (isForbiddenError(error)) {
                logger.warn('Forbidden error - user does not have permission');
            }
            
            return Promise.reject(error);
        }
    );

    privateInterceptorsSetup = true;
};

// Initialize public interceptors immediately
setupPublicInterceptors();

export default axiosInstance;