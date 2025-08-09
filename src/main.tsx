import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AuthProvider } from './context/AuthContext';
import { NavigationProvider } from './context/NavigationContext';
import { UIProvider } from './context/UIContext';
import { NotificationProvider } from './context/NotificationContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <NavigationProvider>
        <UIProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </UIProvider>
      </NavigationProvider>
    </AuthProvider>
  </React.StrictMode>,
);