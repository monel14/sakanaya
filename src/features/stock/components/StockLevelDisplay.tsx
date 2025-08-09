import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingUp, TrendingDown, RefreshCw, Filter, History, Settings, Search, Calendar, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/components/ui';
import { StockLevel, StockMovement } from '../types';
import { Product } from '../../sales/types';
import { stockService } from '../../../shared/services';
import { productService } from '../../../shared/services';
import { toast } from 'sonner';

interface StockLevelDisplayProps {
  storeId: string;
  refreshInterval?: number; // in milliseconds, default 30 seconds
  showFilters?: boolean; // Show advanced filters for managers
  showHistory?: boolean; // Show movement history for products
}

interface EnrichedStockLevel extends StockLevel {
  product: Product;
  flowRate: number; // units per day
  daysOfStock: number; // days until stock runs out
  alertLevel: 'none' | 'low' | 'critical' | 'overstock';
}

interface StockAlert {
  type: 'low_stock' | 'critical_stock' | 'overstock';
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
  message: string;
}

interface StockFilters {
  search: string;
  category: string;
  alertLevel: string;
  sortBy: 'name' | 'quantity' | 'daysOfStock' | 'flowRate';
  sortOrder: 'asc' | 'desc';
}

interface ProductMovementHistory {
  productId: string;
  movements: StockMovement[];
  isLoading: boolean;
}

// Configurable thresholds
const DEFAULT_STOCK_THRESHOLDS = {
  critical: 2, // days of stock remaining
  low: 7, // days of stock remaining
  overstock: 30 // days of stock remaining
};

// Product categories for filtering
const PRODUCT_CATEGORIES = [
  'Tous',
  'Poissons Frais',
  'Crustacés',
  'Mollusques',
  'Poissons Fumés',
  'Conserves',
  'Surgelés'
];

