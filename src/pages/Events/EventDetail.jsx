import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, RefreshCw } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Page } from '@/components/Layout/Page.jsx';
import { HalftoneBackground } from '@/components/HalftoneBackground.jsx';
import { EventCard } from './EventCard.jsx';
import { ErrorMessage } from '@/components/ErrorMessage.jsx';
import { ProfileDrawer } from '../Profile/ProfileDrawer.jsx';
import { LoadingPage } from '@/components/LoadingPage.jsx';
import { CircleButton } from '@/components/CircleButton/CircleButton.jsx';
import { ActionButton } from '@/components/ActionButton/ActionButton.jsx';
import { PendingRequestsList } from '@/components/Events/PendingRequestsList.jsx';
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
                        profile_name: profile.profile_name || user.telegram_name || '',
                        age: profile.age,
                        bio: profile.bio || '',
                        images: profile.images || [],
                        image_url: profile.images?.[0] || user.image_url || null,
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
                capacity: eventData.capacity,
                image: eventData.image || eventData.creator_profile?.image_url || null,
                picture: eventData.image || '',
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
        return <LoadingPage text="Загрузка события..." />;
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
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1.5em'
                    }}>
                        <ErrorMessage message={error} width="100%" marginTop="0" />
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
                <CircleButton
                    icon={<ArrowLeft size={22} color={colors.eventPrimary} />}
                    onClick={() => navigate('/events')}
                    position="top-left"
                    size={50}
                />

                {/* Action buttons for owner */}
                {isOwner && (
                    <>
                        <CircleButton
                            icon={<RefreshCw size={22} color={colors.eventPrimary} />}
                            onClick={handleRefresh}
                            disabled={loading || loadingRequests}
                            position="custom"
                            top="1em"
                            right="calc(1em + 2 * 50px + 2 * 0.75em)"
                            size={50}
                        />
                        <CircleButton
                            icon={<Edit size={22} color={colors.eventPrimary} />}
                            onClick={() => navigate(`/events/edit/${event.id}`)}
                            position="custom"
                            top="1em"
                            right="calc(1em + 50px + 0.75em)"
                            size={50}
                        />
                        <CircleButton
                            icon={<Trash2 size={22} color="#c0392b" />}
                            onClick={handleDeleteEvent}
                            position="custom"
                            top="1em"
                            right="1em"
                            size={50}
                        />
                    </>
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
                        <ActionButton
                            onClick={handleLeaveEvent}
                            backgroundColor="#c0392b"
                            color={colors.white}
                        >
                            ПОКИНУТЬ СОБЫТИЕ
                        </ActionButton>
                    </div>
                )}

                {/* Pending Requests Section - Only for owners */}
                {isOwner && (
                    <PendingRequestsList
                        pendingRequests={pendingRequests}
                        errorRequests={errorRequests}
                        processingAction={processingAction}
                        onAcceptRequest={handleAcceptRequest}
                        onRejectRequest={handleRejectRequest}
                    />
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

