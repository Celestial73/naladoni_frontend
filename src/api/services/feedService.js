/**
 * Feed API Service
 * Centralized API calls for feed functionality
 */

import { axiosPrivate } from '../axios.js';
import { baseServiceConfig } from './baseService.js';
import { formatDateToDDMMYYYY } from '../../utils/dateFormatter.js';

const SERVICE_NAME = 'feedService';

/**
 * Transform API event to UI format
 * Handles participants structure: {profile (required), user (optional)}
 * 
 * @param {Object} apiEvent - Event from API
 * @returns {Object} Transformed event for UI
 */
const transformEvent = (apiEvent) => {
  if (!apiEvent) {
    return null;
  }

  // Transform participants from API format (array of {profile, user}) to flat structure
  // profile is always present, user is optional (only when owner views or /events/me endpoint)
  let attendees = [];
  if (apiEvent.participants && Array.isArray(apiEvent.participants)) {
    attendees = apiEvent.participants.map((participant) => {
      // profile is required, user is optional
      const profile = participant.profile || {};
      const user = participant.user || null; // Explicitly null if not present
      
      // Extract IDs - profile.id is primary identifier (always present)
      const profileId = profile.id || profile._id;
      const userId = user ? (user.id || user._id) : null;
      
      return {
        // Profile data (always available)
        profile_id: profileId,
        profile_name: profile.profile_name || '',
        age: profile.age,
        bio: profile.bio || '',
        images: Array.isArray(profile.images) ? profile.images : [],
        image_url: profile.images?.[0] || null,
        interests: Array.isArray(profile.interests) ? profile.interests : [],
        custom_fields: Array.isArray(profile.custom_fields) ? profile.custom_fields : [],
        background_color: profile.background_color,
        
        // User data (optional - may be null)
        user_id: userId,
        telegram_username: user?.telegram_username || null,
        
        // Fallback name from user if profile name not available
        // (Note: profile_name should always be present, but user.telegram_name as fallback)
        profile_name: profile.profile_name || user?.telegram_name || '',
        
        // Keep nested objects for backward compatibility (but prefer flat structure)
        user: user,
        profile: profile,
      };
    });
  } else if (apiEvent.attendees && Array.isArray(apiEvent.attendees)) {
    // Fallback for old format (legacy support)
    attendees = apiEvent.attendees;
  }

  // Extract event ID - standardize to 'id'
  const eventId = apiEvent.id || apiEvent._id;
  
  return {
    id: eventId,
    title: apiEvent.title || '',
    date: formatDateToDDMMYYYY(apiEvent.date) || '',
    description: apiEvent.description || '',
    attendees: attendees,
    picture: apiEvent.image || '', // Legacy field name
    image: apiEvent.image || apiEvent.creator_profile?.image_url || null,
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

