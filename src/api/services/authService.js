/**
 * Authentication API Service
 * Centralized API calls for authentication
 */

import axiosInstance from '../axios.js';
import { baseServiceConfig } from './baseService.js';

const SERVICE_NAME = 'authService';

export const authService = {
  /**
   * Login with Telegram initData
   * @param {string} initData - Telegram initData string
   * @param {AbortSignal} [signal] - Optional AbortSignal for request cancellation
   * @returns {Promise<Object>} Authentication response
   */
  loginWithTelegram: async (initData, signal) => {
    return baseServiceConfig.executeRequest(
      async (abortSignal) => {
        const config = baseServiceConfig.createRequestConfig(abortSignal, {
          headers: {
            Authorization: `Bearer ${initData}`
          }
        });

        const response = await axiosInstance.post(
          '/auth/login-telegram',
          {},
          config
        );

        if (response?.status === 200 || response?.status === 201) {
          return {
            initData,
            ...response.data
          };
        }

        throw new Error('Authentication failed');
      },
      SERVICE_NAME,
      'loginWithTelegram',
      { signal, logResponse: false } // Don't log auth responses for security
    );
  },
};

