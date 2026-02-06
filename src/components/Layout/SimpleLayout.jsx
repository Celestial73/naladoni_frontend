import { useOutlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { PageWrapper } from '@/components/Layout/PageWrapper.jsx';

export function SimpleLayout() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, position: 'relative', overflow: 'auto' }}>
        <AnimatePresence mode="wait">
          {outlet && (
            <PageWrapper key={location.pathname}>
              {outlet}
            </PageWrapper>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
