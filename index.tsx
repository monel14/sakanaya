import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './src/App';
import { AuthProvider } from './src/shared/context/AuthContext';
import { NavigationProvider } from './src/shared/context/NavigationContext';
import { NotificationProvider } from './src/shared/context/NotificationContext';
import { UIProvider } from './src/shared/context/UIContext';
import './src/index.css';

// Gestion d'erreur globale
const handleGlobalError = (error: Error) => {
  console.error('Erreur globale de l\'application:', error);
  // Ici vous pourriez envoyer l'erreur à un service de monitoring
};

window.addEventListener('error', (event) => {
  handleGlobalError(new Error(event.message));
});

window.addEventListener('unhandledrejection', (event) => {
  handleGlobalError(new Error(event.reason));
});

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('root');
  
  if (!container) {
    throw new Error('Element root non trouvé');
  }

  const root = createRoot(container);
  
  try {
    root.render(
      <React.StrictMode>
        <AuthProvider>
          <NavigationProvider>
            <NotificationProvider>
              <UIProvider>
                <App />
              </UIProvider>
            </NotificationProvider>
          </NavigationProvider>
        </AuthProvider>
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Erreur lors du rendu de l\'application:', error);
    
    // Fallback HTML en cas d'erreur critique
    container.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Inter, sans-serif;">
        <h1 style="color: #dc2626;">Erreur de chargement</h1>
        <p>Une erreur est survenue lors du chargement de l'application.</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #0ea5e9; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Recharger la page
        </button>
      </div>
    `;
  }
});