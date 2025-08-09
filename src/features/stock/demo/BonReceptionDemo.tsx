import React, { useState } from 'react';
import { BonReceptionPage } from '../pages/BonReceptionPage';
import { BonReceptionValidationDemo } from './BonReceptionValidationDemo';
import { Button } from '../../../shared/components/ui';

/**
 * Démonstration du nouveau système de Bon de Réception
 * 
 * Cette démonstration montre les améliorations par rapport à l'ancien ArrivalEntry :
 * 
 * AVANT (ArrivalEntry) :
 * - Saisie simple produit + quantité
 * - Pas de coût d'achat
 * - Pas de structure organisée
 * - Pas de numérotation
 * 
 * APRÈS (BonReceptionForm) :
 * - Structure en 2 sections (Infos générales + Lignes produits)
 * - Saisie obligatoire des coûts d'achat
 * - Calculs automatiques des sous-totaux
 * - Numérotation automatique BR-YYYY-NNNN
 * - Sauvegarde brouillon + validation
 * - Nom fournisseur simple (pas de gestion complexe)
 * 
 * Pour tester :
 * 1. Remplir les informations générales
 * 2. Ajouter des lignes de produits avec quantités et coûts
 * 3. Observer les calculs automatiques
 * 4. Tester la sauvegarde en brouillon ou validation
 */
export const BonReceptionDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'form' | 'validation'>('form');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de démonstration */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Démonstration - Nouveau Système de Bon de Réception
              </h1>
              <p className="text-gray-600 mt-1">
                Transformation de l'ArrivalEntry simple en BonReceptionForm structuré
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Tâche 3.1 - Terminée
              </div>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Tâche 3.2 - En cours
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparaison AVANT/APRÈS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* AVANT */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-3">
              ❌ AVANT - ArrivalEntry simple
            </h3>
            <ul className="space-y-2 text-sm text-red-700">
              <li>• Saisie basique : 1 produit + quantité</li>
              <li>• Pas de coût d'achat (impossible de calculer le CUMP)</li>
              <li>• Pas de fournisseur</li>
              <li>• Pas de numérotation des bons</li>
              <li>• Pas de structure organisée</li>
              <li>• Pas de validation métier</li>
            </ul>
          </div>

          {/* APRÈS */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">
              ✅ APRÈS - BonReceptionForm structuré
            </h3>
            <ul className="space-y-2 text-sm text-green-700">
              <li>• Structure en 2 sections (Infos + Lignes)</li>
              <li>• Coûts d'achat obligatoires pour le CUMP</li>
              <li>• Nom fournisseur (simple, sans gestion complexe)</li>
              <li>• Numérotation automatique BR-YYYY-NNNN</li>
              <li>• Calculs automatiques des totaux</li>
              <li>• Validation métier + sauvegarde brouillon</li>
            </ul>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant={activeTab === 'form' ? 'default' : 'outline'}
            onClick={() => setActiveTab('form')}
          >
            Formulaire de Saisie
          </Button>
          <Button
            variant={activeTab === 'validation' ? 'default' : 'outline'}
            onClick={() => setActiveTab('validation')}
          >
            Tests de Validation
          </Button>
        </div>

        {/* Instructions de test */}
        {activeTab === 'form' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            🧪 Comment tester le nouveau système
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-700">
            <div>
              <h4 className="font-medium mb-2">Étapes de test :</h4>
              <ol className="space-y-1 list-decimal list-inside">
                <li>Remplir la date de réception</li>
                <li>Saisir un nom de fournisseur (ex: "Pêcherie Atlantique")</li>
                <li>Sélectionner le magasin de réception</li>
                <li>Ajouter des lignes de produits</li>
                <li>Saisir quantités et coûts unitaires</li>
                <li>Observer les calculs automatiques</li>
                <li>Tester "Sauvegarder en brouillon" ou "Valider"</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium mb-2">Fonctionnalités à tester :</h4>
              <ul className="space-y-1">
                <li>• Calcul automatique des sous-totaux</li>
                <li>• Calcul du total général</li>
                <li>• Ajout/suppression de lignes</li>
                <li>• Validation des champs obligatoires</li>
                <li>• Génération du numéro de bon</li>
                <li>• Affichage des bons récents</li>
              </ul>
            </div>
          </div>
          </div>
        )}

        {/* Interface principale */}
        {activeTab === 'form' && <BonReceptionPage />}
        {activeTab === 'validation' && <BonReceptionValidationDemo />}
      </div>
    </div>
  );
};

export default BonReceptionDemo;