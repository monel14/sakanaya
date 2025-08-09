import React, { useState } from 'react';
import { Package, Users, Calendar, AlertTriangle } from 'lucide-react';
import { InventaireForm } from './InventaireForm';
import { ComptageSheet } from './ComptageSheet';
import { useInventaire } from '../../hooks/useInventaire';
import { CreateInventaireData } from '../../services/inventaireService';

interface InventaireDemoProps {
  userRole?: 'director' | 'manager';
  userStoreId?: string;
}

export const InventaireDemo: React.FC<InventaireDemoProps> = ({
  userRole = 'manager',
  userStoreId = 'store-1'
}) => {
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'count'>('list');
  const [selectedInventaireId, setSelectedInventaireId] = useState<string | null>(null);

  const {
    inventaires,
    currentInventaire,
    loading,
    error,
    createInventaire,
    updateInventaire,
    submitInventaire,
    loadInventaire,
    completionPercentage
  } = useInventaire('user-1', userRole, userStoreId);

  // Mock stores data
  const mockStores = [
    { id: 'store-1', name: 'Hub Distribution' },
    { id: 'store-2', name: 'Boutique Centre-Ville' },
    { id: 'store-3', name: 'Marché Sandaga' }
  ];

  const handleCreateInventaire = async (data: CreateInventaireData) => {
    try {
      const newInventaire = await createInventaire(data, data.storeId);
      setSelectedInventaireId(newInventaire.id);
      setCurrentView('count');
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const handleStartCounting = async (inventaireId: string) => {
    await loadInventaire(inventaireId);
    setSelectedInventaireId(inventaireId);
    setCurrentView('count');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedInventaireId(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'en_cours': { color: 'bg-blue-100 text-blue-800', label: 'En cours' },
      'en_attente_validation': { color: 'bg-orange-100 text-orange-800', label: 'En attente' },
      'valide': { color: 'bg-green-100 text-green-800', label: 'Validé' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['en_cours'];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (currentView === 'create') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Nouvel Inventaire</h1>
          <button
            onClick={handleBackToList}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Retour à la liste
          </button>
        </div>
        
        <InventaireForm
          stores={mockStores}
          currentUserStoreId={userRole === 'manager' ? userStoreId : undefined}
          onSubmit={handleCreateInventaire}
          loading={loading}
        />
      </div>
    );
  }

  if (currentView === 'count' && currentInventaire) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Comptage Physique</h1>
          <button
            onClick={handleBackToList}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Retour à la liste
          </button>
        </div>
        
        <ComptageSheet
          inventaire={currentInventaire}
          onUpdate={updateInventaire}
          onSubmit={submitInventaire}
          loading={loading}
          autoSave={true}
          autoSaveInterval={30000}
        />
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventaires Physiques</h1>
            <p className="text-gray-600">
              {userRole === 'director' ? 'Gestion des inventaires de tous les magasins' : 'Gestion des inventaires de votre magasin'}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setCurrentView('create')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Package className="h-4 w-4" />
          Nouvel Inventaire
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Inventaires</p>
              <p className="text-2xl font-bold text-gray-900">{inventaires.length}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Cours</p>
              <p className="text-2xl font-bold text-blue-600">
                {inventaires.filter(inv => inv.status === 'en_cours').length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Attente</p>
              <p className="text-2xl font-bold text-orange-600">
                {inventaires.filter(inv => inv.status === 'en_attente_validation').length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Validés</p>
              <p className="text-2xl font-bold text-green-600">
                {inventaires.filter(inv => inv.status === 'valide').length}
              </p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Inventaires List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Liste des Inventaires</h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement...</p>
          </div>
        ) : inventaires.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun inventaire trouvé</p>
            <p className="text-sm text-gray-500 mt-1">
              Créez votre premier inventaire pour commencer
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Numéro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Magasin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progression
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventaires.map((inventaire) => {
                  const completion = inventaire.lignes.length > 0 ? 
                    (inventaire.lignes.filter(l => l.quantitePhysique !== undefined).length / inventaire.lignes.length) * 100 : 0;
                  
                  return (
                    <tr key={inventaire.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {inventaire.numero}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{inventaire.store.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {inventaire.date.toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(inventaire.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${completion}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{Math.round(completion)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {inventaire.status === 'en_cours' && (
                          <button
                            onClick={() => handleStartCounting(inventaire.id)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Compter
                          </button>
                        )}
                        <button
                          onClick={() => handleStartCounting(inventaire.id)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Voir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};