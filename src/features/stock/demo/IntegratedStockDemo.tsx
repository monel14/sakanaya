import React, { useState } from 'react';
import { Package, Truck, ClipboardList, Search, CheckCircle } from 'lucide-react';

// Import des nouvelles pages intégrées
import { TransfertManagement } from '../../director/pages/TransfertManagement';
import { InventaireManagement } from '../../director/pages/InventaireManagement';
import { TraceabilityManagement } from '../../director/pages/TraceabilityManagement';
import { ManagerTransferts } from '../../manager/pages/ManagerTransferts';
import { ManagerInventaire } from '../../manager/pages/ManagerInventaire';

interface IntegratedStockDemoProps {
  userRole?: 'director' | 'manager';
}

export const IntegratedStockDemo: React.FC<IntegratedStockDemoProps> = ({ 
  userRole = 'director' 
}) => {
  const [activeDemo, setActiveDemo] = useState<string>('transferts');

  // Mock user data
  const mockUser = {
    id: '1',
    name: 'Utilisateur Demo',
    role: userRole,
    store: 'Pointe des Almadies',
    storeId: 'store-1'
  };

  const directorDemos = [
    { id: 'transferts', label: 'Gestion des Transferts', icon: Truck, component: TransfertManagement },
    { id: 'inventaires', label: 'Gestion des Inventaires', icon: ClipboardList, component: InventaireManagement },
    { id: 'tracabilite', label: 'Traçabilité & Flux', icon: Search, component: TraceabilityManagement },
  ];

  const managerDemos = [
    { id: 'transferts', label: 'Mes Transferts', icon: Truck, component: ManagerTransferts },
    { id: 'inventaires', label: 'Mes Inventaires', icon: ClipboardList, component: ManagerInventaire },
  ];

  const demos = userRole === 'director' ? directorDemos : managerDemos;
  const ActiveComponent = demos.find(demo => demo.id === activeDemo)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Démonstration - Nouvelles Interfaces Stock
                </h1>
                <p className="text-sm text-gray-500">
                  Rôle: {userRole === 'director' ? 'Directeur' : 'Gérant'} • {mockUser.store}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-600 font-medium">
                Interfaces Intégrées
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-6">
          {/* Navigation des démos */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Interfaces Disponibles
              </h2>
              <nav className="space-y-2">
                {demos.map((demo) => {
                  const IconComponent = demo.icon;
                  return (
                    <button
                      key={demo.id}
                      onClick={() => setActiveDemo(demo.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeDemo === demo.id
                          ? 'bg-blue-100 text-blue-900'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span>{demo.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="mt-6 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-green-900">
                      Intégration Réussie
                    </h3>
                    <p className="text-xs text-green-800 mt-1">
                      Toutes les interfaces sont maintenant accessibles via la navigation principale.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu de la démo */}
          <div className="flex-1">
            {ActiveComponent && <ActiveComponent user={mockUser} />}
          </div>
        </div>
      </div>

      {/* Instructions d'utilisation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <div className="flex items-start space-x-3">
            <Package className="h-6 w-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Comment accéder aux nouvelles interfaces
              </h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p><strong>Pour le Directeur :</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Transferts Inter-Magasins : Sidebar → "Transferts Inter-Magasins"</li>
                  <li>Inventaires Physiques : Sidebar → "Inventaires Physiques"</li>
                  <li>Traçabilité & Flux : Sidebar → "Traçabilité & Flux"</li>
                </ul>
                
                <p className="mt-3"><strong>Pour le Gérant :</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Mes Transferts : Sidebar → "Mes Transferts"</li>
                  <li>Mes Inventaires : Sidebar → "Mes Inventaires"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegratedStockDemo;