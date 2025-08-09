import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Package,
  ArrowUpDown,
  Eye,
  Building2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '../../../../shared/components/ui';
import { MouvementStock, Product } from '../../shared/types';
import { stockService } from '../../../../shared/services';
import { productService } from '../../../../shared/services';
import { toast } from 'sonner';

interface TraceabilityReportsProps {
  storeId?: string;
  productId?: string;
  showAdvancedFilters?: boolean;
}

interface TraceabilityFilters {
  search: string;
  productId: string;
  storeId: string;
  movementType: 'all' | 'arrivage' | 'transfert_sortie' | 'transfert_entree' | 'vente' | 'perte' | 'ajustement';
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  valueRange: {
    min: number | null;
    max: number | null;
  };
  sortBy: 'date' | 'type' | 'product' | 'quantity' | 'value';
  sortOrder: 'asc' | 'desc';
}

interface TraceabilityStats {
  totalMovements: number;
  totalValue: number;
  movementsByType: Record<string, number>;
  topProducts: Array<{
    productId: string;
    productName: string;
    movementCount: number;
    totalQuantity: number;
    totalValue: number;
  }>;
  dailyActivity: Array<{
    date: string;
    movements: number;
    value: number;
  }>;
}

const MOVEMENT_TYPE_LABELS = {
  arrivage: 'Arrivage',
  transfert_sortie: 'Transfert Sortie',
  transfert_entree: 'Transfert Entrée',
  vente: 'Vente',
  perte: 'Perte',
  ajustement: 'Ajustement'
};

const MOVEMENT_TYPE_COLORS = {
  arrivage: 'bg-green-100 text-green-800',
  transfert_sortie: 'bg-blue-100 text-blue-800',
  transfert_entree: 'bg-purple-100 text-purple-800',
  vente: 'bg-orange-100 text-orange-800',
  perte: 'bg-red-100 text-red-800',
  ajustement: 'bg-gray-100 text-gray-800'
};

