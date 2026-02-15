import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, X } from "lucide-react";
import { colors } from '@/constants/colors.js';

/**
 * EventCard Component
 * Card variant for displaying event information with picture, description, and attendees
 * 
 * @param {Object} props
 * @param {Object} props.event - Event object to display
 * @param {boolean} props.showDescription - Whether to show the event description (default: true)
 * @param {string} props.className - Additional CSS class name
 * @param {Function} props.onAttendeeClick - Callback when an attendee is clicked
 * @param {Function} props.onDeleteParticipant - Callback when a participant is deleted (optional)
 * @param {boolean} props.isOwner - Whether the current user is the event owner
 */
export function EventCard({
    event,
    showDescription = true,
    className = "",
    onAttendeeClick,
    onDeleteParticipant,
    isOwner = false,
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
            custom_fields: attendee.customFields || attendee.custom_fields || [],
            background_color: attendee.background_color,
            telegram_username: attendee.telegram_username || (attendee.user && typeof attendee.user === 'object' ? attendee.user.telegram_username : null) || null,
        };
        
        // Use attendee ID for the route - prioritize profile_id from API response
        const userId = attendee.profile_id || attendee.id || attendee.user_id || `user-${Date.now()}`;
        navigate(`/user/${userId}`, { state: { userData } });
    };
    
    // Helper function to check if a participant is the event creator
    const isCreator = (participant) => {
        if (!event.creator_profile) return false;
        // Get creator user ID - can be string or object
        const creatorUser = event.creator_profile.user;
        const creatorUserId = typeof creatorUser === 'object' ? (creatorUser._id || creatorUser.id) : creatorUser;
        const creatorId = event.creator_profile.id || event.creator_profile.user_id || creatorUserId;
        
        // Get participant user ID - prioritize user_id from transformed structure
        const participantUserId = participant.user_id || 
                                  (typeof participant.user === 'object' ? (participant.user._id || participant.user.id) : participant.user) ||
                                  participant.profile_id || 
                                  participant.id;
        
        return creatorId && participantUserId && String(creatorId) === String(participantUserId);
    };

    const eventPicture = event.picture || event.image;
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isAttendeesExpanded, setIsAttendeesExpanded] = useState(false);

    return (
        <div className={`h-full ${className}`} style={{ 
            height: '100%', 
            background: '#fff', 
            display: 'flex', 
            flexDirection: 'column',
            boxSizing: 'border-box',
        }}>
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
                                        {event.description.length > 60 ? (
                                            <>
                                                {event.description.substring(0, 60)}
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
                                            </>
                                        ) : (
                                            event.description
                                        )}
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
                                    // Extract participant ID - prioritize profile_id from API response
                                    const participantId = attendee.profile_id ||
                                                         attendee.user_id || 
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
                                                            onDeleteParticipant(participantId);
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

