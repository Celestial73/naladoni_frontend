import { X } from 'lucide-react';
import { Button, IconButton, List, Section, Cell, Avatar } from '@telegram-apps/telegram-ui';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { EventInformation } from './EventInformation.jsx';
import { eventActionsService } from '@/services/api/eventActionsService.js';
import { eventsService } from '@/services/api/eventsService.js';
import { useDataCache } from '@/context/DataCacheProvider.jsx';

export function EventDrawer({ event, onClose, onLeave, onDelete, onEdit, onDeleteParticipant, isOwner = false, onAttendeeClick, onEventUpdate }) {
    const { eventsCache, updateEventsCache } = useDataCache();
    const [pendingLikes, setPendingLikes] = useState([]);
    const [loadingPendingLikes, setLoadingPendingLikes] = useState(false);
    const [errorPendingLikes, setErrorPendingLikes] = useState(null);
    const [processingAction, setProcessingAction] = useState(null);

    // Fetch pending likes when owner views their event
    useEffect(() => {
        if (!isOwner || !event?.id) {
            setPendingLikes([]);
            return;
        }

        const abortController = new AbortController();

        const fetchPendingLikes = async () => {
            try {
                setLoadingPendingLikes(true);
                setErrorPendingLikes(null);
                const likes = await eventActionsService.getPendingLikesForEvent(event.id, abortController.signal);
                if (!abortController.signal.aborted) {
                    setPendingLikes(likes || []);
                }
            } catch (err) {
                if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
                    if (!abortController.signal.aborted) {
                        setErrorPendingLikes(err.message || 'Failed to load pending requests');
                    }
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setLoadingPendingLikes(false);
                }
            }
        };

        fetchPendingLikes();

        return () => {
            abortController.abort();
        };
    }, [isOwner, event?.id]);

    const handleAcceptLike = async (eventActionId) => {
        try {
            setProcessingAction(eventActionId);
            await eventActionsService.acceptLike(eventActionId);
            
            // Remove from pending list
            const updatedPending = pendingLikes.filter((like) => like.id !== eventActionId);
            setPendingLikes(updatedPending);
            
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
            
            // Refresh event data to show new participant
            if (event?.id) {
                try {
                    const updatedEvent = await eventsService.getEvent(event.id);
                    if (onEventUpdate) {
                        onEventUpdate(updatedEvent);
                    }
                } catch (err) {
                    // Silently fail - event will refresh on next open
                }
            }
        } catch (err) {
            setErrorPendingLikes(err.message || 'Failed to accept request');
        } finally {
            setProcessingAction(null);
        }
    };

    const handleRejectLike = async (eventActionId) => {
        try {
            setProcessingAction(eventActionId);
            await eventActionsService.rejectLike(eventActionId);
            
            // Remove from pending list
            const updatedPending = pendingLikes.filter((like) => like.id !== eventActionId);
            setPendingLikes(updatedPending);
            
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
        } catch (err) {
            setErrorPendingLikes(err.message || 'Failed to reject request');
        } finally {
            setProcessingAction(null);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                zIndex: 50
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                style={{
                    backgroundColor: 'var(--tgui--bg_color)',
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    width: '100%',
                    maxWidth: 430,
                    height: '85vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Drag Handle & Close Button */}
                <div style={{ position: 'relative', padding: '16px 20px 8px', flexShrink: 0 }}>
                    <div style={{
                        width: 48,
                        height: 4,
                        backgroundColor: 'var(--tgui--secondary_hint_color)',
                        opacity: 0.3,
                        borderRadius: 99,
                        margin: '0 auto'
                    }} />
                    <div style={{ position: 'absolute', right: 20, top: 16 }}>
                        <IconButton size="s" mode="bezeled" onClick={onClose}>
                            <X size={20} />
                        </IconButton>
                    </div>
                </div>

                {/* Scrollable C0ntent */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                    <EventInformation
                        event={event}
                        onAttendeeClick={onAttendeeClick}
                        onDeleteParticipant={onDeleteParticipant}
                        isOwner={isOwner}
                    />

                    <div style={{ padding: '0 20px 24px', marginTop: 16 }}>
                        {isOwner ? (
                            <>
                                <Button
                                    mode="filled"
                                    size="l"
                                    stretched
                                    onClick={() => {
                                        onClose();
                                        onEdit?.(event.id);
                                    }}
                                    style={{ marginBottom: 12 }}
                                >
                                    Edit Event
                                </Button>
                                <Button
                                    mode="bezeled"
                                    size="l"
                                    stretched
                                    onClick={() => onDelete(event.id)}
                                    style={{ color: 'var(--tgui--destructive_text_color)' }}
                                >
                                    Delete Event
                                </Button>
                                <p style={{ textAlign: 'center', fontSize: 13, marginTop: 8, color: 'var(--tgui--hint_color)' }}>
                                    This action cannot be undone.
                                </p>
                            </>
                        ) : (
                            <>
                                <Button
                                    mode="bezeled"
                                    size="l"
                                    stretched
                                    onClick={() => onLeave(event.id)}
                                    style={{ color: 'var(--tgui--destructive_text_color)' }}
                                >
                                    Leave Event
                                </Button>
                                <p style={{ textAlign: 'center', fontSize: 13, marginTop: 8, color: 'var(--tgui--hint_color)' }}>
                                    You will be removed from the attendee list.
                                </p>
                            </>
                        )}
                    </div>

                    {/* Pending Requests Section - Only for ownerrs */}
                    {isOwner && (
                        <div style={{ padding: '0 20px 24px', borderTop: '1px solid var(--tgui--section_separator_color)', marginTop: 16 }}>
                            <List>
                                <Section header="Pending Requests">
                                    {loadingPendingLikes ? (
                                        <Cell description="Loading requests...">
                                            <div style={{ padding: 20, textAlign: 'center', opacity: 0.5 }}>
                                                Loading...
                                            </div>
                                        </Cell>
                                    ) : errorPendingLikes ? (
                                        <Cell description="Error loading requests">
                                            <div style={{ padding: 20, textAlign: 'center', color: 'var(--tgui--destructive_text_color)', fontSize: 13 }}>
                                                {errorPendingLikes}
                                            </div>
                                        </Cell>
                                    ) : pendingLikes.length === 0 ? (
                                        <Cell description="No pending requests">
                                            <div style={{ padding: 20, textAlign: 'center', opacity: 0.5, fontSize: 13 }}>
                                                No pending requests
                                            </div>
                                        </Cell>
                                    ) : (
                                        pendingLikes.map((like) => {
                                            const user = like.user || {};
                                            const userName = user.telegram_name || user.display_name || user.name || user.first_name || 'User';
                                            const userAvatar = user.photo_url || user.avatar || user.image;
                                            const isProcessing = processingAction === like.id;

                                            return (
                                                <Cell
                                                    key={like.id}
                                                    before={<Avatar src={userAvatar} size={40} />}
                                                    description={like.text ? like.text : undefined}
                                                    multiline={!!like.text}
                                                >
                                                    {userName}
                                                    <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                                                        <Button
                                                            mode="filled"
                                                            size="s"
                                                            onClick={() => handleAcceptLike(like.id)}
                                                            disabled={isProcessing}
                                                            style={{ flex: 1 }}
                                                        >
                                                            Accept
                                                        </Button>
                                                        <Button
                                                            mode="bezeled"
                                                            size="s"
                                                            onClick={() => handleRejectLike(like.id)}
                                                            disabled={isProcessing}
                                                            style={{ flex: 1, color: 'var(--tgui--destructive_text_color)' }}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </div>
                                                </Cell>
                                            );
                                        })
                                    )}
                                </Section>
                            </List>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
