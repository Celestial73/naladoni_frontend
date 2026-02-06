import { HashRouter } from 'react-router-dom';

import { App } from '@/components/App/App.jsx';
import { ErrorBoundary } from '@/components/App/ErrorBoundary.jsx';
import { AuthProvider } from '@/context/AuthProvider.jsx';

function ErrorBoundaryError({ error }) {
  return (
    <div>
      <p>An unhandled error occurred:</p>
      <blockquote>
        <code>
          {error instanceof Error
            ? error.message
            : typeof error === 'string'
              ? error
              : JSON.stringify(error)}
        </code>
      </blockquote>
    </div>
  );
}

export function Root() {
  return (
    <ErrorBoundary fallback={ErrorBoundaryError}>
      <AuthProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
