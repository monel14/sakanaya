import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Label } from '@/components/ui';
import { FileText, Users, TrendingUp } from 'lucide-react';
import { SalesReport } from './SalesReport';
import { PerformanceReport } from './PerformanceReport';
import { PriceImpactReport } from './PriceImpactReport';
import { ReportFilters } from '../types';

type ReportType = 'sales' | 'performance' | 'price-impact';

export const ReportsView: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('sales');
  const [filters, setFilters] = useState<ReportFilters>(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return {
      startDate: thirtyDaysAgo,
      endDate: now,
      storeId: undefined,
      productId: undefined,
      employeeId: undefined,
      category: undefined
    };
  });

  const handleFilterChange = (key: keyof ReportFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleExport = (data: any) => {
    // Export functionality - could generate CSV, PDF, etc.
    console.log('Exporting report data:', data);
    // In a real app, this would trigger a download
  };

  const reportTypes = [
    {
      id: 'sales' as ReportType,
      label: 'Rapport des Ventes',
      icon: FileText,
      description: 'Chiffre d\'affaires par période/magasin/produit'
    },
    {
      id: 'performance' as ReportType,
      label: 'Performance Employés',
      icon: Users,
      description: 'Analyse des volumes et performance par employé'
    },
    {
      id: 'price-impact' as ReportType,
      label: 'Impact des Prix',
      icon: TrendingUp,
      description: 'Évolution des prix et impact sur les ventes'
    }
  ];

  const periodOptions = [
    { value: 7, label: '7 derniers jours' },
    { value: 30, label: '30 derniers jours' },
    { value: 90, label: '3 derniers mois' }
  ];

  const handlePeriodChange = (days: number) => {
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    setFilters(prev => ({
      ...prev,
      startDate,
      endDate: now
    }));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Rapports & Analyses</h1>

      {/* Report type selection */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Sélection du Rapport</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {reportTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedReport(type.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedReport === type.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`h-5 w-5 ${
                      selectedReport === type.id ? 'text-blue-600' : 'text-slate-600'
                    }`} />
                    <span className={`font-medium ${
                      selectedReport === type.id ? 'text-blue-900' : 'text-slate-900'
                    }`}>
                      {type.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{type.description}</p>
                </button>
              );
            })}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium">Période</Label>
              <select 
                className="w-full mt-1 p-3 sm:p-2 border border-slate-300 rounded-lg text-base sm:text-sm"
                onChange={(e) => handlePeriodChange(Number(e.target.value))}
              >
                {periodOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Date de début</Label>
              <input
                type="date"
                className="w-full mt-1 p-3 sm:p-2 border border-slate-300 rounded-lg text-base sm:text-sm"
                value={filters.startDate.toISOString().split('T')[0]}
                onChange={(e) => handleFilterChange('startDate', new Date(e.target.value))}
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium">Date de fin</Label>
              <input
                type="date"
                className="w-full mt-1 p-3 sm:p-2 border border-slate-300 rounded-lg text-base sm:text-sm"
                value={filters.endDate.toISOString().split('T')[0]}
                onChange={(e) => handleFilterChange('endDate', new Date(e.target.value))}
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium">Magasin</Label>
              <select 
                className="w-full mt-1 p-3 sm:p-2 border border-slate-300 rounded-lg text-base sm:text-sm"
                value={filters.storeId || ''}
                onChange={(e) => handleFilterChange('storeId', e.target.value || undefined)}
              >
                <option value="">Tous les magasins</option>
                <option value="store-1">Hub de Distribution</option>
                <option value="store-2">Pointe des Almadies</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report content */}
      {selectedReport === 'sales' && (
        <SalesReport filters={filters} onExport={handleExport} />
      )}
      
      {selectedReport === 'performance' && (
        <PerformanceReport filters={filters} onExport={handleExport} />
      )}
      
      {selectedReport === 'price-impact' && (
        <PriceImpactReport filters={filters} onExport={handleExport} />
      )}
    </div>
  );
};