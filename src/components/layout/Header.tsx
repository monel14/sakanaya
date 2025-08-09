import React from 'react';
import { Fish, Menu, LogOut, Calendar, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

export const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { toggleSidebar } = useUI();



  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="text-slate-600 hover:text-blue-500 lg:hidden mr-3 p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          
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
          
          {currentUser && (
            <div className="hidden sm:flex items-center text-sm text-slate-600">
              <User className="h-4 w-4 mr-2" />
              <div>
                <div className="font-medium">{currentUser.name || 'Utilisateur'}</div>
                <div className="text-xs text-slate-500 capitalize">{currentUser.role}</div>
              </div>
            </div>
          )}
          
          <button
            onClick={logout}
            className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </div>
    </header>
  );
};