import React, { useState, useEffect } from 'react';
import { TrendingDown, AlertTriangle, BarChart3, Calendar, Download, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { LossRateReport as LossRateReportType } from '../types';
import { stockService } from '@/shared/services';
import { toast } from 'sonner';

interface LossRateReportProps {
  storeId: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface LossRateAnalysis {
  current: LossRateReportType;
  previous: LossRateReportType;
  trend: 'improving' | 'worsening' | 'stable';
  trendPercentage: number;
}

interface LossRateThresholds {
  acceptable: number; // percentage
  warning: number; // percentage
  critical: number; // percentage
}

const DEFAULT_THRESHOLDS: LossRateThresholds = {
  acceptable: 5, // 5% loss rate is acceptable
  warning: 10, // 10% triggers warning
  critical: 15 // 15% is critical
};

export const LossRateReport: React.FC<LossRateReportProps> = ({
  storeId,
  autoRefresh = false,
  refreshInterval = 300000 // 5 minutes
}) => {
  const [weeklyAnalysis, setWeeklyAnalysis] = useState<LossRateAnalysis | null>(null);
  const [monthlyAnalysis, setMonthlyAnalysis] = useState<LossRateAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');

  useEffect(() => {
    loadLossRateData();
    
    if (autoRefresh) {
      const interval = setInterval(loadLossRateData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [storeId, autoRefresh, refreshInterval]);

  const loadLossRateData = async () => {
    setIsLoading(true);
    try {
      // Load current and previous period data for comparison
      const [currentWeekly, previousWeekly, currentMonthly, previousMonthly] = await Promise.all([
        stockService.calculateLossRates(storeId, 'week'),
        getPreviousWeekLossRate(storeId),
        stockService.calculateLossRates(storeId, 'month'),
        getPreviousMonthLossRate(storeId)
      ]);

      // Calculate weekly analysis
      const weeklyTrend = calculateTrend(currentWeekly.lossRate, previousWeekly.lossRate);
      setWeeklyAnalysis({
        current: currentWeekly,
        previous: previousWeekly,
        trend: weeklyTrend.direction,
        trendPercentage: weeklyTrend.percentage
      });

      // Calculate monthly analysis
      const monthlyTrend = calculateTrend(currentMonthly.lossRate, previousMonthly.lossRate);
      setMonthlyAnalysis({
        current: currentMonthly,
        previous: previousMonthly,
        trend: monthlyTrend.direction,
        trendPercentage: monthlyTrend.percentage
      });

      setLastUpdated(new Date());

    } catch (error) {
      console.error('Error loading loss rate data:', error);
      toast.error('Erreur lors du chargement des données de taux de perte');
    } finally {
      setIsLoading(false);
    }
  };

  const getPreviousWeekLossRate = async (storeId: string): Promise<LossRateReportType> => {
    // Calculate loss rate for the week before the current week
    const now = new Date();
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(now.getDate() - 14);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    const movements = await stockService.getStockMovements(storeId, [twoWeeksAgo, oneWeekAgo]);
    
    const arrivals = movements.filter(m => m.type === 'arrival');
    const losses = movements.filter(m => m.type === 'loss');
    
    const totalArrivals = arrivals.reduce((sum, m) => sum + m.quantity, 0);
    const totalLosses = Math.abs(losses.reduce((sum, m) => sum + m.quantity, 0));
    
    const lossBreakdown = {
      spoilage: Math.abs(losses.filter(m => m.lossCategory === 'spoilage').reduce((sum, m) => sum + m.quantity, 0)),
      damage: Math.abs(losses.filter(m => m.lossCategory === 'damage').reduce((sum, m) => sum + m.quantity, 0)),
      promotion: Math.abs(losses.filter(m => m.lossCategory === 'promotion').reduce((sum, m) => sum + m.quantity, 0))
    };

    const lossRate = totalArrivals > 0 ? (totalLosses / totalArrivals) * 100 : 0;

    return {
      storeId,
      period: 'week',
      startDate: twoWeeksAgo,
      endDate: oneWeekAgo,
      totalLosses,
      totalArrivals,
      lossRate,
      lossBreakdown,
      generatedAt: new Date()
    };
  };

  const getPreviousMonthLossRate = async (storeId: string): Promise<LossRateReportType> => {
    // Calculate loss rate for the month before the current month
    const now = new Date();
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(now.getMonth() - 2);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);

    const movements = await stockService.getStockMovements(storeId, [twoMonthsAgo, oneMonthAgo]);
    
    const arrivals = movements.filter(m => m.type === 'arrival');
    const losses = movements.filter(m => m.type === 'loss');
    
    const totalArrivals = arrivals.reduce((sum, m) => sum + m.quantity, 0);
    const totalLosses = Math.abs(losses.reduce((sum, m) => sum + m.quantity, 0));
    
    const lossBreakdown = {
      spoilage: Math.abs(losses.filter(m => m.lossCategory === 'spoilage').reduce((sum, m) => sum + m.quantity, 0)),
      damage: Math.abs(losses.filter(m => m.lossCategory === 'damage').reduce((sum, m) => sum + m.quantity, 0)),
      promotion: Math.abs(losses.filter(m => m.lossCategory === 'promotion').reduce((sum, m) => sum + m.quantity, 0))
    };

    const lossRate = totalArrivals > 0 ? (totalLosses / totalArrivals) * 100 : 0;

    return {
      storeId,
      period: 'month',
      startDate: twoMonthsAgo,
      endDate: oneMonthAgo,
      totalLosses,
      totalArrivals,
      lossRate,
      lossBreakdown,
      generatedAt: new Date()
    };
  };

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) {
      return { direction: 'stable' as const, percentage: 0 };
    }

    const change = ((current - previous) / previous) * 100;
    const threshold = 5; // 5% change threshold for stability

    if (Math.abs(change) < threshold) {
      return { direction: 'stable' as const, percentage: change };
    }

    return {
      direction: change < 0 ? 'improving' as const : 'worsening' as const,
      percentage: Math.abs(change)
    };
  };

  const getLossRateStatus = (lossRate: number) => {
    if (lossRate <= DEFAULT_THRESHOLDS.acceptable) {
      return { status: 'good', label: 'Acceptable', variant: 'default' as const };
    } else if (lossRate <= DEFAULT_THRESHOLDS.warning) {
      return { status: 'warning', label: 'Attention', variant: 'secondary' as const };
    } else {
      return { status: 'critical', label: 'Critique', variant: 'destructive' as const };
    }
  };

  const getTrendIcon = (trend: 'improving' | 'worsening' | 'stable') => {
    switch (trend) {
      case 'improving':
        return <TrendingDown className="h-4 w-4 text-green-600" />;
      case 'worsening':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'stable':
        return <BarChart3 className="h-4 w-4 text-slate-600" />;
    }
  };

  const getTrendLabel = (trend: 'improving' | 'worsening' | 'stable', percentage: number) => {
    switch (trend) {
      case 'improving':
        return `Amélioration de ${percentage.toFixed(1)}%`;
      case 'worsening':
        return `Dégradation de ${percentage.toFixed(1)}%`;
      case 'stable':
        return 'Stable';
    }
  };

  const exportReport = (analysis: LossRateAnalysis) => {
    const report = {
      'Période': analysis.current.period === 'week' ? 'Semaine' : 'Mois',
      'Date de début': analysis.current.startDate.toLocaleDateString('fr-FR'),
      'Date de fin': analysis.current.endDate.toLocaleDateString('fr-FR'),
      'Total arrivages': analysis.current.totalArrivals,
      'Total pertes': analysis.current.totalLosses,
      'Taux de perte (%)': analysis.current.lossRate.toFixed(2),
      'Pertes par avarie': analysis.current.lossBreakdown.spoilage,
      'Pertes par dégât': analysis.current.lossBreakdown.damage,
      'Pertes par promotion': analysis.current.lossBreakdown.promotion,
      'Tendance': getTrendLabel(analysis.trend, analysis.trendPercentage),
      'Généré le': analysis.current.generatedAt.toLocaleString('fr-FR')
    };

    const csvContent = [
      Object.keys(report).join(','),
      Object.values(report).map(val => `"${val}"`).join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-taux-perte-${analysis.current.period}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentAnalysis = selectedPeriod === 'week' ? weeklyAnalysis : monthlyAnalysis;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          Analyse des Taux de Perte
        </h2>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-sm text-slate-500">
              Mis à jour: {lastUpdated.toLocaleTimeString('fr-FR')}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={loadLossRateData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Period Selection */}
      <div className="flex gap-2">
        <Button
          variant={selectedPeriod === 'week' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedPeriod('week')}
        >
          Hebdomadaire
        </Button>
        <Button
          variant={selectedPeriod === 'month' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedPeriod('month')}
        >
          Mensuel
        </Button>
      </div>

      {isLoading && !currentAnalysis ? (
        <Card>
          <CardContent className="text-center py-8 text-slate-500">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            Chargement des données de taux de perte...
          </CardContent>
        </Card>
      ) : currentAnalysis ? (
        <>
          {/* Main Report Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Rapport {selectedPeriod === 'week' ? 'Hebdomadaire' : 'Mensuel'}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportReport(currentAnalysis)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
              <div className="text-sm text-slate-600">
                Du {currentAnalysis.current.startDate.toLocaleDateString('fr-FR')} au{' '}
                {currentAnalysis.current.endDate.toLocaleDateString('fr-FR')}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Loss Rate */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900 mb-2">
                    {currentAnalysis.current.lossRate.toFixed(1)}%
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Badge variant={getLossRateStatus(currentAnalysis.current.lossRate).variant}>
                      {getLossRateStatus(currentAnalysis.current.lossRate).label}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-600">Taux de perte global</div>
                </div>

                {/* Trend */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {getTrendIcon(currentAnalysis.trend)}
                    <span className="text-lg font-semibold text-slate-900">
                      {currentAnalysis.trendPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-sm text-slate-600">
                    {getTrendLabel(currentAnalysis.trend, currentAnalysis.trendPercentage)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    vs période précédente ({currentAnalysis.previous.lossRate.toFixed(1)}%)
                  </div>
                </div>

                {/* Volume */}
                <div className="text-center">
                  <div className="text-lg font-semibold text-slate-900 mb-1">
                    {currentAnalysis.current.totalLosses.toFixed(1)} unités
                  </div>
                  <div className="text-sm text-slate-600 mb-1">
                    sur {currentAnalysis.current.totalArrivals.toFixed(1)} arrivées
                  </div>
                  <div className="text-xs text-slate-500">
                    Volume total des pertes
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loss Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition des Pertes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Spoilage */}
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-slate-900">Avaries</div>
                      <div className="text-sm text-slate-600">Produits avariés ou périmés</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-slate-900">
                      {currentAnalysis.current.lossBreakdown.spoilage.toFixed(1)} unités
                    </div>
                    <div className="text-sm text-slate-600">
                      {currentAnalysis.current.totalLosses > 0 
                        ? ((currentAnalysis.current.lossBreakdown.spoilage / currentAnalysis.current.totalLosses) * 100).toFixed(1)
                        : 0}%
                    </div>
                  </div>
                </div>

                {/* Damage */}
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-slate-900">Dégâts</div>
                      <div className="text-sm text-slate-600">Produits endommagés</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-slate-900">
                      {currentAnalysis.current.lossBreakdown.damage.toFixed(1)} unités
                    </div>
                    <div className="text-sm text-slate-600">
                      {currentAnalysis.current.totalLosses > 0 
                        ? ((currentAnalysis.current.lossBreakdown.damage / currentAnalysis.current.totalLosses) * 100).toFixed(1)
                        : 0}%
                    </div>
                  </div>
                </div>

                {/* Promotion */}
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-slate-900">Promotions</div>
                      <div className="text-sm text-slate-600">Ventes à prix réduit</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-slate-900">
                      {currentAnalysis.current.lossBreakdown.promotion.toFixed(1)} unités
                    </div>
                    <div className="text-sm text-slate-600">
                      {currentAnalysis.current.totalLosses > 0 
                        ? ((currentAnalysis.current.lossBreakdown.promotion / currentAnalysis.current.totalLosses) * 100).toFixed(1)
                        : 0}%
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts and Recommendations */}
          {currentAnalysis.current.lossRate > DEFAULT_THRESHOLDS.warning && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Alertes et Recommandations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-orange-700">
                  {currentAnalysis.current.lossRate > DEFAULT_THRESHOLDS.critical && (
                    <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
                      <div className="font-medium text-red-800 mb-1">
                        🚨 Taux de perte critique ({currentAnalysis.current.lossRate.toFixed(1)}%)
                      </div>
                      <div className="text-sm text-red-700">
                        Le taux de perte dépasse le seuil critique de {DEFAULT_THRESHOLDS.critical}%. 
                        Une action immédiate est requise.
                      </div>
                    </div>
                  )}
                  
                  {currentAnalysis.trend === 'worsening' && (
                    <div className="p-3 bg-orange-100 border border-orange-200 rounded-lg">
                      <div className="font-medium text-orange-800 mb-1">
                        📈 Tendance à la hausse
                      </div>
                      <div className="text-sm text-orange-700">
                        Le taux de perte a augmenté de {currentAnalysis.trendPercentage.toFixed(1)}% 
                        par rapport à la période précédente.
                      </div>
                    </div>
                  )}

                  {currentAnalysis.current.lossBreakdown.spoilage > currentAnalysis.current.totalLosses * 0.6 && (
                    <div className="p-3 bg-yellow-100 border border-yellow-200 rounded-lg">
                      <div className="font-medium text-yellow-800 mb-1">
                        🥶 Avaries importantes
                      </div>
                      <div className="text-sm text-yellow-700">
                        Les avaries représentent plus de 60% des pertes. 
                        Vérifiez les conditions de stockage et la rotation des stocks.
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-8 text-slate-500">
            Aucune donnée disponible pour générer le rapport
          </CardContent>
        </Card>
      )}
    </div>
  );
};