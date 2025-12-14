import { Calendar, Clock, MapPin, Users } from "lucide-react";
import {
    Avatar,
    Cell,
    List,
    Section,
} from '@telegram-apps/telegram-ui';

// Common interfaces
export interface Attendee {
    id: string;
    name: string;
    age: number;
    image: string;
    bio: string;
    location?: string;
    distance?: string;
    photos?: string[];
    work?: string;
    education?: string;
    interests?: Array<{ id: string; name: string; icon: string; color: string }>;
    customFields?: Array<{ id: string; name: string; value: string }>;
}

export interface Event {
    id: number;
    title: string;
    description?: string;
    date: string;
    time: string;
    location: string;
    image: string;
    attendees?: Attendee[];
    host?: string;
    maxAttendees?: number;
}

interface EventInformationProps {
    event: Event;
    showDescription?: boolean;
    className?: string;
    onAttendeeClick?: (attendee: Attendee) => void;
    variant?: 'default' | 'card';
}

export function EventInformation({
    event,
    showDescription = true,
    className = "",
    onAttendeeClick,
    variant = 'default',
}: EventInformationProps) {
    const attendeesCount = event.attendees?.length ?? event.maxAttendees ?? 0;
    const canClickAttendees = Boolean(onAttendeeClick);

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

                            {/* Dense Meta Info (Date, Time, Location) */}
                            <div style={{ padding: '0 16px', marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--tgui--secondary_bg_color)', padding: '6px 12px', borderRadius: 12, fontSize: 13, fontWeight: 500 }}>
                                    <Calendar size={16} className="text-pink-500" />
                                    <span>{event.date}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--tgui--secondary_bg_color)', padding: '6px 12px', borderRadius: 12, fontSize: 13, fontWeight: 500 }}>
                                    <Clock size={16} className="text-pink-500" />
                                    <span>{event.time}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--tgui--secondary_bg_color)', padding: '6px 12px', borderRadius: 12, fontSize: 13, fontWeight: 500, maxWidth: '100%' }}>
                                    <MapPin size={16} className="text-pink-500 shrink-0" />
                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.location}</span>
                                </div>
                            </div>

                            {/* Attendees - Compact Footer */}
                            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--tgui--section_separator_color)' }}>
                                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--tgui--subtitle_text_color)', marginBottom: 8, textTransform: 'uppercase' }}>
                                    Going ({attendeesCount})
                                </div>
                                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 mask-linear-fade" style={{ display: 'flex', overflowX: 'auto' }}>
                                    {event.attendees && event.attendees.map((attendee) => (
                                        <div
                                            key={attendee.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                canClickAttendees && onAttendeeClick?.(attendee);
                                            }}
                                            className="shrink-0"
                                            style={{ cursor: canClickAttendees ? 'pointer' : 'default' }}
                                        >
                                            <Avatar src={attendee.image} size={40} />
                                        </div>
                                    ))}
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
                    <Cell
                        before={<Calendar size={20} style={{ color: 'var(--tgui--link_color)' }} />}
                        description="Date"
                    >
                        {event.date}
                    </Cell>
                    <Cell
                        before={<Clock size={20} style={{ color: 'var(--tgui--link_color)' }} />}
                        description="Time"
                    >
                        {event.time}
                    </Cell>
                    <Cell
                        before={<MapPin size={20} style={{ color: 'var(--tgui--link_color)' }} />}
                        description="Location"
                        multiline
                    >
                        {event.location}
                    </Cell>

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
                            {event.attendees.map((attendee) => (
                                <div
                                    key={attendee.id}
                                    onClick={() => canClickAttendees && onAttendeeClick?.(attendee)}
                                    style={{ cursor: canClickAttendees ? 'pointer' : 'default', textAlign: 'center' }}
                                >
                                    <Avatar src={attendee.image} size={48} />
                                    <div style={{ fontSize: 10, marginTop: 4, maxWidth: 48, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {attendee.name}
                                    </div>
                                </div>
                            ))}
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
