import { Navigate, Route, Routes } from 'react-router-dom';
import { useLaunchParams, useSignal, miniApp } from '@tma.js/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { useEffect, useRef } from 'react';

import { routes } from '@/navigation/routes.jsx';
import { MainLayout } from '@/components/Layout/MainLayout.jsx';
import { SimpleLayout } from '@/components/Layout/SimpleLayout.jsx';
import Login from '@/components/App/Login.jsx';
import useAuth from '@/hooks/useAuth';
import { setupPrivateInterceptors } from '@/api/axios';

export function App() {
  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);
  const { auth } = useAuth();
  const authRef = useRef(auth);

  // Keep auth ref updated for interceptors
  useEffect(() => {
    authRef.current = auth;
  }, [auth]);

  // Setup private interceptors once on mount
  useEffect(() => {
    setupPrivateInterceptors(() => authRef.current);
  }, []); // Only setup once

  const mainLayoutRoutes = routes.filter(route => route.useMainLayout);
  const otherRoutes = routes.filter(route => !route.useMainLayout);

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
    >
      <Routes>
        <Route element={<Login />}>
          {/* Routes with MainLayout (includes BottomNav) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/profile" replace />} />
            {mainLayoutRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<route.Component />}
              />
            ))}
          </Route>

          {/* Routes without MainLayout */}
          <Route element={<SimpleLayout />}>
            {otherRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<route.Component />}
              />
            ))}
          </Route>

          <Route path="*" element={<Navigate to="/profile" replace />} />
        </Route>
      </Routes>
    </AppRoot>
  );
}
