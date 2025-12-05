// src/main.jsx

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(r => r.unregister());
  });
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // 👈 Importa o Tailwind
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);