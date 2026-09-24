import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary
      fallbackTitle="Application Rendering Error"
      fallbackMessage="An unexpected error occurred while running the application. Click below to reload the workspace."
    >
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
