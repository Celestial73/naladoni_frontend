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
  return {
    id: apiEvent.id || apiEvent._id,
    title: apiEvent.title,
    date: formatDateToDDMMYYYY(apiEvent.date) || '',
    location: apiEvent.location,
    description: apiEvent.description,
    attendees: apiEvent.participants || apiEvent.attendees || [],
    maxAttendees: apiEvent.capacity,
    image: apiEvent.picture || apiEvent.image || apiEvent.imageUrl || apiEvent.creator_profile?.photos?.[0] || apiEvent.creator_profile?.photo_url || null,
    picture: apiEvent.picture || '',
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
   * Upload a picture for an event
   * @param {string|number} eventId - Event ID
   * @param {File} file - Image file to upload
   * @param {AbortSignal} [signal] - Optional AbortSignal for request cancellation
   * @returns {Promise<Object>} Updated event with picture URL populated
   */
  uploadEventPicture: async (eventId, file, signal) => {
    return baseServiceConfig.executeRequest(
      async (abortSignal) => {
        const formData = new FormData();
        formData.append('images', file);

        const config = baseServiceConfig.createRequestConfig(abortSignal, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const response = await axiosPrivate.post(`/events/me/${eventId}/picture`, formData, config);
        return response.data;
      },
      SERVICE_NAME,
      'uploadEventPicture',
      { signal }
    );
  },

  /**
   * Delete the picture for an event
   * @param {string|number} eventId - Event ID
   * @param {AbortSignal} [signal] - Optional AbortSignal for request cancellation
   * @returns {Promise<Object>} Updated event with picture cleared
   */
  deleteEventPicture: async (eventId, signal) => {
    return baseServiceConfig.executeRequest(
      async (abortSignal) => {
        const config = baseServiceConfig.createRequestConfig(abortSignal);
        const response = await axiosPrivate.delete(`/events/me/${eventId}/picture`, config);
        return response.data;
      },
      SERVICE_NAME,
      'deleteEventPicture',
      { signal }
    );
  },
};

