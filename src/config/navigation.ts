// Configuration de navigation par rôle
export interface NavigationItem {
  key: string;
  label: string;
  path: string;
  roles: string[];
  icon?: string;
}

export const navigationConfig: NavigationItem[] = [
  {
    key: 'dashboard',
    label: 'Tableau de bord',
    path: '/dashboard',
    roles: ['admin', 'manager', 'director']
  },
  {
    key: 'stock',
    label: 'Gestion Stock',
    path: '/stock',
    roles: ['admin', 'manager', 'stock_manager']
  },
  {
    key: 'reports',
    label: 'Rapports',
    path: '/reports',
    roles: ['admin', 'director']
  }
];

export function getNavigationForRole(role: string): NavigationItem[] {
  return navigationConfig.filter(item => item.roles.includes(role));
}
