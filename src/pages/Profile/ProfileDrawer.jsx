import { X, MapPin, Briefcase, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Avatar,
  List,
  Section,
  Cell,
  IconButton
} from '@telegram-apps/telegram-ui';

export function ProfileDrawer({ profile, onClose }) {
  // Normalize profile data to handle both API format and transformed format
  const displayName = profile.display_name || profile.name || '';
  const age = profile.age;
  const bio = profile.bio;
  const gender = profile.gender;
  const photoUrl = profile.photo_url || profile.photoUrl;
  const photos = profile.photos || (photoUrl ? [photoUrl] : []);
  const interests = profile.interests || [];
  const customFields = profile.custom_fields || profile.customFields || [];
  const showBio = profile.showBio !== false; // Default to true if not specified
  const showInterests = profile.showInterests !== false; // Default to true if not specified
  const location = profile.location;
  const distance = profile.distance;
  const work = profile.work;
  const education = profile.education;

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === photos.length - 1 ? 0 : prev + 1
    );
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? photos.length - 1 : prev - 1
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 50
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        style={{
          backgroundColor: 'var(--tgui--bg_color)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          width: '100%',
          maxWidth: 430,
          height: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle & Close Button */}
        <div style={{ position: 'relative', padding: '16px 20px 8px', flexShrink: 0 }}>
          <div style={{
            width: 48,
            height: 4,
            backgroundColor: 'var(--tgui--secondary_hint_color)',
            opacity: 0.3,
            borderRadius: 99,
            margin: '0 auto'
          }} />
          <div style={{ position: 'absolute', right: 20, top: 16 }}>
            <IconButton size="s" mode="bezeled" onClick={onClose}>
              <X size={20} />
            </IconButton>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <List>
            {/* Photo Section */}
            {photos.length > 0 && (
              <div style={{ position: 'relative', height: 400 }}>
                <img
                  src={photos[currentPhotoIndex]}
                  alt={displayName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Photo Navigation */}
                {photos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      backdropFilter: 'blur(4px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextPhoto}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      backdropFilter: 'blur(4px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <ChevronRight size={24} />
                  </button>

                  {/* Photo Indicators */}
                  <div style={{ position: 'absolute', top: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 4 }}>
                    {photos.map((_, index) => (
                      <div
                        key={index}
                        style={{
                          height: 4,
                          borderRadius: 99,
                          transition: 'all 0.3s',
                          width: index === currentPhotoIndex ? 32 : 16,
                          backgroundColor: index === currentPhotoIndex ? 'white' : 'rgba(255,255,255,0.5)'
                        }}
                      />
                    ))}
                  </div>
                </>
              )}

                {/* Name & Age Overlay */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: 24,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
                }}>
                  <h1 style={{ fontSize: 32, color: 'white', margin: 0, lineHeight: 1.2 }}>
                    {displayName}{age ? `, ${age}` : ''}
                  </h1>
                  {location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                      <MapPin size={16} color="white" />
                      <span style={{ color: 'white', fontSize: 14 }}>
                        {location}{distance ? ` • ${distance} miles away` : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Details Section */}
            <Section>
              {/* Bio - only show if showBio is true and bio exists */}
              {showBio && bio && (
                <Cell multiline style={{ fontSize: 16, lineHeight: '1.5' }}>
                  {bio}
                </Cell>
              )}

              {/* Gender */}
              {gender && (
                <Cell description="Gender">
                  {gender}
                </Cell>
              )}

              {/* Work */}
              {work && (
                <Cell before={<Avatar size={40} style={{ background: 'var(--tgui--secondary_bg_color)' }}><Briefcase size={20} style={{ color: 'var(--tgui--link_color)' }} /></Avatar>} description="Work">
                  {work}
                </Cell>
              )}

              {/* Education */}
              {education && (
                <Cell before={<Avatar size={40} style={{ background: 'var(--tgui--secondary_bg_color)' }}><GraduationCap size={20} style={{ color: 'var(--tgui--link_color)' }} /></Avatar>} description="Education">
                  {education}
                </Cell>
              )}

              {/* Interests - only show if showInterests is true and interests exist */}
              {showInterests && interests && interests.length > 0 && (
                <Cell>
                  <div style={{ marginBottom: 12, fontSize: 17, fontWeight: 600 }}>Interests</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {interests.map((interest, index) => {
                      // Handle both string interests and object interests for backward compatibility
                      const interestText = typeof interest === 'string' ? interest : interest.name;
                      const interestId = typeof interest === 'string' ? index : interest.id || index;
                      
                      return (
                        <div
                          key={interestId}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: 'var(--tgui--secondary_bg_color)',
                            borderRadius: 99,
                            fontSize: 14,
                            color: 'var(--tgui--text_color)'
                          }}
                        >
                          {interestText}
                        </div>
                      );
                    })}
                  </div>
                </Cell>
              )}

              {/* Custom Fields */}
              {customFields && customFields.length > 0 && customFields.map((field, index) => {
                const fieldTitle = field.title || field.name;
                const fieldValue = field.value;
                const fieldId = field.id || field.title || index;
                
                return (
                  <Cell key={fieldId} description={fieldTitle} multiline>
                    {fieldValue}
                  </Cell>
                );
              })}
            </Section>
          </List>
        </div>
      </motion.div>
    </motion.div>
  );
}
