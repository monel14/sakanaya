import React, { useState } from 'react';
import { Fish, Bell } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { addNotification } = useNotifications();
  const [credentials, setCredentials] = useState({
    username: 'director',
    password: 'director'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      addNotification({
        type: 'error',
        title: 'Champs requis',
        message: 'Veuillez remplir tous les champs',
      });
      return;
    }

    setLoading(true);
    
    try {
      await login(credentials);
      addNotification({
        type: 'success',
        title: 'Connexion réussie',
        message: 'Bienvenue dans l\'application',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erreur de connexion',
        message: 'Identifiants incorrects',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: 'username' | 'password') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentials(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 p-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-2xl border-0">
        <div className="text-center space-y-4 p-6 pb-6">
          <div className="mx-auto p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl w-fit">
            <Fish className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Sakanaya
            </h1>
            <p className="text-slate-600 text-sm">Système POS Multisite Poissonneries</p>
          </div>
        </div>
        
        <div className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Identifiant
              </label>
              <input
                id="username"
                value={credentials.username}
                onChange={handleInputChange('username')}
                className="w-full h-12 px-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={credentials.password}
                onChange={handleInputChange('password')}
                className="w-full h-12 px-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              <div className="flex items-start gap-2">
                <Bell className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Comptes de démonstration:</strong>
                  <div className="mt-1 space-y-1">
                    <div>Directeur: <code>director / director</code></div>
                    <div>Manager: <code>manager / manager</code></div>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="loader mr-2" />
                  Connexion...
                </div>
              ) : (
                'Se Connecter'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};