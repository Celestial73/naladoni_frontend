import { Plus } from 'lucide-react';
import { useState } from 'react';
import { EventDrawer } from './EventDrawer';
import { Event, Attendee } from './EventInformation';
import { ProfileDrawer } from './ProfileDrawer';
import { Page } from '@/components/Page.tsx';
import {
  List,
  Section,
  Cell,
  Button,
  Avatar
} from '@telegram-apps/telegram-ui';

// ... (keep data the same)
const myEvents: Event[] = [
  {
    id: 1,
    title: "Board Game Night",
    date: "Friday, Dec 22",
    time: "7:00 PM",
    location: "The Dice & Cup",
    attendees: [],
    maxAttendees: 6,
    image: "https://images.unsplash.com/photo-1632501641765-e568d28b0015?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib2FyZCUyMGdhbWVzfGVufDF8fHx8MTc2NTY1NjAxNXww&ixlib=rb-4.1.0&q=80&w=1080",
  }
];

const initialAcceptedRequests: Event[] = [
  {
    id: 2,
    title: "Morning Yoga in the Park",
    date: "Saturday, Dec 23",
    time: "8:30 AM",
    location: "Central Park",
    host: "Jessica M.",
    maxAttendees: 10,
    image: "https://images.unsplash.com/photo-1544367563-12123d8965cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwb3V0ZG9vcnN8ZW58MXx8fHwxNzY1NjU2MDE1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    attendees: [
      { id: '5', name: 'Jessica', age: 27, image: 'https://images.unsplash.com/photo-1594318223885-20dc4b889f9e?w=150', bio: 'Yoga instructor and wellness coach' },
      { id: '6', name: 'David', age: 29, image: 'https://images.unsplash.com/photo-1695485121912-25c7ea05119c?w=150', bio: 'Fitness enthusiast' },
      { id: '7', name: 'Rachel', age: 25, image: 'https://images.unsplash.com/photo-1581065112742-eb9b90ecf0a3?w=150', bio: 'Meditation practitioner' },
    ]
  },
  {
    id: 3,
    title: "Photography Walk",
    date: "Sunday, Dec 24",
    time: "2:00 PM",
    location: "Brooklyn Bridge",
    host: "David K.",
    maxAttendees: 8,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaG90b2dyYXBoeSUyMHdhbGt8ZW58MXx8fHwxNzY1NjU2MDE1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    attendees: [
      { id: '11', name: 'Ryan', age: 26, image: 'https://images.unsplash.com/photo-1695485121912-25c7ea05119c?w=150', bio: 'Photographer' },
      { id: '12', name: 'Mia', age: 29, image: 'https://images.unsplash.com/photo-1594318223885-20dc4b889f9e?w=150', bio: 'Designer' },
    ]
  }
];

export function Events() {
  const [acceptedRequests, setAcceptedRequests] = useState<Event[]>(initialAcceptedRequests);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);

  const handleLeaveEvent = (eventId: number) => {
    // In a real app, this would make an API call
    setAcceptedRequests((prev) => prev.filter((e) => e.id !== eventId));
    setSelectedEvent(null);
  };

  return (
    <Page>
      <List>
        {/* Section 1: My Events */}
        <Section
          header={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>My Events</span>
              <Button mode="plain" size="s" before={<Plus size={16} />}>Create</Button>
            </div>
          }
        >
          {myEvents.length > 0 ? (
            myEvents.map((event) => (
              <Cell
                key={event.id}
                before={<Avatar src={event.image} size={48} />}
                description={`${event.date} • ${event.time}`}
                after={
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: 12, opacity: 0.6 }}>
                    <span>{event.attendees?.length || 0}/{event.maxAttendees}</span>
                    <span>Guests</span>
                  </div>
                }
              >
                {event.title}
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>{event.location}</div>
              </Cell>
            ))
          ) : (
            <div style={{ padding: 20, textAlign: 'center', opacity: 0.5 }}>
              You haven't created any events yet.
            </div>
          )}
        </Section>

        {/* Section 2: Accepted Requests */}
        <Section header="Accepted Requests">
          {acceptedRequests.length > 0 ? (
            acceptedRequests.map((event) => (
              <Cell
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                before={<Avatar src={event.image} size={48} />}
                description={`${event.date} • Host: ${event.host}`}
                after={<div style={{ fontSize: 12, color: 'var(--tgui--link_color)' }}>Joined</div>}
              >
                {event.title}
              </Cell>
            ))
          ) : (
            <div style={{ padding: 20, textAlign: 'center', opacity: 0.5 }}>
              No accepted requests yet.
            </div>
          )}
        </Section>
      </List>

      {/* Event Drawer */}
      {selectedEvent && (
        <EventDrawer
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onLeave={handleLeaveEvent}
          onAttendeeClick={setSelectedAttendee}
        />
      )}

      {/* Attendee Profile Drawer */}
      {selectedAttendee && (
        <ProfileDrawer
          profile={{
            name: selectedAttendee.name,
            age: selectedAttendee.age,
            location: selectedAttendee.location || 'New York, NY',
            distance: selectedAttendee.distance || '5',
            photos: selectedAttendee.photos || [selectedAttendee.image],
            bio: selectedAttendee.bio,
            work: selectedAttendee.work || '',
            education: selectedAttendee.education || '',
            interests: selectedAttendee.interests || [],
            customFields: selectedAttendee.customFields || [],
          }}
          onClose={() => setSelectedAttendee(null)}
        />
      )}
    </Page>
  );
}
