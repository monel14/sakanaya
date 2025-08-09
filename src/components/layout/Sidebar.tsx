import React from 'react';
import { 
  BarChart3, 
  FileText, 
  Package, 
  DollarSign, 
  Users, 
  Settings,
  Store,
  ShoppingCart,
  UserCheck,
  X,
  Home,
  TrendingUp,
  PieChart,
  Truck,
  ClipboardList,
  Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useUI } from '../../context/UIContext';
import { filterNavigationByRole } from '../../utils/roleUtils';

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  category: string;
  allowedRoles?: string[];
  requiredPermission?: string;
}

const navigationItems: NavigationItem[] = [
  // Director - Selon requirements
  { id: 'dashboard', label: 'Tableau de Bord', icon: 'TrendingUp', category: 'Pilotage', allowedRoles: ['director'] },
  { id: 'reports', label: 'Rapports & Analyses', icon: 'FileText', category: 'Pilotage', allowedRoles: ['director'] },
  { id: 'stock', label: 'Gestion des Stocks', icon: 'Package', category: 'Gestion', allowedRoles: ['director'] },
  { id: 'transferts', label: 'Transferts Inter-Magasins', icon: 'Truck', category: 'Gestion', allowedRoles: ['director'] },
  { id: 'inventaires', label: 'Inventaires Physiques', icon: 'ClipboardList', category: 'Gestion', allowedRoles: ['director'] },
  { id: 'tracabilite', label: 'Traçabilité & Flux', icon: 'Search', category: 'Gestion', allowedRoles: ['director'] },
  { id: 'products', label: 'Produits & Prix', icon: 'DollarSign', category: 'Gestion', allowedRoles: ['director'] },
  { id: 'employees', label: 'Ressources Humaines', icon: 'Users', category: 'Gestion', allowedRoles: ['director'] },
  { id: 'users', label: 'Paramètres', icon: 'Settings', category: 'Administration', allowedRoles: ['director'] },
  
  // Manager - Selon requirements
  { id: 'dashboard', label: 'Mon Magasin', icon: 'Home', category: 'Opérations', allowedRoles: ['manager'] },
  { id: 'sales', label: 'Saisie des Ventes', icon: 'ShoppingCart', category: 'Opérations', allowedRoles: ['manager'] },
  { id: 'stock', label: 'Mon Stock', icon: 'Package', category: 'Opérations', allowedRoles: ['manager'] },
  { id: 'transferts', label: 'Mes Transferts', icon: 'Truck', category: 'Opérations', allowedRoles: ['manager'] },
  { id: 'inventaires', label: 'Mes Inventaires', icon: 'ClipboardList', category: 'Opérations', allowedRoles: ['manager'] },
  
  // Common
  { id: 'profile', label: 'Mon Profil', icon: 'UserCheck', category: 'Personnel', allowedRoles: ['director', 'manager'] },
];

const iconMap = {
  BarChart3,
  FileText,
  Package,
  DollarSign,
  Users,
  Settings,
  Store,
  ShoppingCart,
  UserCheck,
  Home,
  TrendingUp,
  PieChart,
  Truck,
  ClipboardList,
  Search
};

export const Sidebar: React.FC = () => {
  const { currentUser } = useAuth();
  const { currentPageKey, navigateTo } = useNavigation();
  const { state: uiState, setSidebarOpen } = useUI();

  if (!currentUser) return null;

  // Filtrer les éléments de navigation selon le rôle
  const filteredItems = filterNavigationByRole(navigationItems, currentUser.role as any);
  const categories = [...new Set(filteredItems.map(item => item.category))];

  const handleNavigation = (pageKey: string) => {
    navigateTo(pageKey);
    // Fermer la sidebar sur mobile après sélection
    if (uiState.isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {uiState.sidebarOpen && uiState.isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 z-50 h-full w-64 bg-slate-800 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${uiState.sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700 lg:hidden">
          <h2 className="text-lg font-semibold">Navigation</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white hover:bg-slate-700 p-2 rounded-md transition-colors"
            aria-label="Fermer la navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="p-4 space-y-6 overflow-y-auto h-full">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-xs uppercase text-slate-400 font-semibold mb-3 px-3">
                {category}
              </h3>
              <div className="space-y-1">
                {filteredItems
                  .filter((item) => item.category === category)
                  .map((item) => {
                    const IconComponent = iconMap[item.icon as keyof typeof iconMap];
                    const isActive = currentPageKey === item.id;
                    
                    return (
                      <button
                        key={`${category}-${item.id}`}
                        onClick={() => handleNavigation(item.id)}
                        className={`
                          w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all
                          ${isActive
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                          }
                        `}
                      >
                        <IconComponent className="h-5 w-5 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
          
          {/* Informations utilisateur en bas */}
          <div className="mt-auto pt-6 border-t border-slate-700">
            <div className="px-3 py-2 text-xs text-slate-400">
              <div className="font-medium text-slate-300">{currentUser.name || 'Utilisateur'}</div>
              <div className="capitalize">{currentUser.role}</div>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
};