export const StockLevelDisplay: React.FC<StockLevelDisplayProps> = ({ 
  storeId, 
  refreshInterval = 30000,
  showFilters = true,
  showHistory = true
}) => {
  const [stockLevels, setStockLevels] = useState<EnrichedStockLevel[]>([]);
  const [filteredStockLevels, setFilteredStockLevels] = useState<EnrichedStockLevel[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [stockThresholds, setStockThresholds] = useState(DEFAULT_STOCK_THRESHOLDS);
  const [showThresholdSettings, setShowThresholdSettings] = useState(false);
  const [selectedProductHistory, setSelectedProductHistory] = useState<ProductMovementHistory | null>(null);
  const [filters, setFilters] = useState<StockFilters>({
    search: '',
    category: 'Tous',
    alertLevel: 'Tous',
    sortBy: 'daysOfStock',
    sortOrder: 'asc'
  });

  useEffect(() => {
    loadStockData();
    
    // Set up auto-refresh
    const interval = setInterval(loadStockData, refreshInterval);
    
    return () => clearInterval(interval);
  }, [storeId, refreshInterval]);

  useEffect(() => {
    applyFilters();
  }, [stockLevels, filters]);

  const loadStockData = async () => {
    setIsLoading(true);
    try {
      // Get current stock levels
      const levels = await stockService.getCurrentStock(storeId);
      
      // Get all products to enrich stock data
      const products = await productService.getActiveProducts();
      const productMap = new Map(products.map(p => [p.id, p]));
      
      // Enrich stock levels with product data and calculations
      const enrichedLevels: EnrichedStockLevel[] = [];
      const newAlerts: StockAlert[] = [];
      
      for (const level of levels) {
        const product = productMap.get(level.productId);
        if (!product) continue;
        
        // Calculate flow rate (average daily consumption)
        const flowRate = await calculateFlowRate(storeId, level.productId);
        
        // Calculate days of stock remaining
        const daysOfStock = flowRate > 0 ? level.quantity / flowRate : Infinity;
        
        // Determine alert level
        const alertLevel = determineAlertLevel(daysOfStock);
        
        const enrichedLevel: EnrichedStockLevel = {
          ...level,
          product,
          flowRate,
          daysOfStock,
          alertLevel
        };
        
        enrichedLevels.push(enrichedLevel);
        
        // Generate alerts
        const alert = generateAlert(enrichedLevel);
        if (alert) {
          newAlerts.push(alert);
        }
      }
      
      // Sort by alert level (critical first) then by days of stock
      enrichedLevels.sort((a, b) => {
        const alertPriority = { critical: 0, low: 1, overstock: 2, none: 3 };
        const aPriority = alertPriority[a.alertLevel];
        const bPriority = alertPriority[b.alertLevel];
        
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        
        return a.daysOfStock - b.daysOfStock;
      });
      
      setStockLevels(enrichedLevels);
      setAlerts(newAlerts);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Error loading stock data:', error);
      toast.error('Erreur lors du chargement des données de stock');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateFlowRate = async (storeId: string, productId: string): Promise<number> => {
    // Get movements from the last 30 days to calculate average daily flow
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const movements = await stockService.getStockMovements(storeId, [thirtyDaysAgo, new Date()]);
    
    // Calculate total outflow (sales + losses)
    const productMovements = movements.filter(m => m.productId === productId);
    const totalOutflow = productMovements
      .filter(m => m.type === 'loss' || m.quantity < 0)
      .reduce((sum, m) => sum + Math.abs(m.quantity), 0);
    
    // Calculate average daily flow rate
    const days = 30;
    return totalOutflow / days;
  };

  const determineAlertLevel = (daysOfStock: number): EnrichedStockLevel['alertLevel'] => {
    if (daysOfStock <= stockThresholds.critical) {
      return 'critical';
    } else if (daysOfStock <= stockThresholds.low) {
      return 'low';
    } else if (daysOfStock > stockThresholds.overstock) {
      return 'overstock';
    }
    return 'none';
  };

  const generateAlert = (level: EnrichedStockLevel): StockAlert | null => {
    switch (level.alertLevel) {
      case 'critical':
        return {
          type: 'critical_stock',
          productId: level.productId,
          productName: level.product.name,
          currentStock: level.quantity,
          threshold: stockThresholds.critical,
          message: `Stock critique: ${level.product.name} (${level.quantity} ${level.product.unit}, ${Math.round(level.daysOfStock)} jours restants)`
        };
      case 'low':
        return {
          type: 'low_stock',
          productId: level.productId,
          productName: level.product.name,
          currentStock: level.quantity,
          threshold: stockThresholds.low,
          message: `Stock faible: ${level.product.name} (${level.quantity} ${level.product.unit}, ${Math.round(level.daysOfStock)} jours restants)`
        };
      case 'overstock':
        return {
          type: 'overstock',
          productId: level.productId,
          productName: level.product.name,
          currentStock: level.quantity,
          threshold: stockThresholds.overstock,
          message: `Surstock: ${level.product.name} (${level.quantity} ${level.product.unit}, ${Math.round(level.daysOfStock)} jours de stock)`
        };
      default:
        return null;
    }
  };

  const getAlertBadgeVariant = (alertLevel: EnrichedStockLevel['alertLevel']) => {
    switch (alertLevel) {
      case 'critical':
        return 'destructive';
      case 'low':
        return 'secondary';
      case 'overstock':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getAlertIcon = (alertLevel: EnrichedStockLevel['alertLevel']) => {
    switch (alertLevel) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'low':
        return <TrendingDown className="h-4 w-4 text-orange-600" />;
      case 'overstock':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      default:
        return <Package className="h-4 w-4 text-green-600" />;
    }
  };

  const formatDaysOfStock = (days: number): string => {
    if (days === Infinity) return '∞';
    if (days < 1) return '< 1 jour';
    if (days < 7) return `${Math.round(days)} jour${days > 1 ? 's' : ''}`;
    if (days < 30) return `${Math.round(days / 7)} semaine${days > 7 ? 's' : ''}`;
    return `${Math.round(days / 30)} mois`;
  };

  const applyFilters = () => {
    let filtered = [...stockLevels];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(level =>
        level.product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        level.product.category?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Category filter
    if (filters.category !== 'Tous') {
      filtered = filtered.filter(level => level.product.category === filters.category);
    }

    // Alert level filter
    if (filters.alertLevel !== 'Tous') {
      filtered = filtered.filter(level => {
        switch (filters.alertLevel) {
          case 'Critique':
            return level.alertLevel === 'critical';
          case 'Faible':
            return level.alertLevel === 'low';
          case 'Surstock':
            return level.alertLevel === 'overstock';
          case 'Normal':
            return level.alertLevel === 'none';
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'name':
          aValue = a.product.name;
          bValue = b.product.name;
          break;
        case 'quantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case 'daysOfStock':
          aValue = a.daysOfStock === Infinity ? 999999 : a.daysOfStock;
          bValue = b.daysOfStock === Infinity ? 999999 : b.daysOfStock;
          break;
        case 'flowRate':
          aValue = a.flowRate;
          bValue = b.flowRate;
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

    setFilteredStockLevels(filtered);
  };

  const loadProductHistory = async (productId: string) => {
    setSelectedProductHistory({
      productId,
      movements: [],
      isLoading: true
    });

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const movements = await stockService.getStockMovements(storeId, [thirtyDaysAgo, new Date()]);
      const productMovements = movements.filter(m => m.productId === productId);

      setSelectedProductHistory({
        productId,
        movements: productMovements,
        isLoading: false
      });
    } catch (error) {
      console.error('Error loading product history:', error);
      toast.error('Erreur lors du chargement de l\'historique');
      setSelectedProductHistory(null);
    }
  };

  const updateThresholds = (newThresholds: typeof stockThresholds) => {
    setStockThresholds(newThresholds);
    setShowThresholdSettings(false);
    // Reload data to apply new thresholds
    loadStockData();
    toast.success('Seuils d\'alerte mis à jour');
  };

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Niveaux de Stock en Temps Réel
        </h2>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-sm text-slate-500">
              Mis à jour: {lastUpdated.toLocaleTimeString('fr-FR')}
            </span>
          )}
          {showFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowThresholdSettings(!showThresholdSettings)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Seuils
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={loadStockData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Threshold Settings */}
      {showThresholdSettings && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuration des Seuils d'Alerte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Stock Critique (jours)
                </label>
                <Input
                  type="number"
                  value={stockThresholds.critical}
                  onChange={(e) => setStockThresholds(prev => ({
                    ...prev,
                    critical: Number(e.target.value)
                  }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Stock Faible (jours)
                </label>
                <Input
                  type="number"
                  value={stockThresholds.low}
                  onChange={(e) => setStockThresholds(prev => ({
                    ...prev,
                    low: Number(e.target.value)
                  }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Surstock (jours)
                </label>
                <Input
                  type="number"
                  value={stockThresholds.overstock}
                  onChange={(e) => setStockThresholds(prev => ({
                    ...prev,
                    overstock: Number(e.target.value)
                  }))}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowThresholdSettings(false)}
              >
                Annuler
              </Button>
              <Button
                size="sm"
                onClick={() => updateThresholds(stockThresholds)}
              >
                Appliquer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-800 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres et Recherche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Recherche
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Nom du produit..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Catégorie
                </label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Niveau d'Alerte
                </label>
                <Select
                  value={filters.alertLevel}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, alertLevel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tous">Tous</SelectItem>
                    <SelectItem value="Critique">Critique</SelectItem>
                    <SelectItem value="Faible">Faible</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Surstock">Surstock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                    <SelectItem value="name">Nom</SelectItem>
                    <SelectItem value="quantity">Quantité</SelectItem>
                    <SelectItem value="daysOfStock">Autonomie</SelectItem>
                    <SelectItem value="flowRate">Écoulement</SelectItem>
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
                    <SelectItem value="asc">Croissant</SelectItem>
                    <SelectItem value="desc">Décroissant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts Summary */}
      {alerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertes Stock ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.slice(0, 3).map((alert, index) => (
                <div key={index} className="text-sm text-orange-700">
                  • {alert.message}
                </div>
              ))}
              {alerts.length > 3 && (
                <div className="text-sm text-orange-600 font-medium">
                  ... et {alerts.length - 3} autre{alerts.length > 4 ? 's' : ''} alerte{alerts.length > 4 ? 's' : ''}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Levels Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stock par Produit
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && stockLevels.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              Chargement des données de stock...
            </div>
          ) : filteredStockLevels.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              {stockLevels.length === 0 
                ? 'Aucune donnée de stock disponible'
                : 'Aucun produit ne correspond aux filtres sélectionnés'
              }
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-2 font-medium text-slate-700">Produit</th>
                    <th className="text-right py-3 px-2 font-medium text-slate-700">Stock Actuel</th>
                    <th className="text-right py-3 px-2 font-medium text-slate-700">Taux d'Écoulement</th>
                    <th className="text-right py-3 px-2 font-medium text-slate-700">Autonomie</th>
                    <th className="text-center py-3 px-2 font-medium text-slate-700">Statut</th>
                    {showHistory && (
                      <th className="text-center py-3 px-2 font-medium text-slate-700">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredStockLevels.map((level) => (
                    <tr key={`${level.storeId}-${level.productId}`} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          {getAlertIcon(level.alertLevel)}
                          <div>
                            <div className="font-medium text-slate-900">
                              {level.product.name}
                            </div>
                            <div className="text-sm text-slate-500">
                              {level.product.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-3 px-2">
                        <div className="font-medium text-slate-900">
                          {level.quantity} {level.product.unit}
                        </div>
                        {level.reservedQuantity > 0 && (
                          <div className="text-xs text-orange-600">
                            {level.reservedQuantity} en transit
                          </div>
                        )}
                        <div className="text-xs text-slate-500">
                          Mis à jour: {level.lastUpdated.toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="text-right py-3 px-2">
                        <div className="text-slate-700">
                          {level.flowRate.toFixed(1)} {level.product.unit}/jour
                        </div>
                      </td>
                      <td className="text-right py-3 px-2">
                        <div className={`font-medium ${
                          level.alertLevel === 'critical' ? 'text-red-600' :
                          level.alertLevel === 'low' ? 'text-orange-600' :
                          level.alertLevel === 'overstock' ? 'text-blue-600' :
                          'text-green-600'
                        }`}>
                          {formatDaysOfStock(level.daysOfStock)}
                        </div>
                      </td>
                      <td className="text-center py-3 px-2">
                        <Badge variant={getAlertBadgeVariant(level.alertLevel)}>
                          {level.alertLevel === 'critical' ? 'Critique' :
                           level.alertLevel === 'low' ? 'Faible' :
                           level.alertLevel === 'overstock' ? 'Surstock' :
                           'Normal'}
                        </Badge>
                      </td>
                      {showHistory && (
                        <td className="text-center py-3 px-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => loadProductHistory(level.productId)}
                          >
                            <History className="h-4 w-4" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Movement History Modal */}
      {selectedProductHistory && (
        <Card className="fixed inset-0 z-50 bg-white shadow-2xl overflow-auto">
          <CardHeader className="sticky top-0 bg-white border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Historique des Mouvements
                {selectedProductHistory.productId && (
                  <span className="text-slate-600">
                    - {stockLevels.find(l => l.productId === selectedProductHistory.productId)?.product.name}
                  </span>
                )}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedProductHistory(null)}
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {selectedProductHistory.isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                Chargement de l'historique...
              </div>
            ) : selectedProductHistory.movements.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Aucun mouvement trouvé pour les 30 derniers jours
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-slate-600 mb-4">
                  {selectedProductHistory.movements.length} mouvement(s) sur les 30 derniers jours
                </div>
                {selectedProductHistory.movements.map((movement) => (
                  <div 
                    key={movement.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      {getMovementIcon(movement.type)}
                      <div>
                        <div className="font-medium">
                          {movement.type === 'arrival' ? 'Arrivage' :
                           movement.type === 'loss' ? 'Perte' :
                           movement.type === 'transfer' ? 'Transfert' :
                           movement.type}
                        </div>
                        <div className="text-sm text-slate-600">
                          {movement.reason || 'Aucun motif spécifié'}
                        </div>
                        {movement.lossCategory && (
                          <div className="text-xs text-slate-500">
                            Catégorie: {movement.lossCategory}
                          </div>
                        )}
                        {movement.comments && (
                          <div className="text-xs text-slate-500">
                            {movement.comments}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium text-lg ${
                        movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                      </div>
                      <div className="text-sm text-slate-500">
                        {movement.recordedAt.toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-xs text-slate-400">
                        {movement.recordedAt.toLocaleTimeString('fr-FR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  function getMovementIcon(type: string) {
    switch (type) {
      case 'arrival':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'loss':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'transfer':
        return <Package className="h-4 w-4 text-blue-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-slate-600" />;
    }
  }
};