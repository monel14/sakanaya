import React from 'react';

// Import des pages par rôle selon les requirements
import { DirectorDashboard } from '../features/director/pages/DirectorDashboard';
import { DirectorReports } from '../features/director/pages/DirectorReports';
import { StoreManagement } from '../features/director/pages/StoreManagement';
import { StockManagement } from '../features/director/pages/StockManagement';
import { ProductCatalog } from '../features/director/pages/ProductCatalog';
import { EmployeeManagement } from '../features/director/pages/EmployeeManagement';
import { SalesValidation } from '../features/director/pages/SalesValidation';

// Import des nouvelles pages de stock
import { BonReceptionDemo } from '../features/stock/demo/BonReceptionDemo';
import { SimpleTransfertManagement as TransfertManagement } from '../features/director/pages/SimpleTransfertManagement';
import { SimpleInventaireManagement as InventaireManagement } from '../features/director/pages/SimpleInventaireManagement';
import { SimpleTraceabilityManagement as TraceabilityManagement } from '../features/director/pages/SimpleTraceabilityManagement';

import { ManagerDashboard } from '../features/manager/pages/ManagerDashboard';
import { SalesEntry } from '../features/manager/pages/ManagerSales';
import { ManagerStock } from '../features/manager/pages/ManagerStock';
import { SimpleManagerTransferts as ManagerTransferts } from '../features/manager/pages/SimpleManagerTransferts';
import { SimpleManagerInventaire as ManagerInventaire } from '../features/manager/pages/SimpleManagerInventaire';

import { AdminUsers } from '../features/admin/pages/AdminUsers';
import { UserProfile } from '../features/common/pages/UserProfile';
import { NotFound } from '../features/common/pages/NotFound';

// Types pour les rôles selon les requirements
export type UserRole = 'director' | 'manager';
export type PageKey = string;

// Configuration des pages par rôle selon les requirements
const rolePageMap: Record<UserRole, Record<PageKey, React.ComponentType<any>>> = {
  director: {
    dashboard: DirectorDashboard,
    users: AdminUsers,           // Gestion des comptes utilisateurs
    stores: StoreManagement,     // Gestion des magasins
    stock: StockManagement,      // Pilotage global des stocks
    'bon-reception': BonReceptionDemo, // Nouveau système de Bon de Réception
    transferts: TransfertManagement, // Gestion des transferts inter-magasins
    inventaires: InventaireManagement, // Gestion des inventaires physiques
    tracabilite: TraceabilityManagement, // Traçabilité et analyse des flux
    products: ProductCatalog,    // Catalogue produits avec prix variables
    employees: EmployeeManagement, // Gestion RH complète
    reports: DirectorReports,    // Rapports et analyses
    validation: SalesValidation, // Validation des clôtures
    profile: UserProfile,
  },
  manager: {
    dashboard: ManagerDashboard,
    sales: SalesEntry,          // Saisie des ventes quotidiennes
    stock: ManagerStock,        // Arrivages et pertes
    transferts: ManagerTransferts, // Réception des transferts
    inventaires: ManagerInventaire, // Comptage d'inventaire
    profile: UserProfile,
  },
};

// Permissions par rôle selon les requirements
const rolePermissions: Record<UserRole, string[]> = {
  director: [
    'manage_users',           // Req 1: Gestion des comptes utilisateurs
    'manage_stores',          // Req 6: Gestion des magasins
    'manage_products',        // Req 2: Catalogue produits avec prix variables
    'manage_employees',       // Req 5: Gestion RH complète
    'view_all_reports',       // Req 7: Tableaux de bord et reporting
    'validate_sales',         // Req 8: Validation des clôtures
    'view_all_data',          // Accès à toutes les données
  ],
  manager: [
    'create_sales',           // Req 3: Saisie des ventes quotidiennes
    'manage_stock',           // Req 4: Gestion stocks (arrivages/pertes)
    'view_own_store_data',    // Accès aux données de son magasin uniquement
    'request_validation',     // Demander validation au directeur
  ],
};

/**
 * Obtient le composant de page approprié selon le rôle et la clé de page
 */
export const getPageByRole = (role: UserRole, pageKey: PageKey): React.ComponentType<any> => {
  const rolePages = rolePageMap[role];
  
  if (!rolePages) {
    console.warn(`Rôle non reconnu: ${role}`);
    return NotFound;
  }

  const PageComponent = rolePages[pageKey];
  
  if (!PageComponent) {
    console.warn(`Page non trouvée pour le rôle ${role} et la clé ${pageKey}`);
    return NotFound;
  }

  return PageComponent;
};

/**
 * Vérifie si un utilisateur a une permission spécifique
 */
export const hasPermission = (userRole: UserRole, permission: string): boolean => {
  const permissions = rolePermissions[userRole];
  return permissions ? permissions.includes(permission) : false;
};

/**
 * Obtient toutes les permissions d'un rôle
 */
export const getRolePermissions = (role: UserRole): string[] => {
  return rolePermissions[role] || [];
};

/**
 * Vérifie si un utilisateur peut accéder à une page
 */
export const canAccessPage = (userRole: UserRole, pageKey: PageKey): boolean => {
  const rolePages = rolePageMap[userRole];
  return rolePages ? pageKey in rolePages : false;
};

/**
 * Obtient les pages disponibles pour un rôle
 */
export const getAvailablePages = (role: UserRole): PageKey[] => {
  const rolePages = rolePageMap[role];
  return rolePages ? Object.keys(rolePages) : [];
};

/**
 * Filtre les éléments de navigation selon les permissions
 */
export const filterNavigationByRole = (
  navigationItems: any[],
  userRole: UserRole
): any[] => {
  return navigationItems.filter(item => {
    // Si l'item a une permission requise, vérifier si l'utilisateur l'a
    if (item.requiredPermission) {
      return hasPermission(userRole, item.requiredPermission);
    }
    
    // Si l'item a des rôles autorisés, vérifier si l'utilisateur en fait partie
    if (item.allowedRoles) {
      return item.allowedRoles.includes(userRole);
    }
    
    // Par défaut, autoriser l'accès
    return true;
  });
};