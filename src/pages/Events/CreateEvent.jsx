import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, MapPin, Users, Image as ImageIcon, Upload, X, Loader } from 'lucide-react';
import { Page } from '@/components/Layout/Page.jsx';
import { HalftoneBackground } from '@/components/HalftoneBackground.jsx';
import { CircleButton } from '@/components/CircleButton/CircleButton.jsx';
import { EditFieldCard } from '@/components/Profile/ProfileEdit/EditFieldCard.jsx';
import { TownPicker } from '@/components/TownPicker/TownPicker.jsx';
import { colors } from '@/constants/colors.js';
import { eventsService } from '@/services/api/eventsService.js';
import { RUSSIAN_CITIES } from '@/data/russianCities.js';

/**
 * Parse ISO datetime string to date format for form input
 * @param {string} isoString - ISO datetime string (e.g., "2024-07-15T00:00:00Z")
 * @returns {string} Date string in YYYY-MM-DD format for form input
 */
const parseISODateToFormInput = (isoString) => {
  if (!isoString) return '';
  
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    
    // Format date as YYYY-MM-DD for input[type="date"]
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    return '';
  }
};

/**
 * Convert date string to ISO 8601 date-only format (YYYY-MM-DD)
 * @param {string} dateStr - Date string (e.g., "2024-07-15" or "2024/07/15")
 * @returns {string|null} ISO 8601 date-only string (YYYY-MM-DD) or null if invalid
 */
const convertDateToISO8601 = (dateStr) => {
  if (!dateStr) return null;
  
  try {
    // If already in YYYY-MM-DD format, validate and return
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return dateStr; // Return as-is if valid
      }
    }
    
    // Parse date - handle various formats
    let date;
    if (dateStr.includes('-')) {
      // ISO format: YYYY-MM-DD
      date = new Date(dateStr);
    } else if (dateStr.includes('/')) {
      // Slash format: MM/DD/YYYY or DD/MM/YYYY
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        // Assume MM/DD/YYYY format
        date = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
      } else {
        date = new Date(dateStr);
      }
    } else {
      // Try native Date parsing
      date = new Date(dateStr);
    }
    
    if (isNaN(date.getTime())) return null;
    
    // Format as ISO 8601 date-only string (YYYY-MM-DD)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    return null;
  }
};

