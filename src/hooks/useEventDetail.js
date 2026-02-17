import { useState, useEffect } from 'react';
import { useDataCache } from '@/context/DataCacheProvider.jsx';
import { eventsService } from '@/api/services/eventsService.js';
import { eventActionsService } from '@/api/services/eventActionsService.js';

// Note: transformEvent is now handled by eventsService.getEvent()
// This hook no longer needs its own transformation since getEvent() now transforms data

/**
 * Custom hook for managing event detail data
 * Handles fetching event details and pending requests
 * 
 * @param {string} eventId - Event ID to fetch
 * @returns {Object} Event data and controls
 */
export function useEventDetail(eventId) {
    const { eventsCache } = useDataCache();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [errorRequests, setErrorRequests] = useState(null);
    const [processingAction, setProcessingAction] = useState(null);

    // Fetch event details - always fetch fresh, no caching
    useEffect(() => {
        if (!eventId) {
            setEvent(null);
            setLoading(false);
            return;
        }

        const abortController = new AbortController();

        const fetchEvent = async () => {
            try {
                setLoading(true);
                setError(null);
                // getEvent now returns transformed data, no need for manual transformation
                const result = await eventsService.getEvent(eventId, abortController.signal);
                
                if (!abortController.signal.aborted) {
                    setEvent(result);
                }
            } catch (err) {
                if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
                    if (!abortController.signal.aborted) {
                        const errorMsg = err.response?.data?.message || err.message || 'Не удалось загрузить событие';
                        setError(errorMsg);
                    }
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchEvent();

        return () => {
            abortController.abort();
        };
    }, [eventId]);

    // Refetch function for manual refresh
    const refetchEvent = async () => {
        if (!eventId) return;
        
        try {
            setLoading(true);
            setError(null);
            // getEvent now returns transformed data
            const result = await eventsService.getEvent(eventId);
            setEvent(result);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Не удалось загрузить событие';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

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
        handleRejectRequest,
        handleDeleteParticipant
    };
}

