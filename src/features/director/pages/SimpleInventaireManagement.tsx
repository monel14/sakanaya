import React from 'react';
import { ClipboardList, Plus, BarChart3 } from 'lucide-react';

interface SimpleInventaireManagementProps {
  user: any;
}

export const SimpleInventaireManagement: React.FC<SimpleInventaireManagementProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ClipboardList className="h-8 w-8 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des Inventaires Physiques
          </h1>
        </div>
        <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Inventaire
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Interface de Gestion des Inventaires
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Inventaires en cours</h3>
              <p className="text-2xl font-bold text-orange-600">3</p>
              <p className="text-sm text-gray-500">En comptage</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">En attente validation</h3>
              <p className="text-2xl font-bold text-yellow-600">2</p>
              <p className="text-sm text-gray-500">À valider</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Validés ce mois</h3>
              <p className="text-2xl font-bold text-green-600">8</p>
              <p className="text-sm text-gray-500">Terminés</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Inventaires en Attente de Validation
            </h3>
            <div className="space-y-3">
              <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-orange-900">
                      Inventaire #INV-2025-001 - Almadies
                    </h4>
                    <p className="text-sm text-orange-800">
                      Comptage terminé le 08/08/2025 • 15 écarts détectés
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
                    Valider
                  </button>
                </div>
              </div>
              
              <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-orange-900">
                      Inventaire #INV-2025-002 - Sandaga
                    </h4>
                    <p className="text-sm text-orange-800">
                      Comptage terminé le 07/08/2025 • 8 écarts détectés
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
                    Valider
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Historique des Inventaires
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#Inventaire</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Magasin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Écarts</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">INV-2025-003</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">Mermoz</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">06/08/2025</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">3</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Validé
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-start space-x-3">
              <BarChart3 className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-purple-900 mb-1">Interface Intégrée</h4>
                <p className="text-sm text-purple-800">
                  Cette interface de gestion des inventaires est maintenant accessible via la sidebar.
                  Gérez les inventaires physiques, validez les écarts et consultez l'historique.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};