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
const transformEvent = (apiEvent) => {
  // Transform participants from new API format (array of {profile, user}) to flat structure
  let attendees = [];
  if (apiEvent.participants && Array.isArray(apiEvent.participants)) {
    attendees = apiEvent.participants.map((participant) => {
      const profile = participant.profile || {};
      const user = participant.user || {};
      return {
        profile_name: profile.profile_name || user.telegram_name || '',
        name: profile.profile_name || user.telegram_name || '',
        age: profile.age,
        bio: profile.bio || '',
        images: profile.images || [],
        image_url: profile.images?.[0] || user.image_url || null,
        interests: profile.interests || [],
        custom_fields: profile.custom_fields || [],
        background_color: profile.background_color,
        telegram_username: user.telegram_username || null,
        profile_id: profile._id || profile.id,
        user_id: user._id || user.id,
        user: user,
        profile: profile,
      };
    });
  } else if (apiEvent.attendees && Array.isArray(apiEvent.attendees)) {
    // Fallback for old format
    attendees = apiEvent.attendees;
  }

  return {
    id: apiEvent.id || apiEvent._id,
    title: apiEvent.title,
    date: formatDateToDDMMYYYY(apiEvent.date) || '',
    location: apiEvent.location,
    description: apiEvent.description,
    attendees: attendees,
    maxAttendees: apiEvent.capacity,
    image: apiEvent.image || apiEvent.imageUrl || apiEvent.creator_profile?.images?.[0] || apiEvent.creator_profile?.image_url || null,
    picture: apiEvent.image || '',
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
   * @returns {Promise<Object>} Event data
   */
  getEvent: async (eventId, signal) => {
    return baseServiceConfig.executeRequest(
      async (abortSignal) => {
        const config = baseServiceConfig.createRequestConfig(abortSignal);
        const response = await axiosPrivate.get(`/events/${eventId}`, config);
        return response.data;
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

