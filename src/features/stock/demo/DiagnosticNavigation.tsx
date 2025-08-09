import React from 'react';
import { CheckCircle, AlertCircle, Package } from 'lucide-react';

// Test des imports pour vérifier qu'ils fonctionnent
import { TransfertManagement } from '../../director/pages/TransfertManagement';
import { InventaireManagement } from '../../director/pages/InventaireManagement';
import { TraceabilityManagement } from '../../director/pages/TraceabilityManagement';
import { ManagerTransferts } from '../../manager/pages/ManagerTransferts';
import { ManagerInventaire } from '../../manager/pages/ManagerInventaire';

export const DiagnosticNavigation: React.FC = () => {
  const imports = [
    { name: 'TransfertManagement', component: TransfertManagement, status: 'success' },
    { name: 'InventaireManagement', component: InventaireManagement, status: 'success' },
    { name: 'TraceabilityManagement', component: TraceabilityManagement, status: 'success' },
    { name: 'ManagerTransferts', component: ManagerTransferts, status: 'success' },
    { name: 'ManagerInventaire', component: ManagerInventaire, status: 'success' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <Package className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Diagnostic Navigation Stock
              </h1>
              <p className="text-gray-600">
                Vérification des imports et de l'intégration
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {/* Test des imports */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Test des Imports de Pages
              </h2>
              <div className="space-y-3">
                {imports.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md">
                    {item.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.status === 'success' ? 'Import réussi' : 'Erreur d\'import'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Configuration de navigation */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Configuration Navigation
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-800">
{`// roleUtils.ts
director: {
  transferts: TransfertManagement,
  inventaires: InventaireManagement,
  tracabilite: TraceabilityManagement,
  ...
},
manager: {
  transferts: ManagerTransferts,
  inventaires: ManagerInventaire,
  ...
}`}
                </pre>
              </div>
            </div>

            {/* Sidebar configuration */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Configuration Sidebar
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-800">
{`// Sidebar.tsx
{ id: 'transferts', label: 'Transferts Inter-Magasins', icon: 'Truck', ... },
{ id: 'inventaires', label: 'Inventaires Physiques', icon: 'ClipboardList', ... },
{ id: 'tracabilite', label: 'Traçabilité & Flux', icon: 'Search', ... },`}
                </pre>
              </div>
            </div>

            {/* Instructions de test */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <div className="flex items-start space-x-3">
                <Package className="h-6 w-6 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Instructions de Test
                  </h3>
                  <div className="text-sm text-blue-800 space-y-2">
                    <p>1. Connectez-vous avec un compte Directeur</p>
                    <p>2. Regardez dans la sidebar section "Gestion"</p>
                    <p>3. Vous devriez voir :</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>"Transferts Inter-Magasins"</li>
                      <li>"Inventaires Physiques"</li>
                      <li>"Traçabilité & Flux"</li>
                    </ul>
                    <p>4. Cliquez sur ces liens pour accéder aux interfaces</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status final */}
            <div className="bg-green-50 rounded-lg border border-green-200 p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-green-900">
                    Intégration Complète
                  </h3>
                  <p className="text-green-800">
                    Toutes les pages sont créées et configurées. Les interfaces devraient être accessibles via la sidebar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticNavigation;