import { useState, useEffect } from 'react';
import { eventsService } from '@/api/services/eventsService.js';
import { eventActionsService } from '@/api/services/eventActionsService.js';
import { useDataCache } from '@/context/DataCacheProvider.jsx';
import { useCachedFetch } from './useCachedFetch.js';

/**
 * Custom hook for managing events data
 * Handles fetching my events, accepted events, and pending request counts
 * 
 * @returns {Object} Events data and controls
 */
export function useEvents() {
    const { eventsCache, updateEventsCache, isEventsCacheValid } = useDataCache();
    const [pendingRequestCounts, setPendingRequestCounts] = useState(eventsCache.pendingRequestCounts || {});

    // Fetch my events
    const {
        data: myEvents,
        loading: loadingMyEvents,
        error: errorMyEvents,
        refetch: refetchMyEvents
    } = useCachedFetch({
        fetchFn: (signal) => eventsService.getMyEvents(signal),
        cacheKey: 'myEvents',
        cache: eventsCache,
        isCacheValid: isEventsCacheValid,
        updateCache: updateEventsCache,
        errorMessage: 'Не удалось загрузить события'
    });

    // Fetch accepted events
    const {
        data: acceptedRequests,
        loading: loadingAccepted,
        error: errorAccepted,
        refetch: refetchAccepted
    } = useCachedFetch({
        fetchFn: (signal) => eventsService.getAcceptedEvents(signal),
        cacheKey: 'acceptedRequests',
        cache: eventsCache,
        isCacheValid: isEventsCacheValid,
        updateCache: updateEventsCache,
        errorMessage: 'Не удалось загрузить принятые события'
    });

    // Fetch pending request counts when my events are loaded
    useEffect(() => {
        if (!myEvents || myEvents.length === 0) {
            setPendingRequestCounts({});
            if (myEvents !== null) {
                updateEventsCache({ pendingRequestCounts: {} });
            }
            return;
        }

        const abortController = new AbortController();

        const fetchCounts = async () => {
            const counts = {};
            await Promise.all(
                myEvents.map(async (event) => {
                    try {
                        const requests = await eventActionsService.getPendingLikesForEvent(event.id, abortController.signal);
                        if (!abortController.signal.aborted) {
                            counts[event.id] = requests?.length || 0;
                        }
                    } catch (err) {
                        // Silently fail for individual requests - might not be owner or no requests
                        if (!abortController.signal.aborted) {
                            counts[event.id] = 0;
                        }
                    }
                })
            );
            
            if (!abortController.signal.aborted) {
                setPendingRequestCounts(counts);
                updateEventsCache({ pendingRequestCounts: counts });
            }
        };

        fetchCounts();

        return () => {
            abortController.abort();
        };
    }, [myEvents, updateEventsCache]);

    // Sync pending counts from cache updates
    useEffect(() => {
        if (eventsCache.pendingRequestCounts) {
            setPendingRequestCounts(eventsCache.pendingRequestCounts);
        }
    }, [eventsCache.pendingRequestCounts]);

    // Refresh all events
    const refreshAll = async () => {
        try {
            // Fetch both in parallel
            const [myEventsData, acceptedData] = await Promise.all([
                eventsService.getMyEvents(),
                eventsService.getAcceptedEvents()
            ]);

            // Update cache with fetched data
            updateEventsCache({
                myEvents: myEventsData || [],
                acceptedRequests: acceptedData || [],
            });

            // Fetch pending request counts
            let counts = {};
            if (myEventsData && myEventsData.length > 0) {
                await Promise.all(
                    myEventsData.map(async (event) => {
                        try {
                            const requests = await eventActionsService.getPendingLikesForEvent(event.id);
                            counts[event.id] = requests?.length || 0;
                        } catch (err) {
                            counts[event.id] = 0;
                        }
                    })
                );
            }

            setPendingRequestCounts(counts);
            updateEventsCache({ pendingRequestCounts: counts });
        } catch (err) {
            // If refresh fails, fall back to individual refetches
            await Promise.all([refetchMyEvents(), refetchAccepted()]);
        }
    };

    return {
        myEvents: myEvents || [],
        acceptedRequests: acceptedRequests || [],
        pendingRequestCounts,
        loadingMyEvents,
        loadingAccepted,
        errorMyEvents,
        errorAccepted,
        refreshAll
    };
}

