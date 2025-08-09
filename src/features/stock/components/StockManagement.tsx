import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { ArrivalEntry } from './ArrivalEntry';
import { LossEntry } from './LossEntry';
import { StockLevelDisplay } from './StockLevelDisplay';
import { StockMovement } from '../types';
import { stockService } from '@/shared/services';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';

type TabType = 'arrivals' | 'losses' | 'overview' | 'levels';

export const StockManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [recentMovements, setRecentMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock store ID - in real app this would come from user context
  const currentStoreId = currentUser?.store || 'store-1';

  useEffect(() => {
    loadRecentMovements();
  }, [currentStoreId]);

  const loadRecentMovements = async () => {
    setIsLoading(true);
    try {
      const movements = await stockService.getRecentMovements(currentStoreId, 10);
      setRecentMovements(movements);
    } catch (error) {
      console.error('Error loading movements:', error);
      toast.error('Erreur lors du chargement des mouvements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMovementRecorded = (movement: StockMovement) => {
    setRecentMovements(prev => [movement, ...prev.slice(0, 9)]);
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'arrival':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'loss':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-blue-600" />;
    }
  };

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'arrival':
        return 'Arrivage';
      case 'loss':
        return 'Perte';
      default:
        return type;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'arrivals':
        return (
          <ArrivalEntry 
            storeId={currentStoreId} 
            onArrivalRecorded={handleMovementRecorded}
          />
        );
      case 'losses':
        return (
          <LossEntry 
            storeId={currentStoreId} 
            onLossRecorded={handleMovementRecorded}
          />
        );
      case 'levels':
        return (
          <StockLevelDisplay 
            storeId={currentStoreId}
            refreshInterval={30000}
            showFilters={true}
            showHistory={true}
          />
        );
      case 'overview':
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Mouvements de Stock Récents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-slate-500">
                  Chargement des mouvements...
                </div>
              ) : recentMovements.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  Aucun mouvement de stock récent
                </div>
              ) : (
                <div className="space-y-3">
                  {recentMovements.map((movement) => (
                    <div 
                      key={movement.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getMovementIcon(movement.type)}
                        <div>
                          <div className="font-medium">
                            {getMovementTypeLabel(movement.type)}
                          </div>
                          <div className="text-sm text-slate-600">
                            {movement.reason || 'Aucun motif spécifié'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${
                          movement.type === 'arrival' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {movement.type === 'arrival' ? '+' : ''}{movement.quantity}
                        </div>
                        <div className="text-sm text-slate-500">
                          {movement.recordedAt.toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Gestion des Stocks - Arrivages et Pertes
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('overview')}
          className="rounded-b-none"
        >
          <Package className="h-4 w-4 mr-2" />
          Vue d'ensemble
        </Button>
        <Button
          variant={activeTab === 'levels' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('levels')}
          className="rounded-b-none"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Niveaux de Stock
        </Button>
        <Button
          variant={activeTab === 'arrivals' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('arrivals')}
          className="rounded-b-none"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Arrivages
        </Button>
        <Button
          variant={activeTab === 'losses' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('losses')}
          className="rounded-b-none"
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Pertes
        </Button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {renderTabContent()}
      </div>
    </div>
  );
};