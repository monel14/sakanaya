import React from 'react';
import { Truck, Package, CheckCircle, Clock } from 'lucide-react';

interface SimpleManagerTransfertsProps {
  user: any;
}

export const SimpleManagerTransferts: React.FC<SimpleManagerTransfertsProps> = ({ user }) => {
  const storeName = user.store || 'Pointe des Almadies';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Truck className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Mes Transferts - {storeName}
          </h1>
        </div>
      </div>

      {/* Transferts en attente de réception */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="h-6 w-6 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Réceptions en Attente (2)
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 border border-orange-300 rounded-lg bg-orange-50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-medium text-orange-900">
                    Bon de Transfert #BT-0128
                  </h3>
                  <p className="text-sm text-orange-800">
                    Depuis Hub de Distribution • Envoyé le 04/08/2025
                  </p>
                </div>
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                  <Clock className="h-3 w-3 mr-1" />
                  En Transit
                </span>
              </div>
              
              <div className="mb-3">
                <p className="text-sm text-orange-800 mb-2">Produits à réceptionner :</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                    Thon Rouge: 15kg
                  </span>
                  <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                    Crevettes: 10kg
                  </span>
                </div>
              </div>
              
              <button className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors">
                <CheckCircle className="h-4 w-4 mr-2" />
                Contrôler & Valider la Réception
              </button>
            </div>

            <div className="p-4 border border-orange-300 rounded-lg bg-orange-50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-medium text-orange-900">
                    Bon de Transfert #BT-0129
                  </h3>
                  <p className="text-sm text-orange-800">
                    Depuis Hub de Distribution • Envoyé le 05/08/2025
                  </p>
                </div>
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                  <Clock className="h-3 w-3 mr-1" />
                  En Transit
                </span>
              </div>
              
              <div className="mb-3">
                <p className="text-sm text-orange-800 mb-2">Produits à réceptionner :</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                    Soles: 8kg
                  </span>
                </div>
              </div>
              
              <button className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors">
                <CheckCircle className="h-4 w-4 mr-2" />
                Contrôler & Valider la Réception
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Historique de mes Réceptions
          </h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#Bon</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provenance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Réception</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">BT-0127</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">Hub de Distribution</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">03/08/2025</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Livré
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">BT-0126</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">Hub de Distribution</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">02/08/2025</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Livré
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Ce mois</h4>
              <p className="text-2xl font-bold text-green-600">12</p>
              <p className="text-sm text-gray-500">Transferts reçus</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Taux de conformité</h4>
              <p className="text-2xl font-bold text-blue-600">95%</p>
              <p className="text-sm text-gray-500">Sans écart</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Délai moyen</h4>
              <p className="text-2xl font-bold text-purple-600">2.3j</p>
              <p className="text-sm text-gray-500">Réception</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <Package className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Interface Intégrée</h4>
                <p className="text-sm text-blue-800">
                  Cette interface de gestion des transferts est maintenant accessible via la sidebar.
                  Réceptionnez vos transferts et contrôlez les quantités reçues.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};