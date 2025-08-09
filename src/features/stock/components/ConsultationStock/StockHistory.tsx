import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Calendar,
  Package,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  BarChart3,
  ArrowUpDown,
  Building2,
  User,
  FileText,
  AlertTriangle,
  Eye,
  FileJson,
  Activity,
  Target,
  Clock
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge } from '../../../../shared/components/ui';
import { StockMovement, MouvementStock } from '../../shared/types';
import { Product } from '../../../sales/types';
import { stockService } from '../../../../shared/services';
import { productService } from '../../../../shared/services';
import { traceabilityService, TraceabilityFilters, TraceabilityReport, LogisticsFlowReport } from '../../shared/services/traceabilityService';
import { toast } from 'sonner';

interface StockHistoryProps {
  storeId?: string;
  productId?: string;
  showFilters?: boolean;
  maxResults?: number;
  showAnalytics?: boolean;
  showAnomalies?: boolean;
}

interface HistoryFilters {
  search: string;
  movementType: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  productId: string;
  storeId: string;
  userId: string;
  referenceType: string;
  sortBy: 'date' | 'type' | 'quantity' | 'product';
  sortOrder: 'asc' | 'desc';
}

const MOVEMENT_TYPES = [
  { value: 'all', label: 'Tous les mouvements' },
  { value: 'arrivage', label: 'Arrivages' },
  { value: 'perte', label: 'Pertes' },
  { value: 'transfert_sortie', label: 'Transferts Sortie' },
  { value: 'transfert_entree', label: 'Transferts Entrée' },
  { value: 'vente', label: 'Ventes' },
  { value: 'ajustement', label: 'Ajustements' }
];

const REFERENCE_TYPES = [
  { value: 'all', label: 'Tous les types' },
  { value: 'bon_reception', label: 'Bon de Réception' },
  { value: 'transfert', label: 'Transfert' },
  { value: 'vente', label: 'Vente' },
  { value: 'perte', label: 'Perte' },
  { value: 'inventaire', label: 'Inventaire' }
];

const MOCK_STORES = [
  { id: 'store-1', name: 'Hub Distribution' },
  { id: 'store-2', name: 'Boutique Centre-Ville' },
  { id: 'store-3', name: 'Marché Sandaga' },
  { id: 'store-4', name: 'Point de Vente Almadies' }
];

const MOCK_USERS = [
  { id: 'user-1', name: 'Directeur Principal' },
  { id: 'user-2', name: 'Gérant Centre-Ville' },
  { id: 'user-3', name: 'Gérant Sandaga' },
  { id: 'user-4', name: 'Gérant Almadies' }
];

