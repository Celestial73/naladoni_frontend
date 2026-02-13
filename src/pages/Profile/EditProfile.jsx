import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '@/components/Layout/Page.jsx';
import { HalftoneBackground } from '@/components/HalftoneBackground.jsx';
import { CircleButton } from '@/components/CircleButton/CircleButton.jsx';
import { ErrorMessage } from '@/components/ErrorMessage.jsx';
import { colors } from '@/constants/colors.js';
import { EditFieldCard } from '@/components/Profile/ProfileEdit/EditFieldCard.jsx';
import { PhotoEditRow } from '@/components/Profile/ProfileEdit/PhotoEditRow.jsx';
import { EditInfoCard } from '@/components/Profile/ProfileEdit/EditInfoCard.jsx';
import { SectionTitle } from '@/pages/Events/SectionTitle.jsx';
import { useEditProfile } from '@/hooks/useEditProfile.js';
import { profileService } from '@/services/api/profileService.js';
import { Save, ArrowLeft, Palette } from 'lucide-react';
import { normalizeApiColor, darkenHex } from '@/utils/colorUtils.js';
import { useDataCache } from '@/context/DataCacheProvider.jsx';
import { LoadingPage } from '@/components/LoadingPage.jsx';

const INTEREST_COLORS = [
    '#e74c3c', '#27ae60', '#f39c12', '#8e44ad',
    '#2980b9', '#e67e22', '#1abc9c', '#c0392b',
    '#d35400', '#2c3e50', '#16a085', '#7f8c8d',
];

function getInterestColor(index) {
    return INTEREST_COLORS[index % INTEREST_COLORS.length];
}

