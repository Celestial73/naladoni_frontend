/**
 * Event Actions API Service
 * Centralized API calls for event actions (likes, accepts, rejects)
 */

import { axiosPrivate } from '../../api/axios.js';
import { baseServiceConfig } from './baseService.js';

const SERVICE_NAME = 'eventActionsService';

export const eventActionsService = {
  /**
   * Get pending likes for a specific event
   * @param {string|number} eventId - Event ID
   * @param {AbortSignal} [signal] - Optional AbortSignal for request cancellation
   * @returns {Promise<Array>} List of pending event actions
   */
  getPendingLikesForEvent: async (eventId, signal) => {
    return baseServiceConfig.executeRequest(
      async (abortSignal) => {
        const config = baseServiceConfig.createRequestConfig(abortSignal);
        const response = await axiosPrivate.get(`/event-actions/event/${eventId}/pending`, config);
        return response.data || [];
      },
      SERVICE_NAME,
      'getPendingLikesForEvent',
      { signal }
    );
  },

  /**
   * Accept a pending like
   * @param {string|number} eventActionId - Event Action ID
   * @param {AbortSignal} [signal] - Optional AbortSignal for request cancellation
   * @returns {Promise<Object>} Updated event action
   */
  acceptLike: async (eventActionId, signal) => {
    return baseServiceConfig.executeRequest(
      async (abortSignal) => {
        const config = baseServiceConfig.createRequestConfig(abortSignal);
        const response = await axiosPrivate.patch(`/event-actions/${eventActionId}/accept`, {}, config);
        return response.data;
      },
      SERVICE_NAME,
      'acceptLike',
      { signal }
    );
  },

  /**
   * Reject a pending like
   * @param {string|number} eventActionId - Event Action ID
   * @param {AbortSignal} [signal] - Optional AbortSignal for request cancellation
   * @returns {Promise<Object>} Updated event action
   */
  rejectLike: async (eventActionId, signal) => {
    return baseServiceConfig.executeRequest(
      async (abortSignal) => {
        const config = baseServiceConfig.createRequestConfig(abortSignal);
        const response = await axiosPrivate.patch(`/event-actions/${eventActionId}/reject`, {}, config);
        return response.data;
      },
      SERVICE_NAME,
      'rejectLike',
      { signal }
    );
  },
};

