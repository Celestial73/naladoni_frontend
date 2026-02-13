import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '@/components/Layout/Page.jsx';
import { ProfileCarousel } from '@/components/Profile/ProfileCarousel.jsx';
import { ProfileInfoCard } from '@/components/Profile/ProfileInfoCard.jsx';
import { HalftoneBackground } from '@/components/HalftoneBackground.jsx';
import { CircleButton } from '@/components/CircleButton/CircleButton.jsx';
import { Info, Pen } from 'lucide-react';
import { colors } from '@/constants/colors.js';
import useAuth from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile.js';
import { normalizeApiColor, darkenHex } from '@/utils/colorUtils.js';
import { LoadingPage } from '@/components/LoadingPage.jsx';

// Rotating palette for interest chips
const INTEREST_COLORS = [
    '#e74c3c', '#27ae60', '#f39c12', '#8e44ad',
    '#2980b9', '#e67e22', '#1abc9c', '#c0392b',
    '#16a085', '#d35400', '#2c3e50', '#7f8c8d',
];

export function Profile() {
    const navigate = useNavigate();
    const { auth } = useAuth();
    const { profileData, loading, error } = useProfile();

    // Map backend response to component-friendly shapes
    const name = profileData?.display_name || profileData?.name || auth.user?.name || '';
    const age = profileData?.age ?? null;
    const photos = profileData?.photos || [];
    const bio = profileData?.bio || '';
    const showBio = profileData?.showBio !== false;
    const showInterests = profileData?.showInterests !== false;

    // Derive background colors from API background_color field
    const bgColor = normalizeApiColor(profileData?.background_color, colors.profilePrimary);
    const bgColorDark = darkenHex(bgColor, 0.5);

    // Map custom_fields {title, value} → items {title, text, icon}
    const items = useMemo(() => {
        const fields = profileData?.custom_fields || [];
        return fields.map((field) => ({
            title: field.title || '',
            text: field.value || '',
            icon: <Info size={22} color={bgColor} />,
        }));
    }, [profileData?.custom_fields]);

    // Map interests (strings) → {label, color}
    const interests = useMemo(() => {
        const raw = profileData?.interests || [];
        return raw.map((interest, index) => ({
            label: typeof interest === 'string' ? interest : interest.name || interest.label || '',
            color: INTEREST_COLORS[index % INTEREST_COLORS.length],
        }));
    }, [profileData?.interests]);

    // -- Loading state --
    if (loading) {
        return <LoadingPage text="Загрузка профиля..." />;
    }

    // -- Error state (no profile data at all) --
    if (error && !profileData) {
        return (
            <Page>
            <div style={{
                backgroundColor: bgColor,
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
                    <HalftoneBackground color={bgColorDark} />
                </div>
                    <div style={{
                        position: 'relative',
                        zIndex: 1,
                        color: colors.white,
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '1.2em', fontWeight: '600', marginBottom: '0.5em' }}>
                            Error loading profile
                        </div>
                        <div style={{ fontSize: '0.9em', opacity: 0.8 }}>
                            {error}
                        </div>
                    </div>
                </div>
            </Page>
        );
    }

    // Determine what to show in the info card
    const showInfoCard = (showBio && bio) || items.length > 0 || (showInterests && interests.length > 0);

    return (
        <Page>
            <div style={{
                backgroundColor: bgColor,
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
                    <HalftoneBackground color={bgColorDark} />
                </div>

                {/* Edit Button */}
                <CircleButton
                    icon={<Pen size={18} color={bgColor} />}
                    onClick={() => navigate('/profile/edit')}
                    position="top-right"
                    zIndex={2}
                />

                {/* Inline error banner (profile loaded but with a warning) */}
                {error && profileData && (
                    <div style={{
                        position: 'relative',
                        zIndex: 1,
                        width: '90%',
                        marginTop: '2%',
                        padding: '0.75em 1em',
                        backgroundColor: 'rgba(0,0,0,0.25)',
                        borderRadius: '12px',
                        color: colors.white,
                        fontSize: '0.85em',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                {/* Carousel Container */}
                {photos.length > 0 && (
                    <div style={{
                        width: '100%',
                        maxWidth: '70%',
                        marginTop: '2%',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        <ProfileCarousel photos={photos} name={name} age={age} />
                    </div>
                )}

                {/* Fallback when no photos — show name/age as text */}
                {photos.length === 0 && name && (
                    <div style={{
                        position: 'relative',
                        zIndex: 1,
                        marginTop: '10%',
                        color: colors.white,
                        textAlign: 'center'
                    }}>
                        <div style={{
                            fontSize: '1.6em',
                            fontWeight: '700',
                            textShadow: `0 1px 4px ${colors.shadowText}`
                        }}>
                            {name}{age != null ? `, ${age}` : ''}
                        </div>
                    </div>
                )}

                {/* Info Card */}
                {showInfoCard && (
                    <div style={{
                        width: '100%',
                        marginTop: '5%',
                        marginBottom: '5%',
                        display: 'flex',
                        justifyContent: 'center',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        <ProfileInfoCard
                            bio={showBio ? bio : null}
                            items={items}
                            interests={showInterests ? interests : []}
                            accentColor={bgColor}
                        />
                    </div>
                )}

            </div>
        </Page>
    );
}