export function CreateEvent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    town: '',
    location: '',
    maxAttendees: '',
    description: '',
    picture: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [deletingPicture, setDeletingPicture] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState(null);

  // Clean up blob URL on unmount / when preview changes
  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  // Fetch event data on mount if in edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const abortController = new AbortController();

    const fetchEvent = async () => {
      try {
        setFetching(true);
        setError(null);
        const event = await eventsService.getEvent(id, abortController.signal);

        // Parse ISO date from API to form input
        const dateStr = parseISODateToFormInput(event.date || '');

        setFormData({
          title: event.title || '',
          date: dateStr,
          town: event.town || '',
          location: event.location || '',
          maxAttendees: event.capacity?.toString() || '',
          description: event.description || '',
          picture: event.picture || '',
        });
      } catch (err) {
        if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
          if (!abortController.signal.aborted) {
            setError(err.message || 'Не удалось загрузить событие');
          }
        }
      } finally {
        if (!abortController.signal.aborted) {
          setFetching(false);
        }
      }
    };

    fetchEvent();

    return () => {
      abortController.abort();
    };
  }, [id, isEditMode]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  // --- Picture handlers ---
  const handlePictureClick = () => {
    if (uploadingPicture || deletingPicture) return;
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5 MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

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

    // If we already had a local preview, revoke it
    if (filePreview) URL.revokeObjectURL(filePreview);

    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
    setError(null);
    e.target.value = '';
  };

  const uploadPictureForEvent = async (eventId) => {
    if (!selectedFile) return;
    setUploadingPicture(true);
    setError(null);
    try {
      const updatedEvent = await eventsService.uploadEventPicture(eventId, selectedFile);
      setFormData(prev => ({ ...prev, picture: updatedEvent.picture || '' }));
      setSelectedFile(null);
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
        setFilePreview(null);
      }
      return updatedEvent;
    } catch (err) {
      setError(err.message || 'Не удалось загрузить изображение');
      return null;
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleDeletePicture = async () => {
    if (!isEditMode || deletingPicture) return;
    setDeletingPicture(true);
    setError(null);
    try {
      const updatedEvent = await eventsService.deleteEventPicture(id);
      setFormData(prev => ({ ...prev, picture: updatedEvent.picture || '' }));
    } catch (err) {
      setError(err.message || 'Не удалось удалить изображение');
    } finally {
      setDeletingPicture(false);
    }
  };

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError(null);

    // Validation
    if (!formData.title.trim()) {
      setError('Название события обязательно');
      return;
    }
    if (!formData.date.trim()) {
      setError('Дата обязательна');
      return;
    }
    if (!formData.town.trim()) {
      setError('Город обязателен');
      return;
    }
    if (!RUSSIAN_CITIES.includes(formData.town)) {
      setError('Пожалуйста, выберите город из списка');
      return;
    }
    if (!formData.location.trim()) {
      setError('Место проведения обязательно');
      return;
    }
    if (!formData.maxAttendees || parseInt(formData.maxAttendees) < 1) {
      setError('Максимальное количество участников должно быть не менее 1');
      return;
    }

    setLoading(true);
    try {
      // Convert date to ISO 8601 date-only format (YYYY-MM-DD)
      const dateISO = convertDateToISO8601(formData.date);
      if (!dateISO) {
        setError('Неверный формат даты. Пожалуйста, используйте корректную дату.');
        setLoading(false);
        return;
      }

      // Prepare payload
      const payload = {
        title: formData.title.trim(),
        town: formData.town.trim(),
        location: formData.location.trim(),
        date: dateISO,
        capacity: parseInt(formData.maxAttendees),
      };

      // Add optional fields if they have values
      if (formData.description.trim()) {
        payload.description = formData.description.trim();
      }

      let createdEvent;
      if (isEditMode) {
        createdEvent = await eventsService.updateEvent(id, payload);
      } else {
        createdEvent = await eventsService.createEvent(payload);
      }

      // Upload picture if a file was selected
      const eventId = isEditMode ? id : (createdEvent?.id || createdEvent?._id);
      if (selectedFile && eventId) {
        setUploadingPicture(true);
        try {
          await eventsService.uploadEventPicture(eventId, selectedFile);
        } catch (pictureErr) {
          console.warn('Event saved but picture upload failed:', pictureErr.message);
        } finally {
          setUploadingPicture(false);
        }
      }

      navigate('/events');
    } catch (err) {
      setError(err.message || `Не удалось ${isEditMode ? 'обновить' : 'создать'} событие`);
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading || uploadingPicture || deletingPicture;

  // Loading state
  if (fetching) {
    return (
      <Page>
        <div style={{
          backgroundColor: colors.eventPrimary,
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <HalftoneBackground color={colors.eventPrimaryDark} />
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
            Загрузка события...
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div style={{
        backgroundColor: colors.eventPrimary,
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
          <HalftoneBackground color={colors.eventPrimaryDark} />
        </div>

        {/* Back button */}
        <CircleButton
          icon={<ArrowLeft size={20} color={colors.eventPrimary} />}
          onClick={() => navigate('/events')}
          disabled={isLoading}
          position="top-left"
        />

        {/* Save button (floating) */}
        <CircleButton
          icon={<Save size={18} color={colors.eventPrimary} />}
          onClick={handleSubmit}
          disabled={isLoading}
          position="top-right"
        />

        {/* Hidden file input for picture upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
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
            {isEditMode ? 'Это настройки события.' : 'Создайте новое событие.'}
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

        {/* Single large card with all input fields */}
        <div style={{
          width: '90%',
          marginTop: '1.5em',
          position: 'relative',
          zIndex: 1,
          backgroundColor: colors.white,
          borderRadius: '47px 0 47px 0',
          padding: '2em 1.5em',
          boxSizing: 'border-box',
          boxShadow: '10px 14px 0px rgba(0, 0, 0, 0.25)'
        }}>
          {/* Title */}
          <div style={{ marginBottom: '1.5em' }}>
            <div style={{
              fontSize: '1em',
              fontWeight: '600',
              fontFamily: "'Montserrat', sans-serif",
              color: colors.textDark,
              marginBottom: '0.5em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5em'
            }}>
              <Calendar size={18} color={colors.eventPrimary} />
              Название события *
            </div>
            <input
              type="text"
              placeholder="Введите название события"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75em',
                boxSizing: 'border-box',
                border: `2px solid ${colors.borderGrey}`,
                borderRadius: '12px',
                fontSize: '0.95em',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Date */}
          <div style={{ marginBottom: '1.5em' }}>
            <div style={{
              fontSize: '1em',
              fontWeight: '600',
              fontFamily: "'Montserrat', sans-serif",
              color: colors.textDark,
              marginBottom: '0.5em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5em'
            }}>
              <Calendar size={18} color={colors.eventPrimary} />
              Дата события *
            </div>
            <input
              type="date"
              placeholder="Выберите дату"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75em',
                boxSizing: 'border-box',
                border: `2px solid ${colors.borderGrey}`,
                borderRadius: '12px',
                fontSize: '0.95em',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Town */}
          <div style={{ marginBottom: '1.5em' }}>
            <div style={{
              fontSize: '1em',
              fontWeight: '600',
              fontFamily: "'Montserrat', sans-serif",
              color: colors.textDark,
              marginBottom: '0.5em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5em'
            }}>
              <MapPin size={18} color={colors.eventPrimary} />
              Город *
            </div>
            <TownPicker
              value={formData.town}
              onChange={(value) => handleChange('town', value)}
            />
          </div>

          {/* Location */}
          <div style={{ marginBottom: '1.5em' }}>
            <div style={{
              fontSize: '1em',
              fontWeight: '600',
              fontFamily: "'Montserrat', sans-serif",
              color: colors.textDark,
              marginBottom: '0.5em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5em'
            }}>
              <MapPin size={18} color={colors.eventPrimary} />
              Место проведения *
            </div>
            <input
              type="text"
              placeholder="Введите место проведения"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75em',
                boxSizing: 'border-box',
                border: `2px solid ${colors.borderGrey}`,
                borderRadius: '12px',
                fontSize: '0.95em',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Max Attendees */}
          <div style={{ marginBottom: '1.5em' }}>
            <div style={{
              fontSize: '1em',
              fontWeight: '600',
              fontFamily: "'Montserrat', sans-serif",
              color: colors.textDark,
              marginBottom: '0.5em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5em'
            }}>
              <Users size={18} color={colors.eventPrimary} />
              Максимальное количество участников *
            </div>
            <input
              type="number"
              placeholder="Введите количество"
              value={formData.maxAttendees}
              onChange={(e) => handleChange('maxAttendees', e.target.value)}
              min="1"
              style={{
                width: '100%',
                padding: '0.75em',
                boxSizing: 'border-box',
                border: `2px solid ${colors.borderGrey}`,
                borderRadius: '12px',
                fontSize: '0.95em',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.5em' }}>
            <div style={{
              fontSize: '1em',
              fontWeight: '600',
              fontFamily: "'Montserrat', sans-serif",
              color: colors.textDark,
              marginBottom: '0.5em'
            }}>
              Описание (необязательно)
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'stretch'
            }}>
              <div style={{
                width: '3px',
                borderRadius: '2px',
                backgroundColor: colors.eventPrimary,
                flexShrink: 0
              }} />
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Опишите ваше событие..."
                rows={4}
                style={{
                  flex: 1,
                  marginLeft: '0.75em',
                  padding: '0.6em',
                  fontSize: '0.95em',
                  lineHeight: '1.5',
                  color: colors.textDark,
                  border: `2px solid ${colors.borderGrey}`,
                  borderRadius: '12px',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  backgroundColor: colors.backgroundGrey,
                  minHeight: '5em'
                }}
              />
            </div>
          </div>
        </div>

        {/* Picture section */}
        <div style={{
          width: '90%',
          marginTop: '1.5em',
          position: 'relative',
          zIndex: 1,
          backgroundColor: colors.white,
          borderRadius: '47px 0 47px 0',
          padding: '2em 1.5em',
          boxSizing: 'border-box',
          boxShadow: '10px 14px 0px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{
            fontSize: '1em',
            fontWeight: '600',
            fontFamily: "'Montserrat', sans-serif",
            color: colors.textDark,
            marginBottom: '1em'
          }}>
            Изображение события (необязательно)
          </div>

          <div style={{
            width: '100%',
            boxSizing: 'border-box',
            position: 'relative'
          }}>
            {(filePreview || formData.picture) ? (
              <div style={{
                width: '100%',
                maxWidth: '300px',
                margin: '0 auto',
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '4px 6px 0px rgba(0, 0, 0, 0.25)'
              }}>
                <img
                  src={filePreview || formData.picture}
                  alt="Event preview"
                  style={{
                    width: '100%',
                    aspectRatio: '16/9',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
                <button
                  type="button"
                  onClick={filePreview ? handleRemoveSelectedFile : handleDeletePicture}
                  disabled={deletingPicture || uploadingPicture}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: (deletingPicture || uploadingPicture) ? 'not-allowed' : 'pointer',
                    opacity: (deletingPicture || uploadingPicture) ? 0.5 : 1
                  }}
                >
                  <X size={18} color={colors.white} />
                </button>
                {(uploadingPicture || deletingPicture) && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Loader size={28} color={colors.white} style={{ animation: 'spin 1s linear infinite' }} />
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={handlePictureClick}
                disabled={uploadingPicture || deletingPicture}
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  margin: '0 auto',
                  aspectRatio: '16/9',
                  borderRadius: '16px',
                  backgroundColor: '#ccc',
                  border: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: (uploadingPicture || deletingPicture) ? 'not-allowed' : 'pointer',
                  boxShadow: '4px 6px 0px rgba(0, 0, 0, 0.25)',
                  gap: '0.5em',
                  opacity: (uploadingPicture || deletingPicture) ? 0.5 : 1
                }}
              >
                <Upload size={36} color={colors.white} />
                <span style={{
                  color: colors.white,
                  fontSize: '1em',
                  fontWeight: '700',
                  fontFamily: "'Uni Sans', sans-serif",
                  fontStyle: 'italic'
                }}>
                  ЗАГРУЗИТЬ
                </span>
              </button>
            )}
            {uploadingPicture && (
              <div style={{
                textAlign: 'center',
                marginTop: '0.5em',
                color: colors.textDark,
                fontSize: '0.9em',
                fontWeight: '600'
              }}>
                Загрузка...
              </div>
            )}
          </div>
        </div>

        {/* Bottom save button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          style={{
            width: '90%',
            marginTop: '2em',
            padding: '1em',
            backgroundColor: colors.white,
            color: colors.eventPrimary,
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
          {loading ? (isEditMode ? 'ОБНОВЛЕНИЕ...' : 'СОЗДАНИЕ...') : (isEditMode ? 'ОБНОВИТЬ' : 'СОЗДАТЬ')}
        </button>
      </div>
    </Page>
  );
}
