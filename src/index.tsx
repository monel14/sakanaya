import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { AuthProvider } from './shared/context/AuthContext';
import { NavigationProvider } from './shared/context/NavigationContext';

// Ajoutez d'autres providers ici si besoin

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('root');
    if (container) {
        const root = createRoot(container);
        try {
            root.render(
                <React.StrictMode>
                    <AuthProvider>
                        <NavigationProvider>
                            {/* Autres providers selon besoins */}
                            <App />
                        </NavigationProvider>
                    </AuthProvider>
                </React.StrictMode>
            );
        } catch (error) {
            // Gestion d'erreur robuste avec fallback HTML
            container.innerHTML = '<div>Erreur critique lors du rendu de l\'application.</div>';
        }
    }
});
