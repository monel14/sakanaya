import React from 'react';
import { useNavigation } from '../../../shared/context/NavigationContext';

interface NotFoundProps {
  user?: any;
}

export const NotFound: React.FC<NotFoundProps> = ({ user }) => {
  const { navigateTo } = useNavigation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="mb-8">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Page non trouvée
        </h2>
        <p className="text-gray-600 max-w-md">
          La page que vous recherchez n'existe pas ou vous n'avez pas les permissions nécessaires pour y accéder.
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => navigateTo('dashboard')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retour au tableau de bord
        </button>
        
        {user && (
          <p className="text-sm text-gray-500">
            Connecté en tant que {user.role}
          </p>
        )}
      </div>
    </div>
  );
};