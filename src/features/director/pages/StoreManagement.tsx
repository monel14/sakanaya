import React from 'react';

interface StoreManagementProps {
  user: any;
}

export const StoreManagement: React.FC<StoreManagementProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Gestion des Magasins
        </h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Nouveau Magasin
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Magasin Principal
          </h3>
          <p className="text-sm text-gray-600 mb-4">Centre-ville</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Employés:</span>
              <span className="text-sm font-medium">8</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">CA mensuel:</span>
              <span className="text-sm font-medium text-green-600">18,450€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Statut:</span>
              <span className="text-sm font-medium text-green-600">Actif</span>
            </div>
          </div>
          <div className="mt-4 flex space-x-2">
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
              Modifier
            </button>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
              Employés
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Magasin Secondaire
          </h3>
          <p className="text-sm text-gray-600 mb-4">Zone commerciale</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Employés:</span>
              <span className="text-sm font-medium">5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">CA mensuel:</span>
              <span className="text-sm font-medium text-green-600">15,230€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Statut:</span>
              <span className="text-sm font-medium text-green-600">Actif</span>
            </div>
          </div>
          <div className="mt-4 flex space-x-2">
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
              Modifier
            </button>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
              Employés
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
            <h3 className="font-medium text-gray-900">Créer un magasin</h3>
            <p className="text-sm text-gray-500">Ajouter un nouveau point de vente</p>
          </button>

          <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
            <h3 className="font-medium text-gray-900">Affecter des employés</h3>
            <p className="text-sm text-gray-500">Gérer les affectations</p>
          </button>

          <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
            <h3 className="font-medium text-gray-900">Paramètres magasins</h3>
            <p className="text-sm text-gray-500">Configuration générale</p>
          </button>
        </div>
      </div>
    </div>
  );
};