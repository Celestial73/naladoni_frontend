import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import { Page } from '@/components/Layout/Page.jsx';
import { HalftoneBackground } from '@/components/HalftoneBackground.jsx';
import { CircleButton } from '@/components/CircleButton/CircleButton.jsx';
import { ErrorMessage } from '@/components/ErrorMessage.jsx';
import { EventList } from './EventList.jsx';
import { SectionTitle } from './SectionTitle.jsx';
import { colors } from '@/constants/colors.js';
import { useEvents } from '@/hooks/useEvents.js';

export function Events() {
    const navigate = useNavigate();
    const {
        myEvents,
        acceptedRequests,
        pendingRequestCounts,
        loadingMyEvents: loading,
        loadingAccepted,
        errorMyEvents: error,
        errorAccepted,
        refreshAll: handleRefresh
    } = useEvents();


    return (
        <Page>
            <div style={{
                backgroundColor: colors.eventPrimary,
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
                <HalftoneBackground color={colors.eventPrimaryDark} />

                {/* Create Event Button - Fixed top right */}
                <CircleButton
                    icon={<Plus size={24} color={colors.eventPrimary} />}
                    onClick={() => navigate('/events/create')}
                    position="top-right"
                    size={50}
                    top="1em"
                    right="1em"
                />

                {/* Refresh Button - Fixed top right */}
                <CircleButton
                    icon={<RefreshCw size={22} color={colors.eventPrimary} />}
                    onClick={handleRefresh}
                    disabled={loading || loadingAccepted}
                    position="top-right"
                    size={50}
                    top="1em"
                    right="5.5em"
                />

                {/* Error messages */}
                <ErrorMessage message={error} marginTop="4em" />
                <ErrorMessage message={errorAccepted} marginTop={error ? '0.5em' : '4em'} />

                {/* My Events Section */}
                <div style={{
                    width: '100%',
                    marginTop: error || errorAccepted ? '1em' : '3em',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <SectionTitle align="left" fontSize="2em">
                        МОИ СОБЫТИЯ
                    </SectionTitle>

                    <EventList
                        events={myEvents}
                        loading={loading}
                        onEventClick={(event) => navigate(`/events/${event.id}/detail`)}
                        pendingRequestCounts={pendingRequestCounts}
                        emptyTitle="Нет событий"
                        emptyMessage="Вы ещё не создали ни одного события"
                    />
                </div>

                {/* Accepted Requests Section */}
                <div style={{
                    width: '100%',
                    marginTop: '2em',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <SectionTitle align="right" fontSize="2em">
                        ПРИНЯТЫЕ ЗАПРОСЫ
                    </SectionTitle>

                    <EventList
                        events={acceptedRequests}
                        loading={loadingAccepted}
                        onEventClick={(event) => navigate(`/events/${event.id}/detail`)}
                        emptyTitle="Нет запросов"
                        emptyMessage="Вы ещё не приняли ни одного запроса"
                    />
                </div>
            </div>
        </Page>
    );
}