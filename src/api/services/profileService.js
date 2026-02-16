/**
 * Profile API Service
 * Centralized API calls for user profiles
 */

import { axiosPrivate } from '../axios.js';
import { baseServiceConfig } from './baseService.js';

const SERVICE_NAME = 'profileService';

export const profileService = {
  /**
   * Get current user's profile
   * @param {AbortSignal} [signal] - Optional AbortSignal for request cancellation
   * @returns {Promise<Object>} Profile data
   */
  getMyProfile: async (signal) => {
    return baseServiceConfig.executeRequest(
      async (abortSignal) => {
        const config = baseServiceConfig.createRequestConfig(abortSignal);
        const response = await axiosPrivate.get('/profiles/me', config);
        return response.data;
      },
      SERVICE_NAME,
      'getMyProfile',
      { signal }
    );
  },

  /**
   * Update current user's profile
   * @param {Object} profileData - Profile data to update
   * @param {AbortSignal} [signal] - Optional AbortSignal for request cancellation
   * @returns {Promise<Object>} Updated profile data
   */
  updateProfile: async (profileData, signal) => {
    return baseServiceConfig.executeRequest(
      async (abortSignal) => {
        const config = baseServiceConfig.createRequestConfig(abortSignal);
        const cleanedData = baseServiceConfig.removeUndefined(profileData);
        const response = await axiosPrivate.patch('/profiles/me', cleanedData, config);
        return response.data;
      },
      SERVICE_NAME,
      'updateProfile',
      { signal }
    );
  },

  /**
   * Upload images to profile
   * @param {File[]} files - Array of File objects to upload (max 3)
   * @param {AbortSignal} [signal] - Optional AbortSignal for request cancellation
   * @returns {Promise<Object>} Updated profile data with images array
   */
  uploadImages: async (files, signal) => {
    return baseServiceConfig.executeRequest(
      async (abortSignal) => {
        const formData = new FormData();
        
        // Add each file to FormData with field name 'images'
        files.forEach((file) => {
          formData.append('images', file);
        });

        const config = baseServiceConfig.createRequestConfig(abortSignal, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const response = await axiosPrivate.post('/profiles/me/images', formData, config);
        return response.data;
      },
      SERVICE_NAME,
      'uploadImages',
      { signal }
    );
  },

  /**
   * Delete images from profile
   * @param {string[]} imageUrls - Array of image URLs to delete
   * @param {AbortSignal} [signal] - Optional AbortSignal for request cancellation
   * @returns {Promise<Object>} Updated profile data with images array
   */
  deleteImages: async (imageUrls, signal) => {
    return baseServiceConfig.executeRequest(
      async (abortSignal) => {
        const config = baseServiceConfig.createRequestConfig(abortSignal);
        const response = await axiosPrivate.delete('/profiles/me/images', {
          ...config,
          data: { image_urls: imageUrls }
        });
        return response.data;
      },
      SERVICE_NAME,
      'deleteImages',
      { signal }
    );
  },
};

