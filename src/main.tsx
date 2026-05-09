import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { sentinelWs } from './api/websocket';

// Establish WebSocket connection once at app startup.
// Components subscribe via sentinelWs.on() to receive live updates.
sentinelWs.connect();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
