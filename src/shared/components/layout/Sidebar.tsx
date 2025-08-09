import React from 'react';
import { 
  BarChart3, 
  FileText, 
  Package, 
  DollarSign, 
  Users, 
  Settings,
  Store,
  DollarSign as CashRegister,
  UserCheck,
  X
} from 'lucide-react';
import { Button } from '@/components/ui';
import { User, ViewType, NavigationItem } from '@/types';
import { cn } from '@/shared/lib/utils';

interface SidebarProps {
  currentUser: User | null;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const directorNavItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Tableau de Bord', icon: 'BarChart3', category: 'Pilotage' },
  { id: 'reports', label: 'Rapports & Analyses', icon: 'FileText', category: 'Pilotage' },
  { id: 'stock', label: 'Gestion des Stocks', icon: 'Package', category: 'Gestion' },
  { id: 'products', label: 'Produits & Prix', icon: 'DollarSign', category: 'Gestion' },
  { id: 'hr', label: 'Ressources Humaines', icon: 'Users', category: 'Gestion' },
  { id: 'admin', label: 'Administration', icon: 'Settings', category: 'Administration' },
];

const managerNavItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Mon Magasin', icon: 'Store', category: 'Opérations' },
  { id: 'sales', label: 'Saisie des Ventes', icon: 'CashRegister', category: 'Opérations' },
  { id: 'stock', label: 'Mon Stock', icon: 'Package', category: 'Opérations' },
  { id: 'attendance', label: 'Présences', icon: 'UserCheck', category: 'Opérations' },
];

const iconMap = {
  BarChart3,
  FileText,
  Package,
  DollarSign,
  Users,
  Settings,
  Store,
  CashRegister,
  UserCheck
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeView,
  setActiveView,
  sidebarOpen,
  setSidebarOpen
}) => {
  const navItems = currentUser?.role === 'director' ? directorNavItems : managerNavItems;
  const categories = [...new Set(navItems.map(item => item.category))];

  const handleViewChange = (view: ViewType) => {
    setActiveView(view);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 z-50 h-full w-64 bg-slate-800 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700 lg:hidden">
          <h2 className="text-lg font-semibold">Navigation</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="text-white hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="p-4 space-y-6">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-xs uppercase text-slate-400 font-semibold mb-3 px-3">
                {category}
              </h3>
              <div className="space-y-1">
                {navItems
                  .filter((item) => item.category === category)
                  .map((item) => {
                    const IconComponent = iconMap[item.icon as keyof typeof iconMap];
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleViewChange(item.id as ViewType)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all',
                          activeView === item.id
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                        )}
                      >
                        <IconComponent className="h-5 w-5 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};