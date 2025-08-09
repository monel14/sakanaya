import React, { useState } from 'react';
import { 
  Package, 
  Truck, 
  FileText, 
  Users, 
  BarChart3,
  Plus,
  ArrowRight
} from 'lucide-react';
import { TransfertForm } from '../components/TransfertForm';
import { BonReceptionForm } from '../components/BonReceptionForm';
import { SupplierManagement } from '../components/ArrivageFournisseur/SupplierManagement';

type TabType = 'dashboard' | 'transferts' | 'arrivages' | 'fournisseurs' | 'consultation';
type ViewType = 'list' | 'form';

interface StockManagementPageProps {
  userRole: 'directeur' | 'gerant';
  currentStoreId: string;
}

export const StockManagementPage: React.FC<StockManagementPageProps> = ({
  userRole,
  currentStoreId
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [currentView, setCurrentView] = useState<ViewType>('list');

  const tabs = [
    {
      id: 'dashboard' as TabType,
      label: 'Tableau de bord',
      icon: BarChart3,
      roles: ['directeur', 'gerant']
    },
    {
      id: 'transferts' as TabType,
      label: 'Transferts',
      icon: Truck,
      roles: ['directeur', 'gerant']
    },
    {
      id: 'arrivages' as TabType,
      label: 'Arrivages',
      icon: Package,
      roles: ['directeur']
    },
    {
      id: 'fournisseurs' as TabType,
      label: 'Fournisseurs',
      icon: Users,
      roles: ['directeur']
    },
    {
      id: 'consultation' as TabType,
      label: 'Consultation',
      icon: FileText,
      roles: ['directeur', 'gerant']
    }
  ];

  const availableTabs = tabs.filter(tab => tab.roles.includes(userRole));

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Tableau de bord - {userRole === 'directeur' ? 'Directeur' : 'Gérant'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Stock Total</p>
                <p className="text-2xl font-bold text-blue-900">1,247</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Transferts en cours</p>
                <p className="text-2xl font-bold text-green-900">5</p>
              </div>
            </div>
          </div>
          
          {userRole === 'directeur' && (
            <>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-600">Bons en attente</p>
                    <p className="text-2xl font-bold text-yellow-900">3</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-600">Fournisseurs actifs</p>
                    <p className="text-2xl font-bold text-purple-900">12</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => {
              setActiveTab('transferts');
              setCurrentView('form');
            }}
            className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <Truck className="h-6 w-6 text-green-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-green-900">Nouveau transfert</p>
              <p className="text-sm text-green-600">Transférer des produits</p>
            </div>
            <ArrowRight className="h-4 w-4 text-green-600 ml-auto" />
          </button>
          
          {userRole === 'directeur' && (
            <button
              onClick={() => {
                setActiveTab('arrivages');
                setCurrentView('form');
              }}
              className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <Package className="h-6 w-6 text-blue-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-blue-900">Nouvel arrivage</p>
                <p className="text-sm text-blue-600">Enregistrer une réception</p>
              </div>
              <ArrowRight className="h-4 w-4 text-blue-600 ml-auto" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderTransferts = () => {
    if (currentView === 'form') {
      return (
        <TransfertForm
          onTransfertCreated={(transfert) => {
            console.log('Transfert créé:', transfert);
            setCurrentView('list');
          }}
          onCancel={() => setCurrentView('list')}
          defaultSourceStoreId={currentStoreId}
        />
      );
    }

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Gestion des Transferts</h2>
            <button
              onClick={() => setCurrentView('form')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nouveau transfert</span>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="text-center py-12">
            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun transfert</h3>
            <p className="text-gray-500 mb-4">Commencez par créer votre premier transfert inter-magasins.</p>
            <button
              onClick={() => setCurrentView('form')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Créer un transfert
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderArrivages = () => {
    if (currentView === 'form') {
      return (
        <BonReceptionForm
          storeId={currentStoreId}
          onBonCreated={(bon) => {
            console.log('Bon créé:', bon);
            setCurrentView('list');
          }}
          onCancel={() => setCurrentView('list')}
        />
      );
    }

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Gestion des Arrivages</h2>
            <button
              onClick={() => setCurrentView('form')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nouvel arrivage</span>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun arrivage</h3>
            <p className="text-gray-500 mb-4">Commencez par enregistrer votre premier arrivage fournisseur.</p>
            <button
              onClick={() => setCurrentView('form')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Créer un arrivage
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderFournisseurs = () => {
    return <SupplierManagement />;
  };

  const renderConsultation = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Consultation des Stocks</h2>
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Module en développement</h3>
        <p className="text-gray-500">La consultation des stocks sera disponible prochainement.</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'transferts':
        return renderTransferts();
      case 'arrivages':
        return renderArrivages();
      case 'fournisseurs':
        return renderFournisseurs();
      case 'consultation':
        return renderConsultation();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Stocks</h1>
              <p className="text-sm text-gray-500">
                Interface {userRole === 'directeur' ? 'Directeur' : 'Gérant'} - Sakanaya
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {availableTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCurrentView('list');
                  }}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default StockManagementPage;