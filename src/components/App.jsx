import { Navigate, Route, Routes } from 'react-router-dom';
import { useLaunchParams, useSignal, miniApp } from '@tma.js/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';

import { routes } from '@/navigation/routes.jsx';
import { MainLayout } from '@/components/MainLayout.jsx';
import { SimpleLayout } from '@/components/SimpleLayout.jsx';
import Login from '@/components/Login.jsx';

export function App() {
  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);

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

          <Route path="*" element={<Navigate to="/profile" />} />
        </Route>
      </Routes>
    </AppRoot>
  );
}
