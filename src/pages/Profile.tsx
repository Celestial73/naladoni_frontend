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
    Briefcase,
    GraduationCap,
    MapPin,
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
import { useState, useEffect } from 'react';

import { Page } from '@/components/Page.tsx';

export function Profile() {
    const [isEditing, setIsEditing] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [showAddField, setShowAddField] = useState(false);
    const [showAddInterest, setShowAddInterest] = useState(false);
    const [newFieldName, setNewFieldName] = useState('');
    const [newFieldValue, setNewFieldValue] = useState('');
    const [newInterest, setNewInterest] = useState('');

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
        name: 'Sarah',
        age: '28',
        location: 'New York, NY',
        distance: '2',
        photos: [
            'https://images.unsplash.com/photo-1594318223885-20dc4b889f9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHdvbWFuJTIwc21pbGluZ3xlbnwxfHx8fDE3NjU2MDQ2NDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
            'https://images.unsplash.com/photo-1573418944421-11c3c8c5c21b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMG91dGRvb3IlMjBoaWtpbmd8ZW58MXx8fHwxNzY1NjU1MjE3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
            'https://images.unsplash.com/photo-1581065112742-eb9b90ecf0a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGNvZmZlZSUyMHNob3B8ZW58MXx8fHwxNjU1ODg5MjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        ],
        bio: 'Adventurous mf and coffee enthusiast ☕ Love exploring new hiking trails and trying different cuisines. Always up for spontaneous road trips and deep conversations.',
        work: 'Product Designer',
        education: 'NYU, Design',
        showBio: true,
        showWork: true,
        showEducation: true,
        showLocation: true,
        showInterests: true,
        customFields: [] as Array<{ id: string; name: string; value: string }>,
        interests: [
            { id: '1', name: 'Music', icon: 'Music', color: 'pink' },
            { id: '2', name: 'Photography', icon: 'Camera', color: 'purple' },
            { id: '3', name: 'Travel', icon: 'Plane', color: 'blue' },
            { id: '4', name: 'Coffee', icon: 'Coffee', color: 'amber' },
        ] as Array<{ id: string; name: string; icon: string; color: string }>,
    });

    const handleSave = () => {
        setIsEditing(false);
        setShowAddField(false);
        setShowAddInterest(false);
        // Here you would typically save to a backend
    };

    const handleCancel = () => {
        setIsEditing(false);
        setShowAddField(false);
        setShowAddInterest(false);
        // Reset to original data if needed
    };

    const deleteSection = (section: string) => {
        setProfileData({ ...profileData, [section]: false });
    };

    const addCustomField = () => {
        if (newFieldName.trim() && newFieldValue.trim()) {
            const newField = {
                id: Date.now().toString(),
                name: newFieldName,
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

    const deleteCustomField = (id: string) => {
        setProfileData({
            ...profileData,
            customFields: profileData.customFields.filter((field) => field.id !== id),
        });
    };

    const updateCustomField = (id: string, key: 'name' | 'value', newValue: string) => {
        setProfileData({
            ...profileData,
            customFields: profileData.customFields.map((field) =>
                field.id === id ? { ...field, [key]: newValue } : field
            ),
        });
    };

    const addInterest = () => {
        if (newInterest.trim()) {
            const newInterestObj = {
                id: Date.now().toString(),
                name: newInterest,
                icon: 'Music', // Default icon
                color: 'pink', // Default color
            };
            setProfileData({
                ...profileData,
                interests: [...profileData.interests, newInterestObj],
            });
            setNewInterest('');
            setShowAddInterest(false);
        }
    };

    const deleteInterest = (id: string) => {
        setProfileData({
            ...profileData,
            interests: profileData.interests.filter((interest) => interest.id !== id),
        });
    };

    const getIconComponent = (iconName: string) => {
        const icons: { [key: string]: any } = {
            Music,
            Camera,
            Plane,
            Coffee,
        };
        return icons[iconName] || Music;
    };

    return (
        <Page>
            <List>
                {/* Header & Photo Section */}
                <Section>
                    <div style={{ padding: 0, textAlign: 'center', position: 'relative' }}>
                        {/* Carousel */}
                        <div className="embla" ref={emblaRef} style={{ overflow: 'hidden', width: '100%' }}>
                            <div className="embla__container" style={{ display: 'flex' }}>
                                {profileData.photos.map((photo, index) => (
                                    <div className="embla__slide" key={index} style={{ flex: '0 0 100%', minWidth: 0 }}>
                                        <img
                                            src={photo}
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
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, color: 'var(--tgui--secondary_text_color)' }}>
                            <MapPin size={16} />
                            <span>{profileData.distance} miles away</span>
                        </div>
                    </div>

                    <Cell
                        before={isEditing ? <XIcon size={20} /> : <Camera size={20} />}
                        after={
                            isEditing ? (
                                <Button size="s" onClick={handleSave} mode="filled" before={<Check size={16} />}>Save</Button>
                            ) : (
                                <Button size="s" onClick={() => setIsEditing(true)} mode="bezeled">Edit Profile</Button>
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
                    {profileData.showWork && (
                        <Cell
                            before={<Avatar size={28} style={{ background: 'var(--tgui--secondary_bg_color)' }}><Briefcase size={16} /></Avatar>}
                            description={isEditing ? 'Job Title' : undefined}
                            after={isEditing && <IconButton mode="plain" onClick={() => deleteSection('showWork')}><Trash2 size={16} /></IconButton>}
                        >
                            {isEditing ? (
                                <Input
                                    value={profileData.work}
                                    onChange={(e) => setProfileData({ ...profileData, work: e.target.value })}
                                />
                            ) : (
                                profileData.work
                            )}
                        </Cell>
                    )}

                    {profileData.showEducation && (
                        <Cell
                            before={<Avatar size={28} style={{ background: 'var(--tgui--secondary_bg_color)' }}><GraduationCap size={16} /></Avatar>}
                            description={isEditing ? 'Education' : undefined}
                            after={isEditing && <IconButton mode="plain" onClick={() => deleteSection('showEducation')}><Trash2 size={16} /></IconButton>}
                        >
                            {isEditing ? (
                                <Input
                                    value={profileData.education}
                                    onChange={(e) => setProfileData({ ...profileData, education: e.target.value })}
                                />
                            ) : (
                                profileData.education
                            )}
                        </Cell>
                    )}

                    {profileData.showLocation && (
                        <Cell
                            before={<Avatar size={28} style={{ background: 'var(--tgui--secondary_bg_color)' }}><MapPin size={16} /></Avatar>}
                            description={isEditing ? 'Location' : undefined}
                            after={isEditing && <IconButton mode="plain" onClick={() => deleteSection('showLocation')}><Trash2 size={16} /></IconButton>}
                        >
                            {isEditing ? (
                                <Input
                                    value={profileData.location}
                                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                                />
                            ) : (
                                profileData.location
                            )}
                        </Cell>
                    )}

                    {/* Custom Fields */}
                    {profileData.customFields.map((field) => (
                        <Cell
                            key={field.id}
                            before={<Avatar size={28} style={{ background: 'var(--tgui--secondary_bg_color)' }}><Info size={16} /></Avatar>}
                            description={isEditing ? 'Custom Field' : field.name}
                            after={isEditing && <IconButton mode="plain" onClick={() => deleteCustomField(field.id)}><Trash2 size={16} /></IconButton>}
                        >
                            {isEditing ? (
                                <div style={{ display: 'flex', gap: 5 }}>
                                    <Input
                                        placeholder="Name"
                                        value={field.name}
                                        onChange={(e) => updateCustomField(field.id, 'name', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Value"
                                        value={field.value}
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


                {/* Interests Section */}
                {profileData.showInterests && (
                    <Section header="Interests">
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '0 20px 20px' }}>
                            {profileData.interests.map((interest) => {
                                const IconComponent = getIconComponent(interest.icon);
                                // Fallback for color mapping or use TGUI chips ideally
                                return (
                                    <div
                                        key={interest.id}
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
                                        <IconComponent size={14} />
                                        {interest.name}
                                        {isEditing && (
                                            <XIcon
                                                size={14}
                                                style={{ cursor: 'pointer', opacity: 0.6 }}
                                                onClick={() => deleteInterest(interest.id)}
                                            />
                                        )}
                                    </div>
                                );
                            })}

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

            </List>
        </Page>
    );
}