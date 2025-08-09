import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { Download, TrendingUp, TrendingDown, AlertTriangle, BarChart3 } from 'lucide-react';
import { reportsService } from '../services/reportsService';
import { PriceImpactReportData, ReportFilters } from '../types';
import { formatCurrency, formatNumber } from '../../../shared/utils/formatters';

interface PriceImpactReportProps {
  filters: ReportFilters;
  onExport?: (data: PriceImpactReportData) => void;
}

export const PriceImpactReport: React.FC<PriceImpactReportProps> = ({ filters, onExport }) => {
  const [reportData, setReportData] = useState<PriceImpactReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateReport();
  }, [filters]);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await reportsService.generatePriceImpactReport(filters);
      setReportData(data);
    } catch (err) {
      setError('Erreur lors de la génération du rapport');
      console.error('Price impact report error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (reportData && onExport) {
      onExport(reportData);
    }
  };

  const getChangeIcon = (changePercent: number) => {
    if (changePercent > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (changePercent < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <BarChart3 className="h-4 w-4 text-slate-400" />;
  };

  const getChangeColor = (changePercent: number) => {
    if (changePercent > 0) return 'text-green-600';
    if (changePercent < 0) return 'text-red-600';
    return 'text-slate-600';
  };

  const getElasticityLabel = (elasticity: number) => {
    if (Math.abs(elasticity) > 1) return 'Élastique';
    if (Math.abs(elasticity) > 0.5) return 'Modérément élastique';
    return 'Inélastique';
  };

  const getElasticityColor = (elasticity: number) => {
    if (Math.abs(elasticity) > 1) return 'text-red-600';
    if (Math.abs(elasticity) > 0.5) return 'text-orange-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-500">Génération du rapport en cours...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500">{error}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reportData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header with summary metrics */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg">Rapport d'Impact des Prix</CardTitle>
            <Button variant="outline" size="sm" onClick={handleExport} className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
          <div className="text-sm text-slate-600">
            Du {filters.startDate.toLocaleDateString('fr-FR')} au {filters.endDate.toLocaleDateString('fr-FR')}
            {filters.productId && ' • Produit spécifique'}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Changements Prix</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {reportData.summary.totalPriceChanges}
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Hausse Moyenne</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {reportData.summary.averagePriceIncrease.toFixed(1)}%
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Impact CA</span>
              </div>
              <div className={`text-2xl font-bold ${getChangeColor(reportData.summary.totalRevenueImpact)}`}>
                {reportData.summary.totalRevenueImpact > 0 ? '+' : ''}
                {reportData.summary.totalRevenueImpact.toFixed(1)}%
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Plus Impacté</span>
              </div>
              <div className="text-sm font-bold text-orange-900 truncate">
                {reportData.summary.mostImpactedProduct.productName || 'N/A'}
              </div>
              <div className={`text-xs ${getChangeColor(reportData.summary.mostImpactedProduct.revenueImpact)}`}>
                {reportData.summary.mostImpactedProduct.revenueImpact > 0 ? '+' : ''}
                {reportData.summary.mostImpactedProduct.revenueImpact.toFixed(1)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price changes table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Historique des Changements de Prix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 font-medium">Produit</th>
                  <th className="text-right py-3 font-medium">Ancien Prix</th>
                  <th className="text-right py-3 font-medium">Nouveau Prix</th>
                  <th className="text-right py-3 font-medium">Variation</th>
                  <th className="text-left py-3 font-medium">Date</th>
                  <th className="text-left py-3 font-medium">Raison</th>
                </tr>
              </thead>
              <tbody>
                {reportData.priceChanges.map((change) => (
                  <tr key={change.id} className="border-b border-slate-100">
                    <td className="py-3 font-medium">{change.productName}</td>
                    <td className="text-right py-3">{formatCurrency(change.oldPrice)}</td>
                    <td className="text-right py-3">{formatCurrency(change.newPrice)}</td>
                    <td className="text-right py-3">
                      <div className="flex items-center justify-end gap-1">
                        {getChangeIcon(change.changePercent)}
                        <span className={`font-medium ${getChangeColor(change.changePercent)}`}>
                          {change.changePercent > 0 ? '+' : ''}
                          {change.changePercent.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3">{change.changeDate.toLocaleDateString('fr-FR')}</td>
                    <td className="py-3 text-slate-600">{change.reason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {reportData.priceChanges.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              Aucun changement de prix pour la période sélectionnée
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sales impact analysis */}
      {reportData.salesImpact.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Analyse d'Impact sur les Ventes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 font-medium">Produit</th>
                    <th className="text-center py-3 font-medium">Date Changement</th>
                    <th className="text-right py-3 font-medium">Quantité Avant</th>
                    <th className="text-right py-3 font-medium">Quantité Après</th>
                    <th className="text-right py-3 font-medium">Impact Quantité</th>
                    <th className="text-right py-3 font-medium">Impact CA</th>
                    <th className="text-center py-3 font-medium">Élasticité</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.salesImpact.map((impact, index) => (
                    <tr key={`${impact.productId}-${index}`} className="border-b border-slate-100">
                      <td className="py-3 font-medium">{impact.productName}</td>
                      <td className="text-center py-3">{impact.priceChangeDate.toLocaleDateString('fr-FR')}</td>
                      <td className="text-right py-3">{formatNumber(impact.salesBefore.quantity)} kg</td>
                      <td className="text-right py-3">{formatNumber(impact.salesAfter.quantity)} kg</td>
                      <td className="text-right py-3">
                        <span className={`font-medium ${getChangeColor(impact.impact.quantityChange)}`}>
                          {impact.impact.quantityChange > 0 ? '+' : ''}
                          {impact.impact.quantityChange.toFixed(1)}%
                        </span>
                      </td>
                      <td className="text-right py-3">
                        <span className={`font-medium ${getChangeColor(impact.impact.revenueChange)}`}>
                          {impact.impact.revenueChange > 0 ? '+' : ''}
                          {impact.impact.revenueChange.toFixed(1)}%
                        </span>
                      </td>
                      <td className="text-center py-3">
                        <div className="flex flex-col items-center">
                          <span className="font-medium">{impact.impact.elasticity.toFixed(2)}</span>
                          <span className={`text-xs ${getElasticityColor(impact.impact.elasticity)}`}>
                            {getElasticityLabel(impact.impact.elasticity)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights and recommendations */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Insights et Recommandations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analyse des Élasticités
              </h4>
              <div className="space-y-3">
                {reportData.salesImpact.slice(0, 3).map((impact, index) => (
                  <div key={`${impact.productId}-${index}`} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm">{impact.productName}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        Math.abs(impact.impact.elasticity) > 1 ? 'bg-red-100 text-red-700' :
                        Math.abs(impact.impact.elasticity) > 0.5 ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {getElasticityLabel(impact.impact.elasticity)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      Élasticité: {impact.impact.elasticity.toFixed(2)} • 
                      Impact CA: <span className={getChangeColor(impact.impact.revenueChange)}>
                        {impact.impact.revenueChange > 0 ? '+' : ''}
                        {impact.impact.revenueChange.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Recommandations
              </h4>
              <div className="space-y-3 text-sm">
                {reportData.summary.averagePriceIncrease > 10 && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="font-medium text-orange-800 mb-1">Hausses importantes</div>
                    <div className="text-orange-700">
                      Les hausses moyennes de {reportData.summary.averagePriceIncrease.toFixed(1)}% 
                      peuvent impacter la demande. Surveillez les volumes.
                    </div>
                  </div>
                )}
                
                {reportData.summary.totalRevenueImpact < -5 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="font-medium text-red-800 mb-1">Impact négatif sur le CA</div>
                    <div className="text-red-700">
                      L'impact global de {reportData.summary.totalRevenueImpact.toFixed(1)}% 
                      sur le CA nécessite une révision de la stratégie prix.
                    </div>
                  </div>
                )}
                
                {reportData.salesImpact.some(impact => Math.abs(impact.impact.elasticity) > 1) && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="font-medium text-blue-800 mb-1">Produits élastiques détectés</div>
                    <div className="text-blue-700">
                      Certains produits sont très sensibles aux prix. 
                      Considérez des ajustements plus graduels.
                    </div>
                  </div>
                )}
                
                {reportData.summary.totalRevenueImpact > 5 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="font-medium text-green-800 mb-1">Impact positif confirmé</div>
                    <div className="text-green-700">
                      L'impact positif de {reportData.summary.totalRevenueImpact.toFixed(1)}% 
                      valide la stratégie de prix actuelle.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};