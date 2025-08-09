import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from '@/components/ui';
import { StoreComparison } from '../types/costAnalysis';

interface StoreComparisonTableProps {
  data: StoreComparison[];
  loading?: boolean;
}

export const StoreComparisonTable: React.FC<StoreComparisonTableProps> = ({ 
  data, 
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        Aucune donnée disponible
      </div>
    );
  }

  // Sort stores by profit margin (descending)
  const sortedData = [...data].sort((a, b) => b.ratios.profitMargin - a.ratios.profitMargin);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' CFA';
  };

  const formatPercentage = (value: number) => {
    return value.toFixed(1) + '%';
  };

  const getPerformanceIndicator = (value: number, threshold: number, reverse = false) => {
    const isGood = reverse ? value < threshold : value > threshold;
    if (Math.abs(value - threshold) < 1) {
      return <Minus className="h-4 w-4 text-slate-400" />;
    }
    return isGood ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getPerformanceBadge = (profitMargin: number, revenue: number) => {
    const marginPercent = (profitMargin / revenue) * 100;
    if (marginPercent > 15) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Excellent</Badge>;
    } else if (marginPercent > 10) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Bon</Badge>;
    } else if (marginPercent > 5) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Moyen</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Faible</Badge>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 font-semibold text-slate-700">Magasin</th>
            <th className="text-right py-3 px-4 font-semibold text-slate-700">CA</th>
            <th className="text-right py-3 px-4 font-semibold text-slate-700">Coûts Salaires</th>
            <th className="text-right py-3 px-4 font-semibold text-slate-700">Pertes</th>
            <th className="text-center py-3 px-4 font-semibold text-slate-700">Ratio Salarial</th>
            <th className="text-center py-3 px-4 font-semibold text-slate-700">Taux Perte</th>
            <th className="text-right py-3 px-4 font-semibold text-slate-700">Marge Nette</th>
            <th className="text-center py-3 px-4 font-semibold text-slate-700">Performance</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((store, index) => (
            <tr 
              key={store.storeId} 
              className={`border-b border-slate-100 hover:bg-slate-50 ${
                index === 0 ? 'bg-green-50' : index === sortedData.length - 1 ? 'bg-red-50' : ''
              }`}
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">{store.storeName}</span>
                  {index === 0 && (
                    <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                      #1
                    </Badge>
                  )}
                </div>
              </td>
              
              <td className="py-3 px-4 text-right font-mono text-sm">
                {formatCurrency(store.revenue)}
              </td>
              
              <td className="py-3 px-4 text-right font-mono text-sm">
                <div className="flex items-center justify-end gap-2">
                  {formatCurrency(store.costs.salaries)}
                  {getPerformanceIndicator(store.ratios.salaryCostRatio, 25, true)}
                </div>
              </td>
              
              <td className="py-3 px-4 text-right font-mono text-sm">
                <div className="flex items-center justify-end gap-2">
                  {formatCurrency(store.costs.losses)}
                  {getPerformanceIndicator(store.ratios.lossRate, 5, true)}
                </div>
              </td>
              
              <td className="py-3 px-4 text-center">
                <span className={`font-semibold ${
                  store.ratios.salaryCostRatio > 30 ? 'text-red-600' :
                  store.ratios.salaryCostRatio > 25 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {formatPercentage(store.ratios.salaryCostRatio)}
                </span>
              </td>
              
              <td className="py-3 px-4 text-center">
                <span className={`font-semibold ${
                  store.ratios.lossRate > 8 ? 'text-red-600' :
                  store.ratios.lossRate > 5 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {formatPercentage(store.ratios.lossRate)}
                </span>
              </td>
              
              <td className="py-3 px-4 text-right font-mono text-sm">
                <span className={`font-semibold ${
                  store.ratios.profitMargin > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(store.ratios.profitMargin)}
                </span>
              </td>
              
              <td className="py-3 px-4 text-center">
                {getPerformanceBadge(store.ratios.profitMargin, store.revenue)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Summary row */}
      <div className="mt-4 p-4 bg-slate-50 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-600">CA Total</p>
            <p className="font-semibold text-slate-900">
              {formatCurrency(sortedData.reduce((sum, store) => sum + store.revenue, 0))}
            </p>
          </div>
          <div>
            <p className="text-slate-600">Coûts Salaires Total</p>
            <p className="font-semibold text-slate-900">
              {formatCurrency(sortedData.reduce((sum, store) => sum + store.costs.salaries, 0))}
            </p>
          </div>
          <div>
            <p className="text-slate-600">Pertes Totales</p>
            <p className="font-semibold text-slate-900">
              {formatCurrency(sortedData.reduce((sum, store) => sum + store.costs.losses, 0))}
            </p>
          </div>
          <div>
            <p className="text-slate-600">Marge Nette Totale</p>
            <p className="font-semibold text-slate-900">
              {formatCurrency(sortedData.reduce((sum, store) => sum + store.ratios.profitMargin, 0))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};