import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '@/components/Layout/Page.jsx';
import { HalftoneBackground } from '@/components/HalftoneBackground.jsx';
import { colors } from '@/constants/colors.js';
import { EditFieldCard } from '@/components/Profile/ProfileEdit/EditFieldCard.jsx';
import { PhotoEditRow } from '@/components/Profile/ProfileEdit/PhotoEditRow.jsx';
import { EditInfoCard } from '@/components/Profile/ProfileEdit/EditInfoCard.jsx';
import useAuth from '@/hooks/useAuth';
import { profileService } from '@/services/api/profileService.js';
import { Save, ArrowLeft } from 'lucide-react';

const INTEREST_COLORS = [
    '#e74c3c', '#27ae60', '#f39c12', '#8e44ad',
    '#2980b9', '#e67e22', '#1abc9c', '#c0392b',
    '#d35400', '#2c3e50', '#16a085', '#7f8c8d',
];

function getInterestColor(index) {
    return INTEREST_COLORS[index % INTEREST_COLORS.length];
}

export function NewEditProfile() {
    const navigate = useNavigate();
    const { auth } = useAuth();
    const fileInputRef = useRef(null);

    const [fetching, setFetching] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingPhotos, setUploadingPhotos] = useState(false);
    const [deletingPhotos, setDeletingPhotos] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        name: auth.user?.name || '',
        age: '',
        photos: [],
        bio: '',
        gender: '',
        customFields: [],
        interests: [],
    });

    // Fetch profile on mount
    useEffect(() => {
        if (!auth?.initData) {
            setFetching(false);
            return;
        }

        const abortController = new AbortController();

        const fetchProfile = async () => {
            try {
                setFetching(true);
                setError(null);
                const response = await profileService.getMyProfile(abortController.signal);

                if (response) {
                    setFormData({
                        name: response.display_name || auth.user?.name || '',
                        age: response.age?.toString() || '',
                        photos: response.photos || [],
                        bio: response.bio || '',
                        gender: response.gender || '',
                        customFields: (response.custom_fields || []).map((field, index) => ({
                            id: field.id || `field-${index}-${Date.now()}`,
                            title: field.title || '',
                            value: field.value || '',
                        })),
                        interests: response.interests || [],
                    });
                }
            } catch (err) {
                if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
                    setError(err.response?.data?.message || err.message || 'Failed to fetch profile');
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setFetching(false);
                }
            }
        };

        fetchProfile();

        return () => abortController.abort();
    }, [auth?.initData, auth.user?.name]);

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
            };

            // Remove undefined fields
            Object.keys(payload).forEach(key => {
                if (payload[key] === undefined) delete payload[key];
            });

            await profileService.updateProfile(payload);
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

    // --- Loading state ---
    if (fetching) {
        return (
            <Page>
                <div style={{
                    backgroundColor: colors.profilePrimary,
                    minHeight: '100vh',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                }}>
                    <HalftoneBackground color={colors.profilePrimaryDark} />
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
                        Загрузка профиля...
                    </div>
                </div>
            </Page>
        );
    }

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
                    <HalftoneBackground color={colors.profilePrimaryDark} />
                </div>

                {/* Back button */}
                <button
                    onClick={() => navigate('/profile')}
                    disabled={isLoading}
                    style={{
                        position: 'fixed',
                        top: '1em',
                        left: '1em',
                        zIndex: 10,
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        backgroundColor: colors.white,
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                        opacity: isLoading ? 0.6 : 1
                    }}
                >
                    <ArrowLeft size={20} color={colors.profilePrimary} />
                </button>

                {/* Save button (floating) */}
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    style={{
                        position: 'fixed',
                        top: '1em',
                        right: '1em',
                        zIndex: 10,
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        backgroundColor: colors.white,
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                        opacity: isLoading ? 0.6 : 1
                    }}
                >
                    <Save size={18} color={colors.profilePrimary} />
                </button>

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
                        color: colors.profilePrimary,
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
