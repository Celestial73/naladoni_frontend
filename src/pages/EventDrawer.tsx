import { X } from 'lucide-react';
import { Button, IconButton } from '@telegram-apps/telegram-ui';
import { Event, EventInformation, Attendee } from './EventInformation';

interface EventDrawerProps {
    event: Event;
    onClose: () => void;
    onLeave: (eventId: number) => void;
    onAttendeeClick?: (attendee: Attendee) => void;
}

export function EventDrawer({ event, onClose, onLeave, onAttendeeClick }: EventDrawerProps) {
    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                zIndex: 50,
                animation: 'fade-in 0.2s ease-out'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: 'var(--tgui--bg_color)',
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    width: '100%',
                    maxWidth: 430,
                    height: '85vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    animation: 'slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
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

                {/* Scrollable Content */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                    <EventInformation
                        event={event}
                        onAttendeeClick={onAttendeeClick}
                    />

                    <div style={{ padding: '0 20px 24px', marginTop: 16 }}>
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
                    </div>
                </div>
            </div>
        </div>
    );
}
