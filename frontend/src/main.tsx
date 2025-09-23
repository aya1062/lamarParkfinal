import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// إجبار الصفحة على البدء من الأعلى
window.addEventListener('load', () => {
  window.scrollTo(0, 0);
});

// إجبار الصفحة على البدء من الأعلى عند تغيير الصفحة
window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
