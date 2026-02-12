import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, Calendar, MapPin, Users, Bell } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Page } from '@/components/Layout/Page.jsx';
import { HalftoneBackground } from '@/components/HalftoneBackground.jsx';
import { EventDrawer } from './EventDrawer.jsx';
import { ProfileDrawer } from '../Profile/ProfileDrawer.jsx';
import { colors } from '@/constants/colors.js';
import { eventsService } from '@/services/api/eventsService.js';
import { eventActionsService } from '@/services/api/eventActionsService.js';
import { formatDateToDDMMYYYY } from '@/utils/dateFormatter.js';
import { useDataCache } from '@/context/DataCacheProvider.jsx';

export function NewEvents() {
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
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedAttendee, setSelectedAttendee] = useState(null);

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

    const handleLeaveEvent = async (eventId) => {
        try {
            await eventsService.leaveEvent(eventId);
            const updatedAccepted = acceptedRequests.filter((e) => e.id !== eventId);
            setAcceptedRequests(updatedAccepted);
            setSelectedEvent(null);
            // Update cache
            updateEventsCache({
                acceptedRequests: updatedAccepted,
            });
        } catch (err) {
            setErrorAccepted(err.message || 'Не удалось покинуть событие');
        }
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            await eventsService.deleteEvent(eventId);
            const updatedEvents = myEvents.filter((e) => e.id !== eventId);
            setMyEvents(updatedEvents);
            setSelectedEvent(null);
            // Update cache
            updateEventsCache({
                myEvents: updatedEvents,
            });
        } catch (err) {
            setError(err.message || 'Не удалось удалить событие');
        }
    };

    const handleEditEvent = (eventId) => {
        navigate(`/events/edit/${eventId}`);
    };

    const handleDeleteParticipant = async (eventId, participantId) => {
        try {
            await eventsService.deleteParticipant(eventId, participantId);
            
            setMyEvents((prev) => 
                prev.map((event) => {
                    if (event.id === eventId) {
                        return {
                            ...event,
                            attendees: event.attendees?.filter(
                                (attendee) => (attendee.id || attendee.user) !== participantId
                            ) || []
                        };
                    }
                    return event;
                })
            );
            
            if (selectedEvent && selectedEvent.id === eventId) {
                setSelectedEvent((prev) => ({
                    ...prev,
                    attendees: prev.attendees?.filter(
                        (attendee) => (attendee.id || attendee.user) !== participantId
                    ) || []
                }));
            }
        } catch (err) {
            setError(err.message || 'Не удалось удалить участника');
        }
    };

    const handleEventUpdate = async (updatedEventData) => {
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

        const transformedEvent = transformEvent(updatedEventData);

        setMyEvents((prev) =>
            prev.map((event) => {
                if (event.id === transformedEvent.id) {
                    return transformedEvent;
                }
                return event;
            })
        );

        if (selectedEvent && selectedEvent.id === transformedEvent.id) {
            setSelectedEvent(transformedEvent);
        }
    };

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

    const isOwner = (event) => {
        return myEvents.some(e => e.id === event.id);
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
                <button
                    onClick={() => navigate('/events/create')}
                    style={{
                        position: 'fixed',
                        top: '1em',
                        right: '1em',
                        zIndex: 10,
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        backgroundColor: colors.white,
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)',
                        transition: 'transform 0.1s'
                    }}
                    onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
                    onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                    <Plus size={24} color={colors.eventPrimary} />
                </button>

                {/* Refresh Button - Fixed top left */}
                <button
                    onClick={handleRefresh}
                    disabled={loading || loadingAccepted}
                    style={{
                        position: 'fixed',
                        top: '1em',
                        left: '1em',
                        zIndex: 10,
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        backgroundColor: colors.white,
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: (loading || loadingAccepted) ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)',
                        opacity: (loading || loadingAccepted) ? 0.6 : 1,
                        transition: 'transform 0.1s'
                    }}
                    onMouseDown={(e) => !loading && !loadingAccepted && (e.currentTarget.style.transform = 'scale(0.92)')}
                    onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                    <RefreshCw size={22} color={colors.eventPrimary} />
                </button>

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
                    marginTop: error || errorAccepted ? '1em' : '4em',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <div style={{
                        width: '90%',
                        margin: '0 auto 1em',
                        padding: '0.8em 1em',
                        backgroundColor: colors.white,
                        borderRadius: '20px 0 20px 0',
                        boxShadow: '8px 10px 0px rgba(0, 0, 0, 0.25)',
                        fontSize: '1.3em',
                        fontWeight: '900',
                        fontFamily: "'Uni Sans', sans-serif",
                        fontStyle: 'italic',
                        color: colors.eventPrimary,
                        textAlign: 'center'
                    }}>
                        МОИ СОБЫТИЯ
                    </div>

                    {loading ? (
                        <div style={{
                            width: '90%',
                            margin: '0 auto',
                            backgroundColor: colors.white,
                            borderRadius: '20px 0 20px 0',
                            padding: '1.5em',
                            boxSizing: 'border-box',
                            boxShadow: '8px 10px 0px rgba(0, 0, 0, 0.25)',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                color: colors.eventPrimary,
                                fontSize: '1em',
                                fontWeight: '700',
                                fontFamily: "'Uni Sans', sans-serif",
                                fontStyle: 'italic'
                            }}>
                                Загрузка...
                            </div>
                        </div>
                    ) : myEvents.length > 0 ? (
                        <div style={{
                            width: '90%',
                            margin: '0 auto',
                            backgroundColor: colors.white,
                            borderRadius: '20px 0 20px 0',
                            boxShadow: '8px 10px 0px rgba(0, 0, 0, 0.25)',
                            overflow: 'hidden'
                        }}>
                            {myEvents.map((event, index) => (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    onClick={() => navigate(`/events/${event.id}/detail`)}
                                    style={{
                                        padding: '1em 1.2em',
                                        borderBottom: index < myEvents.length - 1 ? `1px solid ${colors.borderGrey}` : 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1em',
                                        transition: 'background-color 0.15s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = colors.backgroundGrey;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    {/* Event Image/Avatar */}
                                    <div style={{
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        flexShrink: 0,
                                        backgroundColor: colors.backgroundGrey
                                    }}>
                                        {event.image || event.picture ? (
                                            <img
                                                src={event.image || event.picture}
                                                alt={event.title}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: colors.textLight,
                                                fontSize: '24px',
                                                fontWeight: '700'
                                            }}>
                                                {(event.title || '?')[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    {/* Event Info */}
                                    <div style={{
                                        flex: 1,
                                        minWidth: 0
                                    }}>
                                        <div style={{
                                            fontSize: '1em',
                                            fontWeight: '600',
                                            color: colors.textDark,
                                            marginBottom: '0.3em',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {event.title}
                                        </div>
                                        <div style={{
                                            fontSize: '0.85em',
                                            color: colors.textLight,
                                            marginBottom: '0.2em',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4em'
                                        }}>
                                            <Calendar size={14} color={colors.eventPrimary} />
                                            <span>{event.date || 'Дата не указана'}</span>
                                        </div>
                                        {event.location && (
                                            <div style={{
                                                fontSize: '0.85em',
                                                color: colors.textLight,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.4em',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                <MapPin size={14} color={colors.eventPrimary} />
                                                <span>{event.location}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Attendees Count and Pending Requests */}
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-end',
                                        flexShrink: 0,
                                        gap: '0.5em'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-end',
                                            gap: '0.2em'
                                        }}>
                                            <div style={{
                                                fontSize: '0.9em',
                                                fontWeight: '600',
                                                color: colors.eventPrimary
                                            }}>
                                                {event.attendees?.length || 0}/{event.maxAttendees || '∞'}
                                            </div>
                                            <div style={{
                                                fontSize: '0.75em',
                                                color: colors.textLight
                                            }}>
                                                <Users size={12} color={colors.textLight} />
                                            </div>
                                        </div>
                                        {pendingRequestCounts[event.id] > 0 && (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.3em',
                                                backgroundColor: '#fbbf24',
                                                color: colors.white,
                                                padding: '0.3em 0.6em',
                                                borderRadius: '12px',
                                                fontSize: '0.75em',
                                                fontWeight: '700',
                                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)'
                                            }}>
                                                <Bell size={12} />
                                                <span>{pendingRequestCounts[event.id]}</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            width: '90%',
                            margin: '0 auto',
                            backgroundColor: colors.white,
                            borderRadius: '20px 0 20px 0',
                            padding: '1.5em',
                            boxSizing: 'border-box',
                            boxShadow: '8px 10px 0px rgba(0, 0, 0, 0.25)',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                fontSize: '1.1em',
                                fontWeight: '700',
                                fontFamily: "'Uni Sans', sans-serif",
                                fontStyle: 'italic',
                                color: colors.eventPrimary,
                                marginBottom: '0.5em'
                            }}>
                                Нет событий
                            </div>
                            <div style={{
                                fontSize: '0.9em',
                                color: colors.textLight,
                                lineHeight: '1.5'
                            }}>
                                Вы ещё не создали ни одного события
                            </div>
                        </div>
                    )}
                </div>

                {/* Accepted Requests Section */}
                <div style={{
                    width: '100%',
                    marginTop: '2em',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <div style={{
                        width: '90%',
                        margin: '0 auto 1em',
                        padding: '0.8em 1em',
                        backgroundColor: colors.white,
                        borderRadius: '20px 0 20px 0',
                        boxShadow: '8px 10px 0px rgba(0, 0, 0, 0.25)',
                        fontSize: '1.3em',
                        fontWeight: '900',
                        fontFamily: "'Uni Sans', sans-serif",
                        fontStyle: 'italic',
                        color: colors.eventPrimary,
                        textAlign: 'center'
                    }}>
                        ПРИНЯТЫЕ ЗАПРОСЫ
                    </div>

                    {loadingAccepted ? (
                        <div style={{
                            width: '90%',
                            margin: '0 auto',
                            backgroundColor: colors.white,
                            borderRadius: '20px 0 20px 0',
                            padding: '1.5em',
                            boxSizing: 'border-box',
                            boxShadow: '8px 10px 0px rgba(0, 0, 0, 0.25)',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                color: colors.eventPrimary,
                                fontSize: '1em',
                                fontWeight: '700',
                                fontFamily: "'Uni Sans', sans-serif",
                                fontStyle: 'italic'
                            }}>
                                Загрузка...
                            </div>
                        </div>
                    ) : acceptedRequests.length > 0 ? (
                        <div style={{
                            width: '90%',
                            margin: '0 auto',
                            backgroundColor: colors.white,
                            borderRadius: '20px 0 20px 0',
                            boxShadow: '8px 10px 0px rgba(0, 0, 0, 0.25)',
                            overflow: 'hidden'
                        }}>
                            {acceptedRequests.map((event, index) => (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    onClick={() => setSelectedEvent(event)}
                                    style={{
                                        padding: '1em 1.2em',
                                        borderBottom: index < acceptedRequests.length - 1 ? `1px solid ${colors.borderGrey}` : 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1em',
                                        transition: 'background-color 0.15s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = colors.backgroundGrey;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    {/* Event Image/Avatar */}
                                    <div style={{
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        flexShrink: 0,
                                        backgroundColor: colors.backgroundGrey
                                    }}>
                                        {event.image || event.picture || event.creator_profile?.photos?.[0] ? (
                                            <img
                                                src={event.image || event.picture || event.creator_profile?.photos?.[0]}
                                                alt={event.title}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: colors.textLight,
                                                fontSize: '24px',
                                                fontWeight: '700'
                                            }}>
                                                {(event.title || '?')[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    {/* Event Info */}
                                    <div style={{
                                        flex: 1,
                                        minWidth: 0
                                    }}>
                                        <div style={{
                                            fontSize: '1em',
                                            fontWeight: '600',
                                            color: colors.textDark,
                                            marginBottom: '0.3em',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {event.title}
                                        </div>
                                        <div style={{
                                            fontSize: '0.85em',
                                            color: colors.textLight,
                                            marginBottom: '0.2em',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4em'
                                        }}>
                                            <Calendar size={14} color={colors.eventPrimary} />
                                            <span>{event.date || 'Дата не указана'}</span>
                                        </div>
                                        {event.location && (
                                            <div style={{
                                                fontSize: '0.85em',
                                                color: colors.textLight,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.4em',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                <MapPin size={14} color={colors.eventPrimary} />
                                                <span>
                                                    {event.location}
                                                    {event.creator_profile?.display_name && ` • ${event.creator_profile.display_name}`}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Attendees Count */}
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-end',
                                        flexShrink: 0,
                                        gap: '0.2em'
                                    }}>
                                        <div style={{
                                            fontSize: '0.9em',
                                            fontWeight: '600',
                                            color: colors.eventPrimary
                                        }}>
                                            {event.attendees?.length || 0}/{event.maxAttendees || '∞'}
                                        </div>
                                        <div style={{
                                            fontSize: '0.75em',
                                            color: colors.textLight
                                        }}>
                                            <Users size={12} color={colors.textLight} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            width: '90%',
                            margin: '0 auto',
                            backgroundColor: colors.white,
                            borderRadius: '20px 0 20px 0',
                            padding: '1.5em',
                            boxSizing: 'border-box',
                            boxShadow: '8px 10px 0px rgba(0, 0, 0, 0.25)',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                fontSize: '1.1em',
                                fontWeight: '700',
                                fontFamily: "'Uni Sans', sans-serif",
                                fontStyle: 'italic',
                                color: colors.eventPrimary,
                                marginBottom: '0.5em'
                            }}>
                                Нет запросов
                            </div>
                            <div style={{
                                fontSize: '0.9em',
                                color: colors.textLight,
                                lineHeight: '1.5'
                            }}>
                                Вы ещё не приняли ни одного запроса
                            </div>
                        </div>
                    )}
                </div>

                {/* Event Drawer */}
                <AnimatePresence>
                    {selectedEvent && (
                        <EventDrawer
                            event={selectedEvent}
                            onClose={() => setSelectedEvent(null)}
                            onLeave={handleLeaveEvent}
                            onDelete={handleDeleteEvent}
                            onEdit={handleEditEvent}
                            onDeleteParticipant={handleDeleteParticipant}
                            isOwner={isOwner(selectedEvent)}
                            onAttendeeClick={setSelectedAttendee}
                            onEventUpdate={handleEventUpdate}
                        />
                    )}
                </AnimatePresence>

                {/* Attendee Profile Drawer */}
                <AnimatePresence>
                    {selectedAttendee && (
                        <ProfileDrawer
                            profile={selectedAttendee}
                            onClose={() => setSelectedAttendee(null)}
                        />
                    )}
                </AnimatePresence>
            </div>
        </Page>
    );
}