export const TraceabilityReports: React.FC<TraceabilityReportsProps> = ({
  storeId,
  productId,
  showAdvancedFilters = true
}) => {
  const [movements, setMovements] = useState<MouvementStock[]>([]);
  const [filteredMovements, setFilteredMovements] = useState<MouvementStock[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores] = useState([
    { id: 'store-1', name: 'Hub Distribution' },
    { id: 'store-2', name: 'Boutique Centre-Ville' },
    { id: 'store-3', name: 'Marché Sandaga' },
    { id: 'store-4', name: 'Point de Vente Almadies' }
  ]);
  const [stats, setStats] = useState<TraceabilityStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<MouvementStock | null>(null);
  const [filters, setFilters] = useState<TraceabilityFilters>({
    search: '',
    productId: productId || 'all',
    storeId: storeId || 'all',
    movementType: 'all',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      end: new Date()
    },
    valueRange: {
      min: null,
      max: null
    },
    sortBy: 'date',
    sortOrder: 'desc'
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [movements, filters]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load products
      const productsData = await productService.getActiveProducts();
      setProducts(productsData);

      // Generate mock movements data
      const mockMovements = generateMockMovements(productsData);
      setMovements(mockMovements);

      // Generate stats
      const statsData = generateStats(mockMovements);
      setStats(statsData);

    } catch (error) {
      console.error('Error loading traceability data:', error);
      toast.error('Erreur lors du chargement des données de traçabilité');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockMovements = (products: Product[]): MouvementStock[] => {
    const movements: MouvementStock[] = [];
    const types: Array<MouvementStock['type']> = ['arrivage', 'transfert_sortie', 'transfert_entree', 'vente', 'perte', 'ajustement'];
    
    // Generate 100 mock movements over the last 30 days
    for (let i = 0; i < 100; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const store = stores[Math.floor(Math.random() * stores.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      
      const quantity = type === 'perte' || type === 'vente' || type === 'transfert_sortie' 
        ? -(Math.floor(Math.random() * 20) + 1)
        : Math.floor(Math.random() * 50) + 1;
      
      const coutUnitaire = Math.floor(Math.random() * 5000) + 1000;
      const valeur = Math.abs(quantity) * coutUnitaire;

      movements.push({
        id: `movement-${i}`,
        date,
        type,
        storeId: store.id,
        store,
        productId: product.id,
        product,
        quantite: quantity,
        coutUnitaire,
        valeur,
        referenceId: `ref-${i}`,
        referenceType: type === 'arrivage' ? 'bon_reception' : 
                     type.includes('transfert') ? 'transfert' :
                     type === 'vente' ? 'commande' : 'document',
        createdBy: 'user-1',
        createdAt: date,
        commentaire: Math.random() > 0.7 ? `Commentaire pour mouvement ${i}` : undefined
      });
    }

    return movements.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const generateStats = (movements: MouvementStock[]): TraceabilityStats => {
    const totalMovements = movements.length;
    const totalValue = movements.reduce((sum, m) => sum + (m.valeur || 0), 0);
    
    const movementsByType: Record<string, number> = {};
    movements.forEach(m => {
      movementsByType[m.type] = (movementsByType[m.type] || 0) + 1;
    });

    const productStats = new Map<string, {
      productName: string;
      movementCount: number;
      totalQuantity: number;
      totalValue: number;
    }>();

    movements.forEach(m => {
      const existing = productStats.get(m.productId) || {
        productName: m.product.name,
        movementCount: 0,
        totalQuantity: 0,
        totalValue: 0
      };
      
      existing.movementCount++;
      existing.totalQuantity += Math.abs(m.quantite);
      existing.totalValue += m.valeur || 0;
      
      productStats.set(m.productId, existing);
    });

    const topProducts = Array.from(productStats.entries())
      .map(([productId, stats]) => ({ productId, ...stats }))
      .sort((a, b) => b.movementCount - a.movementCount)
      .slice(0, 5);

    // Daily activity for the last 7 days
    const dailyActivity: Array<{ date: string; movements: number; value: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayMovements = movements.filter(m => 
        m.date.toISOString().split('T')[0] === dateStr
      );
      
      dailyActivity.push({
        date: dateStr,
        movements: dayMovements.length,
        value: dayMovements.reduce((sum, m) => sum + (m.valeur || 0), 0)
      });
    }

    return {
      totalMovements,
      totalValue,
      movementsByType,
      topProducts,
      dailyActivity
    };
  };

  const applyFilters = () => {
    let filtered = [...movements];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(m =>
        m.product.name.toLowerCase().includes(searchLower) ||
        m.store.name.toLowerCase().includes(searchLower) ||
        m.referenceId.toLowerCase().includes(searchLower) ||
        (m.commentaire && m.commentaire.toLowerCase().includes(searchLower))
      );
    }

    // Product filter
    if (filters.productId !== 'all') {
      filtered = filtered.filter(m => m.productId === filters.productId);
    }

    // Store filter
    if (filters.storeId !== 'all') {
      filtered = filtered.filter(m => m.storeId === filters.storeId);
    }

    // Movement type filter
    if (filters.movementType !== 'all') {
      filtered = filtered.filter(m => m.type === filters.movementType);
    }

    // Date range filter
    if (filters.dateRange.start) {
      filtered = filtered.filter(m => m.date >= filters.dateRange.start!);
    }
    if (filters.dateRange.end) {
      filtered = filtered.filter(m => m.date <= filters.dateRange.end!);
    }

    // Value range filter
    if (filters.valueRange.min !== null) {
      filtered = filtered.filter(m => (m.valeur || 0) >= filters.valueRange.min!);
    }
    if (filters.valueRange.max !== null) {
      filtered = filtered.filter(m => (m.valeur || 0) <= filters.valueRange.max!);
    }

    // Sorting
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
        case 'product':
          aValue = a.product.name;
          bValue = b.product.name;
          break;
        case 'quantity':
          aValue = Math.abs(a.quantite);
          bValue = Math.abs(b.quantite);
          break;
        case 'value':
          aValue = a.valeur || 0;
          bValue = b.valeur || 0;
          break;
        default:
          aValue = a.date.getTime();
          bValue = b.date.getTime();
      }

      if (typeof aValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return filters.sortOrder === 'asc' ? comparison : -comparison;
      } else {
        const comparison = aValue - bValue;
        return filters.sortOrder === 'asc' ? comparison : -comparison;
      }
    });

    setFilteredMovements(filtered);
  };

  const exportToCSV = () => {
    const dataToExport = filteredMovements.length > 0 ? filteredMovements : movements;
    
    const csvData = [
      ['Date', 'Type', 'Magasin', 'Produit', 'Quantité', 'Coût Unitaire', 'Valeur', 'Référence', 'Commentaire'],
      ...dataToExport.map(m => [
        m.date.toLocaleDateString('fr-FR'),
        MOVEMENT_TYPE_LABELS[m.type] || m.type,
        m.store.name,
        m.product.name,
        m.quantite.toString(),
        (m.coutUnitaire || 0).toString(),
        (m.valeur || 0).toString(),
        m.referenceId,
        m.commentaire || ''
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tracabilite-stock-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Données exportées avec succès (${dataToExport.length} mouvements)`);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatQuantity = (quantity: number): string => {
    return quantity >= 0 ? `+${quantity}` : quantity.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Traçabilité des Stocks
          </h2>
          <p className="text-slate-600">
            Journal détaillé des mouvements et analyse des flux logistiques
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            disabled={movements.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && showAdvancedFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filtres Avancés</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Recherche
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    placeholder="Produit, magasin, référence..."
                    className="pl-10 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Product Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Produit
                </label>
                <select
                  value={filters.productId}
                  onChange={(e) => setFilters(prev => ({ ...prev, productId: e.target.value }))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="all">Tous les produits</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Store Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Magasin
                </label>
                <select
                  value={filters.storeId}
                  onChange={(e) => setFilters(prev => ({ ...prev, storeId: e.target.value }))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="all">Tous les magasins</option>
                  {stores.map(store => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Movement Type Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Type de Mouvement
                </label>
                <select
                  value={filters.movementType}
                  onChange={(e) => setFilters(prev => ({ ...prev, movementType: e.target.value as any }))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="all">Tous les types</option>
                  {Object.entries(MOVEMENT_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date de début
                </label>
                <input
                  type="date"
                  value={filters.dateRange.start?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value ? new Date(e.target.value) : null }
                  }))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={filters.dateRange.end?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value ? new Date(e.target.value) : null }
                  }))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Sorting */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Trier par
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="date">Date</option>
                  <option value="type">Type</option>
                  <option value="product">Produit</option>
                  <option value="quantity">Quantité</option>
                  <option value="value">Valeur</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ordre
                </label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as any }))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="desc">Décroissant</option>
                  <option value="asc">Croissant</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Mouvements</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.totalMovements}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Valeur Totale</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(stats.totalValue)}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Produits Actifs</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.topProducts.length}
                  </p>
                </div>
                <Package className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Mouvements Filtrés</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {filteredMovements.length}
                  </p>
                </div>
                <Filter className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Movements Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Journal des Mouvements</span>
            <span className="text-sm font-normal text-slate-600">
              {filteredMovements.length} mouvement{filteredMovements.length > 1 ? 's' : ''} affiché{filteredMovements.length > 1 ? 's' : ''}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              Chargement des mouvements...
            </div>
          ) : filteredMovements.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Aucun mouvement ne correspond aux filtres sélectionnés</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-2 font-medium text-slate-700">
                      <button
                        onClick={() => setFilters(prev => ({
                          ...prev,
                          sortBy: 'date',
                          sortOrder: prev.sortBy === 'date' && prev.sortOrder === 'desc' ? 'asc' : 'desc'
                        }))}
                        className="flex items-center gap-1 hover:text-slate-900"
                      >
                        Date
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-slate-700">
                      <button
                        onClick={() => setFilters(prev => ({
                          ...prev,
                          sortBy: 'type',
                          sortOrder: prev.sortBy === 'type' && prev.sortOrder === 'desc' ? 'asc' : 'desc'
                        }))}
                        className="flex items-center gap-1 hover:text-slate-900"
                      >
                        Type
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-slate-700">Magasin</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-700">
                      <button
                        onClick={() => setFilters(prev => ({
                          ...prev,
                          sortBy: 'product',
                          sortOrder: prev.sortBy === 'product' && prev.sortOrder === 'desc' ? 'asc' : 'desc'
                        }))}
                        className="flex items-center gap-1 hover:text-slate-900"
                      >
                        Produit
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-right py-3 px-2 font-medium text-slate-700">
                      <button
                        onClick={() => setFilters(prev => ({
                          ...prev,
                          sortBy: 'quantity',
                          sortOrder: prev.sortBy === 'quantity' && prev.sortOrder === 'desc' ? 'asc' : 'desc'
                        }))}
                        className="flex items-center gap-1 hover:text-slate-900"
                      >
                        Quantité
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-right py-3 px-2 font-medium text-slate-700">
                      <button
                        onClick={() => setFilters(prev => ({
                          ...prev,
                          sortBy: 'value',
                          sortOrder: prev.sortBy === 'value' && prev.sortOrder === 'desc' ? 'asc' : 'desc'
                        }))}
                        className="flex items-center gap-1 hover:text-slate-900"
                      >
                        Valeur
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-slate-700">Référence</th>
                    <th className="text-center py-3 px-2 font-medium text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovements.map((movement) => (
                    <tr 
                      key={movement.id} 
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-3 px-2">
                        <div className="text-sm">
                          <div className="font-medium text-slate-900">
                            {movement.date.toLocaleDateString('fr-FR')}
                          </div>
                          <div className="text-slate-500">
                            {movement.date.toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <Badge 
                          variant="secondary" 
                          className={MOVEMENT_TYPE_COLORS[movement.type] || 'bg-gray-100 text-gray-800'}
                        >
                          {MOVEMENT_TYPE_LABELS[movement.type] || movement.type}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-900">
                            {movement.store.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="text-sm">
                          <div className="font-medium text-slate-900">
                            {movement.product.name}
                          </div>
                          {movement.product.category && (
                            <div className="text-slate-500">
                              {movement.product.category}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className={`text-sm font-medium ${
                          movement.quantite >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatQuantity(movement.quantite)}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className="text-sm font-medium text-slate-900">
                          {formatCurrency(movement.valeur || 0)}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-sm text-slate-600">
                          {movement.referenceId}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedMovement(movement)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Movement Detail Modal */}
      {selectedMovement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Détail du Mouvement
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMovement(null)}
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Date</label>
                    <p className="text-sm text-slate-900">
                      {selectedMovement.date.toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Type</label>
                    <Badge 
                      variant="secondary" 
                      className={MOVEMENT_TYPE_COLORS[selectedMovement.type]}
                    >
                      {MOVEMENT_TYPE_LABELS[selectedMovement.type]}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Magasin</label>
                    <p className="text-sm text-slate-900">{selectedMovement.store.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Produit</label>
                    <p className="text-sm text-slate-900">{selectedMovement.product.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Quantité</label>
                    <p className={`text-sm font-medium ${
                      selectedMovement.quantite >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatQuantity(selectedMovement.quantite)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Coût Unitaire</label>
                    <p className="text-sm text-slate-900">
                      {formatCurrency(selectedMovement.coutUnitaire || 0)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Valeur Totale</label>
                    <p className="text-sm font-medium text-slate-900">
                      {formatCurrency(selectedMovement.valeur || 0)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Référence</label>
                    <p className="text-sm text-slate-900">{selectedMovement.referenceId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Type de Référence</label>
                    <p className="text-sm text-slate-900">{selectedMovement.referenceType}</p>
                  </div>
                </div>

                {selectedMovement.commentaire && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Commentaire</label>
                    <p className="text-sm text-slate-900">{selectedMovement.commentaire}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700">Créé par</label>
                  <p className="text-sm text-slate-900">
                    {selectedMovement.createdBy} le {selectedMovement.createdAt.toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};