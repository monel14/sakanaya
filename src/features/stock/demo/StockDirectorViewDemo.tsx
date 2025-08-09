import React from 'react';
import { StockDirectorView } from '../components/ConsultationStock/StockDirectorView';

const DEMO_STORES = [
  { id: 'store-1', name: 'Hub Distribution' },
  { id: 'store-2', name: 'Boutique Centre-Ville' },
  { id: 'store-3', name: 'Marché Sandaga' },
  { id: 'store-4', name: 'Point de Vente Almadies' }
];

export const StockDirectorViewDemo: React.FC = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Démonstration - Vue Directeur Avancée
          </h1>
          <p className="text-gray-600 mt-2">
            Interface complète de gestion des stocks avec données financières, 
            vue consolidée multi-magasins, filtrage avancé et rapports de valorisation.
          </p>
        </div>

        <StockDirectorView
          stores={DEMO_STORES}
          selectedStoreIds={['store-1', 'store-2', 'store-3', 'store-4']}
          onStoreSelectionChange={(storeIds) => {
            console.log('Store selection changed:', storeIds);
          }}
        />
      </div>
    </div>
  );
};

export default StockDirectorViewDemo;