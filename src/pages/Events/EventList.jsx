import { motion } from 'framer-motion';
import { Calendar, Users, Bell } from 'lucide-react';
import { colors } from '@/constants/colors.js';

/**
 * EventList Component
 * Reusable component for displaying a list of events
 * 
 * @param {Object} props
 * @param {Array} props.events - Array of event objects to display
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onEventClick - Callback when an event is clicked (receives event object)
 * @param {Object} props.pendingRequestCounts - Optional object mapping event IDs to pending request counts
 * @param {string} props.emptyTitle - Title for empty state
 * @param {string} props.emptyMessage - Message for empty state
 */
export function EventList({
    events,
    loading,
    onEventClick,
    pendingRequestCounts = {},
    emptyTitle = 'Нет событий',
    emptyMessage = 'События не найдены'
}) {
    if (loading) {
        return (
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
        );
    }

    if (events.length === 0) {
        return (
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
                    {emptyTitle}
                </div>
                <div style={{
                    fontSize: '0.9em',
                    color: colors.textLight,
                    lineHeight: '1.5'
                }}>
                    {emptyMessage}
                </div>
            </div>
        );
    }

    return (
        <div style={{
            width: '90%',
            margin: '0 auto',
            backgroundColor: colors.white,
            borderRadius: '20px 0 20px 0',
            boxShadow: '8px 10px 0px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
        }}>
            {events.map((event, index) => (
                <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    onClick={() => onEventClick(event)}
                    style={{
                        padding: '1em 1.2em',
                        borderBottom: index < events.length - 1 ? `1px solid ${colors.borderGrey}` : 'none',
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
                        {event.image || event.picture || event.creator_profile?.images?.[0] ? (
                            <img
                                src={event.image || event.picture || event.creator_profile?.images?.[0]}
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
                    </div>

                    {/* Attendees Count and Pending Requests */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        flexShrink: 0,
                        gap: pendingRequestCounts[event.id] > 0 ? '0.5em' : '0.2em'
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
                                {event.attendees?.length || 0}
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
    );
}

