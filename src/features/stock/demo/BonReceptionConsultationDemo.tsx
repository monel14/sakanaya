import React, { useState } from 'react';
import { BonReceptionList } from '../components/ArrivageFournisseur/BonReceptionList';
import { BonReceptionDetail } from '../components/ArrivageFournisseur/BonReceptionDetail';
import { useBonsReception } from '../hooks/useBonsReception';
import { Supplier } from '../types';

// Mock suppliers data
const mockSuppliers: Supplier[] = [
  {
    id: 'supplier-1',
    name: 'Fournisseur Océan',
    contact: 'Jean Dupont',
    phone: '+221 77 123 45 67',
    email: 'contact@ocean.sn',
    address: '123 Rue de la Pêche, Dakar',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    createdBy: 'admin'
  },
  {
    id: 'supplier-2',
    name: 'Marée Fraîche SARL',
    contact: 'Fatou Sall',
    phone: '+221 76 987 65 43',
    email: 'fatou@mareefraiche.sn',
    address: '456 Avenue des Pêcheurs, Rufisque',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    createdBy: 'admin'
  },
  {
    id: 'supplier-3',
    name: 'Poissonnerie du Port',
    contact: 'Mamadou Ba',
    phone: '+221 78 555 44 33',
    email: 'mamadou@port.sn',
    address: '789 Quai des Pêcheurs, Saint-Louis',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    createdBy: 'admin'
  }
];

export const BonReceptionConsultationDemo: React.FC = () => {
  const [selectedBonId, setSelectedBonId] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  
  const {
    bonsReception,
    loading,
    error,
    getBonById,
    getMouvementsByBonId,
    refreshBons
  } = useBonsReception();

  const handleViewDetails = (bonId: string) => {
    setSelectedBonId(bonId);
    setShowEditForm(false);
  };

  const handleBack = () => {
    setSelectedBonId(null);
    setShowEditForm(false);
  };

  const handleEdit = (bonId: string) => {
    setShowEditForm(true);
    // In a real app, this would open an edit form
    console.log('Edit bon:', bonId);
  };

  const handleExport = () => {
    // In a real app, this would export the data
    console.log('Export bons de réception');
    alert('Fonctionnalité d\'export en cours de développement');
  };

  const selectedBon = selectedBonId ? getBonById(selectedBonId) : null;
  const selectedBonMouvements = selectedBonId ? getMouvementsByBonId(selectedBonId) : [];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 max-w-md w-full">
          <div className="text-center">
            <div className="text-red-600 text-4xl mb-4">⚠️</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Erreur de Chargement</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={refreshBons}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Consultation des Bons de Réception
          </h1>
          <p className="mt-2 text-gray-600">
            Consultez et gérez tous les bons de réception fournisseur avec filtrage avancé et historique complet.
          </p>
        </div>

        {/* Content */}
        {selectedBon ? (
          <BonReceptionDetail
            bon={selectedBon}
            mouvements={selectedBonMouvements}
            onBack={handleBack}
            onEdit={handleEdit}
            canEdit={true}
            loading={loading}
          />
        ) : (
          <BonReceptionList
            bonsReception={bonsReception}
            suppliers={mockSuppliers}
            onViewDetails={handleViewDetails}
            onExport={handleExport}
            loading={loading}
          />
        )}

        {/* Demo Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="text-blue-600 text-xl">ℹ️</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Démonstration - Interface de Consultation des Bons de Réception
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p className="mb-2">Cette interface permet de :</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Consulter la liste</strong> de tous les bons de réception avec statistiques</li>
                  <li><strong>Filtrer et rechercher</strong> par fournisseur, statut, période, etc.</li>
                  <li><strong>Voir les détails complets</strong> d'un bon avec informations fournisseur</li>
                  <li><strong>Consulter l'historique</strong> et l'audit trail des modifications</li>
                  <li><strong>Identifier visuellement</strong> les bons validés vs brouillons</li>
                  <li><strong>Exporter les données</strong> pour analyse externe</li>
                </ul>
                <p className="mt-2">
                  <strong>Fonctionnalités implémentées :</strong> Filtrage avancé, vue détaillée, 
                  indicateurs visuels de statut, historique des mouvements, responsive design.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BonReceptionConsultationDemo;