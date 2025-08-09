import React from 'react';
import { TrendingUp, Bell, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
interface DirectorDashboardProps {
  user: any;
}

export const DirectorDashboard: React.FC<DirectorDashboardProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Tableau de bord Directeur
        </h1>
        <div className="text-sm text-gray-500">
          Connecté en tant que {user.name || user.role}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            CA mensuel
          </h3>
          <p className="text-3xl font-bold text-green-600">45,230€</p>
          <p className="text-sm text-gray-500">+8.5% vs mois dernier</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Marge brute
          </h3>
          <p className="text-3xl font-bold text-blue-600">32.5%</p>
          <p className="text-sm text-gray-500">+2.1% vs objectif</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Sites actifs
          </h3>
          <p className="text-3xl font-bold text-purple-600">3</p>
          <p className="text-sm text-gray-500">Tous opérationnels</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Performance globale
          </h3>
          <p className="text-3xl font-bold text-yellow-600">94%</p>
          <p className="text-sm text-gray-500">Score de performance</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Vue d'ensemble des sites
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Site Principal</h3>
              <p className="text-sm text-gray-500">Centre-ville</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-green-600">18,450€</p>
              <p className="text-sm text-gray-500">CA mensuel</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Site Secondaire</h3>
              <p className="text-sm text-gray-500">Zone commerciale</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-green-600">15,230€</p>
              <p className="text-sm text-gray-500">CA mensuel</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Site Express</h3>
              <p className="text-sm text-gray-500">Marché local</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-green-600">11,550€</p>
              <p className="text-sm text-gray-500">CA mensuel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};