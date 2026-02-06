import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Avatar,
    Button,
    Cell,
    List,
    Section,
    Input,
    Textarea,
    IconButton
} from '@telegram-apps/telegram-ui';
import {
    Trash2,
    Plus as PlusIcon,
    X as XIcon,
    Info,
    Image as ImageIcon,
} from 'lucide-react';
import { Page } from '@/components/Layout/Page.jsx';
import useAuth from '@/hooks/useAuth';
import { profileService } from '@/services/api/profileService.js';
import { confirmAction } from '@/utils/confirmDialog.js';

export function EditProfile() {
    const navigate = useNavigate();
    const { auth } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState(null);
    const bioTextareaRef = useRef(null);

    const [formData, setFormData] = useState({
        name: auth.user?.name || '',
        age: '',
        photos: [],
        bio: '',
        gender: '',
        showBio: true,
        showInterests: true,
        customFields: [],
        interests: [],
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadingPhotos, setUploadingPhotos] = useState(false);
    const [deletingPhotos, setDeletingPhotos] = useState(false);
    const fileInputRef = useRef(null);

    // Fetch profile data on mount
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
                        photos: response.photos || [],
                        bio: response.bio || '',
                        gender: response.gender || '',
                        interests: response.interests || [],
                        customFields: (response.custom_fields || []).map((field, index) => ({
                            ...field,
                            id: field.id || `field-${index}-${Date.now()}`
                        })),
                        showBio: response.showBio !== undefined ? response.showBio : true,
                        showInterests: response.showInterests !== undefined ? response.showInterests : true,
                        age: response.age?.toString() || '',
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

        return () => {
            abortController.abort();
        };
    }, [auth?.initData, auth.user?.name]);

    // Auto-resize bio textarea
    useEffect(() => {
        if (bioTextareaRef.current && formData.showBio) {
            const timer = setTimeout(() => {
                if (bioTextareaRef.current) {
                    bioTextareaRef.current.style.height = 'auto';
                    bioTextareaRef.current.style.height = `${bioTextareaRef.current.scrollHeight}px`;
                }
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [formData.bio, formData.showBio]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError(null);
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        setError(null);

        setLoading(true);
        try {
            // Map formData to backend format
            const payload = {
                display_name: formData.name,
                age: formData.age ? parseInt(formData.age) : undefined,
                bio: formData.bio,
                gender: formData.gender,
                interests: formData.interests,
                custom_fields: formData.customFields.map(field => ({
                    title: field.title,
                    value: field.value
                })),
                showBio: formData.showBio,
                showInterests: formData.showInterests,
            };
            
            // Remove undefined fields
            Object.keys(payload).forEach(key => {
                if (payload[key] === undefined) {
                    delete payload[key];
                }
            });
            
            await profileService.updateProfile(payload);
            navigate('/profile');
        } catch (err) {
            setError(err.message || 'Failed to save profile');
        } finally {
            setLoading(false);
        }
    };

    const deleteSection = (section) => {
        setFormData(prev => ({ ...prev, [section]: false }));
    };
    
    const restoreSection = (section) => {
        setFormData(prev => ({ ...prev, [section]: true }));
        // Trigger resize for bio textarea if restoring bio section
        if (section === 'showBio') {
            setTimeout(() => {
                if (bioTextareaRef.current) {
                    bioTextareaRef.current.style.height = 'auto';
                    bioTextareaRef.current.style.height = `${bioTextareaRef.current.scrollHeight}px`;
                }
            }, 10);
        }
    };

    const addCustomField = () => {
        const newField = {
            id: Date.now().toString(),
            title: '',
            value: '',
        };
        setFormData(prev => ({
            ...prev,
            customFields: [...prev.customFields, newField],
        }));
    };

    const deleteCustomField = (id) => {
        setFormData(prev => ({
            ...prev,
            customFields: prev.customFields.filter((field) => field.id !== id),
        }));
    };

    const updateCustomField = (id, key, newValue) => {
        setFormData(prev => ({
            ...prev,
            customFields: prev.customFields.map((field) =>
                field.id === id ? { ...field, [key]: newValue } : field
            ),
        }));
    };

    const addInterest = () => {
        setFormData(prev => ({
            ...prev,
            interests: [...prev.interests, ''],
        }));
    };

    const deleteInterest = (interestToDelete) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.filter((interest) => interest !== interestToDelete),
        }));
    };

    const updateInterest = (index, value) => {
        setFormData(prev => {
            const newInterests = [...prev.interests];
            newInterests[index] = value;
            return { ...prev, interests: newInterests };
        });
    };

    const validateFiles = (files) => {
        const maxFiles = 3;
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        if (files.length > maxFiles) {
            return { valid: false, error: `You can only upload up to ${maxFiles} images` };
        }

        for (const file of files) {
            if (!allowedTypes.includes(file.type)) {
                return { valid: false, error: 'Only image files are allowed (JPEG, PNG, GIF, WebP)' };
            }
            if (file.size > maxSize) {
                return { valid: false, error: `File size too large. Maximum size is 5MB per file` };
            }
        }

        return { valid: true };
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const validation = validateFiles(files);
        if (!validation.valid) {
            setError(validation.error);
            e.target.value = ''; // Reset input
            return;
        }

        setSelectedFiles(files);
        setError(null);
    };

    const handleUploadPhotos = async () => {
        if (selectedFiles.length === 0) {
            setError('Please select at least one image to upload');
            return;
        }

        setUploadingPhotos(true);
        setError(null);

        try {
            const response = await profileService.uploadPhotos(selectedFiles);
            
            // Update formData with the new photos array from response
            setFormData(prev => ({
                ...prev,
                photos: response.photos || []
            }));
            
            // Clear selected files
            setSelectedFiles([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err) {
            setError(err.message || 'Failed to upload photos');
        } finally {
            setUploadingPhotos(false);
        }
    };

    const handleDeletePhoto = async (photoUrl) => {
        const confirmed = await confirmAction(
            'Are you sure you want to delete this photo?',
            'Delete Photo'
        );

        if (!confirmed) {
            return;
        }

        setDeletingPhotos(true);
        setError(null);

        try {
            const response = await profileService.deletePhotos([photoUrl]);
            
            // Update formData with the new photos array from response
            setFormData(prev => ({
                ...prev,
                photos: response.photos || []
            }));
        } catch (err) {
            setError(err.message || 'Failed to delete photo');
        } finally {
            setDeletingPhotos(false);
        }
    };

    if (fetching) {
        return (
            <Page>
                <div style={{ padding: 20, textAlign: 'center', opacity: 0.5 }}>
                    Loading profile...
                </div>
            </Page>
        );
    }

    return (
        <Page>
            <form onSubmit={handleSubmit}>
                <List>
                    <Section header="Basic Information">
                        <div style={{ padding: '12px 20px' }}>
                            <div style={{ 
                                fontSize: '14px', 
                                fontWeight: 500, 
                                color: 'var(--tgui--hint_color)',
                                marginBottom: '8px'
                            }}>
                                Display Name
                            </div>
                            <Input
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="Enter your name"
                            />
                        </div>

                        <div style={{ padding: '12px 20px' }}>
                            <div style={{ 
                                fontSize: '14px', 
                                fontWeight: 500, 
                                color: 'var(--tgui--hint_color)',
                                marginBottom: '8px'
                            }}>
                                Age
                            </div>
                            <Input
                                type="number"
                                value={formData.age}
                                onChange={(e) => handleChange('age', e.target.value)}
                                placeholder="Enter your age"
                                min="1"
                            />
                        </div>

                        <div style={{ padding: '12px 20px' }}>
                            <div style={{ 
                                fontSize: '14px', 
                                fontWeight: 500, 
                                color: 'var(--tgui--hint_color)',
                                marginBottom: '8px'
                            }}>
                                Gender
                            </div>
                            <Input
                                value={formData.gender}
                                onChange={(e) => handleChange('gender', e.target.value)}
                                placeholder="Enter your gender"
                            />
                        </div>

                        {/* Photo Upload Section */}
                        <div style={{ padding: '12px 20px' }}>
                            <div style={{ 
                                fontSize: '14px', 
                                fontWeight: 500, 
                                color: 'var(--tgui--hint_color)',
                                marginBottom: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <ImageIcon size={16} />
                                Profile Photos (up to 3)
                            </div>
                            
                            {/* File Input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                multiple
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                            
                            <Button
                                mode="outline"
                                size="m"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingPhotos || deletingPhotos || loading}
                                style={{ width: '100%', marginBottom: '12px' }}
                            >
                                <ImageIcon size={16} style={{ marginRight: 8 }} />
                                Select Images
                            </Button>

                            {/* Selected Files Preview */}
                            {selectedFiles.length > 0 && (
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ 
                                        fontSize: '12px', 
                                        color: 'var(--tgui--hint_color)',
                                        marginBottom: '8px'
                                    }}>
                                        {selectedFiles.length} file(s) selected
                                    </div>
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(3, 1fr)', 
                                        gap: '8px',
                                        marginBottom: '8px'
                                    }}>
                                        {selectedFiles.map((file, index) => (
                                            <div key={index} style={{ position: 'relative' }}>
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={`Preview ${index + 1}`}
                                                    style={{
                                                        width: '100%',
                                                        aspectRatio: '1',
                                                        objectFit: 'cover',
                                                        borderRadius: '8px',
                                                        border: '1px solid var(--tgui--separator_color, #e0e0e0)'
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <Button
                                        mode="filled"
                                        size="m"
                                        onClick={handleUploadPhotos}
                                        disabled={uploadingPhotos || deletingPhotos || loading}
                                        style={{ width: '100%' }}
                                    >
                                        {uploadingPhotos ? 'Uploading...' : 'Upload Photos'}
                                    </Button>
                                </div>
                            )}

                            {/* Existing Photos Preview */}
                            {formData.photos && formData.photos.length > 0 && (
                                <div>
                                    <div style={{ 
                                        fontSize: '12px', 
                                        color: 'var(--tgui--hint_color)',
                                        marginBottom: '8px',
                                        marginTop: selectedFiles.length > 0 ? '12px' : '0'
                                    }}>
                                        Current photos ({formData.photos.length})
                                    </div>
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(3, 1fr)', 
                                        gap: '8px'
                                    }}>
                                        {formData.photos.map((photoUrl, index) => (
                                            <div key={index} style={{ position: 'relative' }}>
                                                <img
                                                    src={photoUrl}
                                                    alt={`Photo ${index + 1}`}
                                                    style={{
                                                        width: '100%',
                                                        aspectRatio: '1',
                                                        objectFit: 'cover',
                                                        borderRadius: '8px',
                                                        border: '1px solid var(--tgui--separator_color, #e0e0e0)'
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeletePhoto(photoUrl)}
                                                    disabled={deletingPhotos || loading}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '4px',
                                                        right: '4px',
                                                        background: 'rgba(0, 0, 0, 0.6)',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: '24px',
                                                        height: '24px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: deletingPhotos || loading ? 'not-allowed' : 'pointer',
                                                        opacity: deletingPhotos || loading ? 0.5 : 1,
                                                        transition: 'opacity 0.2s'
                                                    }}
                                                    title="Delete photo"
                                                >
                                                    <Trash2 size={12} color="white" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Section>

                    {/* Bio Section */}
                    {formData.showBio && (
                        <Section header={
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between', 
                                width: '100%',
                            }}>
                                <span style={{ 
                                    fontSize: 'var(--tgui--section_header_font_size, 14px)',
                                    fontWeight: 'var(--tgui--section_header_font_weight, 500)',
                                    color: 'var(--tgui--section_header_text_color, var(--tgui--hint_color))',
                                    lineHeight: 'var(--tgui--section_header_line_height, 1.5)',
                                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                    marginLeft: '20px'
                                }}>About</span>
                                <IconButton mode="plain" onClick={() => deleteSection('showBio')} style={{ marginRight: '20px' }}>
                                    <Trash2 size={16} />
                                </IconButton>
                            </div>
                        }>
                            <div style={{ padding: '12px 20px' }}>
                                <Textarea
                                    ref={bioTextareaRef}
                                    value={formData.bio}
                                    onChange={(e) => {
                                        handleChange('bio', e.target.value);
                                        // Auto-resize on change
                                        if (bioTextareaRef.current) {
                                            bioTextareaRef.current.style.height = 'auto';
                                            bioTextareaRef.current.style.height = `${bioTextareaRef.current.scrollHeight}px`;
                                        }
                                    }}
                                    placeholder="Tell people about yourself..."
                                    rows={4}
                                    style={{ 
                                        width: '100%',
                                        resize: 'vertical',
                                        minHeight: '80px'
                                    }}
                                />
                            </div>
                        </Section>
                    )}

                    {/* Details Section */}
                    <Section header="Details">
                        {/* Custom Fields */}
                        {formData.customFields.map((field) => (
                            <div
                                key={field.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 20px',
                                    gap: '12px'
                                }}
                            >
                                <Avatar size={28} style={{ background: 'var(--tgui--secondary_bg_color)', flexShrink: 0 }}><Info size={16} /></Avatar>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <Input
                                        type="text"
                                        value={field.title || ''}
                                        onChange={(e) => updateCustomField(field.id, 'title', e.target.value)}
                                        placeholder="Field Title"
                                        style={{
                                            fontSize: '14px',
                                        }}
                                    />
                                    <Input
                                        type="text"
                                        value={field.value || ''}
                                        onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
                                        placeholder="Field Value"
                                    />
                                </div>
                                <IconButton mode="plain" onClick={() => deleteCustomField(field.id)} style={{ flexShrink: 0 }}><Trash2 size={16} /></IconButton>
                            </div>
                        ))}

                        {/* Add Custom Field */}
                        <div style={{ padding: '12px 20px' }}>
                            <Button mode="plain" size="s" onClick={addCustomField}>
                                <PlusIcon size={16} style={{ marginRight: 5 }} /> Add Custom Field
                            </Button>
                        </div>
                    </Section>

                    {/* Interests Section */}
                    {formData.showInterests && (
                        <Section header={
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between', 
                                width: '100%',
                                padding: '0 20px'
                            }}>
                                <span style={{ 
                                    fontSize: 'var(--tgui--section_header_font_size, 14px)',
                                    fontWeight: 'var(--tgui--section_header_font_weight, 500)',
                                    color: 'var(--tgui--section_header_text_color, var(--tgui--hint_color))',
                                    lineHeight: 'var(--tgui--section_header_line_height, 1.5)',
                                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                                }}>Interests</span>
                                <IconButton mode="plain" onClick={() => deleteSection('showInterests')}>
                                    <Trash2 size={16} />
                                </IconButton>
                            </div>
                        }>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '0 20px 20px' }}>
                                {formData.interests.map((interest, index) => (
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
                                        <input
                                            type="text"
                                            value={interest}
                                            onChange={(e) => updateInterest(index, e.target.value)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                borderBottom: '2px solid var(--tgui--hint_color, #999)',
                                                outline: 'none',
                                                color: 'var(--tgui--text_color, inherit)',
                                                fontSize: '16px',
                                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                                padding: '0 2px',
                                                display: 'inline-block',
                                                minWidth: '40px',
                                                width: 'auto',
                                                maxWidth: '200px',
                                                lineHeight: '1.5'
                                            }}
                                        />
                                        <XIcon
                                            size={14}
                                            style={{ cursor: 'pointer', opacity: 0.6 }}
                                            onClick={() => deleteInterest(interest)}
                                        />
                                    </div>
                                ))}

                                <Button mode="bezeled" size="s" onClick={addInterest} style={{ borderRadius: 16 }}>
                                    <PlusIcon size={14} /> Add
                                </Button>
                            </div>
                        </Section>
                    )}

                    {/* Hidden Sections - Show to allow restoration */}
                    {(!formData.showBio || !formData.showInterests) && (
                        <Section header="Hidden Sections">
                            {!formData.showBio && (
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
                            {!formData.showInterests && (
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

                    {error && (
                        <Section>
                            <div style={{ 
                                padding: '12px 20px', 
                                color: 'var(--tgui--destructive_text_color)',
                                fontSize: '14px',
                                textAlign: 'center'
                            }}>
                                {error}
                            </div>
                        </Section>
                    )}

                    <Section>
                        <div style={{ padding: '0 20px 20px', display: 'flex', gap: '12px' }}>
                            <Button
                                mode="outline"
                                size="l"
                                stretched
                                onClick={() => navigate('/profile')}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                mode="filled"
                                size="l"
                                stretched
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Profile'}
                            </Button>
                        </div>
                    </Section>
                </List>
            </form>
        </Page>
    );
}

