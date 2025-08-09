import React from 'react';
import { SupplierManagement } from '../components/ArrivageFournisseur';

/**
 * Page de gestion des fournisseurs pour les Directeurs
 * 
 * Cette page permet aux directeurs de :
 * - Voir la liste de tous les fournisseurs
 * - Ajouter de nouveaux fournisseurs
 * - Modifier les informations des fournisseurs existants
 * - Activer/désactiver des fournisseurs
 * - Rechercher et filtrer les fournisseurs
 * - Voir les statistiques des fournisseurs
 */
export const SupplierManagementPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SupplierManagement />
      </div>
    </div>
  );
};