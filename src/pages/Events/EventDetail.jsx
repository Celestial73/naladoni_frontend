import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, Check, X as XIcon, Edit, Trash2, RefreshCw } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Page } from '@/components/Layout/Page.jsx';
import { HalftoneBackground } from '@/components/HalftoneBackground.jsx';
import { EventInformation } from './EventInformation.jsx';
import { ProfileDrawer } from '../Profile/ProfileDrawer.jsx';
import { colors } from '@/constants/colors.js';
import { eventsService } from '@/services/api/eventsService.js';
import { eventActionsService } from '@/services/api/eventActionsService.js';
import { formatDateToDDMMYYYY } from '@/utils/dateFormatter.js';

export function EventDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    
    const [event, setEvent] = useState(null);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [error, setError] = useState(null);
    const [errorRequests, setErrorRequests] = useState(null);
    const [processingAction, setProcessingAction] = useState(null);
    const [selectedAttendee, setSelectedAttendee] = useState(null);
    const [isOwner, setIsOwner] = useState(false);

    // Fetch event details
    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        const abortController = new AbortController();

        const fetchEvent = async () => {
            try {
                setLoading(true);
                setError(null);
                const eventData = await eventsService.getEvent(id, abortController.signal);
                
                if (!abortController.signal.aborted) {
                    // Transform event data
                    const transformedEvent = {
                        id: eventData.id || eventData._id,
                        title: eventData.title,
                        date: formatDateToDDMMYYYY(eventData.date) || '',
                        location: eventData.location,
                        description: eventData.description,
                        attendees: eventData.participants || eventData.attendees || [],
                        maxAttendees: eventData.capacity,
                        image: eventData.picture || eventData.image || eventData.imageUrl || eventData.creator_profile?.photo_url || null,
                        picture: eventData.picture || '',
                        creator_profile: eventData.creator_profile,
                    };
                    
                    setEvent(transformedEvent);
                    
                    // Check if current user is the owner
                    // This would need to be checked against the current user's ID
                    // For now, we'll fetch pending requests to determine ownership
                    setIsOwner(true); // Will be updated when we check ownership
                }
            } catch (err) {
                if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
                    if (!abortController.signal.aborted) {
                        setError(err.message || 'Не удалось загрузить событие');
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
    }, [id]);

    // Fetch pending requests if owner
    useEffect(() => {
        if (!isOwner || !event?.id || loading) {
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
                }
            } catch (err) {
                if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
                    if (!abortController.signal.aborted) {
                        // If we get 403 or similar, user is not owner
                        if (err.response?.status === 403 || err.response?.status === 404) {
                            setIsOwner(false);
                        } else {
                            setErrorRequests(err.message || 'Не удалось загрузить запросы');
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
    }, [isOwner, event?.id, loading]);

    const handleAcceptRequest = async (eventActionId) => {
        try {
            setProcessingAction(eventActionId);
            setErrorRequests(null);
            await eventActionsService.acceptLike(eventActionId);
            
            // Remove from pending list
            setPendingRequests((prev) => prev.filter((req) => req.id !== eventActionId));
            
            // Refresh event data to show new participant
            if (event?.id) {
                try {
                    const updatedEventData = await eventsService.getEvent(event.id);
                    const transformedEvent = {
                        id: updatedEventData.id || updatedEventData._id,
                        title: updatedEventData.title,
                        date: formatDateToDDMMYYYY(updatedEventData.date) || '',
                        location: updatedEventData.location,
                        description: updatedEventData.description,
                        attendees: updatedEventData.participants || updatedEventData.attendees || [],
                        maxAttendees: updatedEventData.capacity,
                        image: updatedEventData.picture || updatedEventData.image || updatedEventData.imageUrl || updatedEventData.creator_profile?.photo_url || null,
                        picture: updatedEventData.picture || '',
                        creator_profile: updatedEventData.creator_profile,
                    };
                    setEvent(transformedEvent);
                } catch (err) {
                    // Silently fail - event will refresh on next load
                }
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
            setPendingRequests((prev) => prev.filter((req) => req.id !== eventActionId));
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
            
            // Update event attendees
            setEvent((prev) => ({
                ...prev,
                attendees: prev.attendees?.filter(
                    (attendee) => (attendee.id || attendee.user) !== participantId
                ) || []
            }));
        } catch (err) {
            setError(err.message || 'Не удалось удалить участника');
        }
    };

    const handleDeleteEvent = async () => {
        if (!event?.id) return;
        
        if (!window.confirm('Вы уверены, что хотите удалить это событие?')) {
            return;
        }
        
        try {
            await eventsService.deleteEvent(event.id);
            navigate('/events');
        } catch (err) {
            setError(err.message || 'Не удалось удалить событие');
        }
    };

    const handleRefresh = async () => {
        if (!event?.id) return;
        
        setError(null);
        setErrorRequests(null);
        setLoading(true);
        setLoadingRequests(true);
        
        try {
            const [eventData, requestsData] = await Promise.all([
                eventsService.getEvent(event.id),
                isOwner ? eventActionsService.getPendingLikesForEvent(event.id) : Promise.resolve([])
            ]);
            
            const transformedEvent = {
                id: eventData.id || eventData._id,
                title: eventData.title,
                date: formatDateToDDMMYYYY(eventData.date) || '',
                location: eventData.location,
                description: eventData.description,
                attendees: eventData.participants || eventData.attendees || [],
                maxAttendees: eventData.capacity,
                image: eventData.picture || eventData.image || eventData.imageUrl || eventData.creator_profile?.photo_url || null,
                picture: eventData.picture || '',
                creator_profile: eventData.creator_profile,
            };
            
            setEvent(transformedEvent);
            if (isOwner) {
                setPendingRequests(requestsData || []);
            }
        } catch (err) {
            setError(err.message || 'Не удалось обновить данные');
        } finally {
            setLoading(false);
            setLoadingRequests(false);
        }
    };

    // Loading state
    if (loading && !event) {
        return (
            <Page>
                <div style={{
                    backgroundColor: colors.eventPrimary,
                    minHeight: '100vh',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                }}>
                    <HalftoneBackground color={colors.eventPrimaryDark} />
                    <div style={{
                        position: 'relative',
                        zIndex: 1,
                        color: colors.white,
                        textAlign: 'center',
                        fontSize: '1.2em',
                        fontWeight: '700',
                        fontFamily: "'Uni Sans', sans-serif",
                        fontStyle: 'italic'
                    }}>
                        Загрузка события...
                    </div>
                </div>
            </Page>
        );
    }

    // Error state
    if (error && !event) {
        return (
            <Page>
                <div style={{
                    backgroundColor: colors.eventPrimary,
                    minHeight: '100vh',
                    width: '100%',
                    padding: '2%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                }}>
                    <HalftoneBackground color={colors.eventPrimaryDark} />
                    <div style={{
                        position: 'relative',
                        zIndex: 1,
                        width: '90%',
                        backgroundColor: colors.white,
                        borderRadius: '20px 0 20px 0',
                        padding: '2em',
                        boxShadow: '8px 10px 0px rgba(0, 0, 0, 0.25)',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            fontSize: '1.2em',
                            fontWeight: '700',
                            color: '#c0392b',
                            marginBottom: '1em'
                        }}>
                            Ошибка
                        </div>
                        <div style={{
                            fontSize: '0.95em',
                            color: colors.textDark,
                            marginBottom: '1.5em'
                        }}>
                            {error}
                        </div>
                        <button
                            onClick={() => navigate('/events')}
                            style={{
                                padding: '0.8em 2em',
                                backgroundColor: colors.eventPrimary,
                                color: colors.white,
                                border: 'none',
                                borderRadius: '16px',
                                fontSize: '1em',
                                fontWeight: '700',
                                cursor: 'pointer',
                                boxShadow: '4px 6px 0px rgba(0, 0, 0, 0.25)'
                            }}
                        >
                            Вернуться к событиям
                        </button>
                    </div>
                </div>
            </Page>
        );
    }

    if (!event) {
        return null;
    }

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

                {/* Back button */}
                <button
                    onClick={() => navigate('/events')}
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
                        cursor: 'pointer',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)',
                        transition: 'transform 0.1s'
                    }}
                    onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
                    onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                    <ArrowLeft size={22} color={colors.eventPrimary} />
                </button>

                {/* Action buttons for owner */}
                {isOwner && (
                    <>
                        <button
                            onClick={handleRefresh}
                            disabled={loading || loadingRequests}
                            style={{
                                position: 'fixed',
                                top: '1em',
                                right: '4.5em',
                                zIndex: 10,
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                backgroundColor: colors.white,
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: (loading || loadingRequests) ? 'not-allowed' : 'pointer',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)',
                                opacity: (loading || loadingRequests) ? 0.6 : 1,
                                transition: 'transform 0.1s'
                            }}
                            onMouseDown={(e) => !loading && !loadingRequests && (e.currentTarget.style.transform = 'scale(0.92)')}
                            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            <RefreshCw size={22} color={colors.eventPrimary} />
                        </button>

                        <button
                            onClick={() => navigate(`/events/edit/${event.id}`)}
                            style={{
                                position: 'fixed',
                                top: '1em',
                                right: '8em',
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
                            <Edit size={22} color={colors.eventPrimary} />
                        </button>

                        <button
                            onClick={handleDeleteEvent}
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
                            <Trash2 size={22} color="#c0392b" />
                        </button>
                    </>
                )}

                {/* Error message */}
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

                {/* Event Information Card */}
                <div style={{
                    width: '90%',
                    marginTop: error ? '1em' : '4em',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <div style={{
                        backgroundColor: colors.white,
                        borderRadius: '47px 0 47px 0',
                        overflow: 'hidden',
                        boxShadow: `10px 14px 0px ${colors.eventPrimaryDark}`
                    }}>
                        <EventInformation
                            event={event}
                            variant="card"
                            onAttendeeClick={setSelectedAttendee}
                            onDeleteParticipant={isOwner ? handleDeleteParticipant : null}
                            isOwner={isOwner}
                        />
                    </div>
                </div>

                {/* Pending Requests Section - Only for owners */}
                {isOwner && (
                    <div style={{
                        width: '90%',
                        marginTop: '2em',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        <div style={{
                            width: '100%',
                            marginBottom: '1em',
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
                            ЗАПРОСЫ НА УЧАСТИЕ
                            {pendingRequests.length > 0 && (
                                <span style={{
                                    marginLeft: '0.5em',
                                    fontSize: '0.8em',
                                    backgroundColor: colors.eventPrimary,
                                    color: colors.white,
                                    padding: '0.2em 0.6em',
                                    borderRadius: '12px'
                                }}>
                                    {pendingRequests.length}
                                </span>
                            )}
                        </div>

                        {errorRequests && (
                            <div style={{
                                width: '100%',
                                padding: '0.75em 1em',
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '12px',
                                color: '#c0392b',
                                fontSize: '0.9em',
                                fontWeight: '500',
                                textAlign: 'center',
                                marginBottom: '1em',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                            }}>
                                {errorRequests}
                            </div>
                        )}

                        {loadingRequests ? (
                            <div style={{
                                width: '100%',
                                backgroundColor: colors.white,
                                borderRadius: '20px 0 20px 0',
                                padding: '2em 1.5em',
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
                                    Загрузка запросов...
                                </div>
                            </div>
                        ) : pendingRequests.length > 0 ? (
                            <div style={{
                                width: '100%',
                                backgroundColor: colors.white,
                                borderRadius: '20px 0 20px 0',
                                boxShadow: '8px 10px 0px rgba(0, 0, 0, 0.25)',
                                overflow: 'hidden'
                            }}>
                                {pendingRequests.map((request, index) => {
                                    const user = request.user || {};
                                    const userName = user.telegram_name || user.display_name || user.name || user.first_name || 'Пользователь';
                                    const userAvatar = user.photo_url || user.avatar || user.image;
                                    const isProcessing = processingAction === request.id;

                                    return (
                                        <motion.div
                                            key={request.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2, delay: index * 0.05 }}
                                            style={{
                                                padding: '1.2em',
                                                borderBottom: index < pendingRequests.length - 1 ? `1px solid ${colors.borderGrey}` : 'none',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '1em'
                                            }}
                                        >
                                            {/* User Info - Clickable */}
                                            <div 
                                                onClick={() => {
                                                    // Map user data to profile format
                                                    const userData = {
                                                        display_name: user.telegram_name || user.display_name || user.name || user.first_name || 'Пользователь',
                                                        name: user.name || user.display_name || user.telegram_name || user.first_name || 'Пользователь',
                                                        age: user.age,
                                                        photos: user.photos || (user.photo_url ? [user.photo_url] : []) || (user.avatar ? [user.avatar] : []) || (user.image ? [user.image] : []),
                                                        bio: user.bio || '',
                                                        interests: user.interests || [],
                                                        custom_fields: user.customFields || user.custom_fields || []
                                                    };
                                                    
                                                    // Use user ID for the route, fallback to a generated ID if not available
                                                    const userId = user.id || user.user_id || user.telegram_id || `user-${Date.now()}`;
                                                    navigate(`/user/${userId}`, { state: { userData } });
                                                }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1em',
                                                    cursor: 'pointer',
                                                    transition: 'opacity 0.15s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.opacity = '0.8';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.opacity = '1';
                                                }}
                                            >
                                                <div style={{
                                                    width: '56px',
                                                    height: '56px',
                                                    borderRadius: '50%',
                                                    overflow: 'hidden',
                                                    flexShrink: 0,
                                                    backgroundColor: colors.backgroundGrey
                                                }}>
                                                    {userAvatar ? (
                                                        <img
                                                            src={userAvatar}
                                                            alt={userName}
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
                                                            {(userName || '?')[0].toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{
                                                        fontSize: '1em',
                                                        fontWeight: '600',
                                                        color: colors.textDark,
                                                        marginBottom: '0.2em',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {userName}
                                                    </div>
                                                    {request.text && (
                                                        <div style={{
                                                            fontSize: '0.85em',
                                                            color: colors.textLight,
                                                            lineHeight: '1.4',
                                                            fontStyle: 'italic'
                                                        }}>
                                                            "{request.text}"
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div style={{
                                                display: 'flex',
                                                gap: '0.75em'
                                            }}>
                                                <button
                                                    onClick={() => handleAcceptRequest(request.id)}
                                                    disabled={isProcessing}
                                                    style={{
                                                        flex: 1,
                                                        padding: '0.8em',
                                                        backgroundColor: colors.eventPrimary,
                                                        color: colors.white,
                                                        border: 'none',
                                                        borderRadius: '14px',
                                                        fontSize: '0.95em',
                                                        fontWeight: '700',
                                                        fontFamily: "'Uni Sans', sans-serif",
                                                        fontStyle: 'italic',
                                                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                                                        opacity: isProcessing ? 0.6 : 1,
                                                        boxShadow: isProcessing ? 'none' : '4px 6px 0px rgba(0, 0, 0, 0.25)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.5em',
                                                        transition: 'transform 0.1s'
                                                    }}
                                                    onMouseDown={(e) => !isProcessing && (e.currentTarget.style.transform = 'scale(0.95)')}
                                                    onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                                >
                                                    <Check size={18} />
                                                    ПРИНЯТЬ
                                                </button>
                                                <button
                                                    onClick={() => handleRejectRequest(request.id)}
                                                    disabled={isProcessing}
                                                    style={{
                                                        flex: 1,
                                                        padding: '0.8em',
                                                        backgroundColor: colors.white,
                                                        color: '#c0392b',
                                                        border: `2px solid #c0392b`,
                                                        borderRadius: '14px',
                                                        fontSize: '0.95em',
                                                        fontWeight: '700',
                                                        fontFamily: "'Uni Sans', sans-serif",
                                                        fontStyle: 'italic',
                                                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                                                        opacity: isProcessing ? 0.6 : 1,
                                                        boxShadow: isProcessing ? 'none' : '4px 6px 0px rgba(0, 0, 0, 0.15)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.5em',
                                                        transition: 'transform 0.1s'
                                                    }}
                                                    onMouseDown={(e) => !isProcessing && (e.currentTarget.style.transform = 'scale(0.95)')}
                                                    onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                                >
                                                    <XIcon size={18} />
                                                    ОТКЛОНИТЬ
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{
                                width: '100%',
                                backgroundColor: colors.white,
                                borderRadius: '20px 0 20px 0',
                                padding: '2em 1.5em',
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
                                    Пока нет запросов на участие в этом событии
                                </div>
                            </div>
                        )}
                    </div>
                )}

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

