import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, X } from "lucide-react";
import { colors } from '@/constants/colors.js';

export function EventInformation({
    event,
    showDescription = true,
    className = "",
    onAttendeeClick,
    onDeleteParticipant,
    isOwner = false,
    variant = 'default',
}) {
    const navigate = useNavigate();
    const attendeesCount = event.attendees?.length ?? event.maxAttendees ?? 0;
    
    // Handle attendee click - navigate to user profile page
    const handleAttendeeClick = (attendee) => {
        // Map attendee data to profile format
        const userData = {
            display_name: attendee.display_name || attendee.name,
            name: attendee.name || attendee.display_name,
            age: attendee.age,
            photos: attendee.photos || (attendee.photo_url ? [attendee.photo_url] : []) || (attendee.image ? [attendee.image] : []),
            bio: attendee.bio || '',
            interests: attendee.interests || [],
            custom_fields: attendee.customFields || attendee.custom_fields || []
        };
        
        // Use attendee ID for the route, fallback to a generated ID if not available
        const userId = attendee.id || attendee.user_id || `user-${Date.now()}`;
        navigate(`/user/${userId}`, { state: { userData } });
    };
    
    // Helper function to check if a participant is the event creator
    const isCreator = (participant) => {
        if (!event.creator_profile) return false;
        const creatorId = event.creator_profile.id || event.creator_profile.user_id || event.creator_profile.user;
        const participantId = participant.id || participant.user_id || participant.user;
        return creatorId && participantId && creatorId === participantId;
    };

    const eventPicture = event.picture || event.image;
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isAttendeesExpanded, setIsAttendeesExpanded] = useState(false);

    if (variant === 'card') {
        return (
            <div className={`h-full ${className}`} style={{ height: '100%', background: '#fff', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Picture with overlaid title */}
                    {eventPicture ? (
                        <div style={{
                            position: 'relative',
                            width: '100%',
                            overflow: 'hidden'
                        }}>
                            <img
                                src={eventPicture}
                                alt={event.title}
                                style={{
                                    width: '100%',
                                    aspectRatio: '16 / 9',
                                    objectFit: 'cover',
                                    display: 'block'
                                }}
                            />
                            {/* Gradient overlay */}
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: '60%',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                                pointerEvents: 'none'
                            }} />
                            {/* Title overlay */}
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                padding: '12px 16px'
                            }}>
                                <div style={{
                                    fontSize: 20,
                                    fontWeight: 700,
                                    lineHeight: '1.2',
                                    color: '#fff',
                                    textShadow: '0 1px 4px rgba(0,0,0,0.5)'
                                }}>
                                    {event.title}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Header without picture */
                        <div style={{ marginTop: '10px', padding: '12px 16px' }}>
                            <div style={{ fontSize: 20, fontWeight: 700, lineHeight: '1.2', color: '#333' }}>
                                {event.title}
                            </div>
                        </div>
                    )}

                    {/* Description with vertical accent line */}
                    {showDescription && event.description && (
                        <div style={{
                            padding: '12px 20px',
                            flex: 1,
                            minHeight: 0,
                            overflow: 'hidden',
                            marginBottom: 0
                        }}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'stretch'
                            }}>
                                <div style={{
                                    width: 3,
                                    borderRadius: 2,
                                    backgroundColor: colors.feedPrimary,
                                    flexShrink: 0
                                }} />
                                <div style={{
                                    paddingLeft: '0.75em',
                                    fontSize: 15,
                                    lineHeight: '1.5',
                                    color: '#333',
                                    flex: 1
                                }}>
                                    {isDescriptionExpanded ? (
                                        <div>
                                            {event.description}
                                            <span
                                                onClick={() => setIsDescriptionExpanded(false)}
                                                style={{
                                                    color: colors.feedPrimary,
                                                    cursor: 'pointer',
                                                    marginLeft: '0.3em',
                                                    fontWeight: 500
                                                }}
                                            >
                                                меньше
                                            </span>
                                        </div>
                                    ) : (
                                        <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                                            <div style={{
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                wordBreak: 'break-word'
                                            }}>
                                                {event.description}
                                            </div>
                                            <span
                                                onClick={() => setIsDescriptionExpanded(true)}
                                                style={{
                                                    color: colors.feedPrimary,
                                                    cursor: 'pointer',
                                                    fontWeight: 500,
                                                    whiteSpace: 'nowrap',
                                                    marginLeft: '0.3em'
                                                }}
                                            >
                                                больше
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Dense Meta Info (Date, Location) */}
                    <div style={{ padding: '0 16px', marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {event.date && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f7f7f7', padding: '6px 12px', borderRadius: 12, fontSize: 13, fontWeight: 500 }}>
                                <Calendar size={16} color={colors.feedPrimary} />
                                <span style={{ color: '#333' }}>{event.date}</span>
                            </div>
                        )}
                        {event.location && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f7f7f7', padding: '6px 12px', borderRadius: 12, fontSize: 13, fontWeight: 500, maxWidth: '100%' }}>
                                <MapPin size={16} color={colors.feedPrimary} />
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#333' }}>{event.location}</span>
                            </div>
                        )}
                    </div>

                    {/* Attendees - Compact Footer */}
                    <div style={{ padding: '12px 20px', borderTop: '1px solid #eee' }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: '#999', marginBottom: 8, textTransform: 'uppercase' }}>
                        Кто идёт ({attendeesCount}):
                        </div>
                        {event.attendees && event.attendees.length > 0 && (
                            <>
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(5, 1fr)',
                                    gap: 8,
                                    marginBottom: event.attendees.length > 5 ? 8 : 0
                                }}>
                                    {(isAttendeesExpanded ? event.attendees : event.attendees.slice(0, 5)).map((attendee) => {
                                        // Extract participant ID - prioritize user ID fields, NOT attendee.id (which might be event ID or participation record ID)
                                        const participantId = attendee.user_id || 
                                                             attendee.participant_id ||
                                                             (typeof attendee.user === 'object' ? attendee.user?.id || attendee.user?.user_id : null) ||
                                                             (typeof attendee.user === 'string' || typeof attendee.user === 'number' ? attendee.user : null) ||
                                                             attendee.telegram_id ||
                                                             null;
                                        const participantIsCreator = isCreator(attendee);
                                        const attendeePhoto = attendee.profile?.photo_url || attendee.photo_url || attendee.image || attendee.photos?.[0];
                                        return (
                                            <div
                                                key={participantId}
                                                style={{ 
                                                    position: 'relative',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: 4
                                                }}
                                            >
                                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                                    <div
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAttendeeClick(attendee);
                                                        }}
                                                        style={{ 
                                                            cursor: 'pointer', 
                                                            width: 56,
                                                            height: 56,
                                                            borderRadius: '50%',
                                                            overflow: 'hidden'
                                                        }}
                                                    >
                                                        {attendeePhoto ? (
                                                            <img
                                                                src={attendeePhoto}
                                                                alt={attendee.display_name || attendee.name}
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
                                                                backgroundColor: '#ddd',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: '#999',
                                                                fontSize: 18
                                                            }}>
                                                                {(attendee.display_name || attendee.name || '?')[0].toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {isOwner && onDeleteParticipant && !participantIsCreator && participantId && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeleteParticipant(event.id, participantId);
                                                            }}
                                                            style={{
                                                                position: 'absolute',
                                                                top: -4,
                                                                right: -4,
                                                                backgroundColor: '#ef4444',
                                                                color: '#fff',
                                                                width: 20,
                                                                height: 20,
                                                                borderRadius: '50%',
                                                                border: 'none',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                cursor: 'pointer',
                                                                padding: 0,
                                                                zIndex: 10
                                                            }}
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {event.attendees.length > 5 && (
                                    <div style={{ textAlign: 'center', marginTop: 4 }}>
                                        <span
                                            onClick={() => setIsAttendeesExpanded(!isAttendeesExpanded)}
                                            style={{
                                                color: colors.feedPrimary,
                                                cursor: 'pointer',
                                                fontWeight: 500,
                                                fontSize: 13
                                            }}
                                        >
                                            {isAttendeesExpanded ? 'меньше' : `ещё ${event.attendees.length - 5}`}
                                        </span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Default variant (non-card)
    return (
        <div className={className}>
            <div>
                {/* Header Section */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee' }}>
                    <div style={{ fontSize: 18, fontWeight: 600, color: '#333' }}>{event.title}</div>
                </div>

                {/* Date and Location */}
                <div>
                    {event.date && (
                        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #eee' }}>
                            <Calendar size={20} color={colors.feedPrimary} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, color: '#999', marginBottom: 2 }}>Date</div>
                                <div style={{ fontSize: 15, color: '#333' }}>{event.date}</div>
                            </div>
                        </div>
                    )}
                    {event.location && (
                        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 12, borderBottom: '1px solid #eee' }}>
                            <MapPin size={20} color={colors.feedPrimary} style={{ flexShrink: 0, marginTop: 2 }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, color: '#999', marginBottom: 2 }}>Location</div>
                                <div style={{ fontSize: 15, color: '#333', lineHeight: '1.4' }}>{event.location}</div>
                            </div>
                        </div>
                    )}
                    <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #eee' }}>
                        <Users size={20} color={colors.feedPrimary} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, color: '#999', marginBottom: 2 }}>Attendees</div>
                            <div style={{ fontSize: 15, color: '#333' }}>{attendeesCount} people</div>
                        </div>
                    </div>
                </div>

                {/* Description Section */}
                {showDescription && event.description && (
                    <div style={{ borderBottom: '1px solid #eee' }}>
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee', fontSize: 14, fontWeight: 600, color: '#333' }}>
                            About
                        </div>
                        <div style={{ padding: '12px 16px' }}>
                            <div style={{ fontSize: 15, color: '#333', lineHeight: '1.5' }}>{event.description}</div>
                        </div>
                    </div>
                )}

                {/* Attendees Section */}
                {event.attendees && event.attendees.length > 0 && (
                    <div>
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee', fontSize: 14, fontWeight: 600, color: '#333' }}>
                            Who's Going
                        </div>
                        <div style={{ padding: '10px 20px', display: 'flex', gap: 10, overflowX: 'auto' }}>
                            {event.attendees.map((attendee) => {
                                // Extract participant ID - prioritize user ID fields, NOT attendee.id (which might be event ID or participation record ID)
                                console.log(attendee);
                                const participantId = attendee.user_id || 
                                                     attendee.participant_id ||
                                                     (typeof attendee.user === 'object' ? attendee.user?.id || attendee.user?.user_id : null) ||
                                                     (typeof attendee.user === 'string' || typeof attendee.user === 'number' ? attendee.user : null) ||
                                                     attendee.telegram_id ||
                                                     null;
                                const participantIsCreator = isCreator(attendee);
                                const attendeePhoto = attendee.profile?.photo_url || attendee.photo_url || attendee.image || attendee.photos?.[0];
                                return (
                                    <div
                                        key={participantId}
                                        style={{ 
                                            position: 'relative',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            flexShrink: 0
                                        }}
                                        onClick={() => handleAttendeeClick(attendee)}
                                    >
                                        <div style={{ position: 'relative', display: 'inline-block' }}>
                                            {attendeePhoto ? (
                                                <img
                                                    src={attendeePhoto}
                                                    alt={attendee.display_name || attendee.name}
                                                    style={{
                                                        width: 56,
                                                        height: 56,
                                                        borderRadius: '50%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: 56,
                                                    height: 56,
                                                    borderRadius: '50%',
                                                    backgroundColor: '#ddd',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#999',
                                                    fontSize: 20
                                                }}>
                                                    {(attendee.display_name || attendee.name || '?')[0].toUpperCase()}
                                                </div>
                                            )}
                                            {isOwner && onDeleteParticipant && !participantIsCreator && participantId && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteParticipant(event.id, participantId);
                                                    }}
                                                    style={{
                                                        position: 'absolute',
                                                        top: -4,
                                                        right: -4,
                                                        backgroundColor: '#ef4444',
                                                        color: '#fff',
                                                        width: 20,
                                                        height: 20,
                                                        borderRadius: '50%',
                                                        border: 'none',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        padding: 0
                                                    }}
                                                >
                                                    <X size={12} />
                                                </button>
                                            )}
                                        </div>
                                        <div style={{ fontSize: 10, marginTop: 4, maxWidth: 48, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {attendee.display_name || attendee.name}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Host Section */}
                {!event.attendees && event.host && (
                    <div style={{ padding: '12px 16px', borderTop: '1px solid #eee' }}>
                        <div style={{ fontSize: 12, color: '#999', marginBottom: 2 }}>Host</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                backgroundColor: '#ddd',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#999',
                                fontSize: 12
                            }}>
                                ?
                            </div>
                            <div style={{ fontSize: 15, color: '#333' }}>{event.host}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
