import { Page } from '@/components/Page.jsx';
import { HalftoneBackground } from '@/components/HalftoneBackground.jsx';
import { colors } from '@/constants/colors.js';
import { EditFieldCard } from '@/components/EditFieldCard.jsx';
import { PhotoEditRow } from '@/components/PhotoEditRow.jsx';
import { EditInfoCard } from '@/components/EditInfoCard.jsx';
import { Coffee, Music, Plane, BookOpen, Dumbbell } from 'lucide-react';
import profileImage1 from '../../assets/photo_2025-12-14_19-07-23.jpg';
import profileImage2 from '../../assets/photo_2026-01-21_19-16-39.jpg';

const dummyPhotos = [profileImage1, profileImage2];

const dummyBio = "I love long walks on the beach, exploring new coffee shops, and spontaneous road trips. Always looking to meet new people and make meaningful connections.";

const dummyFunFacts = [
    { title: 'Coffee Addict', text: "Can't start my day without a double espresso", icon: <Coffee size={22} color={colors.profilePrimary} /> },
    { title: 'Music Lover', text: 'Guitar player for 10 years', icon: <Music size={22} color={colors.profilePrimary} /> },
    { title: 'World Traveler', text: 'Visited 23 countries and counting', icon: <Plane size={22} color={colors.profilePrimary} /> },
    { title: 'Bookworm', text: 'Read 52 books last year', icon: <BookOpen size={22} color={colors.profilePrimary} /> },
    { title: 'Fitness Enthusiast', text: 'Morning gym routine, rain or shine', icon: <Dumbbell size={22} color={colors.profilePrimary} /> },
];

const dummyInterests = [
    { label: 'Photography', color: '#e74c3c' },
    { label: 'Hiking', color: '#27ae60' },
    { label: 'Cooking', color: '#f39c12' },
    { label: 'Yoga', color: '#8e44ad' },
    { label: 'Travel', color: '#2980b9' },
    { label: 'Music', color: '#e67e22' },
    { label: 'Art', color: '#1abc9c' },
    { label: 'Cinema', color: '#c0392b' },
];

export function NewEditProfile() {
    return (
        <Page>
            <div style={{
                backgroundColor: colors.profilePrimary,
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
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 0
                }}>
                    <HalftoneBackground color={colors.profilePrimaryDark} />
                </div>
                
                {/* Header banner */}
                <div style={{ display: 'contents' }}>
                    <div style={{
                        width: '90%',
                        marginTop: '5%',
                        position: 'relative',
                        zIndex: 1,
                        backgroundColor: colors.white,
                        borderRadius: '20px',
                        padding: '1em',
                        boxSizing: 'border-box',
                        textAlign: 'center',
                        fontSize: '1.5em',
                        fontWeight: '900',
                        color: colors.textDark
                    }}>
                        Это настройки профиля.
                    </div>

                    <div style={{
                        width: '70%',
                        position: 'relative',
                        zIndex: 1,
                        backgroundColor: 'red',
                        borderRadius: '0px 0px 20px 20px',
                        padding: '0.5em',
                        boxSizing: 'border-box',
                        textAlign: 'center',
                        fontSize: '0.9em',
                        fontWeight: '900',
                        color: colors.white,
                        borderLeft: `3px solid ${colors.white}`,
                        borderRight: `3px solid ${colors.white}`,
                        borderBottom: `3px solid ${colors.white}`,
                        borderTop: 'none'
                    }}>
                        Здесь вы можете настроить профиль.
                    </div>

                    <div style={{
                        width: '50%',
                        position: 'relative',
                        zIndex: 1,
                        backgroundColor: 'grey',
                        borderRadius: '0px 0px 10px 10px',
                        padding: '0.5em',
                        boxSizing: 'border-box',
                        textAlign: 'center',
                        fontSize: '0.75em',
                        fontWeight: '600',
                        color: colors.white,
                        borderLeft: `3px solid ${colors.white}`,
                        borderRight: `3px solid ${colors.white}`,
                        borderBottom: `3px solid ${colors.white}`,
                        borderTop: 'none'
                    }}>
                        Хотите? Ну настраивайте.
                    </div>
                </div>
                {/* Name and age inputs */}
                <div style={{
                    width: '100%',
                    position: 'relative',
                    zIndex: 1,
                    marginTop: '1.5em',
                    minHeight: '10em'
                }}>
                    <EditFieldCard
                        title="Имя!!!"
                        placeholder="Введите имя"
                        style={{
                            width: '45%',
                            position: 'absolute',
                            top: 0,
                            left: '3%'
                        }}
                    />

                    <EditFieldCard
                        title="Возраст!!!"
                        placeholder="Введите возраст"
                        flipped
                        style={{
                            width: '45%',
                            position: 'absolute',
                            top: '3em',
                            right: '3%'
                        }}
                    />
                </div>

                {/* Photos section */}
                <div style={{ display: 'contents' }}>
                    <div style={{
                        alignSelf: 'flex-start',
                        marginLeft: '5%',
                        position: 'relative',
                        zIndex: 1,
                        fontSize: '3em',
                        fontWeight: '900',
                        fontFamily: "'Uni Sans', sans-serif",
                        color: colors.white,
                        fontStyle: "italic",
                        textShadow: '3px 4px 0px rgba(0, 0, 0, 0.5)'
                    }}>
                        ФОТКИ:
                    </div>

                    <div style={{
                        width: '100%',
                        padding: '0 2%',
                        boxSizing: 'border-box',
                        position: 'relative',
                        zIndex: 1,
                        marginTop: '0.5em'
                    }}>
                        <PhotoEditRow photos={dummyPhotos} onAddClick={() => {}} />
                    </div>
                </div>

                {/* Info card edit section */}
                <EditInfoCard
                    bio={dummyBio}
                    funFacts={dummyFunFacts}
                    interests={dummyInterests}
                    onIconClick={(index) => {}}
                    onAddInterest={() => {}}
                />

                
            </div>
        </Page>
    );
}

