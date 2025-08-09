import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AuthProvider } from './shared/context/AuthContext';
import { NavigationProvider } from './shared/context/NavigationContext';
import { UIProvider } from './shared/context/UIContext';
import { NotificationProvider } from './shared/context/NotificationContext';
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