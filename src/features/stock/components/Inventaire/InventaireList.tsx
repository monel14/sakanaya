import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Inventaire } from '../../shared/types';
import { useInventaire } from '../../shared/hooks/useInventaire';

interface InventaireListProps {
  userRole: 'director' | 'manager';
  userStoreId?: string;
  onViewInventaire?: (inventaire: Inventaire) => void;
  onExportData?: (inventaires: Inventaire[]) => void;
}

interface FilterOptions {
  storeId: string;
  status: 'all' | 'en_cours' | 'en_attente_validation' | 'valide';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom';
  customStartDate?: Date;
  customEndDate?: Date;
  hasVariances: 'all' | 'with_variances' | 'without_variances';
}

export const InventaireList: React.FC<InventaireListProps> = ({
  userRole,
  userStoreId,
  onViewInventaire,
  onExportData
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    storeId: userStoreId || 'all',
    status: 'all',
    dateRange: 'all',
    hasVariances: 'all'
  });

  const {
    inventaires,
    loading,
    error,
    loadInventaires
  } = useInventaire('user-1', userRole, userStoreId);

  // Mock stores data
  const mockStores = [
    { id: 'store-1', name: 'Hub Distribution' },
    { id: 'store-2', name: 'Boutique Centre-Ville' },
    { id: 'store-3', name: 'Marché Sandaga' }
  ];

  // Load inventories when filters change
  useEffect(() => {
    const storeFilter = filters.storeId === 'all' ? undefined : filters.storeId;
    const statusFilter = filters.status === 'all' ? undefined : filters.status;
    loadInventaires(storeFilter, statusFilter);
  }, [filters.storeId, filters.status]);

  // Filter inventories based on search and filters
  const filteredInventaires = inventaires.filter(inventaire => {
    // Search filter
    const matchesSearch = !searchTerm || 
      inventaire.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inventaire.store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inventaire.commentaires?.toLowerCase().includes(searchTerm.toLowerCase());

    // Date range filter
    let matchesDateRange = true;
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const inventaireDate = new Date(inventaire.date);
      
      switch (filters.dateRange) {
        case 'today':
          matchesDateRange = inventaireDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDateRange = inventaireDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDateRange = inventaireDate >= monthAgo;
          break;
        case 'custom':
          if (filters.customStartDate && filters.customEndDate) {
            matchesDateRange = inventaireDate >= filters.customStartDate && 
                             inventaireDate <= filters.customEndDate;
          }
          break;
      }
    }

    // Variance filter
    let matchesVarianceFilter = true;
    if (filters.hasVariances !== 'all') {
      const hasVariances = inventaire.lignes.some(ligne => 
        ligne.ecart !== undefined && Math.abs(ligne.ecart) > 0.01
      );
      
      matchesVarianceFilter = filters.hasVariances === 'with_variances' ? 
        hasVariances : !hasVariances;
    }

    return matchesSearch && matchesDateRange && matchesVarianceFilter;
  });

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

  const getVarianceIndicator = (inventaire: Inventaire) => {
    const linesWithVariance = inventaire.lignes.filter(ligne => 
      ligne.ecart !== undefined && Math.abs(ligne.ecart) > 0.01
    );

    if (linesWithVariance.length === 0) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">Aucun écart</span>
        </div>
      );
    }

    const positiveVariances = linesWithVariance.filter(l => l.ecart! > 0).length;
    const negativeVariances = linesWithVariance.filter(l => l.ecart! < 0).length;

    return (
      <div className="flex items-center gap-2">
        {positiveVariances > 0 && (
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">+{positiveVariances}</span>
          </div>
        )}
        {negativeVariances > 0 && (
          <div className="flex items-center gap-1 text-red-600">
            <TrendingDown className="h-4 w-4" />
            <span className="text-sm">-{negativeVariances}</span>
          </div>
        )}
      </div>
    );
  };

  const handleExport = () => {
    if (onExportData) {
      onExportData(filteredInventaires);
    } else {
      // Default export functionality
      const csvContent = generateCSVContent(filteredInventaires);
      downloadCSV(csvContent, 'inventaires.csv');
    }
  };

  const generateCSVContent = (inventaires: Inventaire[]): string => {
    const headers = [
      'Numéro',
      'Magasin',
      'Date',
      'Statut',
      'Nombre de Produits',
      'Écarts Positifs',
      'Écarts Négatifs',
      'Valeur Écarts (CFA)',
      'Créé par',
      'Validé par',
      'Commentaires'
    ];

    const rows = inventaires.map(inv => {
      const linesWithVariance = inv.lignes.filter(l => l.ecart !== undefined && Math.abs(l.ecart) > 0.01);
      const positiveVariances = linesWithVariance.filter(l => l.ecart! > 0).length;
      const negativeVariances = linesWithVariance.filter(l => l.ecart! < 0).length;

      return [
        inv.numero,
        inv.store.name,
        inv.date.toLocaleDateString('fr-FR'),
        inv.status,
        inv.lignes.length.toString(),
        positiveVariances.toString(),
        negativeVariances.toString(),
        Math.abs(inv.valeurEcarts).toLocaleString(),
        inv.createdBy,
        inv.validatedBy || '',
        (inv.commentaires || '').replace(/"/g, '""')
      ];
    });

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
    total: filteredInventaires.length,
    enCours: filteredInventaires.filter(inv => inv.status === 'en_cours').length,
    enAttente: filteredInventaires.filter(inv => inv.status === 'en_attente_validation').length,
    valides: filteredInventaires.filter(inv => inv.status === 'valide').length,
    withVariances: filteredInventaires.filter(inv => 
      inv.lignes.some(l => l.ecart !== undefined && Math.abs(l.ecart) > 0.01)
    ).length,
    totalVarianceValue: filteredInventaires.reduce((sum, inv) => sum + Math.abs(inv.valeurEcarts), 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Historique des Inventaires
            </h2>
            <p className="text-sm text-gray-600">
              {stats.total} inventaire{stats.total > 1 ? 's' : ''} trouvé{stats.total > 1 ? 's' : ''}
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
            disabled={filteredInventaires.length === 0}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="h-4 w-4" />
            Exporter
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{stats.enCours}</div>
          <div className="text-sm text-gray-600">En cours</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-orange-600">{stats.enAttente}</div>
          <div className="text-sm text-gray-600">En attente</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">{stats.valides}</div>
          <div className="text-sm text-gray-600">Validés</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-red-600">{stats.withVariances}</div>
          <div className="text-sm text-gray-600">Avec écarts</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-lg font-bold text-purple-600">
            {stats.totalVarianceValue.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">CFA écarts</div>
        </div>
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
                <option value="en_cours">En cours</option>
                <option value="en_attente_validation">En attente</option>
                <option value="valide">Validé</option>
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

            {/* Variance Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Écarts
              </label>
              <select
                value={filters.hasVariances}
                onChange={(e) => setFilters(prev => ({ ...prev, hasVariances: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous</option>
                <option value="with_variances">Avec écarts</option>
                <option value="without_variances">Sans écarts</option>
              </select>
            </div>
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

      {/* Inventories Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement...</p>
          </div>
        ) : filteredInventaires.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun inventaire trouvé</p>
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
                    Inventaire
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
                    Écarts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valeur Écarts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventaires.map((inventaire) => (
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
                        {inventaire.date.toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {inventaire.createdAt.toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(inventaire.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getVarianceIndicator(inventaire)}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => onViewInventaire?.(inventaire)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                        Voir
                      </button>
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