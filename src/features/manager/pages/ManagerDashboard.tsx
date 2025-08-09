import React from 'react';
import { ShoppingCart, Package, UserCheck, Truck, Bell, CheckCircle } from 'lucide-react';
import { useNavigation } from '../../../shared/context/NavigationContext';

interface ManagerDashboardProps {
  user: any;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ user }) => {
  const { navigateTo } = useNavigation();

  const storeName = user.store || 'Pointe des Almadies';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">🏪</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Mon Magasin - {storeName}
          </h1>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => navigateTo('sales')}
          className="bg-white p-6 rounded-lg shadow-sm border hover:bg-blue-50 transition-colors text-center group"
        >
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Saisir les Ventes</h2>
          <p className="text-sm text-gray-500">Enregistrer les ventes du jour</p>
        </button>

        <button 
          onClick={() => navigateTo('stock')}
          className="bg-white p-6 rounded-lg shadow-sm border hover:bg-green-50 transition-colors text-center group"
        >
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Package className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Gérer le Stock</h2>
          <p className="text-sm text-gray-500">Arrivages et déclaration des pertes</p>
        </button>

        <button 
          onClick={() => navigateTo('employees')}
          className="bg-white p-6 rounded-lg shadow-sm border hover:bg-yellow-50 transition-colors text-center group"
        >
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
              <UserCheck className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Pointer les Présences</h2>
          <p className="text-sm text-gray-500">Gestion des présences du personnel</p>
        </button>
      </div>

      {/* Notifications et informations */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Notifications & Informations</h2>
          </div>
          
          <div className="space-y-4">
            {/* Notification arrivage */}
            <div className="flex items-start p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex-shrink-0">
                <Truck className="h-6 w-6 text-blue-600 mt-1" />
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-blue-900">
                    Arrivage en attente de validation
                  </h3>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    Urgent
                  </span>
                </div>
                <p className="text-sm text-blue-800 mt-1">
                  Bon de transfert #BT-0128 du Hub. 15kg de Thon, 10kg de Crevettes.
                </p>
                <button 
                  onClick={() => navigateTo('stock')}
                  className="text-sm text-blue-700 font-semibold mt-2 hover:text-blue-900 transition-colors"
                >
                  Valider la réception →
                </button>
              </div>
            </div>

            {/* Notification clôture */}
            <div className="flex items-start p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-green-900">
                  Clôture d'hier validée
                </h3>
                <p className="text-sm text-green-800 mt-1">
                  Ventes du 07/08/2025 : 1,250,000 CFA - Validé par le directeur à 09:15
                </p>
              </div>
            </div>

            {/* Information générale */}
            <div className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 bg-gray-400 rounded-full flex items-center justify-center mt-1">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  Mise à jour des prix
                </h3>
                <p className="text-sm text-gray-700 mt-1">
                  Les prix du Thon Rouge et des Crevettes ont été mis à jour ce matin par le directeur.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Résumé rapide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ventes aujourd'hui</p>
              <p className="text-2xl font-bold text-gray-900">0 CFA</p>
              <p className="text-xs text-gray-400">Pas encore de saisie</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Stock disponible</p>
              <p className="text-2xl font-bold text-gray-900">125.8 kg</p>
              <p className="text-xs text-orange-500">Stock bas</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Équipe présente</p>
              <p className="text-2xl font-bold text-gray-900">3/4</p>
              <p className="text-xs text-green-500">Bon taux de présence</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Conseils du jour */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">💡</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Conseils pour une journée efficace
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Commencez par valider les arrivages en attente</li>
              <li>• Vérifiez les prix mis à jour avant la première vente</li>
              <li>• N'oubliez pas de pointer les présences de votre équipe</li>
              <li>• La sauvegarde automatique des ventes se fait toutes les 30 secondes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};