import React from 'react';
import ReactDOM from 'react-dom/client';

// ✅ App component lives at: components/app.tsx
import App from './components/app';

const rootEl = document.getElementById('root');

if (!rootEl) {
  // Fail loudly if the HTML is not wired correctly
  throw new Error('Root element #root not found in index.html');
}

const root = ReactDOM.createRoot(rootEl);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