export const StockHistory: React.FC<StockHistoryProps> = ({
  storeId,
  productId,
  showFilters = true,
  maxResults = 100,
  showAnalytics: showAnalyticsProp = true,
  showAnomalies = true
}) => {
  const [movements, setMovements] = useState<MouvementStock[]>([]);
  const [filteredMovements, setFilteredMovements] = useState<MouvementStock[]>([]);
  const [traceabilityReport, setTraceabilityReport] = useState<TraceabilityReport | null>(null);
  const [logisticsReport, setLogisticsReport] = useState<LogisticsFlowReport | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAnalyticsState, setShowAnalyticsState] = useState(showAnalyticsProp);
  const [showLogisticsReport, setShowLogisticsReport] = useState(false);
  const [filters, setFilters] = useState<HistoryFilters>({
    search: '',
    movementType: 'all',
    dateRange: {
      start: (() => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date;
      })(),
      end: new Date()
    },
    productId: productId || 'all',
    storeId: storeId || 'all',
    userId: 'all',
    referenceType: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  useEffect(() => {
    loadHistoryData();
    loadProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [movements, filters]);

  const loadHistoryData = async () => {
    setIsLoading(true);
    try {
      // Build filters for traceability service
      const traceFilters: TraceabilityFilters = {};

      if (filters.dateRange.start && filters.dateRange.end) {
        traceFilters.dateRange = {
          start: filters.dateRange.start,
          end: filters.dateRange.end
        };
      }

      if (storeId) {
        traceFilters.storeIds = [storeId];
      }

      if (productId) {
        traceFilters.productIds = [productId];
      }

      // Load movements using traceability service
      const allMovements = await traceabilityService.getMovements(traceFilters);

      // Limit results
      let limitedMovements = allMovements;
      if (maxResults > 0) {
        limitedMovements = allMovements.slice(0, maxResults);
      }

      setMovements(limitedMovements);

      // Generate reports
      await generateReports(traceFilters);
    } catch (error) {
      console.error('Error loading history data:', error);
      toast.error('Erreur lors du chargement de l\'historique');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const productList = await productService.getActiveProducts();
      setProducts(productList);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const generateReports = async (traceFilters: TraceabilityFilters) => {
    try {
      // Generate traceability report
      const report = await traceabilityService.generateTraceabilityReport(traceFilters);
      setTraceabilityReport(report);

      // Generate logistics flow report if store is specified
      if (storeId && filters.dateRange.start && filters.dateRange.end) {
        const storeName = MOCK_STORES.find(s => s.id === storeId)?.name || storeId;
        const logReport = await traceabilityService.generateLogisticsFlowReport(
          storeId,
          storeName,
          filters.dateRange.start,
          filters.dateRange.end
        );
        setLogisticsReport(logReport);
      }
    } catch (error) {
      console.error('Error generating reports:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...movements];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(movement =>
        movement.product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        movement.store.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        movement.commentaire?.toLowerCase().includes(filters.search.toLowerCase()) ||
        movement.referenceId.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Movement type filter
    if (filters.movementType !== 'all') {
      filtered = filtered.filter(movement => movement.type === filters.movementType);
    }

    // Product filter
    if (filters.productId !== 'all') {
      filtered = filtered.filter(movement => movement.productId === filters.productId);
    }

    // Store filter
    if (filters.storeId !== 'all') {
      filtered = filtered.filter(movement => movement.storeId === filters.storeId);
    }

    // User filter
    if (filters.userId !== 'all') {
      filtered = filtered.filter(movement => movement.createdBy === filters.userId);
    }

    // Reference type filter
    if (filters.referenceType !== 'all') {
      filtered = filtered.filter(movement => movement.referenceType === filters.referenceType);
    }

    // Date range filter
    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(movement =>
        movement.date >= filters.dateRange.start! &&
        movement.date <= filters.dateRange.end!
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'date':
          aValue = a.date.getTime();
          bValue = b.date.getTime();
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'quantity':
          aValue = Math.abs(a.quantite);
          bValue = Math.abs(b.quantite);
          break;
        case 'product':
          aValue = a.product.name;
          bValue = b.product.name;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string') {
        return filters.sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return filters.sortOrder === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }
    });

    setFilteredMovements(filtered);
  };

  const exportToCSV = async () => {
    try {
      const traceFilters = buildTraceabilityFilters();
      const csvContent = await traceabilityService.exportToCSV(traceFilters);

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `historique-stock-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Historique exporté en CSV avec succès');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Erreur lors de l\'export CSV');
    }
  };

  const exportToJSON = async () => {
    try {
      const traceFilters = buildTraceabilityFilters();
      const jsonContent = await traceabilityService.exportToJSON(traceFilters);

      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `historique-stock-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Historique exporté en JSON avec succès');
    } catch (error) {
      console.error('Error exporting JSON:', error);
      toast.error('Erreur lors de l\'export JSON');
    }
  };

  const buildTraceabilityFilters = (): TraceabilityFilters => {
    const traceFilters: TraceabilityFilters = {};

    if (filters.dateRange.start && filters.dateRange.end) {
      traceFilters.dateRange = {
        start: filters.dateRange.start,
        end: filters.dateRange.end
      };
    }

    if (filters.storeId !== 'all') {
      traceFilters.storeIds = [filters.storeId];
    } else if (storeId) {
      traceFilters.storeIds = [storeId];
    }

    if (filters.productId !== 'all') {
      traceFilters.productIds = [filters.productId];
    } else if (productId) {
      traceFilters.productIds = [productId];
    }

    if (filters.movementType !== 'all') {
      traceFilters.movementTypes = [filters.movementType];
    }

    if (filters.userId !== 'all') {
      traceFilters.userIds = [filters.userId];
    }

    if (filters.referenceType !== 'all') {
      traceFilters.referenceType = filters.referenceType;
    }

    if (filters.search) {
      traceFilters.search = filters.search;
    }

    return traceFilters;
  };

  const getMovementTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      arrivage: 'Arrivage',
      perte: 'Perte',
      transfert_sortie: 'Transfert Sortie',
      transfert_entree: 'Transfert Entrée',
      vente: 'Vente',
      ajustement: 'Ajustement'
    };
    return typeMap[type] || type;
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'arrivage':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'perte':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'transfert_sortie':
        return <ArrowUpDown className="h-4 w-4 text-blue-600" />;
      case 'transfert_entree':
        return <ArrowUpDown className="h-4 w-4 text-blue-600" />;
      case 'vente':
        return <Package className="h-4 w-4 text-purple-600" />;
      case 'ajustement':
        return <BarChart3 className="h-4 w-4 text-orange-600" />;
      default:
        return <FileText className="h-4 w-4 text-slate-600" />;
    }
  };

  const getQuantityColor = (quantity: number): string => {
    return quantity > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getReferenceTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      bon_reception: 'Bon de Réception',
      transfert: 'Transfert',
      vente: 'Vente',
      perte: 'Perte',
      inventaire: 'Inventaire'
    };
    return typeMap[type] || type;
  };

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const updateDateRange = (type: 'start' | 'end', value: string) => {
    const date = value ? new Date(value) : null;
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [type]: date
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <History className="h-6 w-6" />
            Historique des Mouvements de Stock
          </h2>
          <p className="text-slate-600">
            Journal détaillé de tous les mouvements avec traçabilité complète
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAnalyticsState(!showAnalyticsState)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {showAnalyticsState ? 'Masquer' : 'Analyses'}
          </Button>
          {storeId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLogisticsReport(!showLogisticsReport)}
            >
              <Activity className="h-4 w-4 mr-2" />
              {showLogisticsReport ? 'Masquer' : 'Flux Logistiques'}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            disabled={filteredMovements.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToJSON}
            disabled={filteredMovements.length === 0}
          >
            <FileJson className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadHistoryData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Analytics */}
      {showAnalyticsState && traceabilityReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Mouvements</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {traceabilityReport.totalMovements}
                    </p>
                  </div>
                  <History className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Types de Mouvements</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {Object.keys(traceabilityReport.movementsByType).length}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Magasins Actifs</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {Object.keys(traceabilityReport.movementsByStore).length}
                    </p>
                  </div>
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Anomalies</p>
                    <p className="text-2xl font-bold text-red-600">
                      {traceabilityReport.anomalies.filter(a => !a.resolved).length}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Movement Types Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition par Type de Mouvement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(traceabilityReport.movementsByType).map(([type, count]) => (
                  <div key={type} className="text-center p-3 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-slate-900">{count}</div>
                    <div className="text-sm text-slate-600">{getMovementTypeLabel(type)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Anomalies */}
          {showAnomalies && traceabilityReport.anomalies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Anomalies Détectées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {traceabilityReport.anomalies.slice(0, 5).map((anomaly) => (
                    <div
                      key={anomaly.id}
                      className={`p-3 rounded-lg border-l-4 ${anomaly.severity === 'high' ? 'border-red-500 bg-red-50' :
                          anomaly.severity === 'medium' ? 'border-orange-500 bg-orange-50' :
                            'border-yellow-500 bg-yellow-50'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-slate-900">
                            {anomaly.description}
                          </div>
                          <div className="text-sm text-slate-600">
                            Détectée le {anomaly.detectedAt.toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        <Badge
                          variant={anomaly.resolved ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {anomaly.resolved ? 'Résolue' : anomaly.severity.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Logistics Flow Report */}
      {showLogisticsReport && logisticsReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Rapport de Flux Logistiques - {logisticsReport.storeName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Inbound Flows */}
              <div className="space-y-3">
                <h4 className="font-medium text-slate-900">Flux Entrants</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Arrivages:</span>
                    <span className="font-medium">{logisticsReport.inboundFlows.arrivals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Transferts:</span>
                    <span className="font-medium">{logisticsReport.inboundFlows.transfers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Ajustements:</span>
                    <span className="font-medium">{logisticsReport.inboundFlows.adjustments}</span>
                  </div>
                </div>
              </div>

              {/* Outbound Flows */}
              <div className="space-y-3">
                <h4 className="font-medium text-slate-900">Flux Sortants</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Ventes:</span>
                    <span className="font-medium">{logisticsReport.outboundFlows.sales}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Pertes:</span>
                    <span className="font-medium">{logisticsReport.outboundFlows.losses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Transferts:</span>
                    <span className="font-medium">{logisticsReport.outboundFlows.transfers}</span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-3">
                <h4 className="font-medium text-slate-900">Performance</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Flux Net:</span>
                    <span className={`font-medium ${logisticsReport.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {logisticsReport.netFlow >= 0 ? '+' : ''}{logisticsReport.netFlow.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Efficacité:</span>
                    <span className="font-medium">{logisticsReport.flowEfficiency.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Temps Moyen:</span>
                    <span className="font-medium">{logisticsReport.averageProcessingTime}h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Products */}
            {logisticsReport.topProducts.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-slate-900 mb-3">Produits les Plus Actifs</h4>
                <div className="space-y-2">
                  {logisticsReport.topProducts.slice(0, 5).map((product, index) => (
                    <div key={product.productId} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                          {index + 1}
                        </div>
                        <span className="text-slate-900">{product.productName}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{product.totalMovements} mouvements</div>
                        <div className={`text-xs ${getQuantityColor(product.netQuantity)}`}>
                          {product.netQuantity > 0 ? '+' : ''}{product.netQuantity.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres de Recherche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Recherche
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Produit, motif..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Movement Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Type de Mouvement
                </label>
                <Select
                  value={filters.movementType}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, movementType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MOVEMENT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Product */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Produit
                </label>
                <Select
                  value={filters.productId}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, productId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les produits</SelectItem>
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reference Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Type de Référence
                </label>
                <Select
                  value={filters.referenceType}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, referenceType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REFERENCE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Store */}
              {!storeId && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Magasin
                  </label>
                  <Select
                    value={filters.storeId}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, storeId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les magasins</SelectItem>
                      {MOCK_STORES.map(store => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date de début
                </label>
                <Input
                  type="date"
                  value={formatDateForInput(filters.dateRange.start)}
                  onChange={(e) => updateDateRange('start', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date de fin
                </label>
                <Input
                  type="date"
                  value={formatDateForInput(filters.dateRange.end)}
                  onChange={(e) => updateDateRange('end', e.target.value)}
                />
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Trier par
                </label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortBy: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                    <SelectItem value="quantity">Quantité</SelectItem>
                    <SelectItem value="product">Produit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ordre
                </label>
                <Select
                  value={filters.sortOrder}
                  onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortOrder: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Plus récent</SelectItem>
                    <SelectItem value="asc">Plus ancien</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>
          {filteredMovements.length} mouvement{filteredMovements.length > 1 ? 's' : ''} trouvé{filteredMovements.length > 1 ? 's' : ''}
          {movements.length !== filteredMovements.length && ` sur ${movements.length} total`}
        </span>
        {maxResults > 0 && movements.length >= maxResults && (
          <span className="text-orange-600">
            Résultats limités à {maxResults} entrées
          </span>
        )}
      </div>

      {/* Movements List */}
      <Card>
        <CardHeader>
          <CardTitle>Journal des Mouvements</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              Chargement de l'historique...
            </div>
          ) : filteredMovements.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Aucun mouvement trouvé pour les critères sélectionnés
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMovements.map((movement) => (
                <div
                  key={movement.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {getMovementIcon(movement.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-900">
                          {getMovementTypeLabel(movement.type)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {movement.product.name}
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-600">
                        {movement.commentaire || 'Aucun commentaire'}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {getReferenceTypeLabel(movement.referenceType)}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          Réf: {movement.referenceId}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {movement.store.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {movement.createdBy}
                        </span>
                        {movement.valeur && (
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {movement.valeur.toFixed(0)} CFA
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-lg ${getQuantityColor(movement.quantite)}`}>
                      {movement.quantite > 0 ? '+' : ''}{movement.quantite.toFixed(1)}
                    </div>
                    <div className="text-sm text-slate-500">
                      {movement.date.toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-xs text-slate-400">
                      {movement.date.toLocaleTimeString('fr-FR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>


    </div>
  );
};