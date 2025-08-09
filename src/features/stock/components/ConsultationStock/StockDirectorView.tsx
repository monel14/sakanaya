import React, { useState, useEffect } from 'react';
import {
    Package,
    TrendingUp,
    TrendingDown,
    DollarSign,
    BarChart3,
    Building2,
    RefreshCw,
    Download,
    Filter
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '../../../../shared/components/ui';
import { StockLevel } from '../../shared/types';
import { Product } from '../../../sales/types';
import { stockService } from '../../../../shared/services';
import { productService } from '../../../../shared/services';
import { toast } from 'sonner';
import { StockFilters, StockFilterOptions } from './StockFilters';

interface StockDirectorViewProps {
    stores?: Array<{ id: string; name: string }>;
    selectedStoreIds?: string[];
    onStoreSelectionChange?: (storeIds: string[]) => void;
}

interface ConsolidatedStockLevel {
    productId: string;
    product: Product;
    totalQuantity: number;
    totalValue: number;
    averageCost: number;
    storeBreakdown: Array<{
        storeId: string;
        storeName: string;
        quantity: number;
        value: number;
        alertLevel: 'none' | 'low' | 'critical' | 'overstock';
    }>;
    consolidatedAlertLevel: 'none' | 'low' | 'critical' | 'overstock';
    rotation: number; // days
    lastMovement: Date;
}

interface StockValuationReport {
    totalValue: number;
    totalProducts: number;
    averageRotation: number;
    criticalProducts: number;
    lowStockProducts: number;
    overstockProducts: number;
    byCategory: Array<{
        category: string;
        value: number;
        quantity: number;
        percentage: number;
    }>;
    byStore: Array<{
        storeId: string;
        storeName: string;
        value: number;
        products: number;
        percentage: number;
    }>;
    generatedAt: Date;
}

// Mock stores data
const MOCK_STORES = [
    { id: 'store-1', name: 'Hub Distribution' },
    { id: 'store-2', name: 'Boutique Centre-Ville' },
    { id: 'store-3', name: 'Marché Sandaga' },
    { id: 'store-4', name: 'Point de Vente Almadies' }
];

// Mock average costs for products
const MOCK_AVERAGE_COSTS: Record<string, number> = {
    '1': 4500, // Thon Rouge
    '2': 3200, // Crevettes Roses
    '3': 2800, // Soles
    '4': 1200  // Pack Sardines
};

export const StockDirectorView: React.FC<StockDirectorViewProps> = ({
    stores = MOCK_STORES,
    selectedStoreIds = ['store-1', 'store-2', 'store-3', 'store-4'],
    onStoreSelectionChange
}) => {
    const [consolidatedStock, setConsolidatedStock] = useState<ConsolidatedStockLevel[]>([]);
    const [filteredStock, setFilteredStock] = useState<ConsolidatedStockLevel[]>([]);
    const [valuationReport, setValuationReport] = useState<StockValuationReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [viewMode, setViewMode] = useState<'consolidated' | 'by_store' | 'valuation' | 'transit'>('consolidated');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedStores, setSelectedStores] = useState<string[]>(selectedStoreIds);
    const [filters, setFilters] = useState<StockFilterOptions>({
        search: '',
        category: 'Tous',
        alertLevel: 'all',
        store: 'all',
        dateRange: { start: null, end: null },
        valueRange: { min: null, max: null },
        sortBy: 'name',
        sortOrder: 'asc'
    });
    const [selectedProduct, setSelectedProduct] = useState<ConsolidatedStockLevel | null>(null);

    useEffect(() => {
        loadDirectorStockData();
    }, [selectedStores]);

    useEffect(() => {
        applyFilters();
    }, [consolidatedStock, filters]);

    const loadDirectorStockData = async () => {
        setIsLoading(true);
        try {
            // Load stock data from all selected stores
            const allStockLevels: Array<StockLevel & { storeName: string }> = [];
            const products = await productService.getActiveProducts();
            const productMap = new Map(products.map(p => [p.id, p]));

            for (const storeId of selectedStores) {
                const storeName = stores.find(s => s.id === storeId)?.name || storeId;
                const stockLevels = await stockService.getCurrentStock(storeId);

                allStockLevels.push(
                    ...stockLevels.map(level => ({
                        ...level,
                        storeName
                    }))
                );
            }

            // Consolidate stock by product
            const consolidated = consolidateStockByProduct(allStockLevels, productMap);
            setConsolidatedStock(consolidated);

            // Generate valuation report
            const report = generateValuationReport(consolidated, stores);
            setValuationReport(report);

            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error loading director stock data:', error);
            toast.error('Erreur lors du chargement des données de stock');
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...consolidatedStock];

        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(item =>
                item.product.name.toLowerCase().includes(searchLower) ||
                item.product.category?.toLowerCase().includes(searchLower)
            );
        }

        // Category filter
        if (filters.category !== 'Tous') {
            filtered = filtered.filter(item => item.product.category === filters.category);
        }

        // Alert level filter
        if (filters.alertLevel !== 'all') {
            filtered = filtered.filter(item => item.consolidatedAlertLevel === filters.alertLevel);
        }

        // Store filter
        if (filters.store !== 'all') {
            filtered = filtered.filter(item =>
                item.storeBreakdown.some(breakdown => breakdown.storeId === filters.store)
            );
        }

        // Value range filter
        if (filters.valueRange.min !== null) {
            filtered = filtered.filter(item => item.totalValue >= filters.valueRange.min!);
        }
        if (filters.valueRange.max !== null) {
            filtered = filtered.filter(item => item.totalValue <= filters.valueRange.max!);
        }

        // Date range filter (based on last movement)
        if (filters.dateRange.start) {
            filtered = filtered.filter(item => item.lastMovement >= filters.dateRange.start!);
        }
        if (filters.dateRange.end) {
            filtered = filtered.filter(item => item.lastMovement <= filters.dateRange.end!);
        }

        // Sorting
        filtered.sort((a, b) => {
            let aValue: any, bValue: any;

            switch (filters.sortBy) {
                case 'name':
                    aValue = a.product.name;
                    bValue = b.product.name;
                    break;
                case 'quantity':
                    aValue = a.totalQuantity;
                    bValue = b.totalQuantity;
                    break;
                case 'value':
                    aValue = a.totalValue;
                    bValue = b.totalValue;
                    break;
                case 'rotation':
                    aValue = a.rotation;
                    bValue = b.rotation;
                    break;
                case 'lastMovement':
                    aValue = a.lastMovement;
                    bValue = b.lastMovement;
                    break;
                default:
                    aValue = a.product.name;
                    bValue = b.product.name;
            }

            if (typeof aValue === 'string') {
                const comparison = aValue.localeCompare(bValue);
                return filters.sortOrder === 'asc' ? comparison : -comparison;
            } else {
                const comparison = aValue - bValue;
                return filters.sortOrder === 'asc' ? comparison : -comparison;
            }
        });

        setFilteredStock(filtered);
    };

    const consolidateStockByProduct = (
        stockLevels: Array<StockLevel & { storeName: string }>,
        productMap: Map<string, Product>
    ): ConsolidatedStockLevel[] => {
        const consolidated = new Map<string, ConsolidatedStockLevel>();

        for (const level of stockLevels) {
            const product = productMap.get(level.productId);
            if (!product) continue;

            const averageCost = MOCK_AVERAGE_COSTS[level.productId] || 0;
            const value = level.quantity * averageCost;
            const alertLevel = determineAlertLevel(level.quantity, averageCost);

            if (consolidated.has(level.productId)) {
                const existing = consolidated.get(level.productId)!;
                existing.totalQuantity += level.quantity;
                existing.totalValue += value;
                existing.storeBreakdown.push({
                    storeId: level.storeId,
                    storeName: level.storeName,
                    quantity: level.quantity,
                    value,
                    alertLevel
                });
            } else {
                consolidated.set(level.productId, {
                    productId: level.productId,
                    product,
                    totalQuantity: level.quantity,
                    totalValue: value,
                    averageCost,
                    storeBreakdown: [{
                        storeId: level.storeId,
                        storeName: level.storeName,
                        quantity: level.quantity,
                        value,
                        alertLevel
                    }],
                    consolidatedAlertLevel: alertLevel,
                    rotation: calculateRotation(level.productId),
                    lastMovement: level.lastUpdated
                });
            }
        }

        // Update consolidated alert levels
        for (const [, item] of consolidated) {
            item.consolidatedAlertLevel = determineConsolidatedAlertLevel(item.storeBreakdown);
        }

        return Array.from(consolidated.values()).sort((a, b) => b.totalValue - a.totalValue);
    };

    const determineAlertLevel = (quantity: number, averageCost: number): ConsolidatedStockLevel['consolidatedAlertLevel'] => {
        // Simple logic based on quantity - in real app would use flow rates
        if (quantity <= 2) return 'critical';
        if (quantity <= 5) return 'low';
        if (quantity > 50) return 'overstock';
        return 'none';
    };

    const determineConsolidatedAlertLevel = (breakdown: ConsolidatedStockLevel['storeBreakdown']): ConsolidatedStockLevel['consolidatedAlertLevel'] => {
        const criticalCount = breakdown.filter(b => b.alertLevel === 'critical').length;
        const lowCount = breakdown.filter(b => b.alertLevel === 'low').length;

        if (criticalCount > 0) return 'critical';
        if (lowCount > breakdown.length / 2) return 'low';
        if (breakdown.every(b => b.alertLevel === 'overstock')) return 'overstock';
        return 'none';
    };

    const calculateRotation = (productId: string): number => {
        // Mock rotation calculation - in real app would use historical data
        const rotations: Record<string, number> = {
            '1': 3, // Thon Rouge - 3 days
            '2': 5, // Crevettes - 5 days
            '3': 7, // Soles - 7 days
            '4': 14 // Sardines - 14 days
        };
        return rotations[productId] || 7;
    };

    const generateValuationReport = (
        consolidated: ConsolidatedStockLevel[],
        stores: Array<{ id: string; name: string }>
    ): StockValuationReport => {
        const totalValue = consolidated.reduce((sum, item) => sum + item.totalValue, 0);
        const totalProducts = consolidated.length;
        const averageRotation = consolidated.reduce((sum, item) => sum + item.rotation, 0) / totalProducts;

        const criticalProducts = consolidated.filter(item => item.consolidatedAlertLevel === 'critical').length;
        const lowStockProducts = consolidated.filter(item => item.consolidatedAlertLevel === 'low').length;
        const overstockProducts = consolidated.filter(item => item.consolidatedAlertLevel === 'overstock').length;

        // Group by category
        const categoryMap = new Map<string, { value: number; quantity: number }>();
        for (const item of consolidated) {
            const category = item.product.category || 'Non classé';
            const existing = categoryMap.get(category) || { value: 0, quantity: 0 };
            categoryMap.set(category, {
                value: existing.value + item.totalValue,
                quantity: existing.quantity + item.totalQuantity
            });
        }

        const byCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
            category,
            value: data.value,
            quantity: data.quantity,
            percentage: (data.value / totalValue) * 100
        })).sort((a, b) => b.value - a.value);

        // Group by store
        const storeMap = new Map<string, { value: number; products: Set<string> }>();
        for (const item of consolidated) {
            for (const breakdown of item.storeBreakdown) {
                const existing = storeMap.get(breakdown.storeId) || { value: 0, products: new Set() };
                storeMap.set(breakdown.storeId, {
                    value: existing.value + breakdown.value,
                    products: existing.products.add(item.productId)
                });
            }
        }

        const byStore = Array.from(storeMap.entries()).map(([storeId, data]) => ({
            storeId,
            storeName: stores.find(s => s.id === storeId)?.name || storeId,
            value: data.value,
            products: data.products.size,
            percentage: (data.value / totalValue) * 100
        })).sort((a, b) => b.value - a.value);

        return {
            totalValue,
            totalProducts,
            averageRotation,
            criticalProducts,
            lowStockProducts,
            overstockProducts,
            byCategory,
            byStore,
            generatedAt: new Date()
        };
    };

    const exportToCSV = () => {
        if (!valuationReport) return;

        const dataToExport = filteredStock.length > 0 ? filteredStock : consolidatedStock;
        
        const csvData = [
            ['Produit', 'Catégorie', 'Quantité Totale', 'Valeur Totale (CFA)', 'Coût Moyen', 'Rotation (jours)', 'Statut', 'Nombre Magasins'],
            ...dataToExport.map(item => [
                item.product.name,
                item.product.category || 'Non classé',
                item.totalQuantity.toString(),
                item.totalValue.toString(),
                item.averageCost.toString(),
                item.rotation.toString(),
                item.consolidatedAlertLevel === 'critical' ? 'Critique' :
                    item.consolidatedAlertLevel === 'low' ? 'Faible' :
                        item.consolidatedAlertLevel === 'overstock' ? 'Surstock' : 'Normal',
                item.storeBreakdown.length.toString()
            ])
        ];

        // Add store breakdown section
        csvData.push([''], ['DÉTAIL PAR MAGASIN'], ['']);
        csvData.push(['Produit', 'Magasin', 'Quantité', 'Valeur (CFA)', 'Statut']);
        
        for (const item of dataToExport) {
            for (const breakdown of item.storeBreakdown) {
                csvData.push([
                    item.product.name,
                    breakdown.storeName,
                    breakdown.quantity.toString(),
                    breakdown.value.toString(),
                    breakdown.alertLevel === 'critical' ? 'Critique' :
                        breakdown.alertLevel === 'low' ? 'Faible' :
                            breakdown.alertLevel === 'overstock' ? 'Surstock' : 'Normal'
                ]);
            }
        }

        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stock-valorisation-directeur-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        toast.success(`Rapport exporté avec succès (${dataToExport.length} produits)`);
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getAlertBadgeVariant = (alertLevel: ConsolidatedStockLevel['consolidatedAlertLevel']) => {
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        Vue Directeur - Analyse Consolidée
                    </h2>
                    <p className="text-slate-600">
                        Analyse financière et logistique multi-magasins
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {lastUpdated && (
                        <span className="text-sm text-slate-500">
                            Mis à jour: {lastUpdated.toLocaleTimeString('fr-FR')}
                        </span>
                    )}
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
                        disabled={!valuationReport}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadDirectorStockData}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Actualiser
                    </Button>
                </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
                <div className="space-y-4">
                    <StockFilters
                        filters={filters}
                        onFiltersChange={setFilters}
                        stores={stores}
                        categories={['Tous', 'Poissons Frais', 'Crustacés', 'Mollusques', 'Poissons Fumés', 'Conserves', 'Surgelés']}
                        showAdvanced={true}
                    />
                    
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Sélection des Magasins
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {stores.map(store => (
                                    <label key={store.id} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedStores.includes(store.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedStores(prev => [...prev, store.id]);
                                                } else {
                                                    setSelectedStores(prev => prev.filter(id => id !== store.id));
                                                }
                                            }}
                                            className="rounded border-slate-300"
                                        />
                                        <span className="text-sm font-medium">{store.name}</span>
                                    </label>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* View Mode Selector */}
            <div className="flex gap-2 flex-wrap">
                <Button
                    variant={viewMode === 'consolidated' ? 'default' : 'outline'}
                    onClick={() => setViewMode('consolidated')}
                >
                    <Package className="h-4 w-4 mr-2" />
                    Vue Consolidée
                </Button>
                <Button
                    variant={viewMode === 'by_store' ? 'default' : 'outline'}
                    onClick={() => setViewMode('by_store')}
                >
                    <Building2 className="h-4 w-4 mr-2" />
                    Par Magasin
                </Button>
                <Button
                    variant={viewMode === 'valuation' ? 'default' : 'outline'}
                    onClick={() => setViewMode('valuation')}
                >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Valorisation
                </Button>
                <Button
                    variant={viewMode === 'transit' ? 'default' : 'outline'}
                    onClick={() => setViewMode('transit')}
                >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Stock en Transit
                </Button>
            </div>

            {/* Summary Cards */}
            {valuationReport && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Valeur Totale</p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {formatCurrency(valuationReport.totalValue)}
                                    </p>
                                </div>
                                <DollarSign className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Produits Actifs</p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {valuationReport.totalProducts}
                                    </p>
                                </div>
                                <Package className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Rotation Moyenne</p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {Math.round(valuationReport.averageRotation)} j
                                    </p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Alertes</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {valuationReport.criticalProducts + valuationReport.lowStockProducts}
                                    </p>
                                </div>
                                <TrendingDown className="h-8 w-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Main Content */}
            {viewMode === 'consolidated' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Stock Consolidé par Produit</span>
                            <span className="text-sm font-normal text-slate-600">
                                {filteredStock.length} produit{filteredStock.length > 1 ? 's' : ''} affiché{filteredStock.length > 1 ? 's' : ''}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-8">
                                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                                Chargement des données...
                            </div>
                        ) : filteredStock.length === 0 ? (
                            <div className="text-center py-8">
                                <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                <p className="text-slate-600">Aucun produit ne correspond aux filtres sélectionnés</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="text-left py-3 px-2 font-medium text-slate-700">Produit</th>
                                            <th className="text-right py-3 px-2 font-medium text-slate-700">Quantité Totale</th>
                                            <th className="text-right py-3 px-2 font-medium text-slate-700">Valeur Totale</th>
                                            <th className="text-right py-3 px-2 font-medium text-slate-700">Coût Moyen</th>
                                            <th className="text-right py-3 px-2 font-medium text-slate-700">Rotation</th>
                                            <th className="text-center py-3 px-2 font-medium text-slate-700">Statut</th>
                                            <th className="text-center py-3 px-2 font-medium text-slate-700">Magasins</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStock.map((item) => (
                                            <tr 
                                                key={item.productId} 
                                                className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                                                onClick={() => setSelectedProduct(item)}
                                            >
                                                <td className="py-3 px-2">
                                                    <div>
                                                        <div className="font-medium text-slate-900">
                                                            {item.product.name}
                                                        </div>
                                                        <div className="text-sm text-slate-500">
                                                            {item.product.category}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-right py-3 px-2">
                                                    <div className="font-medium text-slate-900">
                                                        {item.totalQuantity} {item.product.unit}
                                                    </div>
                                                </td>
                                                <td className="text-right py-3 px-2">
                                                    <div className="font-medium text-slate-900">
                                                        {formatCurrency(item.totalValue)}
                                                    </div>
                                                </td>
                                                <td className="text-right py-3 px-2">
                                                    <div className="text-slate-700">
                                                        {formatCurrency(item.averageCost)}
                                                    </div>
                                                </td>
                                                <td className="text-right py-3 px-2">
                                                    <div className="text-slate-700">
                                                        {item.rotation} jours
                                                    </div>
                                                </td>
                                                <td className="text-center py-3 px-2">
                                                    <Badge variant={getAlertBadgeVariant(item.consolidatedAlertLevel)}>
                                                        {item.consolidatedAlertLevel === 'critical' ? 'Critique' :
                                                            item.consolidatedAlertLevel === 'low' ? 'Faible' :
                                                                item.consolidatedAlertLevel === 'overstock' ? 'Surstock' :
                                                                    'Normal'}
                                                    </Badge>
                                                </td>
                                                <td className="text-center py-3 px-2">
                                                    <div className="text-sm text-slate-600">
                                                        {item.storeBreakdown.length} magasin{item.storeBreakdown.length > 1 ? 's' : ''}
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
            )}

            {viewMode === 'by_store' && valuationReport && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {valuationReport.byStore.map((store) => (
                        <Card key={store.storeId}>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>{store.storeName}</span>
                                    <Badge variant="outline">
                                        {store.percentage.toFixed(1)}% du total
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600">Valeur du stock:</span>
                                        <span className="font-bold text-lg">{formatCurrency(store.value)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600">Produits actifs:</span>
                                        <span className="font-medium">{store.products}</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${store.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {viewMode === 'valuation' && valuationReport && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Répartition par Catégorie</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {valuationReport.byCategory.map((category) => (
                                    <div key={category.category} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">{category.category}</span>
                                            <span className="text-sm text-slate-600">
                                                {category.percentage.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-600">
                                                {formatCurrency(category.value)}
                                            </span>
                                            <span className="text-slate-600">
                                                {category.quantity} unités
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full"
                                                style={{ width: `${category.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Analyse des Alertes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <TrendingDown className="h-5 w-5 text-red-600" />
                                        <span className="font-medium text-red-800">Stock Critique</span>
                                    </div>
                                    <span className="text-2xl font-bold text-red-600">
                                        {valuationReport.criticalProducts}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <TrendingDown className="h-5 w-5 text-orange-600" />
                                        <span className="font-medium text-orange-800">Stock Faible</span>
                                    </div>
                                    <span className="text-2xl font-bold text-orange-600">
                                        {valuationReport.lowStockProducts}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-blue-600" />
                                        <span className="font-medium text-blue-800">Surstock</span>
                                    </div>
                                    <span className="text-2xl font-bold text-blue-600">
                                        {valuationReport.overstockProducts}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Package className="h-5 w-5 text-green-600" />
                                        <span className="font-medium text-green-800">Stock Normal</span>
                                    </div>
                                    <span className="text-2xl font-bold text-green-600">
                                        {valuationReport.totalProducts - valuationReport.criticalProducts - valuationReport.lowStockProducts - valuationReport.overstockProducts}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {viewMode === 'transit' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Stock en Transit</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8">
                            <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600 mb-2">Fonctionnalité Stock en Transit</p>
                            <p className="text-sm text-slate-500">
                                Cette vue affichera les transferts en cours entre magasins avec les quantités réservées.
                                Intégration avec le module de transferts en cours de développement.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">
                                        {selectedProduct.product.name}
                                    </h3>
                                    <p className="text-slate-600">{selectedProduct.product.category}</p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedProduct(null)}
                                >
                                    Fermer
                                </Button>
                            </div>

                            {/* Product Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="text-center">
                                            <p className="text-sm text-slate-600">Quantité Totale</p>
                                            <p className="text-xl font-bold text-slate-900">
                                                {selectedProduct.totalQuantity} {selectedProduct.product.unit}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="text-center">
                                            <p className="text-sm text-slate-600">Valeur Totale</p>
                                            <p className="text-xl font-bold text-green-600">
                                                {formatCurrency(selectedProduct.totalValue)}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="text-center">
                                            <p className="text-sm text-slate-600">Coût Moyen</p>
                                            <p className="text-xl font-bold text-blue-600">
                                                {formatCurrency(selectedProduct.averageCost)}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="text-center">
                                            <p className="text-sm text-slate-600">Rotation</p>
                                            <p className="text-xl font-bold text-purple-600">
                                                {selectedProduct.rotation} jours
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Store Breakdown */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Répartition par Magasin</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-slate-200">
                                                    <th className="text-left py-2 px-3 font-medium text-slate-700">Magasin</th>
                                                    <th className="text-right py-2 px-3 font-medium text-slate-700">Quantité</th>
                                                    <th className="text-right py-2 px-3 font-medium text-slate-700">Valeur</th>
                                                    <th className="text-center py-2 px-3 font-medium text-slate-700">Statut</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedProduct.storeBreakdown.map((breakdown) => (
                                                    <tr key={breakdown.storeId} className="border-b border-slate-100">
                                                        <td className="py-2 px-3 font-medium text-slate-900">
                                                            {breakdown.storeName}
                                                        </td>
                                                        <td className="text-right py-2 px-3">
                                                            {breakdown.quantity} {selectedProduct.product.unit}
                                                        </td>
                                                        <td className="text-right py-2 px-3">
                                                            {formatCurrency(breakdown.value)}
                                                        </td>
                                                        <td className="text-center py-2 px-3">
                                                            <Badge variant={getAlertBadgeVariant(breakdown.alertLevel)}>
                                                                {breakdown.alertLevel === 'critical' ? 'Critique' :
                                                                    breakdown.alertLevel === 'low' ? 'Faible' :
                                                                        breakdown.alertLevel === 'overstock' ? 'Surstock' :
                                                                            'Normal'}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};