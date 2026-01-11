// Feed.jsx
import { Heart, X, Mail } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ProfileDrawer } from "./ProfileDrawer.jsx";
import { Page } from '@/components/Page.jsx';
import { EventInformation } from "./EventInformation.jsx";

const events = [
  {
    id: 1,
    title: "Wine Tasting Evening",
    description:
      "Join us for an elegant evening of wine tasting featuring local vineyards. We'll sample 5 different wines paired with artisanal cheeses. Perfect for wine enthusiasts and newcomers alike!",
    date: "Friday, Dec 15",
    time: "7:00 PM",
    location: "Downtown Vineyard",
    image: "https://i1.sndcdn.com/artworks-000076772850-gfnyiy-t500x500.jpg",
    attendees: [
      {
        id: "1",
        name: "Emma",
        age: 28,
        image: "https://images.unsplash.com/photo-1594318223885-20dc4b889f9e?w=150",
        bio: "Wine enthusiast and foodie. Love exploring new restaurants and trying different cuisines!",
        location: "Brooklyn, NY",
        distance: "3",
        photos: [
          "https://images.unsplash.com/photo-1594318223885-20dc4b889f9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHdvbWFuJTIwc21pbGluZ3xlbnwxfHx8fDE3NjU2MjkyODB8MA&ixlib=rb-4.1.0&q=80&w=1080",
          "https://images.unsplash.com/photo-1573418944421-11c3c8c5c21b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMG91dGRvb3IlMjBoaWtpbmd8ZW58MXx8fHwxNzY1NjU1MjE3fDA&ixlib=rb-4.1.0&q=80&w=1080",
          "https://images.unsplash.com/photo-1581065112742-eb9b90ecf0a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGNvZmZlZSUyMHNob3B8ZW58MXx8fHwxNjU1ODg5MjF8MA&ixlib=rb-4.1.0&q=80&w=1080",
        ],
        work: "Food Blogger",
        education: "Culinary Institute of America",
        interests: [
          { id: "1", name: "Wine", icon: "Coffee", color: "purple" },
          { id: "2", name: "Cooking", icon: "Coffee", color: "amber" },
          { id: "3", name: "Travel", icon: "Plane", color: "blue" },
        ],
        customFields: [{ id: "1", name: "Favorite Wine", value: "Pinot Noir" }],
      },
      {
        id: "2",
        name: "Michael",
        age: 32,
        image: "https://images.unsplash.com/photo-1695485121912-25c7ea05119c?w=150",
        bio: "Software engineer who loves good wine",
        location: "Manhattan, NY",
        distance: "5",
        photos: ["https://images.unsplash.com/photo-1695485121912-25c7ea05119c?w=400"],
        work: "Software Engineer at Tech Corp",
        education: "MIT",
        interests: [
          { id: "1", name: "Wine", icon: "Coffee", color: "purple" },
          { id: "2", name: "Technology", icon: "Camera", color: "blue" },
        ],
      },
      {
        id: "3",
        name: "Sophie",
        age: 26,
        image: "https://images.unsplash.com/photo-1581065112742-eb9b90ecf0a3?w=150",
        bio: "Chef and sommelier in training",
        location: "Queens, NY",
        distance: "7",
        photos: ["https://images.unsplash.com/photo-1581065112742-eb9b90ecf0a3?w=400"],
        work: "Chef at Fine Dining Restaurant",
        education: "French Culinary Institute",
        interests: [
          { id: "1", name: "Cooking", icon: "Coffee", color: "amber" },
          { id: "2", name: "Wine", icon: "Coffee", color: "purple" },
        ],
      },
      {
        id: "4",
        name: "Alex",
        age: 30,
        image: "https://images.unsplash.com/photo-1695485121912-25c7ea05119c?w=150",
        bio: "Marketing professional",
        location: "Brooklyn, NY",
        distance: "4",
        photos: ["https://images.unsplash.com/photo-1695485121912-25c7ea05119c?w=400"],
        work: "Marketing Manager",
        education: "NYU Stern",
        interests: [{ id: "1", name: "Networking", icon: "Music", color: "pink" }],
      },
    ],
  },
  {
    id: 2,
    title: "Morning Yoga in the Park",
    description:
      "Start your weekend with a refreshing outdoor yoga session. All levels welcome! Bring your own mat and water. We'll focus on breathing, stretching, and mindfulness.",
    date: "Saturday, Dec 16",
    time: "9:00 AM",
    location: "Central Park",
    image:
      "https://images.unsplash.com/photo-1619781458519-5c6115c0ee98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwY2xhc3MlMjBncm91cHxlbnwxfHx8fDE3NjU3MDA0NzR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    attendees: [
      { id: "5", name: "Jessica", age: 27, image: "https://images.unsplash.com/photo-1594318223885-20dc4b889f9e?w=150", bio: "Yoga instructor and wellness coach" },
      { id: "6", name: "David", age: 29, image: "https://images.unsplash.com/photo-1695485121912-25c7ea05119c?w=150", bio: "Fitness enthusiast" },
      { id: "7", name: "Rachel", age: 25, image: "https://images.unsplash.com/photo-1581065112742-eb9b90ecf0a3?w=150", bio: "Meditation practitioner" },
    ],
  },
  {
    id: 3,
    title: "Coffee & Conversations",
    description:
      "Casual coffee meetup for interesting conversations and making new friends. We'll discuss books, travel, and life experiences. Great for introverts and extroverts!",
    date: "Sunday, Dec 17",
    time: "10:30 AM",
    location: "The Cozy Bean Café",
    image:
      "https://images.unsplash.com/photo-1739302750743-06315cb81f5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBtZWV0dXAlMjBjYWZlfGVufDF8fHx8MTc2NTcwMzU2NHww&ixlib=rb-4.1.0&q=80&w=1080",
    attendees: [
      { id: "8", name: "Olivia", age: 24, image: "https://images.unsplash.com/photo-1594318223885-20dc4b889f9e?w=150", bio: "Book lover and writer" },
      { id: "9", name: "James", age: 31, image: "https://images.unsplash.com/photo-1695485121912-25c7ea05119c?w=150", bio: "Travel blogger" },
      { id: "10", name: "Lily", age: 28, image: "https://images.unsplash.com/photo-1581065112742-eb9b90ecf0a3?w=150", bio: "Coffee connoisseur" },
      { id: "11", name: "Ryan", age: 26, image: "https://images.unsplash.com/photo-1695485121912-25c7ea05119c?w=150", bio: "Photographer" },
      { id: "12", name: "Mia", age: 29, image: "https://images.unsplash.com/photo-1594318223885-20dc4b889f9e?w=150", bio: "Designer" },
    ],
  },
  {
    id: 4,
    title: "Live Jazz Night",
    description:
      "Enjoy an evening of smooth jazz with local talented musicians. Great atmosphere, drinks, and music. Come alone or bring friends - everyone's welcome!",
    date: "Friday, Dec 22",
    time: "8:30 PM",
    location: "Blue Note Jazz Club",
    image:
      "https://images.unsplash.com/photo-1631061434620-db65394197e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXZlJTIwbXVzaWMlMjBjb25jZXJ0fGVufDF8fHx8MTc2NTYxNzIxOXww&ixlib=rb-4.1.0&q=80&w=1080",
    attendees: [
      { id: "13", name: "Nina", age: 30, image: "https://images.unsplash.com/photo-1594318223885-20dc4b889f9e?w=150", bio: "Music lover and jazz singer" },
      { id: "14", name: "Chris", age: 33, image: "https://images.unsplash.com/photo-1695485121912-25c7ea05119c?w=150", bio: "Jazz guitarist" },
      { id: "15", name: "Sarah", age: 27, image: "https://images.unsplash.com/photo-1581065112742-eb9b90ecf0a3?w=150", bio: "Event organizer" },
    ],
  },
  {
    id: 5,
    title: "Hiking Adventure",
    description:
      "Join us for a moderate 5-mile hike through beautiful trails. We'll take breaks for photos and snacks. Perfect for nature lovers and those looking to stay active!",
    date: "Saturday, Dec 23",
    time: "8:00 AM",
    location: "Mountain Trail Head",
    image:
      "https://images.unsplash.com/photo-1758599669009-5a9002c09487?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWtpbmclMjBncm91cCUyMG91dGRvb3J8ZW58MXx8fHwxNzY1NzAzNTY1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    attendees: [
      { id: "16", name: "Lucas", age: 28, image: "https://i1.sndcdn.com/artworks-000076772850-gfnyiy-t500x500.jpg", bio: "Outdoor enthusiast" },
      { id: "17", name: "Emma", age: 26, image: "https://images.unsplash.com/photo-1594318223885-20dc4b889f9e?w=150", bio: "Adventure seeker" },
      { id: "18", name: "Mark", age: 31, image: "https://images.unsplash.com/photo-1695485121912-25c7ea05119c?w=150", bio: "Trail guide" },
      { id: "19", name: "Ava", age: 25, image: "https://images.unsplash.com/photo-1581065112742-eb9b90ecf0a3?w=150", bio: "Nature photographer" },
      { id: "20", name: "Ben", age: 29, image: "https://images.unsplash.com/photo-1695485121912-25c7ea05119c?w=150", bio: "Fitness coach" },
      { id: "21", name: "Grace", age: 27, image: "https://images.unsplash.com/photo-1594318223885-20dc4b889f9e?w=150", bio: "Yoga instructor" },
    ],
  },
];


