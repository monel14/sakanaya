import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { Download, TrendingUp, Package, DollarSign, BarChart3 } from 'lucide-react';
import { reportsService } from '../services/reportsService';
import { SalesReportData, ReportFilters } from '../types';
import { formatCurrency, formatNumber } from '../../../shared/utils/formatters';

interface SalesReportProps {
  filters: ReportFilters;
  onExport?: (data: SalesReportData) => void;
}

export const SalesReport: React.FC<SalesReportProps> = ({ filters, onExport }) => {
  const [reportData, setReportData] = useState<SalesReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateReport();
  }, [filters]);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await reportsService.generateSalesReport(filters);
      setReportData(data);
    } catch (err) {
      setError('Erreur lors de la génération du rapport');
      console.error('Sales report error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (reportData && onExport) {
      onExport(reportData);
    }
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
            <CardTitle className="text-lg">Rapport des Ventes</CardTitle>
            <Button variant="outline" size="sm" onClick={handleExport} className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
          <div className="text-sm text-slate-600">
            Du {filters.startDate.toLocaleDateString('fr-FR')} au {filters.endDate.toLocaleDateString('fr-FR')}
            {filters.storeId && ' • Magasin spécifique'}
            {filters.productId && ' • Produit spécifique'}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Chiffre d'Affaires</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {formatCurrency(reportData.totalRevenue)}
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Quantité Totale</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {formatNumber(reportData.totalQuantity)} kg
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Prix Moyen</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {formatCurrency(reportData.averagePrice)}/kg
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Nb Ventes</span>
              </div>
              <div className="text-2xl font-bold text-orange-900">
                {reportData.salesCount}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">
            Répartition par {reportData.productId ? 'Magasin' : 'Produit'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 font-medium">
                    {reportData.productId ? 'Magasin' : 'Produit'}
                  </th>
                  <th className="text-right py-3 font-medium">Chiffre d'Affaires</th>
                  <th className="text-right py-3 font-medium">Quantité (kg)</th>
                  <th className="text-right py-3 font-medium">Prix Moyen</th>
                  <th className="text-right py-3 font-medium">Nb Ventes</th>
                  <th className="text-right py-3 font-medium">Part (%)</th>
                </tr>
              </thead>
              <tbody>
                {reportData.breakdown.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-3 font-medium">{item.name}</td>
                    <td className="text-right py-3">{formatCurrency(item.revenue)}</td>
                    <td className="text-right py-3">{formatNumber(item.quantity)}</td>
                    <td className="text-right py-3">{formatCurrency(item.averagePrice)}</td>
                    <td className="text-right py-3">{item.salesCount}</td>
                    <td className="text-right py-3">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${Math.min(item.percentage, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium w-10 text-right">
                          {item.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {reportData.breakdown.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              Aucune donnée disponible pour la période sélectionnée
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top performers */}
      {reportData.breakdown.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reportData.breakdown.slice(0, 3).map((item, index) => (
                <div key={item.id} className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-slate-400' : 'bg-orange-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">CA:</span>
                      <span className="font-medium">{formatCurrency(item.revenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Quantité:</span>
                      <span className="font-medium">{formatNumber(item.quantity)} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Part:</span>
                      <span className="font-medium">{item.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};