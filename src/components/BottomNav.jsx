import { useLocation, useNavigate } from 'react-router-dom';
import { colors } from '@/constants/colors.js';
import eventsIcon from '../../assets/icons/events (horse).svg';
import feedIcon from '../../assets/icons/feed (slots).svg';
import profileIcon from '../../assets/icons/profile (englishman).svg';

const tabs = [
    { path: '/events', label: 'Events', icon: eventsIcon, activeColor: colors.eventPrimary },
    { path: '/feed', label: 'Feed', icon: feedIcon, activeColor: colors.feedPrimary },
    { path: '/profile', label: 'Profile', icon: profileIcon, activeColor: colors.profilePrimary },
];

export function BottomNav() {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <nav style={styles.navbar}>
            {tabs.map((tab) => {
                const isActive = location.pathname === tab.path;
                return (
                    <button
                        key={tab.path}
                        onClick={() => navigate(tab.path)}
                        style={{
                            ...styles.tab,
                            ...(isActive ? { background: `${tab.activeColor}33` } : {}),
                        }}
                    >
                        <img
                            src={tab.icon}
                            alt={tab.label}
                            style={{
                                ...styles.icon,
                                opacity: isActive ? 1 : 0.45,
                            }}
                        />
                        <span
                            style={{
                                ...styles.label,
                                color: isActive ? tab.activeColor : 'rgba(255, 255, 255, 0.93)',
                            }}
                        >
                            {tab.label}
                        </span>
                        {isActive && (
                            <div style={{
                                ...styles.activeIndicator,
                                backgroundColor: tab.activeColor,
                            }} />
                        )}
                    </button>
                );
            })}
        </nav>
    );
}

const styles = {
    navbar: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        height: '80px',
        justifyContent: 'space-around',
        alignItems: 'center',
        background: '#171717',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '6px 0 env(safe-area-inset-bottom, 8px)',
        zIndex: 50,
    },
    tab: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '3px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '6px 16px',
        borderRadius: '12px',
        transition: 'all 0.2s ease',
        WebkitTapHighlightColor: 'transparent',
        outline: 'none',
        position: 'relative',
    },
    icon: {
        width: '38px',
        height: '38px',
        transition: 'opacity 0.2s ease',
    },
    label: {
        fontSize: '10px',
        fontWeight: 600,
        letterSpacing: '0.3px',
        transition: 'color 0.2s ease',
    },
    activeIndicator: {
        position: 'absolute',
        bottom: '2px',
        width: '16px',
        height: '3px',
        borderRadius: '2px',
    },
};