export function Feed() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [messageText, setMessageText] = useState("");

  const currentEvent = events[currentIndex];

  const handleSwipe = (direction) => {
    if (animating) return;

    setSwipeDirection(direction);
    setAnimating(true);

    window.setTimeout(() => {
      setCurrentIndex((prev) => (prev < events.length - 1 ? prev + 1 : 0));
      setSwipeDirection(null);
      setAnimating(false);
    }, 300);
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    // Here you would send the message to the backend
    console.log("Sending message to event host:", messageText);
    setShowMessagePopup(false);
    setMessageText("");
    handleSwipe('right'); // Swipe right like a like
  };

  const handleCancelMessage = () => {
    setShowMessagePopup(false);
    setMessageText("");
  };

  if (!currentEvent) return null;

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

        {/* Main area */}
        <main style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', padding: '0 16px 80px', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 340, margin: '0 auto', aspectRatio: '3/4', maxHeight: 600 }}>
            {/* Card Container */}
            <div
              style={{
                width: '100%',
                position: 'relative',
                borderRadius: 24,
                overflow: 'hidden',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', // Retaining shadow for depth, TGUI doesn't enforce flat cards
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'var(--tgui--bg_color)',
                transition: 'all 0.3s ease',
                transform: animating
                  ? swipeDirection === "left"
                    ? "translateX(-120%) rotate(-12deg)"
                    : "translateX(120%) rotate(12deg)"
                  : "translateX(0) rotate(0)",
                opacity: animating ? 0 : 1
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
            </div>

            {/* Action Buttons */}
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
                onClick={() => handleSwipe('left')}
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
                  cursor: 'pointer',
                  transition: 'transform 0.1s'
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
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
                onClick={() => handleSwipe('right')}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #EC4899 0%, #E11D48 100%)',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer',
                  transition: 'transform 0.1s',
                  border: 'none'
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Heart size={32} color="white" fill="white" />
              </button>
            </div>
          </div>
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
