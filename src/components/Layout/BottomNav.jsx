import { useLocation, useNavigate } from 'react-router-dom';
import { colors } from '@/constants/colors.js';
import eventsIcon from '../../../assets/icons/events (horse).svg';
import feedIcon from '../../../assets/icons/feed (slots).svg';
import profileIcon from '../../../assets/icons/profile (zebra).svg';

const tabs = [
    { path: '/events', label: 'Движи', icon: eventsIcon, activeColor: colors.eventPrimary },
    { path: '/feed', label: 'Искать', icon: feedIcon, activeColor: colors.feedPrimary },
    { path: '/profile', label: 'Профиль', icon: profileIcon, activeColor: colors.profilePrimary },
];

export function BottomNav() {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <nav style={styles.navbar}>
            {tabs.map((tab) => {
                const isActive = location.pathname === tab.path || location.pathname.startsWith(`${tab.path}/`);
                return (
                    <button
                        key={tab.path}
                        onClick={() => navigate(tab.path)}
                        style={styles.tab}
                    >
                        <span
                            style={{
                                ...styles.iconBadge,
                                ...(isActive ? styles.iconBadgeActive(tab.activeColor) : {}),
                            }}
                        >
                        <img
                            src={tab.icon}
                            alt={tab.label}
                            style={{
                                ...styles.icon,
                                opacity: isActive ? 1 : 0.5,
                                transform: isActive ? 'scale(1.06)' : 'none',
                                filter: isActive ? 'grayscale(1) brightness(2.2)' : 'grayscale(1) brightness(0.42)',
                            }}
                        />
                        </span>
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
        height: '84px',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#e9e9e9',
        borderTop: '3px solid rgba(0, 0, 0, 0.14)',
        boxShadow: '0 -3px 10px rgba(0, 0, 0, 0.1)',
        padding: '6px 0 calc(env(safe-area-inset-bottom, 0px) + 8px)',
        zIndex: 100,
        boxSizing: 'border-box',
    },
    tab: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        background: 'none',
        border: 'none',
        appearance: 'none',
        cursor: 'pointer',
        padding: '8px 16px',
        transition: 'transform 0.2s ease',
        WebkitTapHighlightColor: 'transparent',
        outline: 'none',
        position: 'relative',
        height: '62px',
        boxSizing: 'border-box',
    },
    iconBadge: {
        borderRadius: '10px',
        backgroundColor: 'transparent',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        padding: '8px 16px',
        transition: 'background-color 0.2s ease, transform 0.2s ease',
    },
    iconBadgeActive: (color) => ({
        backgroundColor: color,
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 0 rgba(0, 0, 0, 0.22)',
    }),
    icon: {
        width: '52px',
        height: '52px',
        transition: 'opacity 0.2s ease, transform 0.2s ease, filter 0.2s ease',
        display: 'block',
        verticalAlign: 'middle',
        objectFit: 'contain',
    },
};
