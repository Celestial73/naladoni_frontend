import { X } from 'lucide-react';
import { Button, IconButton } from '@telegram-apps/telegram-ui';
import { motion } from 'framer-motion';
import { EventInformation } from './EventInformation.jsx';

export function EventDrawer({ event, onClose, onLeave, onDelete, onEdit, onDeleteParticipant, isOwner = false, onAttendeeClick }) {
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
                </div>
            </motion.div>
        </motion.div>
    );
}
