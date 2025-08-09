import React, { useState } from 'react';
import { BonReceptionForm } from '../components/ArrivageFournisseur/BonReceptionForm';
import { SimpleBonReception } from '../services/simpleBonReceptionService';

/**
 * Page de création de bons de réception fournisseur
 * 
 * Cette page permet aux directeurs de :
 * - Créer de nouveaux bons de réception structurés
 * - Saisir les coûts d'achat pour chaque produit
 * - Calculer automatiquement les sous-totaux et totaux
 * - Sauvegarder en brouillon ou valider directement
 * - Générer automatiquement les numéros de bon
 */
export const BonReceptionPage: React.FC = () => {
  const [showForm, setShowForm] = useState(true);
  const [recentBons, setRecentBons] = useState<SimpleBonReception[]>([]);

  const handleBonCreated = (bon: SimpleBonReception) => {
    // Ajouter le nouveau bon à la liste des récents
    setRecentBons(prev => [bon, ...prev.slice(0, 4)]);
    
    // Optionnel : masquer le formulaire et afficher une confirmation
    // setShowForm(false);
  };

  const handleNewBon = () => {
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bons de Réception Fournisseur</h1>
              <p className="text-gray-600 mt-2">
                Enregistrement structuré des arrivages de marchandises avec coûts d'achat
              </p>
            </div>
            {!showForm && (
              <button
                onClick={handleNewBon}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Nouveau Bon de Réception</span>
              </button>
            )}
          </div>
        </div>

        {/* Informations sur les améliorations */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            🚀 Améliorations par rapport à l'ancien système
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-blue-700">
            <div>
              <h3 className="font-medium mb-1">📋 Structure organisée</h3>
              <p>Informations générales + lignes de produits séparées</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">💰 Coûts d'achat</h3>
              <p>Saisie obligatoire des coûts unitaires pour le CUMP</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">🔢 Calculs automatiques</h3>
              <p>Sous-totaux et total général calculés en temps réel</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">📄 Numérotation auto</h3>
              <p>Génération automatique des numéros BR-YYYY-NNNN</p>
            </div>
          </div>
        </div>

        {/* Formulaire ou liste */}
        {showForm ? (
          <BonReceptionForm
            initialStoreId="store-1" // TODO: Get from context or props
            onSuccess={(bonId) => {
              console.log('Bon créé avec succès:', bonId);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Bon de réception créé avec succès !
            </h2>
            <p className="text-gray-600 mb-6">
              Votre bon de réception a été enregistré. Vous pouvez créer un nouveau bon ou consulter la liste des bons existants.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleNewBon}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                Nouveau Bon de Réception
              </button>
              <button
                onClick={() => alert('Fonctionnalité à venir : Liste des bons de réception')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
              >
                Voir tous les bons
              </button>
            </div>
          </div>
        )}

        {/* Bons récents */}
        {recentBons.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Bons de réception récents
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Numéro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fournisseur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total (CFA)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentBons.map((bon) => (
                    <tr key={bon.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {bon.numero}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bon.dateReception.toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {bon.nomFournisseur}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {bon.totalValue.toLocaleString('fr-FR')} CFA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          bon.status === 'validated'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {bon.status === 'validated' ? 'Validé' : 'Brouillon'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};