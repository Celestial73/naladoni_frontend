import { useState, useEffect } from 'react';
import { Heart, X, Mail, MapPin, RefreshCw } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Page } from '@/components/Layout/Page.jsx';
import { HalftoneBackground } from '@/components/HalftoneBackground.jsx';
import { ProfileDrawer } from '../Profile/ProfileDrawer.jsx';
import { EventInformation } from '../Events/EventInformation.jsx';
import { colors } from '@/constants/colors.js';
import { feedService } from '@/services/api/feedService.js';
import { RUSSIAN_CITIES } from '@/data/russianCities.js';
import townHashMapping from '@/data/townHashMapping.json';

const getTownHash = (townName) => {
    return townHashMapping[townName] || null;
};

export function NewFeed() {
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
    const [messageText, setMessageText] = useState('');

    // --- Data fetching helpers ---
    const fetchEventData = async (abortSignal = null) => {
        if (!town || !town.trim()) return null;

        const townHash = getTownHash(town);
        if (!townHash) return null;

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

                if (isNotFound) return null;
                throw err;
            }
            return null;
        }
    };

    const fetchNextEvent = async (abortSignal = null) => {
        if (!town || !town.trim()) {
            setError('Выберите город');
            return;
        }

        const townHash = getTownHash(town);
        if (!townHash) {
            setError('Неизвестный город');
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
            if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
                const isNotFound =
                    err.response?.status === 404 ||
                    err.message?.includes('404') ||
                    err.message?.includes('not found') ||
                    err.message?.toLowerCase().includes('the requested resource was not found');

                if (isNotFound) {
                    setNoEventsAvailable(true);
                    setCurrentEvent(null);
                    setError(null);
                } else {
                    setError(err.response?.data?.message || err.message || 'Ошибка загрузки');
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

    // --- Town handlers ---
    const handleTownChange = (value) => {
        setTown(value);
        setError(null);
        setNoEventsAvailable(false);

        const filtered = value
            ? RUSSIAN_CITIES.filter(city =>
                city.toLowerCase().startsWith(value.toLowerCase())
            ).slice(0, 10)
            : [];
        setTownSuggestions(filtered);
        setShowTownSuggestions(value.length > 0 && filtered.length > 0);
    };

    const handleTownSelect = (selectedTown) => {
        setTown(selectedTown);
        setShowTownSuggestions(false);
        setTownSuggestions([]);
    };

    // --- Swipe action helpers ---
    const performAction = async (action, text = null) => {
        if (!currentEvent || animating || loading) return;

        try {
            setLoading(true);
            setAnimating(true);
            setSwipeDirection(action === 'skip' ? 'left' : 'right');

            const currentEventId = currentEvent.id;
            const actionPromise = feedService.recordAction(currentEventId, action, text);
            const nextEventPromise = fetchEventData();

            await actionPromise;
            const nextEvent = await nextEventPromise;

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
                window.setTimeout(() => setSwipeDirection(null), 300);
            }, 150);
        } catch (err) {
            setAnimating(false);
            setSwipeDirection(null);
            setLoading(false);
            setError(err.message || 'Ошибка');
        }
    };

    const handleSkip = () => performAction('skip');
    const handleLike = () => performAction('like');

    const handleSendMessage = async () => {
        if (!messageText.trim() || !currentEvent || animating || loading) return;

        const textToSend = messageText.trim();
        setShowMessagePopup(false);
        setMessageText('');

        try {
            await performAction('like', textToSend);
        } catch {
            setShowMessagePopup(true);
            setMessageText(textToSend);
        }
    };

    const handleCancelMessage = () => {
        setShowMessagePopup(false);
        setMessageText('');
    };

    const handleRefresh = () => {
        setError(null);
        setNoEventsAvailable(false);
        fetchNextEvent();
    };

    const isActionDisabled = loading || animating;

    // --- Loading state ---
    if (fetching && !currentEvent) {
        return (
            <Page>
                <div style={{
                    backgroundColor: colors.feedPrimary,
                    minHeight: '100vh',
                    width: '100%',
                    padding: '2%',
                    paddingBottom: '3em',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'visible'
                }}>
                {/* Fixed background */}
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 0
                }}>
                    <HalftoneBackground color={colors.feedPrimaryDark} />
                </div>
                    <div style={{
                        position: 'relative',
                        zIndex: 1,
                        color: colors.white,
                        textAlign: 'center',
                        fontSize: '1.2em',
                        fontWeight: '700',
                        fontFamily: "'Uni Sans', sans-serif",
                        fontStyle: 'italic'
                    }}>
                        Загрузка ленты...
                    </div>
                </div>
            </Page>
        );
    }

    return (
        <Page>
            <div style={{
                    backgroundColor: colors.feedPrimary,
                    minHeight: 'calc(100vh - 80px)',
                    width: '100%',
                    padding: '2%',
                    paddingBottom: '3em',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'visible'
                }}>
                {/* Fixed background */}
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 0
                }}>
                    <HalftoneBackground color={colors.feedPrimaryDark} />
                </div>

                {/* Header */}
                <div style={{
                    width: '90%',
                    marginTop: '3%',
                    position: 'relative',
                    zIndex: 1,
                    backgroundColor: colors.white,
                    borderRadius: '20px 0 20px 0',
                    padding: '0.8em 1em',
                    boxSizing: 'border-box',
                    textAlign: 'center',
                    fontSize: '1.6em',
                    fontWeight: '900',
                    fontFamily: "'Uni Sans', sans-serif",
                    fontStyle: 'italic',
                    color: colors.feedPrimary,
                    boxShadow: '8px 10px 0px rgba(0, 0, 0, 0.25)',
                    letterSpacing: '0.05em'
                }}>
                    НАЛАДОНИ
                </div>

                {/* Town filter */}
                <div style={{
                    width: '90%',
                    marginTop: '1.2em',
                    position: 'relative',
                    zIndex: 10
                }}>
                    <div style={{
                        backgroundColor: colors.white,
                        borderRadius: '20px 0 20px 0',
                        padding: '1em',
                        boxSizing: 'border-box',
                        boxShadow: '8px 10px 0px rgba(0, 0, 0, 0.25)'
                    }}>
                        <div style={{
                            fontSize: '1em',
                            fontWeight: '700',
                            fontFamily: "'Uni Sans', sans-serif",
                            fontStyle: 'italic',
                            color: colors.textLight,
                            marginBottom: '0.5em',
                            marginLeft: '0.5em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4em'
                        }}>
                            <MapPin size={16} color={colors.feedPrimary} />
                            ГОРОД
                        </div>
                        <input
                            type="text"
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
                                setTimeout(() => setShowTownSuggestions(false), 200);
                            }}
                            placeholder="Введите город"
                            autoComplete="off"
                            style={{
                                width: '100%',
                                padding: '0.6em 0.8em',
                                boxSizing: 'border-box',
                                border: `2px solid ${colors.borderGrey}`,
                                borderRadius: '10px',
                                fontSize: '0.95em',
                                outline: 'none',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>

                    {/* Town autocomplete dropdown */}
                    {showTownSuggestions && townSuggestions.length > 0 && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: '0',
                            right: '0',
                            backgroundColor: colors.white,
                            border: `2px solid ${colors.borderGrey}`,
                            borderRadius: '0 0 16px 16px',
                            marginTop: '-8px',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            zIndex: 1000,
                            boxShadow: '4px 8px 0px rgba(0, 0, 0, 0.15)'
                        }}>
                            {townSuggestions.map((city, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleTownSelect(city)}
                                    onMouseDown={(e) => e.preventDefault()}
                                    style={{
                                        padding: '0.75em 1.2em',
                                        cursor: 'pointer',
                                        borderBottom: index < townSuggestions.length - 1
                                            ? `1px solid ${colors.borderGrey}`
                                            : 'none',
                                        fontSize: '0.9em',
                                        color: colors.textDark,
                                        fontWeight: '500',
                                        transition: 'background 0.15s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = colors.backgroundGrey;
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

                {/* Error message */}
                {error && (
                    <div style={{
                        width: '90%',
                        marginTop: '1em',
                        padding: '0.75em 1em',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '12px',
                        color: '#c0392b',
                        fontSize: '0.9em',
                        fontWeight: '500',
                        textAlign: 'center',
                        position: 'relative',
                        zIndex: 1,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}>
                        {error}
                    </div>
                )}

                {/* Main card area */}
                <div style={{
                    width: '100%',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '1em',
                    position: 'relative',
                    zIndex: 1
                }}>
                    {noEventsAvailable && !fetching ? (
                        /* No events state */
                        <div style={{
                            width: '90%',
                            backgroundColor: colors.white,
                            borderRadius: '47px 0 47px 0',
                            padding: '2em 1.5em',
                            boxSizing: 'border-box',
                            boxShadow: `10px 14px 0px ${colors.feedPrimaryDark}`,
                            textAlign: 'center'
                        }}>
                            <div style={{
                                fontSize: '1.8em',
                                fontWeight: '900',
                                fontFamily: "'Uni Sans', sans-serif",
                                fontStyle: 'italic',
                                color: colors.feedPrimary,
                                marginBottom: '0.3em'
                            }}>
                                ПУСТО!
                            </div>
                            <div style={{
                                fontSize: '0.95em',
                                color: colors.textLight,
                                lineHeight: '1.5',
                                marginBottom: '1.5em'
                            }}>
                                Вы просмотрели все события в этом городе. Загляните позже!
                            </div>
                            <button
                                onClick={handleRefresh}
                                disabled={fetching}
                                style={{
                                    padding: '0.8em 2em',
                                    backgroundColor: colors.feedPrimary,
                                    color: colors.white,
                                    border: 'none',
                                    borderRadius: '16px',
                                    fontSize: '1em',
                                    fontWeight: '700',
                                    fontFamily: "'Uni Sans', sans-serif",
                                    fontStyle: 'italic',
                                    cursor: fetching ? 'not-allowed' : 'pointer',
                                    boxShadow: '4px 6px 0px rgba(0, 0, 0, 0.25)',
                                    opacity: fetching ? 0.6 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5em',
                                    margin: '0 auto',
                                    letterSpacing: '0.03em'
                                }}
                            >
                                <RefreshCw size={18} />
                                {fetching ? 'ОБНОВЛЕНИЕ...' : 'ОБНОВИТЬ'}
                            </button>
                        </div>
                    ) : (
                        /* Event card */
                        <div style={{ width: '92%', maxWidth: '380px' }}>
                            <AnimatePresence mode="wait">
                                {currentEvent ? (
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
                                            ease: 'easeOut'
                                        }}
                                        style={{
                                            width: '100%',
                                            borderRadius: '47px 0 47px 0',
                                            overflow: 'hidden',
                                            boxShadow: `10px 14px 0px ${colors.feedPrimaryDark}`,
                                            backgroundColor: colors.white
                                        }}
                                    >
                                        <EventInformation
                                            event={currentEvent}
                                            onAttendeeClick={setSelectedAttendee}
                                            variant="card"
                                        />
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>

                            {/* Action buttons */}
                            {currentEvent && (
                                <div style={{
                                    marginTop: '1.5em',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '1.2em'
                                }}>
                                    {/* Skip */}
                                    <button
                                        onClick={handleSkip}
                                        disabled={isActionDisabled}
                                        style={{
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: colors.white,
                                            border: 'none',
                                            boxShadow: '5px 7px 0px rgba(0, 0, 0, 0.2)',
                                            cursor: isActionDisabled ? 'not-allowed' : 'pointer',
                                            opacity: isActionDisabled ? 0.5 : 1,
                                            transition: 'transform 0.1s'
                                        }}
                                        onMouseDown={(e) => !isActionDisabled && (e.currentTarget.style.transform = 'scale(0.92)')}
                                        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                    >
                                        <X size={28} color="#c0392b" strokeWidth={3} />
                                    </button>

                                    {/* Message */}
                                    <button
                                        onClick={() => setShowMessagePopup(true)}
                                        style={{
                                            width: '52px',
                                            height: '52px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: colors.white,
                                            border: 'none',
                                            boxShadow: '5px 7px 0px rgba(0, 0, 0, 0.2)',
                                            cursor: 'pointer',
                                            transition: 'transform 0.1s'
                                        }}
                                        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
                                        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                    >
                                        <Mail size={22} color={colors.feedPrimary} />
                                    </button>

                                    {/* Like */}
                                    <button
                                        onClick={handleLike}
                                        disabled={isActionDisabled}
                                        style={{
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: colors.feedPrimary,
                                            border: 'none',
                                            boxShadow: '5px 7px 0px rgba(0, 0, 0, 0.2)',
                                            cursor: isActionDisabled ? 'not-allowed' : 'pointer',
                                            opacity: isActionDisabled ? 0.5 : 1,
                                            transition: 'transform 0.1s'
                                        }}
                                        onMouseDown={(e) => !isActionDisabled && (e.currentTarget.style.transform = 'scale(0.92)')}
                                        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                    >
                                        <Heart size={28} color={colors.white} fill={colors.white} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

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
                                padding: '0 5%'
                            }}
                            onClick={handleCancelMessage}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                style={{
                                    backgroundColor: colors.white,
                                    borderRadius: '47px 0 47px 0',
                                    padding: '2em 1.5em',
                                    width: '100%',
                                    maxWidth: '400px',
                                    boxShadow: `10px 14px 0px ${colors.feedPrimaryDark}`
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div style={{
                                    fontSize: '1.4em',
                                    fontWeight: '900',
                                    fontFamily: "'Uni Sans', sans-serif",
                                    fontStyle: 'italic',
                                    color: colors.feedPrimary,
                                    marginBottom: '0.3em'
                                }}>
                                    СООБЩЕНИЕ
                                </div>
                                <div style={{
                                    fontSize: '0.85em',
                                    color: colors.textLight,
                                    marginBottom: '1em',
                                    lineHeight: '1.4'
                                }}>
                                    Представьтесь организатору события
                                </div>

                                {/* Bio-style textarea with left border */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'stretch'
                                }}>
                                    <div style={{
                                        width: '3px',
                                        borderRadius: '2px',
                                        backgroundColor: colors.feedPrimary,
                                        flexShrink: 0
                                    }} />
                                    <textarea
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        placeholder="Напишите сообщение..."
                                        rows={4}
                                        style={{
                                            flex: 1,
                                            marginLeft: '0.75em',
                                            padding: '0.6em',
                                            fontSize: '0.95em',
                                            lineHeight: '1.5',
                                            color: colors.textDark,
                                            border: `2px solid ${colors.borderGrey}`,
                                            borderRadius: '10px',
                                            outline: 'none',
                                            resize: 'vertical',
                                            fontFamily: 'inherit',
                                            backgroundColor: colors.backgroundGrey,
                                            minHeight: '5em'
                                        }}
                                    />
                                </div>

                                {/* Action buttons */}
                                <div style={{
                                    display: 'flex',
                                    gap: '0.75em',
                                    marginTop: '1.5em'
                                }}>
                                    <button
                                        onClick={handleCancelMessage}
                                        style={{
                                            flex: 1,
                                            padding: '0.8em',
                                            borderRadius: '14px',
                                            border: `2px solid ${colors.borderGrey}`,
                                            backgroundColor: colors.white,
                                            color: colors.textDark,
                                            fontSize: '0.95em',
                                            fontWeight: '700',
                                            fontFamily: "'Uni Sans', sans-serif",
                                            fontStyle: 'italic',
                                            cursor: 'pointer',
                                            boxShadow: '4px 6px 0px rgba(0, 0, 0, 0.1)'
                                        }}
                                    >
                                        ОТМЕНА
                                    </button>
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!messageText.trim()}
                                        style={{
                                            flex: 1,
                                            padding: '0.8em',
                                            borderRadius: '14px',
                                            border: 'none',
                                            backgroundColor: messageText.trim() ? colors.feedPrimary : colors.defaultChip,
                                            color: colors.white,
                                            fontSize: '0.95em',
                                            fontWeight: '700',
                                            fontFamily: "'Uni Sans', sans-serif",
                                            fontStyle: 'italic',
                                            cursor: messageText.trim() ? 'pointer' : 'not-allowed',
                                            opacity: messageText.trim() ? 1 : 0.5,
                                            boxShadow: messageText.trim()
                                                ? '4px 6px 0px rgba(0, 0, 0, 0.25)'
                                                : 'none',
                                            letterSpacing: '0.03em'
                                        }}
                                    >
                                        ОТПРАВИТЬ
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
                                location: selectedAttendee.location || '',
                                distance: selectedAttendee.distance || '',
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
                </AnimatePresence>
            </div>
        </Page>
    );
}

