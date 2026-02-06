import {
    Avatar,
    Cell,
    List,
    Section,
} from '@telegram-apps/telegram-ui';
import {
    initData,
    useSignal,
} from '@tma.js/sdk-react';
import {
    Info,
    Pencil
} from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Page } from '@/components/Layout/Page.jsx';
import { DisplayData } from '@/components/DisplayData/DisplayData.jsx';
import useAuth from '@/hooks/useAuth';
import { profileService } from '@/services/api/profileService.js';

export function Profile() {
    const navigate = useNavigate();
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const initDataRaw = useSignal(initData.raw);
    const initDataState = useSignal(initData.state);

    const { auth } = useAuth();

    const initDataRows = useMemo(() => {
        if (!initDataState || !initDataRaw) {
            return;
        }
        return [
            { title: 'raw', value: initDataRaw },
            ...Object.entries(initDataState).reduce((acc, [title, value]) => {
                if (value instanceof Date) {
                    acc.push({ title, value: value.toISOString() });
                } else if (!value || typeof value !== 'object') {
                    acc.push({ title, value });
                }
                return acc;
            }, []),
        ];
    }, [initDataState, initDataRaw]);



    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

    useEffect(() => {
        if (!emblaApi) return;

        const onSelect = () => {
            setCurrentPhotoIndex(emblaApi.selectedScrollSnap());
        };

        emblaApi.on('select', onSelect);

        return () => {
            emblaApi.off('select', onSelect);
        };
    }, [emblaApi]);

    const [profileData, setProfileData] = useState({
        name: auth.user?.name || '',
        age: '',
        photos: [],
        bio: '',
        gender: '',
        id: null,
        user: null,
        showBio: true,
        showInterests: true,
        customFields: [],
        interests: [],
    });

    // Fetch profile data from backend on component mount
    useEffect(() => {
        if (!auth?.initData) {
            setLoading(false);
            return;
        }

        const abortController = new AbortController();

        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await profileService.getMyProfile(abortController.signal);
                
                // Update profileData with fetched data
                if (response) {
                    setProfileData(prevData => {
                        const data = response;
                        // Map backend response structure to component state
                        const updatedProfile = {
                            ...prevData,
                            // Map display_name to name
                            name: data.display_name || prevData.name || '',
                            // Map photos array from backend
                            photos: data.photos || prevData.photos || [],
                            // Direct mappings from backend (already camelCase)
                            bio: data.bio || prevData.bio || '',
                            gender: data.gender || prevData.gender || '',
                            interests: data.interests || prevData.interests || [],
                            // Map custom_fields (snake_case) to customFields (camelCase)
                            // Backend uses title/value format, add id for internal tracking
                            customFields: (data.custom_fields || prevData.customFields || []).map((field, index) => ({
                                ...field,
                                id: field.id || `field-${index}-${Date.now()}`
                            })),
                            // Store additional backend data
                            id: data.id || prevData.id,
                            user: data.user || prevData.user,
                            // Visibility flags (already camelCase in backend response)
                            showBio: data.showBio !== undefined ? data.showBio : prevData.showBio,
                            showInterests: data.showInterests !== undefined ? data.showInterests : prevData.showInterests,
                            // Add age if it exists in backend response
                            age: data.age?.toString() || prevData.age || '',
                        };
                        return updatedProfile;
                    });
                }
            } catch (err) {
                if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
                    setError(err.response?.data?.message || err.message || 'Failed to fetch profile');
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchProfile();

        return () => {
            abortController.abort();
        };
    }, [auth?.initData]); // Re-fetch if initData changes (axiosPrivate is stable)

    const handleEdit = () => {
        navigate('/profile/edit');
    };

    // Show loading state
    if (loading) {
        return (
            <Page>
                <List>
                    <Section>
                        <Cell>
                            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                Loading profile...
                            </div>
                        </Cell>
                    </Section>
                </List>
            </Page>
        );
    }

    // Show error state
    if (error && !profileData.name) {
        return (
            <Page>
                <List>
                    <Section>
                        <Cell>
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--tgui--error_color)' }}>
                                <div style={{ marginBottom: 10 }}>Error loading profile</div>
                                <div style={{ fontSize: 14, opacity: 0.8 }}>{error}</div>
                            </div>
                        </Cell>
                    </Section>
                </List>
            </Page>
        );
    }

    return (
        <Page>
            {/* Floating Action Button - Top Right Corner */}
            <div style={{
                position: 'fixed',
                top: 16,
                right: 16,
                zIndex: 1000,
                display: 'flex',
                gap: 8,
                alignItems: 'center'
            }}>
                <button
                    onClick={handleEdit}
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        backgroundColor: 'var(--tgui--button_color, #3390ec)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <Pencil size={20} color="#fff" />
                </button>
            </div>

            <List style={{ paddingBottom: '' }}>
                {error && (
                    <Section>
                        <Cell>
                            <div style={{ color: 'var(--tgui--error_color)', fontSize: 14, padding: '10px 0' }}>
                                {error}
                            </div>
                        </Cell>
                    </Section>
                )}
                {/* Header & Photo Section */}
                <Section>
                    <div style={{ padding: 0, textAlign: 'center', position: 'relative' }}>
                        {/* Carousel */}
                        {profileData.photos && profileData.photos.length > 0 && (
                            <>
                                <div className="embla" ref={emblaRef} style={{ overflow: 'hidden', width: '100%' }}>
                                    <div className="embla__container" style={{ display: 'flex' }}>
                                        {profileData.photos.map((photoUrl, index) => (
                                            <div key={index} className="embla__slide" style={{ flex: '0 0 100%', minWidth: 0 }}>
                                                <img
                                                    src={photoUrl}
                                                    alt={`Profile ${index + 1}`}
                                                    style={{
                                                        width: '100%',
                                                        aspectRatio: '4/5', // Premium portrait ratio
                                                        objectFit: 'cover',
                                                        display: 'block'
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Pagination Dots */}
                                {profileData.photos.length > 1 && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 10,
                                        left: 0,
                                        right: 0,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        gap: 6,
                                        zIndex: 10
                                    }}>
                                        {profileData.photos.map((_, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    background: index === currentPhotoIndex ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                                                    transition: 'background 0.3s ease'
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div style={{ padding: '0 20px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: '600', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', color: 'var(--tgui--text_color, inherit)', lineHeight: '1.4', display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                            {profileData.name || 'Name'}, {profileData.age || 'Age'}
                        </div>
                    </div>
                </Section>

                {/* Bio Section */}
                {profileData.showBio && (
                    <Section header="About">
                        <div style={{ 
                            padding: '12px 20px',
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word',
                            lineHeight: '1.5',
                            fontSize: '16px',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                            color: 'var(--tgui--text_color, inherit)'
                        }}>
                            {profileData.bio || <span style={{ opacity: 0.5 }}>Tell people about yourself...</span>}
                        </div>
                    </Section>
                )}

                {/* Info Section */}
                <Section header="Details">
                    {/* Custom Fields */}
                    {profileData.customFields.map((field) => (
                        <Cell
                            key={field.id}
                            before={<Avatar size={28} style={{ background: 'var(--tgui--secondary_bg_color)' }}><Info size={16} /></Avatar>}
                            description={field.title}
                        >
                            {field.value}
                        </Cell>
                    ))}
                </Section>

                {/* Interests Section */}
                {profileData.showInterests && (
                    <Section header="Interests">
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '0 20px 20px' }}>
                            {profileData.interests.map((interest, index) => (
                                <div
                                    key={index}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        padding: '6px 12px',
                                        background: 'var(--tgui--secondary_bg_color)',
                                        borderRadius: 16,
                                        fontSize: '16px',
                                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                        color: 'var(--tgui--text_color, inherit)',
                                        lineHeight: '1.5'
                                    }}
                                >
                                    {interest}
                                </div>
                            ))}
                        </div>
                    </Section>
                )}


                {initDataRows && (
                    <Section header="Init Data">
                        <DisplayData rows={initDataRows} />
                    </Section>
                )}


            </List>
        </Page>
    );
}
