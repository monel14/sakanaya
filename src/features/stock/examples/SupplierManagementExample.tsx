import React from 'react';
import { SupplierManagementPage } from '../pages';

/**
 * Exemple d'utilisation de l'interface de gestion des fournisseurs
 * 
 * Pour utiliser cette interface dans votre application :
 * 
 * 1. Importez la page :
 *    import { SupplierManagementPage } from '@/features/stock';
 * 
 * 2. Ajoutez-la à vos routes (exemple avec React Router) :
 *    <Route path="/stock/suppliers" element={<SupplierManagementPage />} />
 * 
 * 3. Ou utilisez-la directement dans un composant :
 *    <SupplierManagementPage />
 * 
 * L'interface inclut :
 * - Tableau de bord avec statistiques
 * - Liste des fournisseurs avec recherche et filtres
 * - Formulaire d'ajout/modification
 * - Actions d'activation/désactivation
 * - Gestion des erreurs et états de chargement
 */
export const SupplierManagementExample: React.FC = () => {
  return (
    <div>
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">
          Interface de Gestion des Fournisseurs
        </h2>
        <p className="text-blue-700 text-sm">
          Cette interface permet aux directeurs de gérer complètement leurs fournisseurs.
          Utilisez les boutons et fonctionnalités ci-dessous pour tester l'interface.
        </p>
      </div>
      
      <SupplierManagementPage />
    </div>
  );
};

export default SupplierManagementExample;