import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Guard against Vite HMR WebSocket send loop in local dev overlay
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason?.message?.includes?.("reading 'send'") ||
      event.reason?.message?.includes?.('WebSocket')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
