import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  List,
  Section,
  Input,
  Textarea,
  Button,
} from '@telegram-apps/telegram-ui';
import { Calendar, MapPin, Users, Image as ImageIcon, Upload, X, Loader } from 'lucide-react';
import { Page } from '@/components/Layout/Page.jsx';
import { eventsService } from '@/services/api/eventsService.js';
import { RUSSIAN_CITIES } from '@/data/russianCities.js';
// import useAuth from '@/hooks/useAuth'; // Reserved for future use

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
  // const { auth } = useAuth(); // Reserved for future use
  const isEditMode = Boolean(id);
  
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    town: '',
    location: '',
    maxAttendees: '',
    description: '',
    picture: '',  // existing picture URL from the server
  });
  const [selectedFile, setSelectedFile] = useState(null);       // File object chosen by user
  const [filePreview, setFilePreview] = useState(null);          // local blob URL for preview
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [deletingPicture, setDeletingPicture] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [townSuggestions, setTownSuggestions] = useState([]);
  const [showTownSuggestions, setShowTownSuggestions] = useState(false);

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
          setError(err.response?.data?.message || err.message || 'Failed to load event');
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
    
    // Handle town autocomplete
    if (field === 'town') {
      const filtered = value
        ? RUSSIAN_CITIES.filter(city => 
            city.toLowerCase().startsWith(value.toLowerCase())
          ).slice(0, 10) // Show max 10 suggestions
        : [];
      setTownSuggestions(filtered);
      setShowTownSuggestions(value.length > 0 && filtered.length > 0);
    }
  };

  const handleTownSelect = (town) => {
    setFormData(prev => ({ ...prev, town }));
    setShowTownSuggestions(false);
    setTownSuggestions([]);
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
      setError('Only images are allowed (JPEG, PNG, GIF, WebP)');
      e.target.value = '';
      return;
    }
    if (file.size > maxSize) {
      setError('Maximum file size is 5 MB');
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

  /**
   * Upload the selected file to an already-existing event.
   * Used in edit mode when the user picks a new picture.
   */
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
      setError(err.message || 'Failed to upload picture');
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
      setError(err.message || 'Failed to delete picture');
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
      setError('Title is required');
      return;
    }
    if (!formData.date.trim()) {
      setError('Date is required');
      return;
    }
    if (!formData.town.trim()) {
      setError('Town is required');
      return;
    }
    if (!RUSSIAN_CITIES.includes(formData.town)) {
      setError('Please select a valid town from the list');
      return;
    }
    if (!formData.location.trim()) {
      setError('Location is required');
      return;
    }
    if (!formData.maxAttendees || parseInt(formData.maxAttendees) < 1) {
      setError('Maximum attendees must be at least 1');
      return;
    }

    setLoading(true);
    try {
      // Convert date to ISO 8601 date-only format (YYYY-MM-DD)
      const dateISO = convertDateToISO8601(formData.date);
      if (!dateISO) {
        setError('Invalid date format. Please use a valid date.');
        setLoading(false);
        return;
      }

      // Prepare payload according to Swagger documentation
      const payload = {
        title: formData.title.trim(),
        town: formData.town.trim(),
        location: formData.location.trim(),
        date: dateISO, // Required: ISO 8601 date-only string (YYYY-MM-DD)
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
          // Event was created/updated successfully but picture failed
          // Still navigate but show could be improved with a toast
          console.warn('Event saved but picture upload failed:', pictureErr.message);
        } finally {
          setUploadingPicture(false);
        }
      }

      navigate('/events');
    } catch (err) {
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} event`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Page>
        <div style={{ padding: 20, textAlign: 'center', opacity: 0.5 }}>
          Loading event...
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <form onSubmit={handleSubmit}>
        <List>
          <Section header="Event Details">
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
                <Calendar size={16} />
                Title *
              </div>
              <Input
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter event title"
              />
            </div>

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
                <Calendar size={16} />
                Date *
              </div>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                placeholder="YYYY-MM-DD"
              />
            </div>

            <div style={{ padding: '12px 20px', position: 'relative' }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 500, 
                color: 'var(--tgui--hint_color)',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <MapPin size={16} />
                Town *
              </div>
              <Input
                value={formData.town}
                onChange={(e) => handleChange('town', e.target.value)}
                onFocus={() => {
                  if (formData.town) {
                    const filtered = RUSSIAN_CITIES.filter(city => 
                      city.toLowerCase().startsWith(formData.town.toLowerCase())
                    ).slice(0, 10);
                    setTownSuggestions(filtered);
                    setShowTownSuggestions(filtered.length > 0);
                  }
                }}
                onBlur={() => {
                  // Delay hiding suggestions to allow click on suggestion
                  setTimeout(() => setShowTownSuggestions(false), 200);
                }}
                placeholder="Enter town"
                autoComplete="off"
              />
              {showTownSuggestions && townSuggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '20px',
                  right: '20px',
                  backgroundColor: 'var(--tgui--bg_color)',
                  border: '1px solid var(--tgui--section_separator_color)',
                  borderRadius: '12px',
                  marginTop: '4px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 1000,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                  {townSuggestions.map((city, index) => (
                    <div
                      key={index}
                      onClick={() => handleTownSelect(city)}
                      onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom: index < townSuggestions.length - 1 ? '1px solid var(--tgui--section_separator_color)' : 'none',
                        fontSize: '14px',
                        color: 'var(--tgui--text_color)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--tgui--secondary_bg_color)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {city}
                    </div>
                  ))}
                </div>
              )}
            </div>

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
                <MapPin size={16} />
                Location *
              </div>
              <Input
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Enter location"
              />
            </div>

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
                <Users size={16} />
                Maximum Attendees *
              </div>
              <Input
                type="number"
                value={formData.maxAttendees}
                onChange={(e) => handleChange('maxAttendees', e.target.value)}
                placeholder="Enter max attendees"
                min="1"
              />
            </div>
          </Section>

          <Section header="Additional Information">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

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
                Event Picture (Optional)
              </div>

              {/* Preview of selected file or existing picture */}
              {(filePreview || formData.picture) ? (
                <div style={{ position: 'relative', marginBottom: '8px' }}>
                  <img
                    src={filePreview || formData.picture}
                    alt="Event preview"
                    style={{
                      width: '100%',
                      maxHeight: '220px',
                      objectFit: 'cover',
                      borderRadius: '12px',
                      display: 'block',
                    }}
                  />
                  {/* Remove / delete button */}
                  <button
                    type="button"
                    onClick={filePreview ? handleRemoveSelectedFile : handleDeletePicture}
                    disabled={deletingPicture}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: deletingPicture ? 'not-allowed' : 'pointer',
                      opacity: deletingPicture ? 0.5 : 1,
                    }}
                  >
                    <X size={16} color="#fff" />
                  </button>
                  {/* Upload indicator overlay */}
                  {(uploadingPicture || deletingPicture) && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '12px',
                      backgroundColor: 'rgba(0,0,0,0.45)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Loader size={28} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
                    </div>
                  )}
                </div>
              ) : null}

              {/* Upload button */}
              <Button
                mode="bezeled"
                size="m"
                stretched
                onClick={handlePictureClick}
                disabled={uploadingPicture || deletingPicture}
                before={<Upload size={16} />}
              >
                {filePreview ? 'Change Picture' : formData.picture ? 'Replace Picture' : 'Upload Picture'}
              </Button>

              {/* In edit mode: upload immediately when a file is selected */}
              {isEditMode && selectedFile && (
                <div style={{ marginTop: '8px' }}>
                  <Button
                    mode="filled"
                    size="s"
                    stretched
                    onClick={() => uploadPictureForEvent(id)}
                    disabled={uploadingPicture}
                  >
                    {uploadingPicture ? 'Uploading...' : 'Save Picture Now'}
                  </Button>
                </div>
              )}
            </div>

            <div style={{ padding: '12px 20px' }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 500, 
                color: 'var(--tgui--hint_color)',
                marginBottom: '8px'
              }}>
                Description (Optional)
              </div>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe your event..."
                rows={4}
                style={{ 
                  width: '100%',
                  resize: 'vertical',
                  minHeight: '80px'
                }}
              />
            </div>
          </Section>

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
            <div style={{ padding: '0 20px 20px' }}>
              <Button
                mode="filled"
                size="l"
                stretched
                onClick={handleSubmit}
                disabled={loading || uploadingPicture || deletingPicture}
              >
                {loading
                  ? (uploadingPicture ? 'Uploading picture...' : (isEditMode ? 'Updating...' : 'Creating...'))
                  : (isEditMode ? 'Update Event' : 'Create Event')}
              </Button>
            </div>
          </Section>
        </List>
      </form>
    </Page>
  );
}
