import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import { Page } from '@/components/Layout/Page.jsx';
import { HalftoneBackground } from '@/components/HalftoneBackground.jsx';
import { CircleButton } from '@/components/CircleButton/CircleButton.jsx';
import { EventList } from './EventList.jsx';
import { SectionTitle } from './SectionTitle.jsx';
import { colors } from '@/constants/colors.js';
import { eventsService } from '@/services/api/eventsService.js';
import { eventActionsService } from '@/services/api/eventActionsService.js';
import { useDataCache } from '@/context/DataCacheProvider.jsx';

export function Events() {
    const navigate = useNavigate();
    const { eventsCache, updateEventsCache, isEventsCacheValid } = useDataCache();
    
    // Restore state from cache on mount
    const [myEvents, setMyEvents] = useState(eventsCache.myEvents || []);
    const [acceptedRequests, setAcceptedRequests] = useState(eventsCache.acceptedRequests || []);
    const [pendingRequestCounts, setPendingRequestCounts] = useState(eventsCache.pendingRequestCounts || {});
    
    const [loading, setLoading] = useState(!isEventsCacheValid() || !eventsCache.myEvents);
    const [loadingAccepted, setLoadingAccepted] = useState(!isEventsCacheValid() || !eventsCache.acceptedRequests);
    const [error, setError] = useState(null);
    const [errorAccepted, setErrorAccepted] = useState(null);

    // Sync state with cache updates (e.g., when pending counts change from other pages)
    useEffect(() => {
        if (eventsCache.pendingRequestCounts) {
            setPendingRequestCounts(eventsCache.pendingRequestCounts);
        }
    }, [eventsCache.pendingRequestCounts]);

    // Fetch my events and pending request counts
    useEffect(() => {
        // Check if we have valid cached data
        const cacheValid = isEventsCacheValid();
        const hasCachedData = eventsCache.myEvents !== null;
        
        // Only fetch if cache is invalid or doesn't exist
        if (cacheValid && hasCachedData) {
            // Cache is valid, skip fetching but ensure loading is false
            setLoading(false);
            return;
        }

        const abortController = new AbortController();

        const fetchEvents = async () => {
            try {
                setLoading(true);
                setError(null);
                const events = await eventsService.getMyEvents(abortController.signal);
                if (!abortController.signal.aborted) {
                    setMyEvents(events || []);
                    
                    // Fetch pending request counts for each event
                    if (events && events.length > 0) {
                        const counts = {};
                        await Promise.all(
                            events.map(async (event) => {
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
                            // Update cache
                            updateEventsCache({
                                myEvents: events || [],
                                pendingRequestCounts: counts,
                            });
                        }
                    } else {
                        // Update cache even if no events
                        updateEventsCache({
                            myEvents: [],
                            pendingRequestCounts: {},
                        });
                    }
                }
            } catch (err) {
                if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
                    if (!abortController.signal.aborted) {
                        setError(err.message || 'Не удалось загрузить события');
                    }
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchEvents();

        return () => {
            abortController.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount - cache check happens inside

    // Fetch accepted events
    useEffect(() => {
        // Check if we have valid cached data
        const cacheValid = isEventsCacheValid();
        const hasCachedData = eventsCache.acceptedRequests !== null;
        
        // Only fetch if cache is invalid or doesn't exist
        if (cacheValid && hasCachedData) {
            // Cache is valid, skip fetching but ensure loading is false
            setLoadingAccepted(false);
            return;
        }

        const abortController = new AbortController();

        const fetchAcceptedEvents = async () => {
            try {
                setLoadingAccepted(true);
                setErrorAccepted(null);
                const events = await eventsService.getAcceptedEvents(abortController.signal);
                if (!abortController.signal.aborted) {
                    setAcceptedRequests(events || []);
                    // Update cache
                    updateEventsCache({
                        acceptedRequests: events || [],
                    });
                }
            } catch (err) {
                if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
                    if (!abortController.signal.aborted) {
                        setErrorAccepted(err.message || 'Не удалось загрузить принятые события');
                    }
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setLoadingAccepted(false);
                }
            }
        };

        fetchAcceptedEvents();

        return () => {
            abortController.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount - cache check happens inside


    const handleRefresh = async () => {
        setError(null);
        setErrorAccepted(null);
        setLoading(true);
        setLoadingAccepted(true);
        
        try {
            const [myEventsData, acceptedData] = await Promise.all([
                eventsService.getMyEvents(),
                eventsService.getAcceptedEvents()
            ]);
            setMyEvents(myEventsData || []);
            setAcceptedRequests(acceptedData || []);
            
            // Refresh pending request counts
            let counts = {};
            if (myEventsData && myEventsData.length > 0) {
                await Promise.all(
                    myEventsData.map(async (event) => {
                        try {
                            const requests = await eventActionsService.getPendingLikesForEvent(event.id);
                            counts[event.id] = requests?.length || 0;
                        } catch (err) {
                            // Silently fail for individual requests
                            counts[event.id] = 0;
                        }
                    })
                );
            }
            setPendingRequestCounts(counts);
            
            // Update cache
            updateEventsCache({
                myEvents: myEventsData || [],
                acceptedRequests: acceptedData || [],
                pendingRequestCounts: counts,
            });
        } catch (err) {
            setError(err.message || 'Не удалось обновить события');
        } finally {
            setLoading(false);
            setLoadingAccepted(false);
        }
    };


    return (
        <Page>
            <div style={{
                backgroundColor: colors.eventPrimary,
                minHeight: 'calc(100vh - 80px)',
                width: '100%',
                padding: '2%',
                paddingBottom: '3em',
                boxSizing: 'border-box',
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'center',
                position: 'relative',
                overflow: 'visible'
            }}>
                {/* Fixed background */}
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 0
                }}>
                    <HalftoneBackground color={colors.eventPrimaryDark} />
                </div>

                {/* Create Event Button - Fixed top right */}
                <CircleButton
                    icon={<Plus size={24} color={colors.eventPrimary} />}
                    onClick={() => navigate('/events/create')}
                    position="top-right"
                    size={50}
                    top="1em"
                    right="1em"
                />

                {/* Refresh Button - Fixed top right */}
                <CircleButton
                    icon={<RefreshCw size={22} color={colors.eventPrimary} />}
                    onClick={handleRefresh}
                    disabled={loading || loadingAccepted}
                    position="top-right"
                    size={50}
                    top="1em"
                    right="5.5em"
                />

                {/* Error messages */}
                {error && (
                    <div style={{
                        width: '90%',
                        marginTop: '4em',
                        padding: '0.75em 1em',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '12px',
                        color: '#c0392b',
                        fontSize: '0.9em',
                        fontWeight: '500',
                        textAlign: 'center',
                        position: 'relative',
                        zIndex: 1,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}>
                        {error}
                    </div>
                )}

                {errorAccepted && (
                    <div style={{
                        width: '90%',
                        marginTop: error ? '0.5em' : '4em',
                        padding: '0.75em 1em',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '12px',
                        color: '#c0392b',
                        fontSize: '0.9em',
                        fontWeight: '500',
                        textAlign: 'center',
                        position: 'relative',
                        zIndex: 1,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}>
                        {errorAccepted}
                    </div>
                )}

                {/* My Events Section */}
                <div style={{
                    width: '100%',
                    marginTop: error || errorAccepted ? '1em' : '3em',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <SectionTitle align="left" fontSize="2em">
                        МОИ СОБЫТИЯ
                    </SectionTitle>

                    <EventList
                        events={myEvents}
                        loading={loading}
                        onEventClick={(event) => navigate(`/events/${event.id}/detail`)}
                        pendingRequestCounts={pendingRequestCounts}
                        emptyTitle="Нет событий"
                        emptyMessage="Вы ещё не создали ни одного события"
                    />
                </div>

                {/* Accepted Requests Section */}
                <div style={{
                    width: '100%',
                    marginTop: '2em',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <SectionTitle align="right" fontSize="2em">
                        ПРИНЯТЫЕ ЗАПРОСЫ
                    </SectionTitle>

                    <EventList
                        events={acceptedRequests}
                        loading={loadingAccepted}
                        onEventClick={(event) => navigate(`/events/${event.id}/detail`)}
                        emptyTitle="Нет запросов"
                        emptyMessage="Вы ещё не приняли ни одного запроса"
                    />
                </div>
            </div>
        </Page>
    );
}