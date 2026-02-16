import { useState, useEffect } from 'react';
import { useCachedFetch } from './useCachedFetch.js';
import { eventsService } from '@/api/services/eventsService.js';

/**
 * Parse ISO datetime string to date format for form input
 */
const parseISODateToFormInput = (isoString) => {
    if (!isoString) return '';
    
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return '';
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (error) {
        return '';
    }
};

/**
 * Transform event data to form data format
 */
const transformToFormData = (event) => {
    if (!event) return null;
    
    const dateStr = parseISODateToFormInput(event.date || '');
    
    return {
        title: event.title || '',
        date: dateStr,
        town: event.town || '',
        location: event.location || '',
        maxAttendees: event.capacity?.toString() || '',
        description: event.description || '',
        picture: event.image || '',
    };
};

/**
 * Custom hook for managing event creation/editing
 * Handles fetching event data when in edit mode
 * 
 * @param {string} eventId - Event ID if in edit mode
 * @returns {Object} Event form data and controls
 */
export function useCreateEvent(eventId) {
    const isEditMode = Boolean(eventId);
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        town: '',
        location: '',
        maxAttendees: '',
        description: '',
        picture: '',
    });

    const {
        data: eventData,
        loading: fetching,
        error,
        refetch
    } = useCachedFetch({
        fetchFn: (signal) => eventsService.getEvent(eventId, signal),
        cacheKey: `event_${eventId}`,
        cache: {}, // Don't cache - always fetch fresh for editing
        isCacheValid: () => false,
        updateCache: () => {},
        errorMessage: 'Не удалось загрузить событие',
        enabled: isEditMode,
        transform: transformToFormData
    });

    // Update formData when eventData is loaded
    useEffect(() => {
        if (eventData) {
            setFormData(eventData);
        }
    }, [eventData]);

    return {
        formData,
        setFormData,
        fetching,
        error,
        isEditMode
    };
}

