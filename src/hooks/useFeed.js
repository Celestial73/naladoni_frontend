import { useState, useEffect, useCallback, useRef } from 'react';
import { useDataCache } from '@/context/DataCacheProvider.jsx';
import { feedService } from '@/api/services/feedService.js';
import townHashMapping from '@/data/townHashMapping.json';
import { formatDateToAPI } from '@/utils/dateFormatter.js';

/**
 * Custom hook for managing feed data and actions
 * Handles fetching events, filters, cache management, and user actions
 * 
 * @returns {Object} Feed data, state, and control functions
 */
export function useFeed() {
    const { feedCache, updateFeedCache, isFeedCacheValid } = useDataCache();
    
    // Restore state from cache on mount
    const [filtersEnabled, setFiltersEnabled] = useState(feedCache.filters?.filtersEnabled || false);
    const [town, setTown] = useState(feedCache.filters?.town || 'Москва');
    const [startDate, setStartDate] = useState(feedCache.filters?.startDate || null);
    const [endDate, setEndDate] = useState(feedCache.filters?.endDate || null);
    const [currentEvent, setCurrentEvent] = useState(feedCache.currentEvent || null);
    const [noEventsAvailable, setNoEventsAvailable] = useState(feedCache.noEventsAvailable || false);
    
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState(null);

    // Track if component has mounted to avoid fetching on initial mount
    const isMountedRef = useRef(false);
    // Track last filter values to detect actual changes (not just re-renders)
    const lastFiltersRef = useRef({ town: null, startDate: null, endDate: null, filtersEnabled: false });

    // Helper to get town hash ID from town name
    const getTownHash = useCallback((townName) => {
        return townHashMapping[townName] || null;
    }, []);

    // Helper function to fetch event from API without setting state
    const fetchEventData = useCallback(async (abortSignal = null) => {
        // If filters are enabled, validate town
        let townHash = null;
        if (filtersEnabled) {
            if (!town || !town.trim()) {
                return null;
            }

            townHash = getTownHash(town);
            if (!townHash) {
                return null;
            }
        }

        // Convert date filters to YYYY-MM-DD format for API
        const fromDay = filtersEnabled && startDate ? formatDateToAPI(startDate) : null;
        const toDay = filtersEnabled && endDate ? formatDateToAPI(endDate) : null;

        try {
            const event = await feedService.getNextEvent(townHash, fromDay, toDay, abortSignal);
            return event || null;
        } catch (err) {
            if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
                const isNotFound = 
                    err.response?.status === 404 || 
                    err.message?.includes('404') ||
                    err.message?.includes('not found') ||
                    err.message?.toLowerCase().includes('the requested resource was not found');
                
                // Return null for 404 (no more events), throw otherwise
                if (isNotFound) {
                    return null;
                }
                throw err;
            }
            return null;
        }
    }, [filtersEnabled, town, startDate, endDate, getTownHash]);

    // Fetch next event from API and update state
    const fetchNextEvent = useCallback(async (abortSignal = null, forceRefresh = false) => {
        // If filters are enabled, validate town
        if (filtersEnabled) {
            if (!town || !town.trim()) {
                setError('Пожалуйста, выберите город');
                return;
            }

            const townHash = getTownHash(town);
            if (!townHash) {
                setError('Выбран неверный город');
                return;
            }
        }

        try {
            setFetching(true);
            setError(null);
            setNoEventsAvailable(false);
            const event = await fetchEventData(abortSignal);
            if (event) {
                setCurrentEvent(event);
                setNoEventsAvailable(false);
                // Update cache
                updateFeedCache({
                    currentEvent: event,
                    filters: { town, startDate, endDate, filtersEnabled },
                    noEventsAvailable: false,
                });
            } else {
                setNoEventsAvailable(true);
                setCurrentEvent(null);
                // Update cache
                updateFeedCache({
                    currentEvent: null,
                    filters: { town, startDate, endDate, filtersEnabled },
                    noEventsAvailable: true,
                });
            }
        } catch (err) {
            if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
                const errorMessage = err.message || '';
                
                const isNotFound = 
                    err.response?.status === 404 || 
                    errorMessage.includes('404') ||
                    errorMessage.includes('not found') ||
                    errorMessage.toLowerCase().includes('the requested resource was not found');
                
                // Handle 404 (no more events)
                if (isNotFound) {
                    setNoEventsAvailable(true);
                    setCurrentEvent(null);
                    setError(null);
                    // Update cache
                    updateFeedCache({
                        currentEvent: null,
                        filters: { town, startDate, endDate, filtersEnabled },
                        noEventsAvailable: true,
                    });
                } else {
                    setError(err.response?.data?.message || err.message || 'Не удалось загрузить событие');
                    setNoEventsAvailable(false);
                }
            }
        } finally {
            if (!abortSignal?.aborted) {
                setFetching(false);
            }
        }
    }, [filtersEnabled, town, startDate, endDate, getTownHash, fetchEventData, updateFeedCache]);

    // Fetch event on initial mount - only if cache is invalid or doesn't exist
    useEffect(() => {
        // Check if we have valid cached data and filters match
        const filtersMatch = 
            feedCache.filters?.town === town &&
            feedCache.filters?.startDate === startDate &&
            feedCache.filters?.endDate === endDate &&
            feedCache.filters?.filtersEnabled === filtersEnabled;
        
        const hasCachedData = feedCache.currentEvent !== null || feedCache.noEventsAvailable === true;
        
        // Only fetch if cache is invalid or filters changed
        if (!isFeedCacheValid() || !filtersMatch || !hasCachedData) {
            // If filters are enabled, check if town is set; otherwise fetch without filters
            if (!filtersEnabled || (town && town.trim())) {
                const abortController = new AbortController();
                fetchNextEvent(abortController.signal);
                isMountedRef.current = true;
                lastFiltersRef.current = { town, startDate, endDate, filtersEnabled };

                return () => {
                    abortController.abort();
                };
            }
        } else {
            // Cache is valid and filters match, just mark as mounted
            isMountedRef.current = true;
            lastFiltersRef.current = { town, startDate, endDate, filtersEnabled };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount

    // Reload event whenever filters change (town, startDate, endDate, or filtersEnabled)
    useEffect(() => {
        // Skip on initial mount (handled by the useEffect above)
        if (!isMountedRef.current) {
            return;
        }

        // If filters are enabled, validate town
        if (filtersEnabled) {
            const townHash = getTownHash(town);
            if (!town || !town.trim() || !townHash) {
                setCurrentEvent(null);
                return;
            }
        }

        // Check if filters actually changed (including filtersEnabled toggle)
        const filtersChanged = 
            lastFiltersRef.current.town !== town ||
            lastFiltersRef.current.startDate !== startDate ||
            lastFiltersRef.current.endDate !== endDate ||
            lastFiltersRef.current.filtersEnabled !== filtersEnabled;

        if (filtersChanged) {
            lastFiltersRef.current = { town, startDate, endDate, filtersEnabled };
            // Update cache filters immediately
            updateFeedCache({
                filters: { town, startDate, endDate, filtersEnabled },
            });
            const abortController = new AbortController();
            fetchNextEvent(abortController.signal);

            return () => {
                abortController.abort();
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [town, startDate, endDate, filtersEnabled, getTownHash, updateFeedCache]); // Reload when any filter changes

    // --- Filter handlers ---
    const handleTownChange = useCallback((value) => {
        setTown(value);
        setError(null);
        setNoEventsAvailable(false);
    }, []);

    const handleTownBlur = useCallback(() => {
        // Fetch events when user unfocuses the town input (only if filters are enabled)
        if (filtersEnabled && town && town.trim()) {
            const abortController = new AbortController();
            fetchNextEvent(abortController.signal);
        }
    }, [town, filtersEnabled, fetchNextEvent]);

    const handleStartDateChange = useCallback((date) => {
        setStartDate(date);
        setError(null);
        setNoEventsAvailable(false);
    }, []);

    const handleEndDateChange = useCallback((date) => {
        setEndDate(date);
        setError(null);
        setNoEventsAvailable(false);
    }, []);

    const handleDateRangeClear = useCallback(() => {
        setError(null);
        setNoEventsAvailable(false);
        // Fetch events when dates are cleared (without date filtering)
        if (!filtersEnabled || (town && town.trim())) {
            const abortController = new AbortController();
            fetchNextEvent(abortController.signal);
        }
    }, [town, filtersEnabled, fetchNextEvent]);

    const handleDateRangeClose = useCallback(() => {
        // Fetch events when calendar closes
        if (!filtersEnabled || (town && town.trim())) {
            const abortController = new AbortController();
            fetchNextEvent(abortController.signal);
        }
    }, [town, filtersEnabled, fetchNextEvent]);

    // --- Action handlers ---
    const handleSkip = useCallback(async () => {
        if (!currentEvent) return;

        try {
            // Record action and fetch next event in parallel
            const currentEventId = currentEvent.id;
            const actionPromise = feedService.recordAction(currentEventId, 'skip');
            const nextEventPromise = fetchEventData();

            // Wait for action to complete
            await actionPromise;

            // Wait for next event, then update state
            const nextEvent = await nextEventPromise;
            
            if (nextEvent) {
                setCurrentEvent(nextEvent);
                setNoEventsAvailable(false);
                // Update cache
                updateFeedCache({
                    currentEvent: nextEvent,
                    noEventsAvailable: false,
                });
            } else {
                setCurrentEvent(null);
                setNoEventsAvailable(true);
                // Update cache
                updateFeedCache({
                    currentEvent: null,
                    noEventsAvailable: true,
                });
            }
        } catch (err) {
            setError(err.message || 'Не удалось пропустить событие');
        }
    }, [currentEvent, fetchEventData, updateFeedCache]);

    const handleLike = useCallback(async () => {
        if (!currentEvent) return;

        try {
            // Record action and fetch next event in parallel
            const currentEventId = currentEvent.id;
            const actionPromise = feedService.recordAction(currentEventId, 'like');
            const nextEventPromise = fetchEventData();

            // Wait for action to complete
            await actionPromise;

            // Wait for next event, then update state
            const nextEvent = await nextEventPromise;
            
            if (nextEvent) {
                setCurrentEvent(nextEvent);
                setNoEventsAvailable(false);
                // Update cache
                updateFeedCache({
                    currentEvent: nextEvent,
                    noEventsAvailable: false,
                });
            } else {
                setCurrentEvent(null);
                setNoEventsAvailable(true);
                // Update cache
                updateFeedCache({
                    currentEvent: null,
                    noEventsAvailable: true,
                });
            }
        } catch (err) {
            setError(err.message || 'Не удалось лайкнуть событие');
        }
    }, [currentEvent, fetchEventData, updateFeedCache]);

    const handleSendMessage = useCallback(async (messageText) => {
        if (!messageText.trim() || !currentEvent) return;

        const textToSend = messageText.trim();
        const eventId = currentEvent.id;

        try {
            // Record action with text and fetch next event in parallel
            const actionPromise = feedService.recordAction(eventId, 'like', textToSend);
            const nextEventPromise = fetchEventData();

            // Wait for action to complete
            await actionPromise;

            // Wait for next event, then update state
            const nextEvent = await nextEventPromise;
            
            if (nextEvent) {
                setCurrentEvent(nextEvent);
                setNoEventsAvailable(false);
                // Update cache
                updateFeedCache({
                    currentEvent: nextEvent,
                    noEventsAvailable: false,
                });
            } else {
                setCurrentEvent(null);
                setNoEventsAvailable(true);
                // Update cache
                updateFeedCache({
                    currentEvent: null,
                    noEventsAvailable: true,
                });
            }
        } catch (err) {
            setError(err.message || 'Не удалось отправить сообщение');
            throw err; // Re-throw so component can handle (e.g., reopen popup)
        }
    }, [currentEvent, fetchEventData, updateFeedCache]);

    const handleRefresh = useCallback(() => {
        setError(null);
        setNoEventsAvailable(false);
        fetchNextEvent(null, true); // Force refresh
    }, [fetchNextEvent]);

    const handleResetSkips = useCallback(async () => {
        if (fetching) return;

        // If filters are enabled, validate town
        if (filtersEnabled) {
            if (!town || !town.trim()) {
                setError('Пожалуйста, выберите город');
                return;
            }

            const townHash = getTownHash(town);
            if (!townHash) {
                setError('Выбран неверный город');
                return;
            }
        }

        try {
            setFetching(true);
            setError(null);
            setNoEventsAvailable(false);

            // Convert date filters to YYYY-MM-DD format for API
            const fromDay = filtersEnabled && startDate ? formatDateToAPI(startDate) : null;
            const toDay = filtersEnabled && endDate ? formatDateToAPI(endDate) : null;

            // Get town hash only if filters are enabled
            const townHash = filtersEnabled && town ? getTownHash(town) : null;

            // Reset skips for current filters
            await feedService.resetSkips(townHash, fromDay, toDay);

            // Fetch new events after resetting skips
            await fetchNextEvent();
        } catch (err) {
            if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
                setError(err.response?.data?.message || err.message || 'Не удалось сбросить пропущенные события');
            }
        } finally {
            setFetching(false);
        }
    }, [fetching, filtersEnabled, town, startDate, endDate, getTownHash, fetchNextEvent]);

    return {
        // State
        currentEvent,
        noEventsAvailable,
        fetching,
        error,
        
        // Filters
        filtersEnabled,
        town,
        startDate,
        endDate,
        
        // Filter setters
        setFiltersEnabled,
        handleTownChange,
        handleTownBlur,
        handleStartDateChange,
        handleEndDateChange,
        handleDateRangeClear,
        handleDateRangeClose,
        
        // Actions
        handleSkip,
        handleLike,
        handleSendMessage,
        handleRefresh,
        handleResetSkips,
        
        // Direct fetch function (for advanced use cases)
        fetchNextEvent,
    };
}

