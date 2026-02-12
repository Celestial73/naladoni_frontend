/**
 * Feed API Service
 * Centralized API calls for feed functionality
 */

import { axiosPrivate } from '../../api/axios.js';
import { baseServiceConfig } from './baseService.js';
import { formatDateToDDMMYYYY } from '../../utils/dateFormatter.js';

const SERVICE_NAME = 'feedService';

/**
 * Transform API event to UI format
 * @param {Object} apiEvent - Event from API
 * @returns {Object} Transformed event for UI
 */
const transformEvent = (apiEvent) => {
  return {
    id: apiEvent.id || apiEvent._id,
    title: apiEvent.title,
    date: formatDateToDDMMYYYY(apiEvent.date) || '',
    location: apiEvent.location,
    description: apiEvent.description,
    attendees: apiEvent.participants || apiEvent.attendees || [],
    maxAttendees: apiEvent.capacity,
    picture: apiEvent.picture || null,
    image: apiEvent.picture || apiEvent.image || apiEvent.imageUrl || apiEvent.creator_profile?.photo_url || null,
    creator_profile: apiEvent.creator_profile,
    town: apiEvent.town,
  };
};

export const feedService = {
  /**
   * Get next event from feed
   * @param {string|null} [townId] - Toкwn ID hash (optional - if omitted, returns events from all towns)
   * @param {string} [fromDay] - Start date in YYYY-MM-DD format (optional)
   * @param {string} [toDay] - End date in YYYY-MM-DD format (optional)
   * @param {AbortSignal} [signal] - Optional AbortSignal for request cancellation
   * @returns {Promise<Object>} Event data
   */
  getNextEvent: async (townId, fromDay, toDay, signal) => {
    return baseServiceConfig.executeRequest(
      async (abortSignal) => {
        const config = baseServiceConfig.createRequestConfig(abortSignal);
        
        // Build query parameters
        const params = new URLSearchParams();
        
        if (townId) {
          params.append('town_id', townId);
        }
        
        if (fromDay) {
          params.append('from_day', fromDay);
        }
        
        if (toDay) {
          params.append('to_day', toDay);
        }
        
        const response = await axiosPrivate.get(`/feed/me?${params.toString()}`, config);
        return transformEvent(response.data);
      },
      SERVICE_NAME,
      'getNextEvent',
      { signal }
    );
  },

  /**
   * Record user action on an event
   * @param {string} eventId - Event ID
   * @param {string} action - Action type: 'skip' or 'like'
   * @param {string} [text] - Optional text message (for like action with message)
   * @param {AbortSignal} [signal] - Optional AbortSignal for request cancellation
   * @returns {Promise<Object>} Action response
   */
  recordAction: async (eventId, action, text, signal) => {
    return baseServiceConfig.executeRequest(
      async (abortSignal) => {
        const config = baseServiceConfig.createRequestConfig(abortSignal);
        
        if (action !== 'skip' && action !== 'like') {
          throw new Error('Invalid action. Must be "skip" or "like"');
        }
        
        const payload = {
          event_id: eventId,
          action: action,
        };
        
        // Add text if provided
        if (text && text.trim()) {
          payload.text = text.trim();
        }
        
        const response = await axiosPrivate.post('/event-actions', payload, config);
        return response.data;
      },
      SERVICE_NAME,
      'recordAction',
      { signal }
    );
  },

  /**
   * Reset skipped events for a town and optional date range
   * @param {string|null} [townId] - Town ID hash (optional - if omitted, resets skips for all towns)
   * @param {string} [fromDay] - Start date in YYYY-MM-DD format (optional)
   * @param {string} [toDay] - End date in YYYY-MM-DD format (optional)
   * @param {AbortSignal} [signal] - Optional AbortSignal for request cancellation
   * @returns {Promise<Object>} Response with deletedCount
   */
  resetSkips: async (townId, fromDay, toDay, signal) => {
    return baseServiceConfig.executeRequest(
      async (abortSignal) => {
        const config = baseServiceConfig.createRequestConfig(abortSignal);
        
        // Build query parameters
        const params = new URLSearchParams();
        
        if (townId) {
          params.append('town_id', townId);
        }
        
        if (fromDay) {
          params.append('from_day', fromDay);
        }
        
        if (toDay) {
          params.append('to_day', toDay);
        }
        
        const response = await axiosPrivate.post(`/feed/me/reset-skips?${params.toString()}`, {}, config);
        return response.data;
      },
      SERVICE_NAME,
      'resetSkips',
      { signal }
    );
  },
};

