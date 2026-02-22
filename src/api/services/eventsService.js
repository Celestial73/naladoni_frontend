/**
 * Events API Service
 * Centralized API calls for events
 */

import { axiosPrivate } from '../axios.js';
import { baseServiceConfig } from './baseService.js';
import { formatDateToDDMMYYYY } from '../../utils/dateFormatter.js';

const SERVICE_NAME = 'eventsService';

/**
 * Transform API event to UI format
 * @param {Object} apiEvent - Event from API
 * @returns {Object} Transformed event for UI
 */
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
    image: apiEvent.image || apiEvent.creator_profile?.images?.[0] || apiEvent.creator_profile?.image_url || null,
    picture: apiEvent.image || '', // Legacy field name
    creator_profile: apiEvent.creator_profile,
  };
};

export const eventsService = {
  /**
   * Get user's events
   * @param {AbortSignal} [signal] - Optional AbortSignal for request cancellation
   * @returns {Promise<Array>} List of user's events
   */
  getMyEvents: async (signal) => {
    return baseServiceConfig.executeRequest(
      async (abortSignal) => {
        const config = baseServiceConfig.createRequestConfig(abortSignal);
        const response = await axiosPrivate.get('/events/me', config);
        const events = response.data.results || response.data || [];
        return events.map(transformEvent);
      },
      SERVICE_NAME,
      'getMyEvents',
      { signal }
    );
  },

  /**
   * Get event by ID
   * @param {string|number} eventId - Event ID
   * @param {AbortSignal} [signal] - Optional AbortSignal for request cancellation
   * @returns {Promise<Object>} Event data (transformed to consistent format)
   */
  getEvent: async (eventId, signal) => {
    return baseServiceConfig.executeRequest(
      async (abortSignal) => {
        const config = baseServiceConfig.createRequestConfig(abortSignal);
        const response = await axiosPrivate.get(`/events/${eventId}`, config);
        // Transform to consistent format like other event-fetching methods
        return transformEvent(response.data);
      },
      SERVICE_NAME,
      'getEvent',
      { signal }
    );
  },

  /**
   * Create a new event
   * @param {Object} eventData - Event data
   * @param {AbortSignal} [signal] - Optional AbortSignal for request cancellation
   * @returns {Promise<Object>} Created event
   */
  createEvent: async (eventData, signal) => {
    return baseServiceConfig.executeRequest(
      async (abortSignal) => {
        const config = baseServiceConfig.createRequestConfig(abortSignal);
        const cleanedData = baseServiceConfig.removeUndefined(eventData);
        const response = await axiosPrivate.post('/events/me', cleanedData, config);
        return response.data;
      },
      SERVICE_NAME,
      'createEvent',
      { signal }
    );
  },

  /**
   * Update an event
   * @param {string|number} eventId - Event ID
   * @param {Object} eventData - Updated event data
   * @param {AbortSignal} [signal] - Optional AbortSignal for request cancellation
   * @returns {Promise<Object>} Updated event
   */
  updateEvent: async (eventId, eventData, signal) => {
    return baseServiceConfig.executeRequest(
      async (abortSignal) => {
        const config = baseServiceConfig.createRequestConfig(abortSignal);
        const cleanedData = baseServiceConfig.removeUndefined(eventData);
        const response = await axiosPrivate.patch(`/events/me/${eventId}`, cleanedData, config);
        return response.data;
      },
      SERVICE_NAME,
      'updateEvent',
      { signal }
    );
  },

  /**
   * Delete an event
   * @param {string|number} eventId - Event ID
   * @param {AbortSignal} [signal] - Optional AbortSignal for request cancellation
   * @returns {Promise<void>}
   */
  deleteEvent: async (eventId, signal) => {
    return baseServiceConfig.executeRequest(
      async (abortSignal) => {
        const config = baseServiceConfig.createRequestConfig(abortSignal);
        await axiosPrivate.delete(`/events/me/${eventId}`, config);
      },
      SERVICE_NAME,
      'deleteEvent',
      { signal }
    );
  },

  /**
   * Delete a participant from an event
   * @param {string|number} eventId - Event ID
   * @param {string|number} participantId - Participant ID
   * @param {AbortSignal} [signal] - Optional AbortSignal for request cancellation
   * @returns {Promise<void>}
   */
  deleteParticipant: async (eventId, participantId, signal) => {
    return baseServiceConfig.executeRequest(
      async (abortSignal) => {
        const config = baseServiceConfig.createRequestConfig(abortSignal);
        await axiosPrivate.delete(`/events/me/${eventId}/participants/${participantId}`, config);
      },
      SERVICE_NAME,
      'deleteParticipant',
      { signal }
    );
  },

  /**
   * Get accepted events (events user is a participant of)
   * @param {AbortSignal} [signal] - Optional AbortSignal for request cancellation
   * @returns {Promise<Array>} List of accepted events
   */
  getAcceptedEvents: async (signal) => {
    return baseServiceConfig.executeRequest(
      async (abortSignal) => {
        const config = baseServiceConfig.createRequestConfig(abortSignal);
        const response = await axiosPrivate.get('/events/me/accepted', config);
        const events = response.data.results || response.data || [];
        return events.map(transformEvent);
      },
      SERVICE_NAME,
      'getAcceptedEvents',
      { signal }
    );
  },

  /**
   * Leave an event (for participants, not hosts)
   * @param {string|number} eventId - Event ID
   * @param {AbortSignal} [signal] - Optional AbortSignal for request cancellation
   * @returns {Promise<void>}
   */
  leaveEvent: async (eventId, signal) => {
    return baseServiceConfig.executeRequest(
      async (abortSignal) => {
        const config = baseServiceConfig.createRequestConfig(abortSignal);
        await axiosPrivate.post(`/events/me/${eventId}/leave`, {}, config);
      },
      SERVICE_NAME,
      'leaveEvent',
      { signal }
    );
  },

  /**
   * Upload an image for an event
   * @param {string|number} eventId - Event ID
   * @param {File} file - Image file to upload
   * @param {AbortSignal} [signal] - Optional AbortSignal for request cancellation
   * @returns {Promise<Object>} Updated event with image URL populated
   */
  uploadEventImage: async (eventId, file, signal) => {
    return baseServiceConfig.executeRequest(
      async (abortSignal) => {
        const formData = new FormData();
        formData.append('images', file);

        const config = baseServiceConfig.createRequestConfig(abortSignal, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const response = await axiosPrivate.post(`/events/me/${eventId}/image`, formData, config);
        return response.data;
      },
      SERVICE_NAME,
      'uploadEventImage',
      { signal }
    );
  },

  /**
   * Delete the image for an event
   * @param {string|number} eventId - Event ID
   * @param {AbortSignal} [signal] - Optional AbortSignal for request cancellation
   * @returns {Promise<Object>} Updated event with image cleared
   */
  deleteEventImage: async (eventId, signal) => {
    return baseServiceConfig.executeRequest(
      async (abortSignal) => {
        const config = baseServiceConfig.createRequestConfig(abortSignal);
        const response = await axiosPrivate.delete(`/events/me/${eventId}/image`, config);
        return response.data;
      },
      SERVICE_NAME,
      'deleteEventImage',
      { signal }
    );
  },
};

