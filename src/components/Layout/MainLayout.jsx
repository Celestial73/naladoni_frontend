import { useOutlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { BottomNav } from '@/components/Layout/BottomNav.jsx';
import { PageWrapper } from '@/components/Layout/PageWrapper.jsx';

export function MainLayout() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflow: 'auto'}}>
        <AnimatePresence mode="wait">
          {outlet && (
            <PageWrapper key={location.pathname}>
              {outlet}
            </PageWrapper>
          )}
        </AnimatePresence>
      </div>
      <div style={{ height: '80px', position: 'relative', zIndex: 100 }}>
        <BottomNav />
      </div>
    </div>
  );
}
