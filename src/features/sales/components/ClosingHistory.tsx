import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Eye, Search, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { DailySales, User as UserType } from '@/types';
import { DailyClosingSummary } from './DailyClosingSummary';
import { usePriceManagement } from '@/shared/hooks';
import { closingHistoryService } from '@/shared/services';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';

interface ClosingHistoryProps {
  currentUser: UserType | null;
  storeId?: string;
}

export const ClosingHistory: React.FC<ClosingHistoryProps> = ({
  currentUser,
  storeId
}) => {
  const { allProducts } = usePriceManagement(currentUser?.id);
  const [closings, setClosings] = useState<DailySales[]>([]);
  const [filteredClosings, setFilteredClosings] = useState<DailySales[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClosing, setSelectedClosing] = useState<DailySales | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month' | 'quarter'>('month');
  const [sortBy, setSortBy] = useState<'date' | 'total' | 'items'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load closing history
  const loadClosingHistory = async () => {
    try {
      setLoading(true);
      const targetStoreId = storeId || currentUser?.store || '';
      const history = await closingHistoryService.getClosingHistory(targetStoreId, dateFilter);
      setClosings(history);
      setFilteredClosings(history);
    } catch (error) {
      toast.error('Erreur lors du chargement de l\'historique');
      console.error('Error loading closing history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search closings
  useEffect(() => {
    let filtered = [...closings];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(closing => 
        closing.comments?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        closing.createdBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        closing.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'total':
          aValue = a.total;
          bValue = b.total;
          break;
        case 'items':
          aValue = a.entries.length;
          bValue = b.entries.length;
          break;
        default:
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    setFilteredClosings(filtered);
  }, [closings, searchTerm, sortBy, sortOrder]);

  // Load data on mount and filter change
  useEffect(() => {
    loadClosingHistory();
  }, [currentUser, storeId, dateFilter]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTrend = () => {
    if (filteredClosings.length < 2) return null;
    
    const recent = filteredClosings.slice(0, Math.min(7, filteredClosings.length));
    const older = filteredClosings.slice(7, Math.min(14, filteredClosings.length));
    
    if (older.length === 0) return null;
    
    const recentAvg = recent.reduce((sum, c) => sum + c.total, 0) / recent.length;
    const olderAvg = older.reduce((sum, c) => sum + c.total, 0) / older.length;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    return {
      change: change.toFixed(1),
      isPositive: change > 0,
      recentAvg: recentAvg.toFixed(0),
      olderAvg: olderAvg.toFixed(0)
    };
  };

  const trend = calculateTrend();

  if (selectedClosing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setSelectedClosing(null)}
          >
            ← Retour à l'historique
          </Button>
        </div>
        <DailyClosingSummary
          sale={selectedClosing}
          products={allProducts}
          currentUser={currentUser}
          onPrint={() => window.print()}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'historique...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Historique des Clôtures
          </h1>
          <p className="text-gray-600">
            {filteredClosings.length} clôture{filteredClosings.length !== 1 ? 's' : ''} trouvée{filteredClosings.length !== 1 ? 's' : ''}
            {storeId && ` pour ${storeId}`}
          </p>
        </div>

        {/* Trend Indicator */}
        {trend && (
          <Card className={cn(
            "p-4",
            trend.isPositive ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
          )}>
            <div className="flex items-center gap-2">
              {trend.isPositive ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
              <div>
                <p className={cn(
                  "text-sm font-medium",
                  trend.isPositive ? "text-green-900" : "text-red-900"
                )}>
                  {trend.isPositive ? '+' : ''}{trend.change}% vs période précédente
                </p>
                <p className="text-xs text-gray-600">
                  Moyenne: {trend.recentAvg} CFA
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher par commentaire, utilisateur ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Date Filter */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              {[
                { key: 'week', label: 'Semaine' },
                { key: 'month', label: 'Mois' },
                { key: 'quarter', label: 'Trimestre' },
                { key: 'all', label: 'Tout' }
              ].map((filter) => (
                <Button
                  key={filter.key}
                  variant={dateFilter === filter.key ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDateFilter(filter.key as any)}
                  className="rounded-none border-r last:border-r-0"
                >
                  {filter.label}
                </Button>
              ))}
            </div>

            {/* Sort Options */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="date">Date</option>
                <option value="total">Montant</option>
                <option value="items">Nb articles</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Closing List */}
      {filteredClosings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune clôture trouvée
            </h3>
            <p className="text-gray-600">
              Aucune clôture ne correspond aux critères de recherche.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredClosings.map((closing) => (
            <Card key={closing.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {formatDate(closing.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {formatTime(closing.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {closing.createdBy}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Total: </span>
                        <span className="font-semibold text-blue-600">
                          {closing.total.toLocaleString('fr-FR')} CFA
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Articles: </span>
                        <span className="font-medium">
                          {closing.entries.length}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Statut: </span>
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-medium",
                          closing.isValidated 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        )}>
                          {closing.isValidated ? 'Validé' : 'En attente'}
                        </span>
                      </div>
                    </div>

                    {closing.comments && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                        <span className="text-blue-800">{closing.comments}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedClosing(closing)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir détails
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {filteredClosings.length > 0 && (
        <Card className="bg-gray-50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Statistiques de la Période</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredClosings.reduce((sum, c) => sum + c.total, 0).toLocaleString('fr-FR')}
                </div>
                <div className="text-sm text-gray-600">CFA Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(filteredClosings.reduce((sum, c) => sum + c.total, 0) / filteredClosings.length).toFixed(0)}
                </div>
                <div className="text-sm text-gray-600">CFA Moyenne/jour</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {filteredClosings.reduce((sum, c) => sum + c.entries.length, 0)}
                </div>
                <div className="text-sm text-gray-600">Articles vendus</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {filteredClosings.filter(c => c.isValidated).length}
                </div>
                <div className="text-sm text-gray-600">Clôtures validées</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};