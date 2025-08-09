import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  AlertTriangle,
  BarChart3,
  Calendar,
  RefreshCw,
  Download
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui';
import { useCostAnalysis } from '../../../shared/hooks/useCostAnalysis';
import { CostRatiosChart } from './CostRatiosChart';
import { StoreComparisonTable } from './StoreComparisonTable';
import { CostTrendsChart } from './CostTrendsChart';

interface CostAnalysisProps {
  storeIds: string[];
  className?: string;
}

export const CostAnalysis: React.FC<CostAnalysisProps> = ({ 
  storeIds, 
  className = '' 
}) => {
  const [dateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date()
  });

  const { 
    report, 
    kpis, 
    storeComparisons, 
    timeSeriesData,
    loading, 
    error, 
    refreshData
  } = useCostAnalysis({
    storeIds,
    startDate: dateRange.start,
    endDate: dateRange.end,
    autoRefresh: true,
    refreshInterval: 300000 // 5 minutes
  });



  const handleExportReport = () => {
    if (!report) return;
    
    // Create CSV content
    const csvContent = [
      ['Magasin', 'CA', 'Coûts Salaires', 'Pertes', 'Ratio Salarial %', 'Taux Perte %', 'Marge %'],
      ...storeComparisons.map(store => [
        store.storeName,
        store.revenue.toLocaleString('fr-FR'),
        store.costs.salaries.toLocaleString('fr-FR'),
        store.costs.losses.toLocaleString('fr-FR'),
        store.ratios.salaryCostRatio.toFixed(2),
        store.ratios.lossRate.toFixed(2),
        ((store.ratios.profitMargin / store.revenue) * 100).toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analyse-couts-${dateRange.start.toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <Card className={`border-red-200 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Erreur: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Analyse des Coûts et Ratios</h2>
          <p className="text-slate-600 text-sm">
            Analyse comparative des coûts et ratios clés par magasin
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportReport}
            disabled={!report}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">CA Total</p>
                  <p className="text-2xl font-bold">
                    {kpis.totalRevenue.toLocaleString('fr-FR')} CFA
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Coûts Totaux</p>
                  <p className="text-2xl font-bold">
                    {kpis.totalCosts.toLocaleString('fr-FR')} CFA
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Ratio Salarial Moyen</p>
                  <p className="text-2xl font-bold">{kpis.averageSalaryCostRatio.toFixed(1)}%</p>
                </div>
                <Users className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Taux Perte Moyen</p>
                  <p className="text-2xl font-bold">{kpis.averageLossRate.toFixed(1)}%</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Insights */}
      {kpis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <TrendingUp className="h-5 w-5" />
                Meilleure Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-semibold text-lg">{kpis.bestStore.name}</p>
                <p className="text-sm text-slate-600">
                  Marge bénéficiaire: {kpis.bestStore.profitMargin.toLocaleString('fr-FR')} CFA
                </p>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  Magasin le plus rentable
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <TrendingDown className="h-5 w-5" />
                À Améliorer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-semibold text-lg">{kpis.worstStore.name}</p>
                <p className="text-sm text-slate-600">
                  Marge bénéficiaire: {kpis.worstStore.profitMargin.toLocaleString('fr-FR')} CFA
                </p>
                <Badge variant="outline" className="text-red-600 border-red-200">
                  Nécessite attention
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Ratios Clés par Magasin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CostRatiosChart 
              data={storeComparisons} 
              loading={loading}
            />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Évolution des Coûts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CostTrendsChart 
              data={timeSeriesData} 
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Store Comparison Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Comparaison Détaillée par Magasin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StoreComparisonTable 
            data={storeComparisons} 
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Trends and Insights */}
      {report && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Tendances et Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Tendance CA</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  {report.insights.trends.revenue === 'increasing' ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : report.insights.trends.revenue === 'decreasing' ? (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  ) : (
                    <div className="h-5 w-5 bg-slate-400 rounded-full" />
                  )}
                  <span className="font-semibold capitalize">
                    {report.insights.trends.revenue === 'increasing' ? 'En hausse' :
                     report.insights.trends.revenue === 'decreasing' ? 'En baisse' : 'Stable'}
                  </span>
                </div>
              </div>

              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Tendance Coûts</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  {report.insights.trends.costs === 'increasing' ? (
                    <TrendingUp className="h-5 w-5 text-red-500" />
                  ) : report.insights.trends.costs === 'decreasing' ? (
                    <TrendingDown className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="h-5 w-5 bg-slate-400 rounded-full" />
                  )}
                  <span className="font-semibold capitalize">
                    {report.insights.trends.costs === 'increasing' ? 'En hausse' :
                     report.insights.trends.costs === 'decreasing' ? 'En baisse' : 'Stable'}
                  </span>
                </div>
              </div>

              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Rentabilité</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  {report.insights.trends.profitability === 'improving' ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : report.insights.trends.profitability === 'declining' ? (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  ) : (
                    <div className="h-5 w-5 bg-slate-400 rounded-full" />
                  )}
                  <span className="font-semibold capitalize">
                    {report.insights.trends.profitability === 'improving' ? 'En amélioration' :
                     report.insights.trends.profitability === 'declining' ? 'En dégradation' : 'Stable'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};