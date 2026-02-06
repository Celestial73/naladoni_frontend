import { Calendar, MapPin, Users, X } from "lucide-react";
import {
    Avatar,
    Cell,
    List,
    Section,
    IconButton,
} from '@telegram-apps/telegram-ui';

export function EventInformation({
    event,
    showDescription = true,
    className = "",
    onAttendeeClick,
    onDeleteParticipant,
    isOwner = false,
    variant = 'default',
}) {
    const attendeesCount = event.attendees?.length ?? event.maxAttendees ?? 0;
    const canClickAttendees = Boolean(onAttendeeClick);
    
    // Helper function to check if a participant is the event creator
    const isCreator = (participant) => {
        if (!event.creator_profile) return false;
        const creatorId = event.creator_profile.id || event.creator_profile.user_id || event.creator_profile.user;
        const participantId = participant.id || participant.user_id || participant.user;
        return creatorId && participantId && creatorId === participantId;
    };

    if (variant === 'card') {
        return (
            <div className={`h-full ${className}`}>
                <List style={{ height: '100%', background: 'var(--tgui--bg_color)' }}>
                    <Section style={{ height: '100%', display: 'flex', flexDirection: 'column', margin: 0 }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            {/* Header */}
                            <Cell
                                multiline
                                description={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                        <span style={{ color: 'var(--tgui--link_color)' }}>{attendeesCount} joined</span>
                                    </div>
                                }
                            >
                                <span style={{ fontSize: 20, fontWeight: 700, lineHeight: '1.2' }}>{event.title}</span>
                            </Cell>

                            {/* Description - Flexible height */}
                            {showDescription && event.description && (
                                <div style={{ padding: '0 20px', flex: 1, minHeight: 0, overflow: 'hidden', marginBottom: 12 }}>
                                    <div style={{
                                        fontSize: 15,
                                        lineHeight: '1.5',
                                        color: 'var(--tgui--text_color)',
                                        opacity: 0.8,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 10,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {event.description}
                                    </div>
                                </div>
                            )}

                            {/* Dense Meta Info (Date, Location) */}
                            <div style={{ padding: '0 16px', marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {event.date && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--tgui--secondary_bg_color)', padding: '6px 12px', borderRadius: 12, fontSize: 13, fontWeight: 500 }}>
                                        <Calendar size={16} className="text-pink-500" />
                                        <span>{event.date}</span>
                                    </div>
                                )}
                                {event.location && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--tgui--secondary_bg_color)', padding: '6px 12px', borderRadius: 12, fontSize: 13, fontWeight: 500, maxWidth: '100%' }}>
                                        <MapPin size={16} className="text-pink-500 shrink-0" />
                                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.location}</span>
                                    </div>
                                )}
                            </div>

                            {/* Attendees - Compact Footer */}
                            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--tgui--section_separator_color)' }}>
                                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--tgui--subtitle_text_color)', marginBottom: 8, textTransform: 'uppercase' }}>
                                    Going ({attendeesCount})
                                </div>
                                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 mask-linear-fade" style={{ display: 'flex', overflowX: 'auto' }}>
                                    {event.attendees && event.attendees.map((attendee) => {
                                        const participantId = attendee.id || attendee.user;
                                        const participantIsCreator = isCreator(attendee);
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
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        canClickAttendees && onAttendeeClick?.(attendee);
                                                    }}
                                                    className="shrink-0"
                                                    style={{ cursor: canClickAttendees ? 'pointer' : 'default', position: 'relative' }}
                                                >
                                                    <Avatar src={attendee.profile?.photo_url || attendee.photo_url || attendee.image || attendee.photos?.[0]} size={40} />
                                                    {isOwner && onDeleteParticipant && !participantIsCreator && (
                                                        <IconButton
                                                            size="xs"
                                                            mode="bezeled"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeleteParticipant(event.id, participantId);
                                                            }}
                                                            style={{
                                                                position: 'absolute',
                                                                top: -4,
                                                                right: -4,
                                                                backgroundColor: 'var(--tgui--destructive_bg_color)',
                                                                color: 'var(--tgui--destructive_text_color)',
                                                                width: 20,
                                                                height: 20,
                                                                padding: 0,
                                                                minWidth: 20
                                                            }}
                                                        >
                                                            <X size={12} />
                                                        </IconButton>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </Section>
                </List>
            </div>
        );
    }

    return (
        <div className={className}>
            <List>
                <Section header={event.title}>
                    {event.date && (
                        <Cell
                            before={<Calendar size={20} style={{ color: 'var(--tgui--link_color)' }} />}
                            description="Date"
                        >
                            {event.date}
                        </Cell>
                    )}
                    {event.location && (
                        <Cell
                            before={<MapPin size={20} style={{ color: 'var(--tgui--link_color)' }} />}
                            description="Location"
                            multiline
                        >
                            {event.location}
                        </Cell>
                    )}

                    <Cell
                        before={<Users size={20} style={{ color: 'var(--tgui--link_color)' }} />}
                        description="Attendees"
                    >
                        {attendeesCount} people
                    </Cell>
                </Section>

                {showDescription && event.description && (
                    <Section header="About">
                        <Cell multiline>{event.description}</Cell>
                    </Section>
                )}

                {event.attendees && event.attendees.length > 0 && (
                    <Section header="Who's Going">
                        <div style={{ padding: '10px 20px', display: 'flex', gap: 10, overflowX: 'auto' }}>
                            {event.attendees.map((attendee) => {
                                const participantId = attendee.id || attendee.user;
                                const participantIsCreator = isCreator(attendee);
                                return (
                                    <div
                                        key={participantId}
                                        style={{ 
                                            position: 'relative',
                                            textAlign: 'center',
                                            cursor: canClickAttendees ? 'pointer' : 'default'
                                        }}
                                        onClick={() => canClickAttendees && onAttendeeClick?.(attendee)}
                                    >
                                        <div style={{ position: 'relative', display: 'inline-block' }}>
                                            <Avatar src={attendee.profile?.photo_url || attendee.photo_url || attendee.image || attendee.photos?.[0]} size={48} />
                                            {isOwner && onDeleteParticipant && !participantIsCreator && (
                                                <IconButton
                                                    size="xs"
                                                    mode="bezeled"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteParticipant(event.id, participantId);
                                                    }}
                                                    style={{
                                                        position: 'absolute',
                                                        top: -4,
                                                        right: -4,
                                                        backgroundColor: 'var(--tgui--destructive_bg_color)',
                                                        color: 'var(--tgui--destructive_text_color)',
                                                        width: 20,
                                                        height: 20,
                                                        padding: 0,
                                                        minWidth: 20
                                                    }}
                                                >
                                                    <X size={12} />
                                                </IconButton>
                                            )}
                                        </div>
                                        <div style={{ fontSize: 10, marginTop: 4, maxWidth: 48, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {attendee.display_name || attendee.name}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Section>
                )}

                {!event.attendees && event.host && (
                    <Section>
                        <Cell before={<Avatar size={28} />} description="Host">
                            {event.host}
                        </Cell>
                    </Section>
                )}
            </List>
        </div>
    );
}
