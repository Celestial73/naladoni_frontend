/**
 * Events API Service
 * Centralized API calls for events
 */

import { axiosPrivate } from '../../api/axios.js';
import { baseServiceConfig } from './baseService.js';

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
    date: apiEvent.starts_at || '',
    time: '',
    location: apiEvent.location,
    description: apiEvent.description,
    attendees: apiEvent.participants || apiEvent.attendees || [],
    maxAttendees: apiEvent.capacity,
    image: apiEvent.image || apiEvent.imageUrl || apiEvent.creator_profile?.photo_url || null,
    starts_at: apiEvent.starts_at,
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
        const response = await axiosPrivate.patch(`/events/${eventId}`, cleanedData, config);
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
};

