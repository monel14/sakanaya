import React, { useState } from 'react';
import { Filter, Search, Calendar, BarChart3, Building2, Package } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../shared/components/ui';

export interface StockFilterOptions {
  search: string;
  category: string;
  alertLevel: string;
  store: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  valueRange: {
    min: number | null;
    max: number | null;
  };
  sortBy: 'name' | 'quantity' | 'value' | 'rotation' | 'lastMovement';
  sortOrder: 'asc' | 'desc';
}

interface StockFiltersProps {
  filters: StockFilterOptions;
  onFiltersChange: (filters: StockFilterOptions) => void;
  stores?: Array<{ id: string; name: string }>;
  categories?: string[];
  showAdvanced?: boolean;
}

const DEFAULT_CATEGORIES = [
  'Tous',
  'Poissons Frais',
  'Crustacés',
  'Mollusques',
  'Poissons Fumés',
  'Conserves',
  'Surgelés'
];

const ALERT_LEVELS = [
  { value: 'all', label: 'Tous les niveaux' },
  { value: 'critical', label: 'Stock critique' },
  { value: 'low', label: 'Stock faible' },
  { value: 'normal', label: 'Stock normal' },
  { value: 'overstock', label: 'Surstock' }
];

const SORT_OPTIONS = [
  { value: 'name', label: 'Nom du produit' },
  { value: 'quantity', label: 'Quantité' },
  { value: 'value', label: 'Valeur' },
  { value: 'rotation', label: 'Rotation' },
  { value: 'lastMovement', label: 'Dernier mouvement' }
];

export const StockFilters: React.FC<StockFiltersProps> = ({
  filters,
  onFiltersChange,
  stores = [],
  categories = DEFAULT_CATEGORIES,
  showAdvanced = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof StockFilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const updateDateRange = (type: 'start' | 'end', value: string) => {
    const date = value ? new Date(value) : null;
    updateFilter('dateRange', {
      ...filters.dateRange,
      [type]: date
    });
  };

  const updateValueRange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseFloat(value) : null;
    updateFilter('valueRange', {
      ...filters.valueRange,
      [type]: numValue
    });
  };

  const resetFilters = () => {
    onFiltersChange({
      search: '',
      category: 'Tous',
      alertLevel: 'all',
      store: 'all',
      dateRange: { start: null, end: null },
      valueRange: { min: null, max: null },
      sortBy: 'name',
      sortOrder: 'asc'
    });
  };

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres Avancés
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
            >
              Réinitialiser
            </Button>
            {showAdvanced && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Masquer' : 'Plus d\'options'}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Recherche
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Nom du produit..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Catégorie
            </label>
            <Select
              value={filters.category}
              onValueChange={(value) => updateFilter('category', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Alert Level */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Niveau d'Alerte
            </label>
            <Select
              value={filters.alertLevel}
              onValueChange={(value) => updateFilter('alertLevel', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALERT_LEVELS.map(level => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Store (if multiple stores) */}
          {stores.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Magasin
              </label>
              <Select
                value={filters.store}
                onValueChange={(value) => updateFilter('store', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les magasins</SelectItem>
                  {stores.map(store => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Sorting */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Trier par
            </label>
            <Select
              value={filters.sortBy}
              onValueChange={(value: any) => updateFilter('sortBy', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Ordre
            </label>
            <Select
              value={filters.sortOrder}
              onValueChange={(value: any) => updateFilter('sortOrder', value)}
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

        {/* Advanced Filters */}
        {showAdvanced && isExpanded && (
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-medium text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Filtres Avancés
            </h4>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date de début
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="date"
                    value={formatDateForInput(filters.dateRange.start)}
                    onChange={(e) => updateDateRange('start', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date de fin
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="date"
                    value={formatDateForInput(filters.dateRange.end)}
                    onChange={(e) => updateDateRange('end', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Value Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Valeur minimale (CFA)
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.valueRange.min || ''}
                  onChange={(e) => updateValueRange('min', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Valeur maximale (CFA)
                </label>
                <Input
                  type="number"
                  placeholder="1000000"
                  value={filters.valueRange.max || ''}
                  onChange={(e) => updateValueRange('max', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <span className="text-sm font-medium text-slate-600">Filtres actifs:</span>
          {filters.search && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              Recherche: "{filters.search}"
            </span>
          )}
          {filters.category !== 'Tous' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
              Catégorie: {filters.category}
            </span>
          )}
          {filters.alertLevel !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
              Alerte: {ALERT_LEVELS.find(l => l.value === filters.alertLevel)?.label}
            </span>
          )}
          {filters.store !== 'all' && stores.length > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
              Magasin: {stores.find(s => s.id === filters.store)?.name}
            </span>
          )}
          {(filters.dateRange.start || filters.dateRange.end) && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">
              Période définie
            </span>
          )}
          {(filters.valueRange.min || filters.valueRange.max) && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-pink-100 text-pink-800">
              Valeur filtrée
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};