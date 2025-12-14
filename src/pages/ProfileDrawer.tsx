import { X, MapPin, Briefcase, GraduationCap, ChevronLeft, ChevronRight, Music, Camera, Plane, Coffee } from 'lucide-react';
import { useState } from 'react';
import {
  Button,
  Avatar,
  List,
  Section,
  Cell,
  IconButton
} from '@telegram-apps/telegram-ui';

export interface ProfileData {
  name: string;
  age: number;
  location: string;
  distance: string;
  photos: string[];
  bio: string;
  work: string;
  education: string;
  interests: Array<{ id: string; name: string; icon: string; color: string }>;
  customFields?: Array<{ id: string; name: string; value: string }>;
}

interface ProfileDrawerProps {
  profile: ProfileData;
  onClose: () => void;
}

export function ProfileDrawer({ profile, onClose }: ProfileDrawerProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === profile.photos.length - 1 ? 0 : prev + 1
    );
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? profile.photos.length - 1 : prev - 1
    );
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
    <div
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
      <div
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
            <div style={{ position: 'relative', height: 400 }}>
              <img
                src={profile.photos[currentPhotoIndex]}
                alt={profile.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Photo Navigation */}
              {profile.photos.length > 1 && (
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
                    {profile.photos.map((_, index) => (
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
                  {profile.name}, {profile.age}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  <MapPin size={16} color="white" />
                  <span style={{ color: 'white', fontSize: 14 }}>
                    {profile.location} • {profile.distance} miles away
                  </span>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <Section>
              {profile.bio && (
                <Cell multiline style={{ fontSize: 16, lineHeight: '1.5' }}>
                  {profile.bio}
                </Cell>
              )}

              {profile.work && (
                <Cell before={<Avatar size={40} style={{ background: 'var(--tgui--secondary_bg_color)' }}><Briefcase size={20} style={{ color: 'var(--tgui--link_color)' }} /></Avatar>} description="Work">
                  {profile.work}
                </Cell>
              )}

              {profile.education && (
                <Cell before={<Avatar size={40} style={{ background: 'var(--tgui--secondary_bg_color)' }}><GraduationCap size={20} style={{ color: 'var(--tgui--link_color)' }} /></Avatar>} description="Education">
                  {profile.education}
                </Cell>
              )}

              {/* Interests */}
              {profile.interests && profile.interests.length > 0 && (
                <Cell>
                  <div style={{ marginBottom: 12, fontSize: 17, fontWeight: 600 }}>Interests</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {profile.interests.map((interest) => {
                      const IconComponent = getIconComponent(interest.icon);
                      return (
                        <div
                          key={interest.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '6px 12px',
                            backgroundColor: 'var(--tgui--secondary_bg_color)',
                            borderRadius: 99,
                            fontSize: 14,
                            color: 'var(--tgui--text_color)'
                          }}
                        >
                          <IconComponent size={16} style={{ opacity: 0.7 }} />
                          <span>{interest.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </Cell>
              )}

              {/* Custom Fields */}
              {profile.customFields && profile.customFields.map((field) => (
                <Cell key={field.id} description={field.name} multiline>
                  {field.value}
                </Cell>
              ))}
            </Section>
          </List>
        </div>
      </div>
    </div>
  );
}
