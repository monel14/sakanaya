import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Search,
  Filter,
  Calendar,
  Building2,
  Package,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Plus
} from 'lucide-react';
import { TransfertStock } from '../../shared/types';
import { useTransferts } from '../../shared/hooks/useTransferts';

interface TransfertListProps {
  userRole: 'director' | 'manager';
  currentStoreId?: string;
  onViewTransfert?: (transfert: TransfertStock) => void;
  onCreateTransfert?: () => void;
  onReceiveTransfert?: (transfert: TransfertStock) => void;
}

interface FilterOptions {
  storeId: string;
  status: 'all' | TransfertStock['status'];
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom';
  customStartDate?: Date;
  customEndDate?: Date;
  direction: 'all' | 'outgoing' | 'incoming';
}

// Mock stores data
const mockStores = [
  { id: 'store-1', name: 'Hub Distribution' },
  { id: 'store-2', name: 'Boutique Centre-Ville' },
  { id: 'store-3', name: 'Marché Sandaga' }
];

export const TransfertList: React.FC<TransfertListProps> = ({
  userRole,
  currentStoreId,
  onViewTransfert,
  onCreateTransfert,
  onReceiveTransfert
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    storeId: 'all',
    status: 'all',
    dateRange: 'all',
    direction: 'all'
  });

  const {
    transferts,
    loading,
    error,
    loadTransferts,
    refreshTransferts
  } = useTransferts('user-1', userRole, currentStoreId);

  // Load transfers when filters change
  useEffect(() => {
    const storeFilter = filters.storeId === 'all' ? undefined : filters.storeId;
    const statusFilter = filters.status === 'all' ? undefined : filters.status;
    loadTransferts(storeFilter, statusFilter);
  }, [filters.storeId, filters.status, loadTransferts]);

  // Filter transfers based on search and filters
  const filteredTransferts = transferts.filter(transfert => {
    // Search filter
    const matchesSearch = !searchTerm || 
      transfert.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfert.storeSource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfert.storeDestination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfert.commentaires?.toLowerCase().includes(searchTerm.toLowerCase());

    // Date range filter
    let matchesDateRange = true;
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const transfertDate = new Date(transfert.dateCreation);
      
      switch (filters.dateRange) {
        case 'today':
          matchesDateRange = transfertDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDateRange = transfertDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDateRange = transfertDate >= monthAgo;
          break;
        case 'custom':
          if (filters.customStartDate && filters.customEndDate) {
            matchesDateRange = transfertDate >= filters.customStartDate && 
                             transfertDate <= filters.customEndDate;
          }
          break;
      }
    }

    // Direction filter (for managers)
    let matchesDirection = true;
    if (filters.direction !== 'all' && currentStoreId) {
      switch (filters.direction) {
        case 'outgoing':
          matchesDirection = transfert.storeSourceId === currentStoreId;
          break;
        case 'incoming':
          matchesDirection = transfert.storeDestinationId === currentStoreId;
          break;
      }
    }

    return matchesSearch && matchesDateRange && matchesDirection;
  });

  const getStatusBadge = (status: TransfertStock['status']) => {
    const statusConfig = {
      'en_transit': { color: 'bg-blue-100 text-blue-800', label: 'En transit', icon: Clock },
      'termine': { color: 'bg-green-100 text-green-800', label: 'Terminé', icon: CheckCircle },
      'termine_avec_ecart': { color: 'bg-orange-100 text-orange-800', label: 'Terminé avec écarts', icon: AlertTriangle }
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  const getDirectionIndicator = (transfert: TransfertStock) => {
    if (!currentStoreId) return null;

    const isOutgoing = transfert.storeSourceId === currentStoreId;
    const isIncoming = transfert.storeDestinationId === currentStoreId;

    if (isOutgoing) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <ArrowRight className="h-4 w-4" />
          <span className="text-sm">Sortant</span>
        </div>
      );
    } else if (isIncoming) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <ArrowRight className="h-4 w-4 rotate-180" />
          <span className="text-sm">Entrant</span>
        </div>
      );
    }

    return null;
  };

  const canReceiveTransfert = (transfert: TransfertStock): boolean => {
    return userRole === 'manager' && 
           transfert.status === 'en_transit' && 
           transfert.storeDestinationId === currentStoreId;
  };

  const handleExport = () => {
    const csvContent = generateCSVContent(filteredTransferts);
    downloadCSV(csvContent, 'transferts.csv');
  };

  const generateCSVContent = (transferts: TransfertStock[]): string => {
    const headers = [
      'Numéro',
      'Date Création',
      'Magasin Source',
      'Magasin Destination',
      'Statut',
      'Nombre Produits',
      'Créé par',
      'Reçu par',
      'Date Réception',
      'Commentaires'
    ];

    const rows = transferts.map(transfert => [
      transfert.numero,
      transfert.dateCreation.toLocaleDateString('fr-FR'),
      transfert.storeSource.name,
      transfert.storeDestination.name,
      transfert.status,
      transfert.lignes.length.toString(),
      transfert.createdBy,
      transfert.receptionneBy || '',
      transfert.receptionneAt?.toLocaleDateString('fr-FR') || '',
      (transfert.commentaires || '').replace(/"/g, '""')
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate summary statistics
  const stats = {
    total: filteredTransferts.length,
    enTransit: filteredTransferts.filter(t => t.status === 'en_transit').length,
    termines: filteredTransferts.filter(t => t.status === 'termine').length,
    avecEcarts: filteredTransferts.filter(t => t.status === 'termine_avec_ecart').length,
    entrants: currentStoreId ? filteredTransferts.filter(t => t.storeDestinationId === currentStoreId).length : 0,
    sortants: currentStoreId ? filteredTransferts.filter(t => t.storeSourceId === currentStoreId).length : 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ArrowRight className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Transferts Inter-Magasins
            </h2>
            <p className="text-sm text-gray-600">
              {stats.total} transfert{stats.total > 1 ? 's' : ''} trouvé{stats.total > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              showFilters ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filtres
          </button>

          <button
            onClick={handleExport}
            disabled={filteredTransferts.length === 0}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="h-4 w-4" />
            Exporter
          </button>

          {(userRole === 'director' || (userRole === 'manager' && currentStoreId)) && onCreateTransfert && (
            <button
              onClick={onCreateTransfert}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nouveau Transfert
            </button>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{stats.enTransit}</div>
          <div className="text-sm text-gray-600">En transit</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">{stats.termines}</div>
          <div className="text-sm text-gray-600">Terminés</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-orange-600">{stats.avecEcarts}</div>
          <div className="text-sm text-gray-600">Avec écarts</div>
        </div>
        {currentStoreId && (
          <>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-red-600">{stats.sortants}</div>
              <div className="text-sm text-gray-600">Sortants</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-green-600">{stats.entrants}</div>
              <div className="text-sm text-gray-600">Entrants</div>
            </div>
          </>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Store Filter */}
            {userRole === 'director' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Magasin
                </label>
                <select
                  value={filters.storeId}
                  onChange={(e) => setFilters(prev => ({ ...prev, storeId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les magasins</option>
                  {mockStores.map(store => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="en_transit">En transit</option>
                <option value="termine">Terminé</option>
                <option value="termine_avec_ecart">Terminé avec écarts</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Période
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes les dates</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="custom">Personnalisé</option>
              </select>
            </div>

            {/* Direction Filter (for managers) */}
            {userRole === 'manager' && currentStoreId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Direction
                </label>
                <select
                  value={filters.direction}
                  onChange={(e) => setFilters(prev => ({ ...prev, direction: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous</option>
                  <option value="outgoing">Sortants</option>
                  <option value="incoming">Entrants</option>
                </select>
              </div>
            )}
          </div>

          {/* Custom Date Range */}
          {filters.dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  value={filters.customStartDate?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    customStartDate: e.target.value ? new Date(e.target.value) : undefined 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={filters.customEndDate?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    customEndDate: e.target.value ? new Date(e.target.value) : undefined 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par numéro, magasin ou commentaire..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {/* Transfers Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement...</p>
          </div>
        ) : filteredTransferts.length === 0 ? (
          <div className="p-8 text-center">
            <ArrowRight className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun transfert trouvé</p>
            <p className="text-sm text-gray-500 mt-1">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transfert
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produits
                  </th>
                  {currentStoreId && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Direction
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransferts.map((transfert) => (
                  <tr key={transfert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transfert.numero}
                        </div>
                        <div className="text-sm text-gray-500">
                          Par {transfert.createdBy}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <div className="text-sm">
                          <div className="text-gray-900">{transfert.storeSource.name}</div>
                          <div className="text-gray-500 flex items-center gap-1">
                            <ArrowRight className="h-3 w-3" />
                            {transfert.storeDestination.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {transfert.dateCreation.toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transfert.dateCreation.toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(transfert.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {transfert.lignes.length} produit{transfert.lignes.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </td>
                    {currentStoreId && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getDirectionIndicator(transfert)}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => onViewTransfert?.(transfert)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                        Voir
                      </button>
                      {canReceiveTransfert(transfert) && onReceiveTransfert && (
                        <button
                          onClick={() => onReceiveTransfert(transfert)}
                          className="flex items-center gap-1 text-green-600 hover:text-green-900 ml-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Recevoir
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};