export function EditProfile() {
    const navigate = useNavigate();
    const { updateProfileCache } = useDataCache();
    const fileInputRef = useRef(null);

    const { formData, setFormData, fetching, error, refetch } = useEditProfile();
    
    const [saving, setSaving] = useState(false);
    const [uploadingPhotos, setUploadingPhotos] = useState(false);
    const [deletingPhotos, setDeletingPhotos] = useState(false);

    // --- Generic field change ---
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError(null);
    };

    // --- Photo handlers ---
    const handlePhotoAddClick = () => {
        if (uploadingPhotos || deletingPhotos) return;
        fileInputRef.current?.click();
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        for (const file of files) {
            if (!allowedTypes.includes(file.type)) {
                setError('Допустимы только изображения (JPEG, PNG, GIF, WebP)');
                e.target.value = '';
                return;
            }
            if (file.size > maxSize) {
                setError('Максимальный размер файла — 5MB');
                e.target.value = '';
                return;
            }
        }

        uploadPhotos(files);
        e.target.value = '';
    };

    const uploadPhotos = async (files) => {
        setUploadingPhotos(true);
        setError(null);
        try {
            const response = await profileService.uploadPhotos(files);
            setFormData(prev => ({ ...prev, photos: response.photos || [] }));
        } catch (err) {
            setError(err.message || 'Не удалось загрузить фото');
        } finally {
            setUploadingPhotos(false);
        }
    };

    const handleDeletePhoto = async (index) => {
        const photoUrl = formData.photos[index];
        if (!photoUrl || deletingPhotos) return;

        setDeletingPhotos(true);
        setError(null);
        try {
            const response = await profileService.deletePhotos([photoUrl]);
            setFormData(prev => ({ ...prev, photos: response.photos || [] }));
        } catch (err) {
            setError(err.message || 'Не удалось удалить фото');
        } finally {
            setDeletingPhotos(false);
        }
    };

    // --- Custom fields (fun facts) handlers ---
    const addCustomField = () => {
        setFormData(prev => ({
            ...prev,
            customFields: [...prev.customFields, {
                id: Date.now().toString(),
                title: '',
                value: '',
            }],
        }));
    };

    const deleteCustomField = (index) => {
        setFormData(prev => ({
            ...prev,
            customFields: prev.customFields.filter((_, i) => i !== index),
        }));
    };

    const updateCustomFieldTitle = (index, newTitle) => {
        setFormData(prev => ({
            ...prev,
            customFields: prev.customFields.map((field, i) =>
                i === index ? { ...field, title: newTitle } : field
            ),
        }));
    };

    const updateCustomFieldValue = (index, newValue) => {
        setFormData(prev => ({
            ...prev,
            customFields: prev.customFields.map((field, i) =>
                i === index ? { ...field, value: newValue } : field
            ),
        }));
    };

    // --- Interests handlers ---
    const addInterest = () => {
        setFormData(prev => ({
            ...prev,
            interests: [...prev.interests, ''],
        }));
    };

    const updateInterest = (index, value) => {
        setFormData(prev => {
            const newInterests = [...prev.interests];
            newInterests[index] = value;
            return { ...prev, interests: newInterests };
        });
    };

    const deleteInterest = (index) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.filter((_, i) => i !== index),
        }));
    };

    // --- Submit handler ---
    const handleSubmit = async () => {
        setError(null);
        setSaving(true);
        try {
            const payload = {
                display_name: formData.name,
                age: formData.age ? parseInt(formData.age) : undefined,
                bio: formData.bio,
                gender: formData.gender,
                interests: formData.interests.filter(i => i.trim() !== ''),
                custom_fields: formData.customFields.map(field => ({
                    title: field.title,
                    value: field.value,
                })),
                background_color: formData.backgroundColor,
            };

            // Remove undefined fields
            Object.keys(payload).forEach(key => {
                if (payload[key] === undefined) delete payload[key];
            });

            const updatedProfile = await profileService.updateProfile(payload);
            updateProfileCache({ profileData: updatedProfile });
            navigate('/profile');
        } catch (err) {
            setError(err.message || 'Не удалось сохранить профиль');
        } finally {
            setSaving(false);
        }
    };

    // --- Data mapping for child components ---
    const funFactsForCard = formData.customFields.map(field => ({
        id: field.id,
        title: field.title,
        text: field.value,
    }));

    const interestsForCard = formData.interests.map((label, index) => ({
        label,
        color: getInterestColor(index),
    }));

    const isLoading = saving || uploadingPhotos || deletingPhotos;

    // Derive background colors from form state
    const bgColor = normalizeApiColor(formData.backgroundColor, colors.profilePrimary);
    const bgColorDark = darkenHex(bgColor, 0.5);

    // --- Loading state ---
    if (fetching) {
        return <LoadingPage text="Загрузка профиля..." />;
    }

    return (
        <Page>
            <div style={{
                backgroundColor: bgColor,
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
                <HalftoneBackground color={bgColorDark} />

                {/* Back button */}
                <CircleButton
                    icon={<ArrowLeft size={20} color={bgColor} />}
                    onClick={() => navigate('/profile')}
                    disabled={isLoading}
                    position="top-left"
                />

                {/* Save button (floating) */}
                <CircleButton
                    icon={<Save size={18} color={bgColor} />}
                    onClick={handleSubmit}
                    disabled={isLoading}
                    position="top-right"
                />

                {/* Hidden file input for photo upload */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />

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


                </div>

                {/* Background color picker */}
                <div style={{
                    width: '90%',
                    marginTop: '1em',
                    position: 'relative',
                    zIndex: 1,
                    backgroundColor: colors.white,
                    borderRadius: '16px',
                    padding: '0.8em 1em',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75em',
                    boxShadow: '4px 6px 0px rgba(0, 0, 0, 0.2)'
                }}>
                    <Palette size={20} color={bgColor} style={{ flexShrink: 0 }} />
                    <span style={{
                        fontSize: '0.9em',
                        fontWeight: '600',
                        color: colors.textDark,
                        whiteSpace: 'nowrap'
                    }}>
                        Цвет фона:
                    </span>
                    <label style={{
                        position: 'relative',
                        width: '36px',
                        height: '36px',
                        flexShrink: 0,
                        cursor: 'pointer',
                    }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: bgColor,
                            border: `2px solid ${colors.borderGrey}`,
                            boxSizing: 'border-box',
                        }} />
                        <input
                            type="color"
                            value={bgColor}
                            onChange={(e) => {
                                const hex = e.target.value.replace('#', '');
                                handleChange('backgroundColor', hex);
                            }}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                opacity: 0,
                                cursor: 'pointer',
                            }}
                        />
                    </label>
                    <span style={{
                        fontSize: '0.85em',
                        fontFamily: 'monospace',
                        color: colors.textLight,
                        textTransform: 'uppercase'
                    }}>
                        #{formData.backgroundColor}
                    </span>
                </div>

                {/* Error message */}
                <ErrorMessage message={error} />

                {/* Name and age inputs */}
                <div style={{
                    width: '100%',
                    position: 'relative',
                    zIndex: 1,
                    marginTop: '1.5em',
                    minHeight: '10em'
                }}>
                    <EditFieldCard
                        title="Имя!"
                        placeholder="Введите имя"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        style={{
                            width: '45%',
                            position: 'absolute',
                            top: 0,
                            left: '3%'
                        }}
                    />

                    <EditFieldCard
                        title="Возраст!"
                        placeholder="Введите возраст"
                        value={formData.age}
                        onChange={(e) => handleChange('age', e.target.value)}
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
                        width: '100%',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        <SectionTitle align="left" fontSize="3em">
                            ФОТКИ:
                        </SectionTitle>
                    </div>

                    <div style={{
                        width: '100%',
                        padding: '0 2%',
                        boxSizing: 'border-box',
                        position: 'relative',
                        zIndex: 1,
                        marginTop: '0.5em'
                    }}>
                        <PhotoEditRow
                            photos={formData.photos}
                            onAddClick={handlePhotoAddClick}
                            onDeleteClick={handleDeletePhoto}
                        />
                        {uploadingPhotos && (
                            <div style={{
                                textAlign: 'center',
                                marginTop: '0.5em',
                                color: colors.white,
                                fontSize: '0.9em',
                                fontWeight: '600'
                            }}>
                                Загрузка...
                            </div>
                        )}
                    </div>
                </div>

                {/* Info card edit section */}
                <EditInfoCard
                    bio={formData.bio}
                    onBioChange={(value) => handleChange('bio', value)}
                    funFacts={funFactsForCard}
                    onTitleChange={updateCustomFieldTitle}
                    onTextChange={updateCustomFieldValue}
                    onIconClick={() => {}}
                    onDeleteItem={deleteCustomField}
                    onAddItem={addCustomField}
                    interests={interestsForCard}
                    onInterestChange={updateInterest}
                    onDeleteInterest={deleteInterest}
                    onAddInterest={addInterest}
                    accentColor={bgColor}
                />

                {/* Bottom save button */}
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    style={{
                        width: '90%',
                        marginTop: '2em',
                        padding: '1em',
                        backgroundColor: colors.white,
                        color: bgColor,
                        border: 'none',
                        borderRadius: '20px',
                        fontSize: '1.3em',
                        fontWeight: '700',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        position: 'relative',
                        zIndex: 1,
                        boxShadow: '8px 10px 0px rgba(0, 0, 0, 0.25)',
                        opacity: isLoading ? 0.6 : 1,
                        fontFamily: "'Uni Sans', sans-serif",
                        fontStyle: 'italic',
                        letterSpacing: '0.05em'
                    }}
                >
                    {saving ? 'СОХРАНЕНИЕ...' : 'СОХРАНИТЬ'}
                </button>
            </div>
        </Page>
    );
}
