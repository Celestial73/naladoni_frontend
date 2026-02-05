import { useLocation, useNavigate } from 'react-router-dom';
import { Tabbar } from '@telegram-apps/telegram-ui';
import { Calendar, Home, User } from 'lucide-react';

export function BottomNav() {
    const location = useLocation();
    const navigate = useNavigate();

    const tabs = [
        { path: '/events', label: 'Events', icon: Calendar },
        { path: '/feed', label: 'Feed', icon: Home },
        { path: '/profile', label: 'Profile', icon: User },
    ];

    return (
        <div
            style={{
                backgroundColor: 'var(--tgui--bg_color)',
                flexShrink: 0,
                position: 'relative',
                zIndex: 10,
                borderTop: '1px solid var(--tgui--separator_color, rgba(0, 0, 0, 0.1))'
            }}
        >
            <Tabbar>
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = location.pathname === tab.path;

                    return (
                        <Tabbar.Item
                            key={tab.path}
                            text={tab.label}
                            selected={isActive}
                            onClick={() => navigate(tab.path)}
                        >
                            <Icon size={28} />
                        </Tabbar.Item>
                    );
                })}
            </Tabbar>
        </div>
    );
}
