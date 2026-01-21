// Feed.jsx
import { Heart, X, Mail, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ProfileDrawer } from "./ProfileDrawer.jsx";
import { Page } from '@/components/Page.jsx';
import { EventInformation } from "./EventInformation.jsx";
import { Input, Button } from '@telegram-apps/telegram-ui';
import { feedService } from '@/services/api/feedService.js';
import { RUSSIAN_CITIES } from '@/data/russianCities.js';
import townHashMapping from '@/data/townHashMapping.json';

/**
 * Get town hash ID from town name
 * @param {string} townName - Town name
 * @returns {string|null} Town hash ID or null if not found
 */
const getTownHash = (townName) => {
  return townHashMapping[townName] || null;
};

export function Feed() {
  // Town filter state
  const [town, setTown] = useState('Москва');
  const [townSuggestions, setTownSuggestions] = useState([]);
  const [showTownSuggestions, setShowTownSuggestions] = useState(false);

  // Event state
  const [currentEvent, setCurrentEvent] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [noEventsAvailable, setNoEventsAvailable] = useState(false);

  // UI state
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [messageText, setMessageText] = useState("");

  // Helper function to fetch event from API without setting state
  const fetchEventData = async (abortSignal = null) => {
    if (!town || !town.trim()) {
      return null;
    }

    const townHash = getTownHash(town);
    if (!townHash) {
      return null;
    }

    try {
      const event = await feedService.getNextEvent(townHash, null, null, abortSignal);
      return event || null;
    } catch (err) {
      if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
        const isNotFound = 
          err.response?.status === 404 || 
          err.message?.includes('404') ||
          err.message?.includes('not found') ||
          err.message?.toLowerCase().includes('the requested resource was not found');
        
        // Return null for 404 (no more events), throw otherwise
        if (isNotFound) {
          return null;
        }
        throw err;
      }
      return null;
    }
  };

  // Fetch next event from API and update state
  const fetchNextEvent = async (abortSignal = null) => {
    if (!town || !town.trim()) {
      setError('Please select a town');
      return;
    }

    const townHash = getTownHash(town);
    if (!townHash) {
      setError('Invalid town selected');
      return;
    }

    try {
      setFetching(true);
      setError(null);
      setNoEventsAvailable(false);
      const event = await fetchEventData(abortSignal);
      if (event) {
        setCurrentEvent(event);
        setNoEventsAvailable(false);
      } else {
        setNoEventsAvailable(true);
        setCurrentEvent(null);
      }
    } catch (err) {
      console.log(err);
      if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
        const errorMessage = err.message || '';
        
        const isNotFound = 
          err.response?.status === 404 || 
          errorMessage.includes('404') ||
          errorMessage.includes('not found') ||
          errorMessage.toLowerCase().includes('the requested resource was not found');
        console.log(isNotFound);
        console.log(err.response?.status);
        console.log('fetchNextEvent error response:', err.response);
        // Handle 404 (no more events)
        if (isNotFound) {
          setNoEventsAvailable(true);
          setCurrentEvent(null);
          setError(null);
        } else {
          setError(err.response?.data?.message || err.message || 'Failed to load event');
          setNoEventsAvailable(false);
        }
      }
    } finally {
      if (!abortSignal?.aborted) {
        setFetching(false);
      }
    }
  };

  // Fetch event when town changes
  useEffect(() => {
    if (!town || !town.trim()) {
      setCurrentEvent(null);
      return;
    }

    const abortController = new AbortController();
    fetchNextEvent(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [town]);

  // Handle refresh
  const handleRefresh = () => {
    setError(null);
    setNoEventsAvailable(false);
    fetchNextEvent();
  };

  // Handle town input change
  const handleTownChange = (value) => {
    setTown(value);
    setError(null);
    setNoEventsAvailable(false);
    
    // Handle town autocomplete
    const filtered = value
      ? RUSSIAN_CITIES.filter(city => 
          city.toLowerCase().startsWith(value.toLowerCase())
        ).slice(0, 10) // Show max 10 suggestions
      : [];
    setTownSuggestions(filtered);
    setShowTownSuggestions(value.length > 0 && filtered.length > 0);
  };

  // Handle town selection from autocomplete
  const handleTownSelect = (selectedTown) => {
    setTown(selectedTown);
    setShowTownSuggestions(false);
    setTownSuggestions([]);
  };

  // Handle skip action
  const handleSkip = async () => {
    if (!currentEvent || animating || loading) return;

    try {
      setLoading(true);
      setAnimating(true);
      setSwipeDirection('left');

      // Record action and fetch next event in parallel
      const currentEventId = currentEvent.id;
      const actionPromise = feedService.recordAction(currentEventId, 'skip');
      const nextEventPromise = fetchEventData();

      // Wait for action to complete
      await actionPromise;

      // Wait for next event, then update state
      const nextEvent = await nextEventPromise;
      
      // Small delay to let exit animation start, then swap events
      window.setTimeout(() => {
        if (nextEvent) {
          setCurrentEvent(nextEvent);
          setNoEventsAvailable(false);
        } else {
          setCurrentEvent(null);
          setNoEventsAvailable(true);
        }
        setAnimating(false);
        setLoading(false);
        // Reset swipeDirection after enter animation completes
        window.setTimeout(() => {
          setSwipeDirection(null);
        }, 300);
      }, 150);
    } catch (err) {
      setAnimating(false);
      setSwipeDirection(null);
      setLoading(false);
      setError(err.message || 'Failed to skip event');
    }
  };

  // Handle like action
  const handleLike = async () => {
    if (!currentEvent || animating || loading) return;

    try {
      setLoading(true);
      setAnimating(true);
      setSwipeDirection('right');

      // Record action and fetch next event in parallel
      const currentEventId = currentEvent.id;
      const actionPromise = feedService.recordAction(currentEventId, 'like');
      const nextEventPromise = fetchEventData();

      // Wait for action to complete
      await actionPromise;

      // Wait for next event, then update state
      const nextEvent = await nextEventPromise;
      
      // Small delay to let exit animation start, then swap events
      window.setTimeout(() => {
        if (nextEvent) {
          setCurrentEvent(nextEvent);
          setNoEventsAvailable(false);
        } else {
          setCurrentEvent(null);
          setNoEventsAvailable(true);
        }
        setAnimating(false);
        setLoading(false);
        // Reset swipeDirection after enter animation completes
        window.setTimeout(() => {
          setSwipeDirection(null);
        }, 300);
      }, 150);
    } catch (err) {
      setAnimating(false);
      setSwipeDirection(null);
      setLoading(false);
      setError(err.message || 'Failed to like event');
    }
  };

  // Handle message popup - send like action with text
  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentEvent || animating || loading) return;

    const textToSend = messageText.trim();
    const eventId = currentEvent.id;

    try {
      setLoading(true);
      setShowMessagePopup(false);
      setMessageText("");
      setAnimating(true);
      setSwipeDirection('right');

      // Record action with text and fetch next event in parallel
      const actionPromise = feedService.recordAction(eventId, 'like', textToSend);
      const nextEventPromise = fetchEventData();

      // Wait for action to complete
      await actionPromise;

      // Wait for next event, then update state
      const nextEvent = await nextEventPromise;
      
      // Small delay to let exit animation start, then swap events
      window.setTimeout(() => {
        if (nextEvent) {
          setCurrentEvent(nextEvent);
          setNoEventsAvailable(false);
        } else {
          setCurrentEvent(null);
          setNoEventsAvailable(true);
        }
        setAnimating(false);
        setLoading(false);
        // Reset swipeDirection after enter animation completes
        window.setTimeout(() => {
          setSwipeDirection(null);
        }, 300);
      }, 150);
    } catch (err) {
      setAnimating(false);
      setSwipeDirection(null);
      setLoading(false);
      setError(err.message || 'Failed to send message');
      // Reopen popup on error so user can retry
      setShowMessagePopup(true);
      setMessageText(textToSend);
    }
  };

  const handleCancelMessage = () => {
    setShowMessagePopup(false);
    setMessageText("");
  };

  return (
    <Page>
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--tgui--secondary_bg_color)'
        }}
      >
        {/* Header */}
        <header style={{ padding: '24px 20px 8px', flexShrink: 0, textAlign: 'center' }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--tgui--text_color)', opacity: 0.5, margin: 0 }}>НАЛАДОНИ</h1>
        </header>

        {/* Town Filter Section */}
        <div style={{ padding: '12px 20px', position: 'relative', flexShrink: 0 }}>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: 500, 
            color: 'var(--tgui--hint_color)',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <MapPin size={16} />
            Town *
          </div>
          <Input
            value={town}
            onChange={(e) => handleTownChange(e.target.value)}
            onFocus={() => {
              if (town) {
                const filtered = RUSSIAN_CITIES.filter(city => 
                  city.toLowerCase().startsWith(town.toLowerCase())
                ).slice(0, 10);
                setTownSuggestions(filtered);
                setShowTownSuggestions(filtered.length > 0);
              }
            }}
            onBlur={() => {
              // Delay hiding suggestions to allow click on suggestion
              setTimeout(() => setShowTownSuggestions(false), 200);
            }}
            placeholder="Enter town"
            autoComplete="off"
          />
          {showTownSuggestions && townSuggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '20px',
              right: '20px',
              backgroundColor: 'var(--tgui--bg_color)',
              border: '1px solid var(--tgui--section_separator_color)',
              borderRadius: '12px',
              marginTop: '4px',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 1000,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              {townSuggestions.map((city, index) => (
                <div
                  key={index}
                  onClick={() => handleTownSelect(city)}
                  onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: index < townSuggestions.length - 1 ? '1px solid var(--tgui--section_separator_color)' : 'none',
                    fontSize: '14px',
                    color: 'var(--tgui--text_color)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--tgui--secondary_bg_color)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {city}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ 
            padding: '12px 20px', 
            color: 'var(--tgui--destructive_text_color)',
            fontSize: '14px',
            textAlign: 'center',
            flexShrink: 0
          }}>
            {error}
          </div>
        )}

        {/* Main area */}
        <main style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', padding: '0 16px 80px', justifyContent: 'center' }}>
          {noEventsAvailable && !fetching ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{
                padding: '24px',
                backgroundColor: 'var(--tgui--bg_color)',
                borderRadius: 16,
                maxWidth: 400,
                margin: '0 auto'
              }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--tgui--text_color)',
                  marginBottom: '8px'
                }}>
                  No New Events
                </div>
                <div style={{
                  fontSize: '14px',
                  color: 'var(--tgui--secondary_text_color)',
                  marginBottom: '20px'
                }}>
                  You've seen all available events for this town. There may be new events that you haven't seen yet. Check back later!
                </div>
                <Button
                  mode="filled"
                  size="l"
                  stretched
                  onClick={handleRefresh}
                  disabled={fetching}
                >
                  {fetching ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ width: '100%', maxWidth: 340, margin: '0 auto', aspectRatio: '3/4', maxHeight: 600 }}>
              <AnimatePresence mode="wait">
                {fetching && !currentEvent ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ padding: 20, textAlign: 'center', opacity: 0.5 }}
                  >
                    Loading event...
                  </motion.div>
                ) : currentEvent ? (
                  <motion.div
                    key={currentEvent.id}
                    initial={{ 
                      opacity: 0, 
                      x: swipeDirection === 'left' ? 120 : -120,
                      rotate: swipeDirection === 'left' ? 12 : -12
                    }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      rotate: 0
                    }}
                    exit={{ 
                      opacity: 0,
                      x: swipeDirection === 'left' ? -120 : 120,
                      rotate: swipeDirection === 'left' ? -12 : 12
                    }}
                    transition={{ 
                      duration: 0.3,
                      ease: "easeOut"
                    }}
                    style={{
                      width: '100%',
                      position: 'relative',
                      borderRadius: 24,
                      overflow: 'hidden',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: 'var(--tgui--bg_color)'
                    }}
                  >
                {/* Content - Dense Card */}
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--tgui--bg_color)' }}>
                  <EventInformation
                    event={currentEvent}
                    onAttendeeClick={setSelectedAttendee}
                    className="h-full"
                    variant="card"
                  />
                </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {/* Action Buttons - Only show when event exists */}
              {currentEvent && (
              <div style={{
                margin: '32px auto 0',
                width: '100%',
                maxWidth: 250,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 16,
                justifyItems: 'center'
              }}>
                <button
                  onClick={handleSkip}
                  disabled={loading || animating}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'white',
                    border: '1px solid rgba(0,0,0,0.05)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    cursor: (loading || animating) ? 'not-allowed' : 'pointer',
                    opacity: (loading || animating) ? 0.5 : 1,
                    transition: 'transform 0.1s'
                  }}
                  onMouseDown={(e) => !loading && !animating && (e.currentTarget.style.transform = 'scale(0.95)')}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <X size={32} color="#EF4444" />
                </button>
                <button
                  onClick={() => setShowMessagePopup(true)}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#E5E7EB',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                    transition: 'transform 0.1s'
                  }}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Mail size={28} color="#6B7280" />
                </button>
                <button
                  onClick={handleLike}
                  disabled={loading || animating}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #EC4899 0%, #E11D48 100%)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    cursor: (loading || animating) ? 'not-allowed' : 'pointer',
                    opacity: (loading || animating) ? 0.5 : 1,
                    transition: 'transform 0.1s',
                    border: 'none'
                  }}
                  onMouseDown={(e) => !loading && !animating && (e.currentTarget.style.transform = 'scale(0.95)')}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Heart size={32} color="white" fill="white" />
                </button>
              </div>
              )}
            </div>
          )}
        </main>

        {/* Message Popup */}
        <AnimatePresence>
          {showMessagePopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                padding: '0 20px'
              }}
              onClick={handleCancelMessage}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  backgroundColor: 'var(--tgui--bg_color)',
                  borderRadius: 16,
                  padding: 24,
                  width: '100%',
                  maxWidth: 400,
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 600, color: 'var(--tgui--text_color)' }}>
                  Send a Message
                </h3>
                <p style={{ margin: '0 0 16px 0', fontSize: 14, color: 'var(--tgui--secondary_text_color)' }}>
                  Introduce yourself to the event host
                </p>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message here..."
                  style={{
                    width: '100%',
                    minHeight: 120,
                    padding: 12,
                    borderRadius: 8,
                    border: '1px solid var(--tgui--section_separator_color)',
                    backgroundColor: 'var(--tgui--secondary_bg_color)',
                    color: 'var(--tgui--text_color)',
                    fontSize: 14,
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                />
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <button
                    onClick={handleCancelMessage}
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      borderRadius: 8,
                      border: '1px solid var(--tgui--section_separator_color)',
                      backgroundColor: 'var(--tgui--secondary_bg_color)',
                      color: 'var(--tgui--text_color)',
                      fontSize: 15,
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'opacity 0.2s'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      borderRadius: 8,
                      border: 'none',
                      background: messageText.trim() ? 'linear-gradient(135deg, #EC4899 0%, #E11D48 100%)' : 'var(--tgui--secondary_bg_color)',
                      color: messageText.trim() ? 'white' : 'var(--tgui--hint_color)',
                      fontSize: 15,
                      fontWeight: 500,
                      cursor: messageText.trim() ? 'pointer' : 'not-allowed',
                      transition: 'opacity 0.2s',
                      opacity: messageText.trim() ? 1 : 0.5
                    }}
                  >
                    Send
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Attendee Profile Drawer */}
        <AnimatePresence>
          {selectedAttendee && (
            <ProfileDrawer
              profile={{
                name: selectedAttendee.name,
                age: selectedAttendee.age,
                location: selectedAttendee.location || "New York, NY",
                distance: selectedAttendee.distance || "5",
                photos: selectedAttendee.photos || [selectedAttendee.image],
                bio: selectedAttendee.bio,
                work: selectedAttendee.work || "",
                education: selectedAttendee.education || "",
                interests: selectedAttendee.interests || [],
                customFields: selectedAttendee.customFields || [],
              }}
              onClose={() => setSelectedAttendee(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </Page>
  );
}
