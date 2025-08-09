import React, { useState, useEffect } from 'react';
import { Calendar, Package, TrendingUp, TrendingDown, Filter, Download, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input } from '@/components/ui';
import { StockMovement } from '../types';
import { Product } from '@/features/sales/types';
import { stockService, productService } from '@/shared/services';
import { toast } from 'sonner';

interface StockMovementHistoryProps {
  storeId: string;
  productId?: string; // Optional filter by specific product
  maxItems?: number;
}

interface EnrichedStockMovement extends StockMovement {
  product: Product;
}

interface MovementFilters {
  type: 'all' | 'arrival' | 'loss' | 'transfer';
  dateRange: 'week' | 'month' | 'quarter' | 'all';
  productSearch: string;
  lossCategory?: 'spoilage' | 'damage' | 'promotion';
}

export const StockMovementHistory: React.FC<StockMovementHistoryProps> = ({
  storeId,
  productId,
  maxItems = 50
}) => {
  const [movements, setMovements] = useState<EnrichedStockMovement[]>([]);
  const [filteredMovements, setFilteredMovements] = useState<EnrichedStockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<MovementFilters>({
    type: 'all',
    dateRange: 'month',
    productSearch: '',
    lossCategory: undefined
  });

  useEffect(() => {
    loadMovementHistory();
  }, [storeId, productId]);

  useEffect(() => {
    applyFilters();
  }, [movements, filters]);

  const loadMovementHistory = async () => {
    setIsLoading(true);
    try {
      // Calculate date range based on filter
      const dateRange = getDateRange(filters.dateRange);
      
      // Get movements from service
      const rawMovements = await stockService.getStockMovements(storeId, dateRange);
      
      // Filter by specific product if provided
      const productFilteredMovements = productId 
        ? rawMovements.filter(m => m.productId === productId)
        : rawMovements;

      // Get all products to enrich movement data
      const products = await productService.getActiveProducts();
      const productMap = new Map(products.map(p => [p.id, p]));

      // Enrich movements with product data
      const enrichedMovements: EnrichedStockMovement[] = productFilteredMovements
        .map(movement => {
          const product = productMap.get(movement.productId);
          if (!product) return null;
          
          return {
            ...movement,
            product
          };
        })
        .filter((movement): movement is EnrichedStockMovement => movement !== null)
        .slice(0, maxItems);

      setMovements(enrichedMovements);
      
    } catch (error) {
      console.error('Error loading movement history:', error);
      toast.error('Erreur lors du chargement de l\'historique des mouvements');
    } finally {
      setIsLoading(false);
    }
  };

  const getDateRange = (range: MovementFilters['dateRange']): [Date, Date] | undefined => {
    const now = new Date();
    const startDate = new Date();
    
    switch (range) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        return [startDate, now];
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        return [startDate, now];
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        return [startDate, now];
      case 'all':
      default:
        return undefined;
    }
  };

  const applyFilters = () => {
    let filtered = [...movements];

    // Filter by movement type
    if (filters.type !== 'all') {
      filtered = filtered.filter(m => m.type === filters.type);
    }

    // Filter by loss category (only for loss movements)
    if (filters.lossCategory && filters.type === 'loss') {
      filtered = filtered.filter(m => m.lossCategory === filters.lossCategory);
    }

    // Filter by product search
    if (filters.productSearch.trim()) {
      const searchTerm = filters.productSearch.toLowerCase();
      filtered = filtered.filter(m => 
        m.product.name.toLowerCase().includes(searchTerm) ||
        m.product.category.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredMovements(filtered);
  };

  const getMovementIcon = (movement: EnrichedStockMovement) => {
    switch (movement.type) {
      case 'arrival':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'loss':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'transfer':
        return <Package className="h-4 w-4 text-blue-600" />;
      default:
        return <Package className="h-4 w-4 text-slate-600" />;
    }
  };

  const getMovementBadgeVariant = (movement: EnrichedStockMovement) => {
    switch (movement.type) {
      case 'arrival':
        return 'default';
      case 'loss':
        return 'destructive';
      case 'transfer':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getMovementTypeLabel = (movement: EnrichedStockMovement) => {
    switch (movement.type) {
      case 'arrival':
        return 'Arrivage';
      case 'loss':
        return `Perte${movement.lossCategory ? ` (${getLossCategoryLabel(movement.lossCategory)})` : ''}`;
      case 'transfer':
        return 'Transfert';
      default:
        return 'Mouvement';
    }
  };

  const getLossCategoryLabel = (category: string) => {
    switch (category) {
      case 'spoilage':
        return 'Avarie';
      case 'damage':
        return 'Dégât';
      case 'promotion':
        return 'Promotion';
      default:
        return category;
    }
  };

  const formatQuantity = (movement: EnrichedStockMovement) => {
    const quantity = Math.abs(movement.quantity);
    const sign = movement.quantity >= 0 ? '+' : '-';
    return `${sign}${quantity} ${movement.product.unit}`;
  };

  const exportToCSV = () => {
    const csvData = filteredMovements.map(movement => ({
      Date: movement.recordedAt.toLocaleDateString('fr-FR'),
      Heure: movement.recordedAt.toLocaleTimeString('fr-FR'),
      Produit: movement.product.name,
      Type: getMovementTypeLabel(movement),
      Quantité: formatQuantity(movement),
      Raison: movement.reason || '',
      Commentaires: movement.comments || '',
      'Enregistré par': movement.recordedBy
    }));

    // Simple CSV export (in a real app, you'd use a proper CSV library)
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mouvements-stock-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Historique des Mouvements de Stock
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={exportToCSV}
          disabled={filteredMovements.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Type filter */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Type de mouvement
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  type: e.target.value as MovementFilters['type']
                }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              >
                <option value="all">Tous</option>
                <option value="arrival">Arrivages</option>
                <option value="loss">Pertes</option>
                <option value="transfer">Transferts</option>
              </select>
            </div>

            {/* Date range filter */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Période
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => {
                  setFilters(prev => ({ 
                    ...prev, 
                    dateRange: e.target.value as MovementFilters['dateRange']
                  }));
                  // Reload data with new date range
                  setTimeout(loadMovementHistory, 100);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              >
                <option value="week">7 derniers jours</option>
                <option value="month">30 derniers jours</option>
                <option value="quarter">3 derniers mois</option>
                <option value="all">Tout l'historique</option>
              </select>
            </div>

            {/* Loss category filter (only shown when type is 'loss') */}
            {filters.type === 'loss' && (
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Catégorie de perte
                </label>
                <select
                  value={filters.lossCategory || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    lossCategory: e.target.value as MovementFilters['lossCategory'] || undefined
                  }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                >
                  <option value="">Toutes</option>
                  <option value="spoilage">Avarie</option>
                  <option value="damage">Dégât</option>
                  <option value="promotion">Promotion</option>
                </select>
              </div>
            )}

            {/* Product search */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Recherche produit
              </label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Nom ou catégorie..."
                  value={filters.productSearch}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    productSearch: e.target.value
                  }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Movement History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Mouvements ({filteredMovements.length})</span>
            {movements.length > filteredMovements.length && (
              <span className="text-sm font-normal text-slate-500">
                {movements.length - filteredMovements.length} masqué(s) par les filtres
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">
              Chargement de l'historique...
            </div>
          ) : filteredMovements.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Aucun mouvement trouvé pour les critères sélectionnés
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-2 font-medium text-slate-700">Date/Heure</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-700">Produit</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-700">Type</th>
                    <th className="text-right py-3 px-2 font-medium text-slate-700">Quantité</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-700">Raison</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-700">Enregistré par</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovements.map((movement) => (
                    <tr key={movement.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-2">
                        <div className="text-sm">
                          <div className="font-medium text-slate-900">
                            {movement.recordedAt.toLocaleDateString('fr-FR')}
                          </div>
                          <div className="text-slate-500">
                            {movement.recordedAt.toLocaleTimeString('fr-FR')}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          {getMovementIcon(movement)}
                          <div>
                            <div className="font-medium text-slate-900">
                              {movement.product.name}
                            </div>
                            <div className="text-sm text-slate-500">
                              {movement.product.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant={getMovementBadgeVariant(movement)}>
                          {getMovementTypeLabel(movement)}
                        </Badge>
                      </td>
                      <td className="text-right py-3 px-2">
                        <span className={`font-medium ${
                          movement.quantity >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatQuantity(movement)}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="text-sm text-slate-700">
                          {movement.reason || '-'}
                        </div>
                        {movement.comments && (
                          <div className="text-xs text-slate-500 mt-1">
                            {movement.comments}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <div className="text-sm text-slate-700">
                          {movement.recordedBy}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};