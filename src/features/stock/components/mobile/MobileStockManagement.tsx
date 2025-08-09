import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Menu,
  X,
  ChevronRight,
  BarChart3,
  History,
  Settings,
  ArrowUpDown,
  Eye
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input } from '../../../../shared/components/ui';
import { StockLevel, StockMovement } from '../../shared/types';
import { Product } from '../../../sales/types';
import { stockService } from '../../../../shared/services';
import { productService } from '../../../../shared/services';
import { toast } from 'sonner';

interface MobileStockManagementProps {
  storeId: string;
  userRole: 'director' | 'manager';
}

interface EnrichedStockLevel extends StockLevel {
  product: Product;
  flowRate: number;
  daysOfStock: number;
  alertLevel: 'none' | 'low' | 'critical' | 'overstock';
}

interface StockAlert {
  type: 'low_stock' | 'critical_stock' | 'overstock';
  productId: string;
  productName: string;
  currentStock: number;
  message: string;
}

const QUICK_FILTERS = [
  { id: 'all', label: 'Tous', icon: Package },
  { id: 'critical', label: 'Critique', icon: AlertTriangle },
  { id: 'low', label: 'Faible', icon: TrendingDown },
  { id: 'normal', label: 'Normal', icon: TrendingUp }
];

export const MobileStockManagement: React.FC<MobileStockManagementProps> = ({ 
  storeId, 
  userRole 
}) => {
  const [stockLevels, setStockLevels] = useState<EnrichedStockLevel[]>([]);
  const [filteredStockLevels, setFilteredStockLevels] = useState<EnrichedStockLevel[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<EnrichedStockLevel | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);

  useEffect(() => {
    loadStockData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadStockData, 30000);
    return () => clearInterval(interval);
  }, [storeId]);

  useEffect(() => {
    applyFilters();
  }, [stockLevels, searchQuery, activeFilter]);

  const loadStockData = async () => {
    setIsLoading(true);
    try {
      const levels = await stockService.getCurrentStock(storeId);
      const products = await productService.getActiveProducts();
      const productMap = new Map(products.map(p => [p.id, p]));
      
      const enrichedLevels: EnrichedStockLevel[] = [];
      const newAlerts: StockAlert[] = [];
      
      for (const level of levels) {
        const product = productMap.get(level.productId);
        if (!product) continue;
        
        const flowRate = await calculateFlowRate(storeId, level.productId);
        const daysOfStock = flowRate > 0 ? level.quantity / flowRate : Infinity;
        const alertLevel = determineAlertLevel(daysOfStock);
        
        const enrichedLevel: EnrichedStockLevel = {
          ...level,
          product,
          flowRate,
          daysOfStock,
          alertLevel
        };
        
        enrichedLevels.push(enrichedLevel);
        
        const alert = generateAlert(enrichedLevel);
        if (alert) {
          newAlerts.push(alert);
        }
      }
      
      // Sort by alert priority
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
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateFlowRate = async (storeId: string, productId: string): Promise<number> => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const movements = await stockService.getStockMovements(storeId, [thirtyDaysAgo, new Date()]);
    const productMovements = movements.filter(m => m.productId === productId);
    const totalOutflow = productMovements
      .filter(m => m.type === 'loss' || m.quantity < 0)
      .reduce((sum, m) => sum + Math.abs(m.quantity), 0);
    
    return totalOutflow / 30;
  };

  const determineAlertLevel = (daysOfStock: number): EnrichedStockLevel['alertLevel'] => {
    if (daysOfStock <= 2) return 'critical';
    if (daysOfStock <= 7) return 'low';
    if (daysOfStock > 30) return 'overstock';
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
          message: `Stock critique: ${level.product.name} (${Math.round(level.daysOfStock)} jours restants)`
        };
      case 'low':
        return {
          type: 'low_stock',
          productId: level.productId,
          productName: level.product.name,
          currentStock: level.quantity,
          message: `Stock faible: ${level.product.name} (${Math.round(level.daysOfStock)} jours restants)`
        };
      case 'overstock':
        return {
          type: 'overstock',
          productId: level.productId,
          productName: level.product.name,
          currentStock: level.quantity,
          message: `Surstock: ${level.product.name}`
        };
      default:
        return null;
    }
  };

  const applyFilters = () => {
    let filtered = [...stockLevels];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(level =>
        level.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        level.product.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Alert level filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(level => {
        switch (activeFilter) {
          case 'critical':
            return level.alertLevel === 'critical';
          case 'low':
            return level.alertLevel === 'low';
          case 'normal':
            return level.alertLevel === 'none';
          default:
            return true;
        }
      });
    }

    setFilteredStockLevels(filtered);
  };

  const getAlertColor = (alertLevel: EnrichedStockLevel['alertLevel']) => {
    switch (alertLevel) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'low':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'overstock':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getAlertIcon = (alertLevel: EnrichedStockLevel['alertLevel']) => {
    switch (alertLevel) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'low':
        return <TrendingDown className="h-4 w-4" />;
      case 'overstock':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const formatDaysOfStock = (days: number): string => {
    if (days === Infinity) return '∞';
    if (days < 1) return '< 1j';
    if (days < 7) return `${Math.round(days)}j`;
    if (days < 30) return `${Math.round(days / 7)}sem`;
    return `${Math.round(days / 30)}mois`;
  };

  const openProductDetail = (product: EnrichedStockLevel) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Stock</h1>
              {lastUpdated && (
                <p className="text-xs text-slate-500">
                  Mis à jour: {lastUpdated.toLocaleTimeString('fr-FR')}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="p-2"
            >
              <Filter className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadStockData}
              disabled={isLoading}
              className="p-2"
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10"
          />
        </div>

        {/* Quick Filters */}
        {showFilters && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            {QUICK_FILTERS.map((filter) => {
              const Icon = filter.icon;
              const isActive = activeFilter === filter.id;
              return (
                <Button
                  key={filter.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter.id)}
                  className="flex-shrink-0 h-8 px-3"
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {filter.label}
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {/* Alerts Banner */}
      {alerts.length > 0 && (
        <div className="bg-orange-50 border-b border-orange-200 px-4 py-3">
          <div className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">
              {alerts.length} alerte{alerts.length > 1 ? 's' : ''} de stock
            </span>
          </div>
          <div className="mt-1 text-xs text-orange-700">
            {alerts.slice(0, 2).map((alert, index) => (
              <div key={index}>• {alert.message}</div>
            ))}
            {alerts.length > 2 && (
              <div>... et {alerts.length - 2} autre{alerts.length > 3 ? 's' : ''}</div>
            )}
          </div>
        </div>
      )}

      {/* Stock List */}
      <div className="px-4 py-4 space-y-3">
        {isLoading && stockLevels.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Chargement des données...</p>
          </div>
        ) : filteredStockLevels.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Package className="h-8 w-8 mx-auto mb-2" />
            <p>
              {stockLevels.length === 0 
                ? 'Aucune donnée de stock'
                : 'Aucun produit trouvé'
              }
            </p>
          </div>
        ) : (
          filteredStockLevels.map((level) => (
            <Card 
              key={`${level.storeId}-${level.productId}`}
              className={`border-l-4 ${getAlertColor(level.alertLevel)} cursor-pointer active:scale-95 transition-transform`}
              onClick={() => openProductDetail(level)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getAlertIcon(level.alertLevel)}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 truncate">
                        {level.product.name}
                      </h3>
                      <p className="text-sm text-slate-500 truncate">
                        {level.product.category}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                </div>
                
                <div className="mt-3 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-slate-500">Stock</p>
                    <p className="font-semibold text-slate-900">
                      {level.quantity}
                    </p>
                    <p className="text-xs text-slate-500">
                      {level.product.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Écoulement</p>
                    <p className="font-semibold text-slate-900">
                      {level.flowRate.toFixed(1)}
                    </p>
                    <p className="text-xs text-slate-500">
                      /jour
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Autonomie</p>
                    <p className={`font-semibold ${
                      level.alertLevel === 'critical' ? 'text-red-600' :
                      level.alertLevel === 'low' ? 'text-orange-600' :
                      level.alertLevel === 'overstock' ? 'text-blue-600' :
                      'text-green-600'
                    }`}>
                      {formatDaysOfStock(level.daysOfStock)}
                    </p>
                  </div>
                </div>

                {level.reservedQuantity > 0 && (
                  <div className="mt-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                    {level.reservedQuantity} {level.product.unit} en transit
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Product Detail Modal */}
      {showProductDetail && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-white">
          {/* Modal Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getAlertIcon(selectedProduct.alertLevel)}
                <div>
                  <h2 className="font-semibold text-slate-900">
                    {selectedProduct.product.name}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {selectedProduct.product.category}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProductDetail(false)}
                className="p-2"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-4 space-y-4">
            {/* Status Card */}
            <Card className={`border-l-4 ${getAlertColor(selectedProduct.alertLevel)}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-slate-900">Statut du Stock</h3>
                  <Badge 
                    variant={
                      selectedProduct.alertLevel === 'critical' ? 'destructive' :
                      selectedProduct.alertLevel === 'low' ? 'secondary' :
                      selectedProduct.alertLevel === 'overstock' ? 'outline' :
                      'default'
                    }
                  >
                    {selectedProduct.alertLevel === 'critical' ? 'Critique' :
                     selectedProduct.alertLevel === 'low' ? 'Faible' :
                     selectedProduct.alertLevel === 'overstock' ? 'Surstock' :
                     'Normal'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-slate-50 rounded">
                    <p className="text-2xl font-bold text-slate-900">
                      {selectedProduct.quantity}
                    </p>
                    <p className="text-sm text-slate-500">
                      {selectedProduct.product.unit} en stock
                    </p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded">
                    <p className={`text-2xl font-bold ${
                      selectedProduct.alertLevel === 'critical' ? 'text-red-600' :
                      selectedProduct.alertLevel === 'low' ? 'text-orange-600' :
                      selectedProduct.alertLevel === 'overstock' ? 'text-blue-600' :
                      'text-green-600'
                    }`}>
                      {formatDaysOfStock(selectedProduct.daysOfStock)}
                    </p>
                    <p className="text-sm text-slate-500">
                      d'autonomie
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Détails</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Taux d'écoulement</span>
                  <span className="font-medium">
                    {selectedProduct.flowRate.toFixed(1)} {selectedProduct.product.unit}/jour
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Dernière mise à jour</span>
                  <span className="font-medium">
                    {selectedProduct.lastUpdated.toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {selectedProduct.reservedQuantity > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">En transit</span>
                    <span className="font-medium text-orange-600">
                      {selectedProduct.reservedQuantity} {selectedProduct.product.unit}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-600">Prix unitaire</span>
                  <span className="font-medium">
                    {selectedProduct.product.price?.toFixed(2) || 'N/A'} €
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            {userRole === 'director' && (
              <div className="space-y-2">
                <Button className="w-full" size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau Bon de Réception
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Transfert
                  </Button>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Inventaire
                  </Button>
                </div>
              </div>
            )}

            <Button 
              variant="outline" 
              className="w-full"
              size="lg"
            >
              <History className="h-4 w-4 mr-2" />
              Voir l'Historique
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};