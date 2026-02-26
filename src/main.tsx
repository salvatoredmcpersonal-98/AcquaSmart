import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './i18n';
import { LocaleProvider } from './context/LocaleContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocaleProvider>
      <App />
    </LocaleProvider>
  </StrictMode>,
);
