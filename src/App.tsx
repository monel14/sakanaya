import React from 'react';
import { useAuth } from './context/AuthContext';
import { useNavigation } from './context/NavigationContext';
import { useUI } from './context/UIContext';
import { useNotifications } from './context/NotificationContext';

// Components
import { Loader } from './components/common/Loader';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { NotificationContainer } from './components/notifications/NotificationContainer';

// Features
import { LoginPage } from './features/auth/pages/LoginPage';
import { getPageByRole } from './utils/roleUtils';

export const App: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const { currentPageKey } = useNavigation();
  const { state: uiState } = useUI();
  const { notifications } = useNotifications();

  // Affichage du loader pendant le chargement
  if (loading || uiState.loading) {
    return <Loader />;
  }

  // Redirection vers la page de connexion si non authentifié
  if (!currentUser) {
    return <LoginPage />;
  }

  // Obtenir le composant de page selon le rôle et la navigation
  const CurrentPageComponent = getPageByRole(currentUser.role, currentPageKey);

  return (
    <div className="app-container">
      <Header />
      
      <div className="flex relative main-content">
        <Sidebar />
        
        <main className={`flex-1 p-3 sm:p-4 lg:p-6 min-h-screen transition-all duration-300 ${
          uiState.sidebarOpen && !uiState.isMobile ? 'lg:ml-64' : ''
        }`}>
          <div className="animate-fade-in">
            <CurrentPageComponent user={currentUser} />
          </div>
        </main>
      </div>

      {/* Système de notifications global */}
      {notifications.length > 0 && <NotificationContainer />}
    </div>
  );
};