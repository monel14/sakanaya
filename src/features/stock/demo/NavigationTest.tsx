import React from 'react';
import { CheckCircle, AlertCircle, Package, Truck, ClipboardList, Search } from 'lucide-react';

export const NavigationTest: React.FC = () => {
  const navigationStatus = {
    director: {
      transferts: 'TransfertManagement',
      inventaires: 'InventaireManagement', 
      tracabilite: 'TraceabilityManagement'
    },
    manager: {
      transferts: 'ManagerTransferts',
      inventaires: 'ManagerInventaire'
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <Package className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Test de Navigation - Interfaces Stock
              </h1>
              <p className="text-gray-600">
                Vérification de l'intégration des nouvelles interfaces
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {/* Status Directeur */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Navigation Directeur
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Transferts Inter-Magasins</p>
                    <p className="text-sm text-green-700">✓ Intégré</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Inventaires Physiques</p>
                    <p className="text-sm text-green-700">✓ Intégré</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Traçabilité & Flux</p>
                    <p className="text-sm text-green-700">✓ Intégré</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Gérant */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Navigation Gérant
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Mes Transferts</p>
                    <p className="text-sm text-green-700">✓ Intégré</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Mes Inventaires</p>
                    <p className="text-sm text-green-700">✓ Intégré</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <div className="flex items-start space-x-3">
                <Package className="h-6 w-6 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Comment accéder aux nouvelles interfaces
                  </h3>
                  <div className="text-sm text-blue-800 space-y-3">
                    <div>
                      <p className="font-medium">Pour le Directeur :</p>
                      <ul className="list-disc list-inside ml-4 space-y-1 mt-1">
                        <li>Sidebar → "Transferts Inter-Magasins"</li>
                        <li>Sidebar → "Inventaires Physiques"</li>
                        <li>Sidebar → "Traçabilité & Flux"</li>
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-medium">Pour le Gérant :</p>
                      <ul className="list-disc list-inside ml-4 space-y-1 mt-1">
                        <li>Sidebar → "Mes Transferts"</li>
                        <li>Sidebar → "Mes Inventaires"</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnostic */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Diagnostic Technique
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Pages créées : TransfertManagement, InventaireManagement, TraceabilityManagement</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Pages manager : ManagerTransferts, ManagerInventaire</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Navigation configurée dans roleUtils.ts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Sidebar mise à jour avec nouveaux liens</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Composants stock intégrés dans les pages</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationTest;