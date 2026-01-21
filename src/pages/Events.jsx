import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { EventDrawer } from './EventDrawer.jsx';
import { ProfileDrawer } from './ProfileDrawer.jsx';
import { Page } from '@/components/Page.jsx';
import { eventsService } from '@/services/api/eventsService.js';
import { formatDateToDDMMYYYY } from '@/utils/dateFormatter.js';
import {
  List,
  Section,
  Cell,
  Button,
  Avatar
} from '@telegram-apps/telegram-ui';

const initialAcceptedRequests = [
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
  const navigate = useNavigate();
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acceptedRequests, setAcceptedRequests] = useState(initialAcceptedRequests);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedAttendee, setSelectedAttendee] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const events = await eventsService.getMyEvents(abortController.signal);
        setMyEvents(events);
      } catch (err) {
        if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
          setError(err.message || 'Failed to load events');
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchEvents();

    return () => {
      abortController.abort();
    };
  }, []);

  const handleLeaveEvent = (eventId) => {
    // In a real app, this would make an API call
    setAcceptedRequests((prev) => prev.filter((e) => e.id !== eventId));
    setSelectedEvent(null);
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await eventsService.deleteEvent(eventId);
      // Remove the event from the list
      setMyEvents((prev) => prev.filter((e) => e.id !== eventId));
      setSelectedEvent(null);
      // Optionally refetch events to ensure consistency
      const events = await eventsService.getMyEvents();
      setMyEvents(events);
    } catch (err) {
      setError(err.message || 'Failed to delete event');
    }
  };

  const handleEditEvent = (eventId) => {
    navigate(`/events/edit/${eventId}`);
  };

  const handleDeleteParticipant = async (eventId, participantId) => {
    try {
      await eventsService.deleteParticipant(eventId, participantId);
      
      // Update the event in the list to remove the participant
      setMyEvents((prev) => 
        prev.map((event) => {
          if (event.id === eventId) {
            return {
              ...event,
              attendees: event.attendees?.filter(
                (attendee) => (attendee.id || attendee.user) !== participantId
              ) || []
            };
          }
          return event;
        })
      );
      
      // Update selectedEvent if it's the same event
      if (selectedEvent && selectedEvent.id === eventId) {
        setSelectedEvent((prev) => ({
          ...prev,
          attendees: prev.attendees?.filter(
            (attendee) => (attendee.id || attendee.user) !== participantId
          ) || []
        }));
      }
    } catch (err) {
      setError(err.message || 'Failed to remove participant');
    }
  };

  const handleEventUpdate = async (updatedEventData) => {
    // Transform the event data to match the UI format
    const transformEvent = (apiEvent) => {
      return {
        id: apiEvent.id || apiEvent._id,
        title: apiEvent.title,
        date: formatDateToDDMMYYYY(apiEvent.date) || '',
        location: apiEvent.location,
        description: apiEvent.description,
        attendees: apiEvent.participants || apiEvent.attendees || [],
        maxAttendees: apiEvent.capacity,
        image: apiEvent.image || apiEvent.imageUrl || apiEvent.creator_profile?.photo_url || null,
        creator_profile: apiEvent.creator_profile,
      };
    };

    const transformedEvent = transformEvent(updatedEventData);

    // Update the event in the myEvents list
    setMyEvents((prev) =>
      prev.map((event) => {
        if (event.id === transformedEvent.id) {
          return transformedEvent;
        }
        return event;
      })
    );

    // Update selectedEvent if it's the same event
    if (selectedEvent && selectedEvent.id === transformedEvent.id) {
      setSelectedEvent(transformedEvent);
    }
  };

  return (
    <Page>
      <List>
        {/* Section 1: My Events */}
        <Section
          header={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>My Events</span>
              <Button 
                mode="plain" 
                size="s" 
                before={<Plus size={16} />}
                onClick={() => navigate('/events/create')}
              >
                Create
              </Button>
            </div>
          }
        >
          {loading ? (
            <div style={{ padding: 20, textAlign: 'center', opacity: 0.5 }}>
              Loading events...
            </div>
          ) : error ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--tgui--destructive_text_color)' }}>
              {error}
            </div>
          ) : myEvents.length > 0 ? (
            myEvents.map((event) => (
              <Cell
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                before={<Avatar src={event.image} size={48} />}
                description={event.date || ''}
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
      <AnimatePresence>
        {selectedEvent && (
          <EventDrawer
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onLeave={handleLeaveEvent}
            onDelete={handleDeleteEvent}
            onEdit={handleEditEvent}
            onDeleteParticipant={handleDeleteParticipant}
            isOwner={myEvents.some(e => e.id === selectedEvent.id)}
            onAttendeeClick={setSelectedAttendee}
            onEventUpdate={handleEventUpdate}
          />
        )}
      </AnimatePresence>

      {/* Attendee Profile Drawer */}
      <AnimatePresence>
        {selectedAttendee && (
          <ProfileDrawer
            profile={selectedAttendee}
            onClose={() => setSelectedAttendee(null)}
          />
        )}
      </AnimatePresence>
    </Page>
  );
}
