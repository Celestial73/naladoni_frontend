import { Page } from '@/components/Page.jsx';
import { ProfileCarousel } from '@/components/ProfileCarousel.jsx';
import { ProfileInfoCard } from '@/components/ProfileInfoCard.jsx';
import { HalftoneBackground } from '@/components/HalftoneBackground.jsx';
import { Coffee, Music, Plane, BookOpen, Dumbbell } from 'lucide-react';
import { colors } from '@/constants/colors.js';
import profileImage1 from '../../assets/photo_2025-12-14_19-07-23.jpg';
import profileImage2 from '../../assets/photo_2026-01-21_19-16-39.jpg';

const photos = [profileImage1, profileImage2];

const bio = "I love long walks on the beach, exploring new coffee shops, and spontaneous road trips. Always looking to meet new people and make meaningful connections. Life is an adventure — let's share it together!";

const funFacts = [
    { title: 'Coffee Addict', text: "Can't start my day without a double espresso", icon: <Coffee size={22} color={colors.profilePrimary} /> },
    { title: 'Music Lover', text: 'Guitar player for 10 years', icon: <Music size={22} color={colors.profilePrimary} /> },
    { title: 'World Traveler', text: 'Visited 23 countries and counting', icon: <Plane size={22} color={colors.profilePrimary} /> },
    { title: 'Bookworm', text: 'Read 52 books last year', icon: <BookOpen size={22} color={colors.profilePrimary} /> },
    { title: 'Fitness Enthusiast', text: 'Morning gym routine, rain or shine', icon: <Dumbbell size={22} color={colors.profilePrimary} /> },
];

const interests = [
    { label: 'Photography', color: '#e74c3c' },
    { label: 'Hiking', color: '#27ae60' },
    { label: 'Cooking', color: '#f39c12' },
    { label: 'Yoga', color: '#8e44ad' },
    { label: 'Travel', color: '#2980b9' },
    { label: 'Music', color: '#e67e22' },
    { label: 'Art', color: '#1abc9c' },
    { label: 'Cinema', color: '#c0392b' },
];

export function NewProfile() {

    return (
        <Page>
            <div style={{ 
                backgroundColor: colors.profilePrimary, 
                minHeight: '100vh', 
                width: '100%', 
                padding: '2%',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <HalftoneBackground color={colors.profilePrimaryDark} />

                {/* Carousel Container */}
                <div style={{
                    width: '100%',
                    maxWidth: '70%',
                    marginTop: '2%',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <ProfileCarousel photos={photos} name="Alexandra bullshidova" age={24} />
                </div>

                <div style={{ width: '100%', marginTop: '5%', marginBottom: '5%', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                    <ProfileInfoCard bio={bio} items={funFacts} interests={interests} />
                </div>

            </div>
        </Page>
    );
}
