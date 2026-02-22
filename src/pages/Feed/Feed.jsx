import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Page } from '@/components/Layout/Page.jsx';
import { HalftoneBackground } from '@/components/HalftoneBackground.jsx';
import { ErrorMessage } from '@/components/ErrorMessage.jsx';
import { EventCard } from '../Events/EventCard.jsx';
import { MessagePopup } from '@/components/MessagePopup/MessagePopup.jsx';
import { EmptyFeedCard } from '@/components/EmptyFeedCard/EmptyFeedCard.jsx';
import { FeedFilters } from '@/components/FeedFilters/FeedFilters.jsx';
import { colors } from '@/constants/colors.js';
import { useFeed } from '@/hooks/useFeed.js';
import dislikeIcon from '../../../assets/icons/dislike (cockroach).svg';
import messageIcon from '../../../assets/icons/message (hand).svg';
import likeIcon from '../../../assets/icons/like (bison).svg';


export function Feed() {
    const {
        // State
        currentEvent,
        noEventsAvailable,
        fetching,
        error,
        
        // Filters
        filtersEnabled,
        town,
        startDate,
        endDate,
        
        // Filter setters
        setFiltersEnabled,
        handleTownChange,
        handleTownBlur,
        handleStartDateChange,
        handleEndDateChange,
        handleDateRangeClear,
        handleDateRangeClose,
        
        // Actions
        handleSkip: handleSkipBase,
        handleLike: handleLikeBase,
        handleSendMessage: handleSendMessageBase,
        handleRefresh,
        handleResetSkips,
    } = useFeed();

    // UI state
    const [loading, setLoading] = useState(false);
    const [animating, setAnimating] = useState(false);
    const [swipeDirection, setSwipeDirection] = useState(null);
    const [showMessagePopup, setShowMessagePopup] = useState(false);
    const [messageText, setMessageText] = useState('');



    // --- Swipe action helpers ---
    const handleSkip = async () => {
        if (!currentEvent || animating || loading) return;

        try {
            setLoading(true);
            setAnimating(true);
            setSwipeDirection('left');

            // Call the hook's handler which handles the API call and state update
            await handleSkipBase();
            
            // Small delay to let exit animation start, then update UI
            window.setTimeout(() => {
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
        }
    };

    const handleLike = async () => {
        if (!currentEvent || animating || loading) return;

        try {
            setLoading(true);
            setAnimating(true);
            setSwipeDirection('right');

            // Call the hook's handler which handles the API call and state update
            await handleLikeBase();
            
            // Small delay to let exit animation start, then update UI
            window.setTimeout(() => {
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
        }
    };

    const handleSendMessage = async () => {
        if (!messageText.trim() || !currentEvent || animating || loading) return;

        const textToSend = messageText.trim();

        try {
            setLoading(true);
            setShowMessagePopup(false);
            setMessageText("");
            setAnimating(true);
            setSwipeDirection('right');

            // Call the hook's handler which handles the API call and state update
            await handleSendMessageBase(textToSend);
            
            // Small delay to let exit animation start, then update UI
            window.setTimeout(() => {
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
            // Reopen popup on error so user can retry
            setShowMessagePopup(true);
            setMessageText(textToSend);
        }
    };

    const handleCancelMessage = () => {
        setShowMessagePopup(false);
        setMessageText('');
    };

    const isActionDisabled = loading || animating;
    const pageRevealTransition = (delay = 0) => ({
        duration: 0.2,
        delay
    });

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
                    justifyContent: 'end',
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'visible'
                }}>
                {/* Fixed background */}
                <HalftoneBackground color={colors.feedPrimaryDark} pattern = 'radial'/>


                {/* Filter toggle and filters card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={pageRevealTransition(0.05)}
                    style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                >
                    <FeedFilters
                        filtersEnabled={filtersEnabled}
                        onToggleFilters={() => setFiltersEnabled(!filtersEnabled)}
                        town={town}
                        onTownChange={handleTownChange}
                        onTownBlur={handleTownBlur}
                        startDate={startDate}
                        endDate={endDate}
                        onStartDateChange={handleStartDateChange}
                        onEndDateChange={handleEndDateChange}
                        onDateRangeClear={handleDateRangeClear}
                        onDateRangeClose={handleDateRangeClose}
                    />
                </motion.div>

                {/* Error message */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={pageRevealTransition(0.1)}
                    style={{ width: '100%' }}
                >
                    <ErrorMessage message={error} />
                </motion.div>

                {/* Main card area */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={pageRevealTransition(0.15)}
                    style={{
                    width: '100%',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '1em',
                    paddingBottom: '100px',
                    position: 'relative',
                    zIndex: 1
                }}>
                    {fetching && !currentEvent ? null : noEventsAvailable && !fetching ? (
                        /* No events state */
                        <EmptyFeedCard
                            onRefresh={handleRefresh}
                            onResetSkips={handleResetSkips}
                            fetching={fetching}
                        />
                    ) : (
                        /* Event card */
                        <div style={{ width: '92%', maxWidth: '380px' }}>
                            <AnimatePresence mode="wait">
                                {currentEvent ? (
                                    <motion.div
                                        key={currentEvent.id}
                                        initial={{
                                            opacity: 0,
                                            y: 10,
                                            ...(swipeDirection ? {
                                                x: swipeDirection === 'left' ? 120 : -120,
                                                rotate: swipeDirection === 'left' ? 12 : -12
                                            } : {})
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            x: 0,
                                            rotate: 0
                                        }}
                                        exit={{
                                            opacity: 0,
                                            y: -10,
                                            ...(swipeDirection ? {
                                                x: swipeDirection === 'left' ? -120 : 120,
                                                rotate: swipeDirection === 'left' ? -12 : 12
                                            } : {})
                                        }}
                                        transition={{
                                            duration: 0.3,
                                            ease: 'easeOut',
                                            delay: swipeDirection ? 0 : 0.05
                                        }}
                                        style={{
                                            width: '100%',
                                            borderRadius: '47px 0 47px 0',
                                            overflow: 'hidden',
                                            boxShadow: '8px 10px 0px rgba(0, 0, 0, 0.25)',
                                            backgroundColor: colors.white
                                        }}
                                    >
                                        <EventCard
                                            event={currentEvent}
                                        />
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>

                        </div>
                    )}
                </motion.div>

                {/* Fixed action buttons above navbar */}
                {currentEvent && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={pageRevealTransition(0.2)}
                        style={{
                        position: 'fixed',
                        bottom: '130px',
                        left: 0,
                        right: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '1.2em',
                        zIndex: 20
                    }}>
                        {/* Dislike */}
                        <button
                            onClick={handleSkip}
                            disabled={isActionDisabled}
                            style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'linear-gradient(135deg, #e74c3c 0%, #a93226 100%)',
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
                            <img src={dislikeIcon} alt="Dislike" style={{ width: '44px', height: '44px' }} />
                        </button>

                        {/* Message */}
                        <button
                            onClick={() => setShowMessagePopup(true)}
                            style={{
                                width: '72px',
                                height: '72px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
                                border: 'none',
                                boxShadow: '5px 7px 0px rgba(0, 0, 0, 0.2)',
                                cursor: 'pointer',
                                transition: 'transform 0.1s'
                            }}
                            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
                            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            <img src={messageIcon} alt="Message" style={{ width: '40px', height: '40px' }} />
                        </button>

                        {/* Like */}
                        <button
                            onClick={handleLike}
                            disabled={isActionDisabled}
                            style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
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
                            <img src={likeIcon} alt="Like" style={{ width: '44px', height: '44px' }} />
                        </button>
                    </motion.div>
                )}

                {/* Message Popup */}
                <MessagePopup
                    isOpen={showMessagePopup}
                    messageText={messageText}
                    onMessageTextChange={setMessageText}
                    onSend={handleSendMessage}
                    onCancel={handleCancelMessage}
                />

            </div>
        </Page>
    );
}

