import { useState, useEffect } from 'react';
import { useCachedFetch } from './useCachedFetch.js';
import { useDataCache } from '@/context/DataCacheProvider.jsx';
import { eventsService } from '@/api/services/eventsService.js';
import { eventActionsService } from '@/api/services/eventActionsService.js';
import { formatDateToDDMMYYYY } from '@/utils/dateFormatter.js';

/**
 * Transform API event to UI format
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
        image: apiEvent.picture || apiEvent.image || apiEvent.imageUrl || apiEvent.creator_profile?.photo_url || null,
        picture: apiEvent.picture || '',
        creator_profile: apiEvent.creator_profile,
    };
};

/**
 * Custom hook for managing event detail data
 * Handles fetching event details and pending requests
 * 
 * @param {string} eventId - Event ID to fetch
 * @returns {Object} Event data and controls
 */
export function useEventDetail(eventId) {
    const { eventsCache } = useDataCache();
    const [isOwner, setIsOwner] = useState(false);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [errorRequests, setErrorRequests] = useState(null);
    const [processingAction, setProcessingAction] = useState(null);

    // Fetch event details
    const {
        data: event,
        loading,
        error,
        refetch: refetchEvent
    } = useCachedFetch({
        fetchFn: (signal) => eventsService.getEvent(eventId, signal),
        cacheKey: `event_${eventId}`, // Use event-specific cache key
        cache: {}, // Events are not cached globally, fetch fresh each time
        isCacheValid: () => false, // Always fetch fresh
        updateCache: () => {}, // No global cache for individual events
        errorMessage: 'Не удалось загрузить событие',
        enabled: !!eventId,
        transform: transformEvent
    });

    // Determine ownership when event is loaded
    useEffect(() => {
        if (!event?.id) return;

        const myEvents = eventsCache.myEvents || [];
        if (myEvents.length > 0) {
            const isEventOwner = myEvents.some(e => e.id === event.id);
            setIsOwner(isEventOwner);
        } else {
            setIsOwner(false);
        }
    }, [event?.id, eventsCache.myEvents]);

    // Fetch pending requests if owner (or to verify ownership if cache wasn't available)
    useEffect(() => {
        if (!event?.id || loading || !eventId) {
            return;
        }

        const myEvents = eventsCache.myEvents || [];
        const cacheWasAvailable = myEvents.length > 0;
        const shouldFetch = isOwner || !cacheWasAvailable;

        if (!shouldFetch) {
            return;
        }

        const abortController = new AbortController();

        const fetchPendingRequests = async () => {
            try {
                setLoadingRequests(true);
                setErrorRequests(null);
                const requests = await eventActionsService.getPendingLikesForEvent(event.id, abortController.signal);
                
                if (!abortController.signal.aborted) {
                    setPendingRequests(requests || []);
                    // If we successfully fetched, we're definitely the owner
                    if (!isOwner) {
                        setIsOwner(true);
                    }
                }
            } catch (err) {
                if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
                    if (!abortController.signal.aborted) {
                        // If we get 403 or similar, user is not owner - update state
                        if (err.response?.status === 403 || err.response?.status === 404) {
                            setIsOwner(false);
                        } else {
                            // Only show error if we already knew we were owner
                            if (isOwner) {
                                setErrorRequests(err.message || 'Не удалось загрузить запросы');
                            }
                        }
                    }
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setLoadingRequests(false);
                }
            }
        };

        fetchPendingRequests();

        return () => {
            abortController.abort();
        };
    }, [isOwner, event?.id, loading, eventsCache.myEvents, eventId]);

    const handleAcceptRequest = async (eventActionId) => {
        try {
            setProcessingAction(eventActionId);
            setErrorRequests(null);
            await eventActionsService.acceptLike(eventActionId);
            
            // Remove from pending list
            setPendingRequests(prev => prev.filter((req) => req.id !== eventActionId));
            
            // Refresh event data to show new participant
            if (event?.id) {
                await refetchEvent();
            }
        } catch (err) {
            setErrorRequests(err.message || 'Не удалось принять запрос');
        } finally {
            setProcessingAction(null);
        }
    };

    const handleRejectRequest = async (eventActionId) => {
        try {
            setProcessingAction(eventActionId);
            setErrorRequests(null);
            await eventActionsService.rejectLike(eventActionId);
            
            // Remove from pending list
            setPendingRequests(prev => prev.filter((req) => req.id !== eventActionId));
        } catch (err) {
            setErrorRequests(err.message || 'Не удалось отклонить запрос');
        } finally {
            setProcessingAction(null);
        }
    };

    const handleDeleteParticipant = async (participantId) => {
        if (!event?.id) return;
        
        try {
            await eventsService.deleteParticipant(event.id, participantId);
            
            // Refresh event data
            await refetchEvent();
        } catch (err) {
            // Error will be handled by the hook's error state
            throw err;
        }
    };

    return {
        event,
        isOwner,
        pendingRequests,
        loading,
        loadingRequests,
        error,
        errorRequests,
        processingAction,
        refetchEvent,
        handleAcceptRequest,
        handleRejectRequest
    };
}

