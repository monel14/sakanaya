import React from 'react';
import { StockLevelDisplay } from './StockLevelDisplay';
import { StockAlerts } from './StockAlerts';
import { StockThresholdConfig } from './StockThresholdConfig';
import { useStockLevels, StockThresholds } from '../hooks/useStockLevels';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui';

/**
 * Demo component to showcase the real-time stock level functionality
 * This demonstrates the implementation of task 5.2
 */
export const StockLevelDemo: React.FC = () => {
  const [thresholds, setThresholds] = React.useState<StockThresholds>({
    critical: 2,
    low: 7,
    overstock: 30
  });

  const {
    stockLevels,
    alerts,
    isLoading,
    lastUpdated,
    error,

    getCriticalStockItems,
    getLowStockItems,
    getOverstockItems,
    getTotalStockValue,
    getAverageFlowRate
  } = useStockLevels('store-1', thresholds, true, 30000);

  const handleThresholdsChange = (newThresholds: StockThresholds) => {
    setThresholds(newThresholds);
  };

  const handleSaveThresholds = async (newThresholds: StockThresholds) => {
    // In a real app, this would save to backend
    console.log('Saving thresholds:', newThresholds);
    setThresholds(newThresholds);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          Démonstration - Suivi des Stocks en Temps Réel
        </h1>
        <div className="text-sm text-slate-500">
          {lastUpdated && `Dernière mise à jour: ${lastUpdated.toLocaleTimeString('fr-FR')}`}
        </div>
      </div>

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Produits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {stockLevels.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">
              Stock Critique
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {getCriticalStockItems().length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">
              Stock Faible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {getLowStockItems().length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">
              Surstock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {getOverstockItems().length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Valeur Totale du Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">
              {getTotalStockValue().toLocaleString('fr-FR')} CFA
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Taux d'Écoulement Moyen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-900">
              {getAverageFlowRate().toFixed(1)} unités/jour
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <StockAlerts alerts={alerts} maxVisible={5} />
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-800">
              Erreur: {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Threshold Configuration */}
      <StockThresholdConfig
        currentThresholds={thresholds}
        onThresholdsChange={handleThresholdsChange}
        onSave={handleSaveThresholds}
      />

      {/* Main Stock Level Display */}
      <StockLevelDisplay 
        storeId="store-1" 
        refreshInterval={30000}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-4 text-slate-500">
          Actualisation des données en cours...
        </div>
      )}
    </div>
  );
};