import React from 'react';
import { Search, FileText, TrendingUp } from 'lucide-react';

interface SimpleTraceabilityManagementProps {
  user: any;
}

export const SimpleTraceabilityManagement: React.FC<SimpleTraceabilityManagementProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Search className="h-8 w-8 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Traçabilité & Analyse des Flux
          </h1>
        </div>
        <div className="text-sm text-gray-500">
          Suivi complet des mouvements de stock
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Interface de Traçabilité
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Mouvements aujourd'hui</h3>
              <p className="text-2xl font-bold text-blue-600">127</p>
              <p className="text-sm text-gray-500">Toutes opérations</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Arrivages</h3>
              <p className="text-2xl font-bold text-green-600">15</p>
              <p className="text-sm text-gray-500">Bons validés</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Transferts</h3>
              <p className="text-2xl font-bold text-orange-600">8</p>
              <p className="text-sm text-gray-500">En cours</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Pertes déclarées</h3>
              <p className="text-2xl font-bold text-red-600">3</p>
              <p className="text-sm text-gray-500">Ce jour</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Analyse des flux */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-4">
                <TrendingUp className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Analyse des Flux</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-900">Arrivages ce mois</span>
                  <span className="text-lg font-bold text-blue-600">1,250 kg</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-green-900">Transferts sortants</span>
                  <span className="text-lg font-bold text-green-600">890 kg</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm font-medium text-orange-900">Pertes déclarées</span>
                  <span className="text-lg font-bold text-orange-600">45 kg</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-purple-900">Ventes réalisées</span>
                  <span className="text-lg font-bold text-purple-600">1,180 kg</span>
                </div>
              </div>
            </div>

            {/* Indicateurs de performance */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Indicateurs Clés</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Taux de rotation</span>
                  <span className="text-lg font-bold text-gray-900">12.5 jours</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Taux de perte</span>
                  <span className="text-lg font-bold text-red-600">3.6%</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Précision inventaire</span>
                  <span className="text-lg font-bold text-green-600">96.2%</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Délai transfert moyen</span>
                  <span className="text-lg font-bold text-blue-600">1.8 jours</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Journal des Mouvements Récents
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Magasin</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">08/08/2025 14:30</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Arrivage
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">Thon Rouge</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">+25 kg</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">Almadies</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">08/08/2025 13:15</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        Transfert
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">Crevettes</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">-15 kg</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">Hub → Sandaga</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start space-x-3">
              <Search className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900 mb-1">Interface Intégrée</h4>
                <p className="text-sm text-green-800">
                  Cette interface de traçabilité est maintenant accessible via la sidebar.
                  Analysez les flux de stock, consultez l'historique et exportez les données.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};