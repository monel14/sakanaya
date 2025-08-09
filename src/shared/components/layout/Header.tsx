import React from 'react';
import { Fish, Menu, RotateCcw, LogOut, Calendar } from 'lucide-react';
import { Button } from '../ui';
import { User } from '../../types';

interface HeaderProps {
  currentUser: User | null;
  onToggleSidebar: () => void;
  onSwitchRole: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onToggleSidebar,
  onSwitchRole,
  onLogout
}) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="text-slate-600 hover:text-blue-500 lg:hidden mr-3"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-slate-700 flex items-center">
            <Fish className="h-6 w-6 text-blue-500 mr-2" />
            Sakanaya
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center text-sm text-slate-600">
            <Calendar className="h-4 w-4 mr-1" />
            {new Date().toLocaleDateString('fr-FR')}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onSwitchRole}
            className="hidden sm:flex"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Basculer la vue
          </Button>
          
          <span className="text-sm text-slate-600 hidden sm:block">
            {currentUser?.name}
            {currentUser?.store && (
              <span className="block text-xs text-slate-500">{currentUser.store}</span>
            )}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Déconnexion</span>
          </Button>
        </div>
      </div>
    </header>
  );
};