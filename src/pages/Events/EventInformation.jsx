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
