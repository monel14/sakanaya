import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { ValidationInventaire } from './ValidationInventaire';
import { InventaireNotifications } from './InventaireNotifications';
import { useInventaire } from '../../shared/hooks/useInventaire';
import { Inventaire } from '../../shared/types';

interface ValidationInventaireDemoProps {
  userRole?: 'director';
}

export const ValidationInventaireDemo: React.FC<ValidationInventaireDemoProps> = ({
  userRole = 'director'
}) => {
  const [currentView, setCurrentView] = useState<'list' | 'validate'>('list');
  const [selectedInventaire, setSelectedInventaire] = useState<Inventaire | null>(null);

  const {
    inventaires,
    loading,
    error,
    validateInventaire,
    rejectInventaire,
    getPendingInventaires,
    loadInventaire
  } = useInventaire('director-1', userRole);

  // Load pending inventories on mount
  useEffect(() => {
    getPendingInventaires();
  }, []);

  const pendingInventaires = inventaires.filter(inv => inv.status === 'en_attente_validation');

  const handleViewInventaire = async (inventaireId: string) => {
    await loadInventaire(inventaireId);
    const inventaire = inventaires.find(inv => inv.id === inventaireId);
    if (inventaire) {
      setSelectedInventaire(inventaire);
      setCurrentView('validate');
    }
  };

  const handleValidateInventaire = async (inventaireId: string) => {
    try {
      await validateInventaire(inventaireId);
      setCurrentView('list');
      setSelectedInventaire(null);
      // Refresh pending inventories
      await getPendingInventaires();
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
    }
  };

  const handleRejectInventaire = async (inventaireId: string, reason: string) => {
    try {
      await rejectInventaire(inventaireId, reason);
      setCurrentView('list');
      setSelectedInventaire(null);
      // Refresh pending inventories
      await getPendingInventaires();
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
    }
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedInventaire(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'en_cours': { color: 'bg-blue-100 text-blue-800', label: 'En cours', icon: Clock },
      'en_attente_validation': { color: 'bg-orange-100 text-orange-800', label: 'En attente', icon: AlertTriangle },
      'valide': { color: 'bg-green-100 text-green-800', label: 'Validé', icon: CheckCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['en_cours'];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (inventaire: Inventaire) => {
    const daysSinceSubmission = Math.floor(
      (new Date().getTime() - inventaire.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const hasHighVariance = Math.abs(inventaire.valeurEcarts) > 100000; // 100k CFA
    
    if (daysSinceSubmission > 3) {
      return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Urgent</span>;
    } else if (hasHighVariance) {
      return <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">Écarts élevés</span>;
    } else if (daysSinceSubmission > 1) {
      return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">À traiter</span>;
    }
    
    return null;
  };

  if (currentView === 'validate' && selectedInventaire) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Validation d'Inventaire</h1>
          <button
            onClick={handleBackToList}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Retour à la liste
          </button>
        </div>
        
        <ValidationInventaire
          inventaire={selectedInventaire}
          onValidate={handleValidateInventaire}
          onReject={handleRejectInventaire}
          loading={loading}
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
          <div className="p-2 bg-orange-100 rounded-lg">
            <Package className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Validation des Inventaires</h1>
            <p className="text-gray-600">
              Approuver ou rejeter les inventaires soumis par les gérants
            </p>
          </div>
        </div>
        
        <InventaireNotifications
          pendingInventaires={pendingInventaires}
          onViewInventaire={handleViewInventaire}
        />
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
              <p className="text-sm font-medium text-gray-600">En Attente</p>
              <p className="text-2xl font-bold text-orange-600">
                {pendingInventaires.length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Urgents</p>
              <p className="text-2xl font-bold text-red-600">
                {pendingInventaires.filter(inv => {
                  const days = Math.floor((new Date().getTime() - inv.createdAt.getTime()) / (1000 * 60 * 60 * 24));
                  return days > 3;
                }).length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Écarts Élevés</p>
              <p className="text-2xl font-bold text-yellow-600">
                {pendingInventaires.filter(inv => Math.abs(inv.valeurEcarts) > 100000).length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Validés Aujourd'hui</p>
              <p className="text-2xl font-bold text-green-600">
                {inventaires.filter(inv => {
                  if (inv.status !== 'valide' || !inv.validatedAt) return false;
                  const today = new Date();
                  const validatedDate = new Date(inv.validatedAt);
                  return validatedDate.toDateString() === today.toDateString();
                }).length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Pending Inventories List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Inventaires en Attente de Validation
          </h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement...</p>
          </div>
        ) : pendingInventaires.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600">Aucun inventaire en attente</p>
            <p className="text-sm text-gray-500 mt-1">
              Tous les inventaires ont été traités
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inventaire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Magasin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Soumission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Écarts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valeur Écarts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priorité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingInventaires.map((inventaire) => {
                  const daysSinceSubmission = Math.floor(
                    (new Date().getTime() - inventaire.createdAt.getTime()) / (1000 * 60 * 60 * 24)
                  );
                  
                  const linesWithVariance = inventaire.lignes.filter(ligne => 
                    ligne.ecart !== undefined && Math.abs(ligne.ecart) > 0.01
                  ).length;

                  return (
                    <tr key={inventaire.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {inventaire.numero}
                          </div>
                          <div className="text-sm text-gray-500">
                            {inventaire.lignes.length} produits
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{inventaire.store.name}</div>
                        <div className="text-sm text-gray-500">Par {inventaire.createdBy}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {inventaire.createdAt.toLocaleDateString('fr-FR')}
                        </div>
                        <div className="text-sm text-gray-500">
                          Il y a {daysSinceSubmission} jour{daysSinceSubmission > 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {linesWithVariance > 0 ? (
                            <AlertTriangle className="h-4 w-4 text-orange-500 mr-1" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          )}
                          <span className="text-sm text-gray-900">
                            {linesWithVariance} / {inventaire.lignes.length}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          Math.abs(inventaire.valeurEcarts) > 100000 ? 'text-red-600' : 
                          Math.abs(inventaire.valeurEcarts) > 50000 ? 'text-orange-600' : 
                          'text-gray-900'
                        }`}>
                          {Math.abs(inventaire.valeurEcarts).toLocaleString()} CFA
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityBadge(inventaire)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewInventaire(inventaire.id)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Valider
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

      {/* All Inventories List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Historique des Inventaires</h3>
        </div>
        
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
                  Validé par
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventaires.slice(0, 10).map((inventaire) => (
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
                    <div className="text-sm text-gray-900">
                      {inventaire.validatedBy || '-'}
                    </div>
                    {inventaire.validatedAt && (
                      <div className="text-sm text-gray-500">
                        {inventaire.validatedAt.toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewInventaire(inventaire.id)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};