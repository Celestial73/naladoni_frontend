import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { EventDrawer } from './EventDrawer.jsx';
import { ProfileDrawer } from '../Profile/ProfileDrawer.jsx';
import { Page } from '@/components/Layout/Page.jsx';
import { eventsService } from '@/services/api/eventsService.js';
import { formatDateToDDMMYYYY } from '@/utils/dateFormatter.js';
import {
  List,
  Section,
  Cell,
  Button,
  Avatar
} from '@telegram-apps/telegram-ui';

export function Events() {
  const navigate = useNavigate();
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [loadingAccepted, setLoadingAccepted] = useState(true);
  const [errorAccepted, setErrorAccepted] = useState(null);
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

  useEffect(() => {
    const abortController = new AbortController();

    const fetchAcceptedEvents = async () => {
      try {
        setLoadingAccepted(true);
        setErrorAccepted(null);
        const events = await eventsService.getAcceptedEvents(abortController.signal);
        setAcceptedRequests(events);
      } catch (err) {
        if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
          setErrorAccepted(err.message || 'Failed to load accepted events');
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoadingAccepted(false);
        }
      }
    };

    fetchAcceptedEvents();

    return () => {
      abortController.abort();
    };
  }, []);

  const handleLeaveEvent = async (eventId) => {
    try {
      await eventsService.leaveEvent(eventId);
      setAcceptedRequests((prev) => prev.filter((e) => e.id !== eventId));
      setSelectedEvent(null);
    } catch (err) {
      setErrorAccepted(err.message || 'Failed to leave event');
    }
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
          {loadingAccepted ? (
            <div style={{ padding: 20, textAlign: 'center', opacity: 0.5 }}>
              Loading accepted events...
            </div>
          ) : errorAccepted ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--tgui--destructive_text_color)' }}>
              {errorAccepted}
            </div>
          ) : acceptedRequests.length > 0 ? (
            acceptedRequests.map((event) => (
              <Cell
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                before={<Avatar src={event.image || event.creator_profile?.photos?.[0]} size={48} />}
                description={event.date || ''}
                after={
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: 12, opacity: 0.6 }}>
                    <span>{event.attendees?.length || 0}/{event.maxAttendees}</span>
                    <span>Guests</span>
                  </div>
                }
              >
                {event.title}
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                  {event.location}
                  {event.creator_profile?.display_name && ` • Host: ${event.creator_profile.display_name}`}
                </div>
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

      {/* Attendee Profile Drawe4r */}
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
