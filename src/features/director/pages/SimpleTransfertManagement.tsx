import React from 'react';
import { Truck, Plus, Package } from 'lucide-react';

interface SimpleTransfertManagementProps {
  user: any;
}

export const SimpleTransfertManagement: React.FC<SimpleTransfertManagementProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Truck className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des Transferts Inter-Magasins
          </h1>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Transfert
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Interface de Gestion des Transferts
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Transferts en cours</h3>
              <p className="text-2xl font-bold text-blue-600">12</p>
              <p className="text-sm text-gray-500">En transit</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Transferts ce mois</h3>
              <p className="text-2xl font-bold text-green-600">45</p>
              <p className="text-sm text-gray-500">Complétés</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Taux de réussite</h3>
              <p className="text-2xl font-bold text-purple-600">98%</p>
              <p className="text-sm text-gray-500">Sans écart</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Liste des Transferts Récents
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#Bon</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">De</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vers</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">TR-2025-001</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">Hub</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">Almadies</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        En Transit
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">08/08/2025</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">TR-2025-002</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">Hub</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">Sandaga</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Livré
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">07/08/2025</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <Package className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Interface Intégrée</h4>
                <p className="text-sm text-blue-800">
                  Cette interface de gestion des transferts est maintenant accessible via la sidebar.
                  Utilisez les boutons pour créer de nouveaux transferts et gérer les réceptions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};