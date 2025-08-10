// Point d'entrée global pour les exports du projet

// Shared exports
export * from './shared';

// Feature exports - résolution des conflits d'exports
export * from './features/admin';
export * from './features/stock';
export * from './features/dashboard';
export * from './features/hr';
export * from './features/sales';
export * from './features/reports';

// Auth exports avec résolution de conflit useAuth
// Note: useAuth est déjà exporté par ./shared/context/AuthContext
// Les composants auth sont exportés individuellement si nécessaire

// Config exports avec résolution de conflit NavigationItem
export { 
  navigationConfig, 
  getNavigationForRole
} from './config/navigation';
export type { NavigationItem as ConfigNavigationItem } from './config/navigation';