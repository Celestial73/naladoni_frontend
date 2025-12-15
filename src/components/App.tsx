import { useLocation, Navigate, Route, Routes } from 'react-router-dom';
import { useLaunchParams, useSignal, miniApp } from '@tma.js/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { AnimatePresence } from 'framer-motion';

import { routes } from '@/navigation/routes.tsx';
import { PageWrapper } from '@/components/PageWrapper.tsx';
import { BottomNav } from '@/components/BottomNav.tsx';

export function App() {
  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);
  const location = useLocation();

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
    >
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, position: 'relative', overflow: 'auto' }}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {routes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <PageWrapper>
                      <route.Component />
                    </PageWrapper>
                  }
                />
              ))}
              <Route path="*" element={<Navigate to="/profile" />} />
            </Routes>
          </AnimatePresence>
        </div>
        <BottomNav />
      </div>
    </AppRoot>
  );
}
