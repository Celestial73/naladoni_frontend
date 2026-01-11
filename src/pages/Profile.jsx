import {
    Avatar,
    Button,
    Cell,
    List,
    Section,
    Textarea,
    Input,
    IconButton
} from '@telegram-apps/telegram-ui';
import {
    initData,
    useSignal,
} from '@tma.js/sdk-react';
import {
    Camera,
    Music,
    Plane,
    Coffee,
    Trash2,
    Plus as PlusIcon,
    X as XIcon,
    Check,
    Info
} from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { useState, useEffect, useMemo } from 'react';

import { Page } from '@/components/Page.jsx';
import { DisplayData } from '@/components/DisplayData/DisplayData.jsx';
import useAuth from '@/hooks/useAuth';
import useAxiosPrivate from '@/hooks/useAxiosPrivate';

export function Profile() {
    const [isEditing, setIsEditing] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [showAddField, setShowAddField] = useState(false);
    const [showAddInterest, setShowAddInterest] = useState(false);
    const [newFieldName, setNewFieldName] = useState('');
    const [newFieldValue, setNewFieldValue] = useState('');
    const [newInterest, setNewInterest] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const initDataRaw = useSignal(initData.raw);
    const initDataState = useSignal(initData.state);

    const { auth } = useAuth();
    const axiosPrivate = useAxiosPrivate();

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
        photo_url: '',
        bio: '',
        gender: '',
        id: null,
        user: null,
        showBio: true,
        showInterests: true,
        customFields: [],
        interests: [],
    });
    const [originalProfileData, setOriginalProfileData] = useState(null);

    // Fetch profile data from backend on component mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axiosPrivate.get('/profiles/me');
                
                // Log the fetched profile data
                console.log('Fetched profile data:', response.data);
                
                // Update profileData with fetched data
                if (response.data) {
                    setProfileData(prevData => {
                        const data = response.data;
                        // Map backend response structure to component state
                        const updatedProfile = {
                            ...prevData,
                            // Map display_name to name
                            name: data.display_name || prevData.name || '',
                            // Map photo_url directly (single URL string)
                            photo_url: data.photo_url || prevData.photo_url || '',
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
                        console.log('Updated profile state:', updatedProfile);
                        return updatedProfile;
                    });
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError(err.response?.data?.message || err.message || 'Failed to fetch profile');
                // Optionally, you might want to keep default data or handle 404 differently
                // For now, we'll just set the error and keep the empty state
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if we have auth (initData available)
        if (auth?.initData) {
            fetchProfile();
        } else {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth?.initData]); // Re-fetch if initData changes (axiosPrivate is stable)

    const handleSave = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Map profileData state to backend format
            const payload = {
                display_name: profileData.name,
                age: profileData.age ? parseInt(profileData.age) : undefined,
                bio: profileData.bio,
                gender: profileData.gender,
                photo_url: profileData.photo_url,
                interests: profileData.interests,
                custom_fields: profileData.customFields.map(field => ({
                    title: field.title,
                    value: field.value
                })),
                showBio: profileData.showBio,
                showInterests: profileData.showInterests,
            };
            
            // Remove undefined fields
            Object.keys(payload).forEach(key => {
                if (payload[key] === undefined) {
                    delete payload[key];
                }
            });
            
            console.log('Saving profile data:', payload);
            
            const response = await axiosPrivate.patch('/profiles/me', payload);
            
            console.log('Profile saved successfully:', response.data);
            
            // Update profile data with response from backend
            if (response.data) {
                setProfileData(prevData => {
                    const data = response.data;
                    const updatedProfile = {
                        ...prevData,
                        name: data.display_name || prevData.name || '',
                        photo_url: data.photo_url || prevData.photo_url || '',
                        bio: data.bio || prevData.bio || '',
                        gender: data.gender || prevData.gender || '',
                        interests: data.interests || prevData.interests || [],
                        customFields: (data.custom_fields || prevData.customFields || []).map((field, index) => ({
                            ...field,
                            id: field.id || `field-${index}-${Date.now()}`
                        })),
                        id: data.id || prevData.id,
                        user: data.user || prevData.user,
                        showBio: data.showBio !== undefined ? data.showBio : prevData.showBio,
                        showInterests: data.showInterests !== undefined ? data.showInterests : prevData.showInterests,
                        age: data.age?.toString() || prevData.age || '',
                    };
                    return updatedProfile;
                });
            }
            
            setIsEditing(false);
            setShowAddField(false);
            setShowAddInterest(false);
            setOriginalProfileData(null); // Clear original data after successful save
        } catch (err) {
            console.error('Error saving profile:', err);
            setError(err.response?.data?.message || err.message || 'Failed to save profile');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        // Restore original data if it was saved
        if (originalProfileData) {
            setProfileData(originalProfileData);
            setOriginalProfileData(null);
        }
        setIsEditing(false);
        setShowAddField(false);
        setShowAddInterest(false);
    };
    
    const handleEditStart = () => {
        // Store current profile data as original before editing
        setOriginalProfileData({ ...profileData });
        setIsEditing(true);
    };

    const deleteSection = (section) => {
        setProfileData({ ...profileData, [section]: false });
    };
    
    const restoreSection = (section) => {
        setProfileData({ ...profileData, [section]: true });
    };

    const addCustomField = () => {
        if (newFieldName.trim() && newFieldValue.trim()) {
            const newField = {
                id: Date.now().toString(),
                title: newFieldName,
                value: newFieldValue,
            };
            setProfileData({
                ...profileData,
                customFields: [...profileData.customFields, newField],
            });
            setNewFieldName('');
            setNewFieldValue('');
            setShowAddField(false);
        }
    };

    const deleteCustomField = (id) => {
        setProfileData({
            ...profileData,
            customFields: profileData.customFields.filter((field) => field.id !== id),
        });
    };

    const updateCustomField = (id, key, newValue) => {
        setProfileData({
            ...profileData,
            customFields: profileData.customFields.map((field) =>
                field.id === id ? { ...field, [key]: newValue } : field
            ),
        });
    };

    const addInterest = () => {
        if (newInterest.trim()) {
            setProfileData({
                ...profileData,
                interests: [...profileData.interests, newInterest.trim()],
            });
            setNewInterest('');
            setShowAddInterest(false);
        }
    };

    const deleteInterest = (interestToDelete) => {
        setProfileData({
            ...profileData,
            interests: profileData.interests.filter((interest) => interest !== interestToDelete),
        });
    };

    // Show loading state
    if (loading) {
        return (
            <Page>
                <List style={{ paddingBottom: '80px' }}>
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
                <List style={{ paddingBottom: '80px' }}>
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
            <List style={{ paddingBottom: '80px' }}>
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
                        {profileData.photo_url && (
                            <>
                                <div className="embla" ref={emblaRef} style={{ overflow: 'hidden', width: '100%' }}>
                                    <div className="embla__container" style={{ display: 'flex' }}>
                                        <div className="embla__slide" style={{ flex: '0 0 100%', minWidth: 0 }}>
                                            <img
                                                src={profileData.photo_url}
                                                alt="Profile"
                                                style={{
                                                    width: '100%',
                                                    aspectRatio: '4/5', // Premium portrait ratio
                                                    objectFit: 'cover',
                                                    display: 'block'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Pagination Dots - Single dot for single photo */}
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
                                    <div
                                        style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            background: '#fff',
                                            transition: 'background 0.3s ease'
                                        }}
                                    />
                                </div>
                            </>
                        )}

                        {/* Info Overlay (Optional, but keeping below for now as per design request to just change picture) */}
                    </div>

                    <div style={{ padding: '0 20px 20px', textAlign: 'center' }}>
                        {/* Existing Edit inputs moved here or kept below? 
                             The original code had Avatar then Inputs/Text. 
                             Let's keep the name/age inputs here.
                             The style={{ padding: 20, textAlign: 'center' }} was on the parent div which we removed/changed.
                             So we add a container for the rest of the header content.
                          */}
                        {isEditing ? (
                            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 10 }}>
                                <Input
                                    header="Name"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                />
                                <Input
                                    header="Age"
                                    value={profileData.age}
                                    onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                                />
                            </div>
                        ) : (
                            <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                                {profileData.name}, {profileData.age}
                            </div>
                        )}

                    </div>

                    <Cell
                        before={isEditing ? <XIcon size={20} /> : <Camera size={20} />}
                        after={
                            isEditing ? (
                                <Button size="s" onClick={handleSave} mode="filled" before={<Check size={16} />}>Save</Button>
                            ) : (
                                <Button size="s" onClick={handleEditStart} mode="bezeled">Edit Profile</Button>
                            )
                        }
                        onClick={isEditing ? handleCancel : () => { }}
                    >
                        {isEditing ? 'Cancel Editing' : 'Viewer Mode'}
                    </Cell>
                </Section>

                {/* Bio Section */}
                {profileData.showBio && (
                    <Section header="About">
                        {isEditing ? (
                            <Textarea
                                placeholder="Tell people about yourself..."
                                value={profileData.bio}
                                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                            />
                        ) : (
                            <Cell multiline>{profileData.bio}</Cell>
                        )}
                        {isEditing && (
                            <Button mode="plain" size="s" onClick={() => deleteSection('showBio')}>
                                <Trash2 size={16} /> Remove Section
                            </Button>
                        )}
                    </Section>
                )}

                {/* Info Section */}
                <Section header="Details">
                    {/* Custom Fields */}
                    {profileData.customFields.map((field) => (
                        <Cell
                            key={field.id}
                            before={<Avatar size={28} style={{ background: 'var(--tgui--secondary_bg_color)' }}><Info size={16} /></Avatar>}
                            description={isEditing ? 'Custom Field' : field.title}
                            after={isEditing && <IconButton mode="plain" onClick={() => deleteCustomField(field.id)}><Trash2 size={16} /></IconButton>}
                        >
                            {isEditing ? (
                                <div style={{ display: 'flex', gap: 5 }}>
                                    <Input
                                        placeholder="Title"
                                        value={field.title || ''}
                                        onChange={(e) => updateCustomField(field.id, 'title', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Value"
                                        value={field.value || ''}
                                        onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
                                    />
                                </div>
                            ) : (
                                field.value
                            )}
                        </Cell>
                    ))}

                    {/* Add Custom Field */}
                    {isEditing && (
                        <Cell>
                            {showAddField ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                                    <Input
                                        placeholder="Field Name"
                                        value={newFieldName}
                                        onChange={(e) => setNewFieldName(e.target.value)}
                                    />
                                    <Input
                                        placeholder="Field Value"
                                        value={newFieldValue}
                                        onChange={(e) => setNewFieldValue(e.target.value)}
                                    />
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <Button size="s" onClick={addCustomField}>Add</Button>
                                        <Button size="s" mode="gray" onClick={() => setShowAddField(false)}>Cancel</Button>
                                    </div>
                                </div>
                            ) : (
                                <Button mode="plain" size="s" onClick={() => setShowAddField(true)}>
                                    <PlusIcon size={16} style={{ marginRight: 5 }} /> Add Custom Field
                                </Button>
                            )}
                        </Cell>
                    )}
                </Section>

                {/* Hidden Sections - Show in editing mode to allow restoration */}
                {isEditing && (
                    <Section header="Hidden Sections">
                        {!profileData.showBio && (
                            <Cell
                                before={<Avatar size={28} style={{ background: 'var(--tgui--secondary_bg_color)' }}><Info size={16} /></Avatar>}
                                description="About section is hidden"
                                after={
                                    <Button size="s" onClick={() => restoreSection('showBio')} mode="filled">
                                        <PlusIcon size={16} style={{ marginRight: 5 }} /> Restore
                                    </Button>
                                }
                            >
                                About
                            </Cell>
                        )}
                        {!profileData.showInterests && (
                            <Cell
                                before={<Avatar size={28} style={{ background: 'var(--tgui--secondary_bg_color)' }}><Info size={16} /></Avatar>}
                                description="Interests section is hidden"
                                after={
                                    <Button size="s" onClick={() => restoreSection('showInterests')} mode="filled">
                                        <PlusIcon size={16} style={{ marginRight: 5 }} /> Restore
                                    </Button>
                                }
                            >
                                Interests
                            </Cell>
                        )}
                    </Section>
                )}

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
                                        fontSize: 14
                                    }}
                                >
                                    {interest}
                                    {isEditing && (
                                        <XIcon
                                            size={14}
                                            style={{ cursor: 'pointer', opacity: 0.6 }}
                                            onClick={() => deleteInterest(interest)}
                                        />
                                    )}
                                </div>
                            ))}

                            {isEditing && (
                                showAddInterest ? (
                                    <div style={{ display: 'flex', gap: 5, width: '100%', marginTop: 10 }}>
                                        <Input
                                            placeholder="Interest"
                                            value={newInterest}
                                            onChange={(e) => setNewInterest(e.target.value)}
                                        />
                                        <Button size="s" onClick={addInterest}>Add</Button>
                                        <Button size="s" mode="gray" onClick={() => setShowAddInterest(false)}>Cancel</Button>
                                    </div>
                                ) : (
                                    <Button mode="bezeled" size="s" onClick={() => setShowAddInterest(true)} style={{ borderRadius: 16 }}>
                                        <PlusIcon size={14} /> Add
                                    </Button>
                                )
                            )}
                        </div>
                        {isEditing && (
                            <Button mode="plain" size="s" onClick={() => deleteSection('showInterests')}>
                                <Trash2 size={16} /> Remove Section
                            </Button>
                        )}
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
