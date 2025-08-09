import React from 'react';

interface SettingsProps {
  user: any;
}

export const Settings: React.FC<SettingsProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Paramètres
      </h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Préférences générales
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-500">Recevoir des notifications push</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Mode sombre</h3>
              <p className="text-sm text-gray-500">Utiliser le thème sombre</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Sauvegarde automatique</h3>
              <p className="text-sm text-gray-500">Sauvegarder automatiquement les modifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Sécurité
        </h2>
        
        <div className="space-y-4">
          <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <h3 className="font-medium text-gray-900">Changer le mot de passe</h3>
            <p className="text-sm text-gray-500">Modifier votre mot de passe actuel</p>
          </button>

          <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <h3 className="font-medium text-gray-900">Authentification à deux facteurs</h3>
            <p className="text-sm text-gray-500">Ajouter une couche de sécurité supplémentaire</p>
          </button>

          <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <h3 className="font-medium text-gray-900">Sessions actives</h3>
            <p className="text-sm text-gray-500">Gérer vos sessions de connexion</p>
          </button>
        </div>
      </div>
    </div>
  );
};