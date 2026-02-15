import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, Check, X as XIcon, Edit, Trash2, RefreshCw } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Page } from '@/components/Layout/Page.jsx';
import { HalftoneBackground } from '@/components/HalftoneBackground.jsx';
import { EventCard } from './EventCard.jsx';
import { SectionTitle } from './SectionTitle.jsx';
import { ErrorMessage } from '@/components/ErrorMessage.jsx';
import { ProfileDrawer } from '../Profile/ProfileDrawer.jsx';
import { colors } from '@/constants/colors.js';
import { eventsService } from '@/api/services/eventsService.js';
import { eventActionsService } from '@/api/services/eventActionsService.js';
import { useEventDetail } from '@/hooks/useEventDetail.js';
import { useDataCache } from '@/context/DataCacheProvider.jsx';
import { formatDateToDDMMYYYY } from '@/utils/dateFormatter.js';

export function EventDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { updateEventsCache, eventsCache, clearEventsCache } = useDataCache();
    const [selectedAttendee, setSelectedAttendee] = useState(null);
    
    const {
        event,
        isOwner,
        pendingRequests,
        loading,
        loadingRequests,
        error,
        errorRequests,
        processingAction,
        refetchEvent,
        handleAcceptRequest: handleAcceptRequestFromHook,
        handleRejectRequest: handleRejectRequestFromHook,
        handleDeleteParticipant: handleDeleteParticipantFromHook
    } = useEventDetail(id);

    // Log event when component mounts or event changes
    useEffect(() => {
        if (event) {
            console.log('[EventDetail] Event data:', event);
        }
    }, [event]);

    // Wrapper to update cache when accepting/rejecting requests
    const handleAcceptRequest = async (eventActionId) => {
        await handleAcceptRequestFromHook(eventActionId);
        
        // Update cache: decrease pending request count for this event
        if (event?.id) {
            const currentCounts = eventsCache.pendingRequestCounts || {};
            const newCount = Math.max(0, (currentCounts[event.id] || 0) - 1);
            updateEventsCache({
                pendingRequestCounts: {
                    ...currentCounts,
                    [event.id]: newCount,
                },
            });
        }
        
        // Invalidate events cache to force refresh when navigating back
        // This ensures the events list shows updated participant counts
        clearEventsCache();
    };

    const handleRejectRequest = async (eventActionId) => {
        await handleRejectRequestFromHook(eventActionId);
        
        // Update cache: decrease pending request count for this event
        if (event?.id) {
            const currentCounts = eventsCache.pendingRequestCounts || {};
            const newCount = Math.max(0, (currentCounts[event.id] || 0) - 1);
            updateEventsCache({
                pendingRequestCounts: {
                    ...currentCounts,
                    [event.id]: newCount,
                },
            });
        }
    };

    const handleDeleteParticipant = async (participantId) => {
        try {
            await handleDeleteParticipantFromHook(participantId);
        } catch (err) {
            // Error is already handled by the hook
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

    const handleLeaveEvent = async () => {
        if (!event?.id) return;
        
        if (!window.confirm('Вы уверены, что хотите покинуть это событие?')) {
            return;
        }
        
        try {
            await eventsService.leaveEvent(event.id);
            // Update cache
            const updatedAccepted = (eventsCache.acceptedRequests || []).filter((e) => e.id !== event.id);
            updateEventsCache({
                acceptedRequests: updatedAccepted,
            });
            navigate('/events');
        } catch (err) {
            setError(err.message || 'Не удалось покинуть событие');
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
            
            // Transform participants from new API format (array of {profile, user}) to flat structure
            let attendees = [];
            if (eventData.participants && Array.isArray(eventData.participants)) {
                attendees = eventData.participants.map((participant) => {
                    const profile = participant.profile || {};
                    const user = participant.user || {};
                    return {
                        display_name: profile.display_name || user.telegram_name || '',
                        name: profile.display_name || user.telegram_name || '',
                        age: profile.age,
                        bio: profile.bio || '',
                        photos: profile.photos || [],
                        photo_url: profile.photos?.[0] || user.photo_url || null,
                        interests: profile.interests || [],
                        custom_fields: profile.custom_fields || [],
                        background_color: profile.background_color,
                        telegram_username: user.telegram_username || null,
                        profile_id: profile._id || profile.id,
                        user_id: user._id || user.id,
                        user: user,
                        profile: profile,
                    };
                });
            } else if (eventData.attendees && Array.isArray(eventData.attendees)) {
                // Fallback for old format
                attendees = eventData.attendees;
            }
            
            const transformedEvent = {
                id: eventData.id || eventData._id,
                title: eventData.title,
                date: formatDateToDDMMYYYY(eventData.date) || '',
                location: eventData.location,
                description: eventData.description,
                attendees: attendees,
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
                    <HalftoneBackground color={colors.eventPrimaryDark} pattern='waves' />
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
                    <HalftoneBackground color={colors.eventPrimaryDark} pattern='waves' />
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
                <HalftoneBackground color={colors.eventPrimaryDark} pattern='waves' />

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
                    <div style={{
                        position: 'fixed',
                        top: '1em',
                        right: '1em',
                        zIndex: 10,
                        display: 'flex',
                        gap: '0.75em',
                        alignItems: 'center'
                    }}>
                        <button
                            onClick={handleRefresh}
                            disabled={loading || loadingRequests}
                            style={{
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
                    </div>
                )}

                {/* Error message */}
                <ErrorMessage message={error} marginTop="4em" />

                {/* Event Information Card */}
                <div style={{
                    width: '90%',
                    marginTop: error ? '1em' : '4em',
                    position: 'relative',
                    zIndex: 1,
                    backgroundColor: colors.white,
                    borderRadius: '47px 0 47px 0',
                    overflow: 'hidden',
                    boxShadow: '8px 10px 0px rgba(0, 0, 0, 0.25)',
                }}>
                    <EventCard
                        event={event}
                        onAttendeeClick={setSelectedAttendee}
                        onDeleteParticipant={isOwner ? handleDeleteParticipant : null}
                        isOwner={isOwner}
                    />
                </div>

                {/* Leave Event Button - Only for non-owners */}
                {!isOwner && (
                    <div style={{
                        width: '90%',
                        marginTop: '2em',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        <button
                            onClick={handleLeaveEvent}
                            style={{
                                width: '100%',
                                padding: '1em',
                                backgroundColor: '#c0392b',
                                color: colors.white,
                                border: 'none',
                                borderRadius: '20px 0 20px 0',
                                fontSize: '1.1em',
                                fontWeight: '700',
                                fontFamily: "'Uni Sans', sans-serif",
                                fontStyle: 'italic',
                                cursor: 'pointer',
                                boxShadow: '8px 10px 0px rgba(0, 0, 0, 0.25)',
                                transition: 'transform 0.1s'
                            }}
                            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
                            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            ПОКИНУТЬ СОБЫТИЕ
                        </button>
                    </div>
                )}

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
                            position: 'relative'
                        }}>
                            <SectionTitle align="left" fontSize="2em">
                                ЗАПРОСЫ НА УЧАСТИЕ
                                {pendingRequests.length > 0 && (
                                    <span style={{
                                        marginLeft: '0.5em',
                                        fontSize: '0.8em',
                                        backgroundColor: colors.white,
                                        color: colors.eventPrimary,
                                        padding: '0.2em 0.6em',
                                        borderRadius: '12px',
                                        textShadow: 'none'
                                    }}>
                                        {pendingRequests.length}
                                    </span>
                                )}
                            </SectionTitle>
                        </div>

                        {errorRequests && (
                            <ErrorMessage message={errorRequests} width="100%" marginTop="0" marginBottom="1em" />
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
                                    // Extract user and profile from new API structure
                                    const user = request.user || {};
                                    const profile = request.profile || {};
                                    const profileUser = profile.user || {};
                                    
                                    // Get display name from profile
                                    const userName = profile.display_name || profileUser.telegram_name || profile.name || user.telegram_username || 'Пользователь';
                                    
                                    // Get avatar - prefer profile photos, then profile.user.photo_url
                                    const userAvatar = (profile.photos && profile.photos[0]) || profileUser.photo_url || profile.photo_url || null;
                                    
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
                                                    // Map user data to profile format from new API structure
                                                    // All profile information is in request.user.profile
                                                    const userData = {
                                                        display_name: profile.display_name || profileUser.telegram_name || profile.name || 'Пользователь',
                                                        name: profile.name || profile.display_name || profileUser.telegram_name || 'Пользователь',
                                                        age: profile.age,
                                                        photos: profile.photos || (profileUser.photo_url ? [profileUser.photo_url] : []) || [],
                                                        bio: profile.bio || '',
                                                        interests: profile.interests || [],
                                                        custom_fields: profile.custom_fields || [],
                                                        background_color: profile.background_color,
                                                        telegram_username: user.telegram_username || profileUser.telegram_username || null,
                                                    };
                                                    
                                                    // Use user ID from request.user.id
                                                    const userId = user.id || profileUser.id || `user-${Date.now()}`;
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
                                                            fontSize: '0.9em',
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
                                                        padding: '0.6em',
                                                        backgroundColor: colors.eventPrimary,
                                                        color: colors.white,
                                                        border: 'none',
                                                        borderRadius: '14px',
                                                        fontSize: '0.9em',
                                                        fontWeight: '700',
                                                        fontFamily: "'Uni Sans', sans-serif",
                                                        fontStyle: 'italic',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.4em',
                                                        transition: 'transform 0.1s'
                                                    }}
                                                    onMouseDown={(e) => !isProcessing && (e.currentTarget.style.transform = 'scale(0.95)')}
                                                    onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                                >
                                                    <Check size={16} />
                                                    ПРИНЯТЬ
                                                </button>
                                                <button
                                                    onClick={() => handleRejectRequest(request.id)}
                                                    disabled={isProcessing}
                                                    style={{
                                                        flex: 1,
                                                        padding: '0.6em',
                                                        backgroundColor: colors.white,
                                                        color: '#c0392b',
                                                        border: `2px solid #c0392b`,
                                                        borderRadius: '14px',
                                                        fontSize: '0.9em',
                                                        fontWeight: '700',
                                                        fontFamily: "'Uni Sans', sans-serif",
                                                        fontStyle: 'italic',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.4em',
                                                        transition: 'transform 0.1s'
                                                    }}
                                                    onMouseDown={(e) => !isProcessing && (e.currentTarget.style.transform = 'scale(0.95)')}
                                                    onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                                >
                                                    <XIcon size={16} />
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

