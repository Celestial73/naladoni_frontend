import { useOutlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { BottomNav } from '@/components/BottomNav.tsx';
import { PageWrapper } from '@/components/PageWrapper.tsx';

export function MainLayout() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, position: 'relative', overflow: 'auto' }}>
        <AnimatePresence mode="wait">
          {outlet && (
            <PageWrapper key={location.pathname}>
              {outlet}
            </PageWrapper>
          )}
        </AnimatePresence>
      </div>
      <BottomNav />
    </div>
  );
}
