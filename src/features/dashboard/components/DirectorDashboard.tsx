import React, { useState } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  Package, 
  BarChart3, 
  Bell,
  Calculator
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '../../../shared/components/ui';
import { KPIData } from '../../../shared/types';
import { CostAnalysis } from './CostAnalysis';

// Mock data
const mockKPIData: KPIData = {
  revenue: 1250000,
  grossMargin: 480000,
  lossRate: 2.8,
  stockRotation: 2.3
};

export const DirectorDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'overview' | 'cost-analysis'>('overview');
  
  // Mock store IDs - in real implementation, would come from user context or API
  const storeIds = ['store-1', 'store-2', 'store-3'];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Tableau de Bord Global
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant={activeView === 'overview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('overview')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Vue d'ensemble
          </Button>
          <Button
            variant={activeView === 'cost-analysis' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('cost-analysis')}
            className="flex items-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            Analyse des Coûts
          </Button>
          <Badge variant="outline" className="text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            Aujourd'hui
          </Badge>
        </div>
      </div>

      {/* Conditional Content */}
      {activeView === 'cost-analysis' ? (
        <CostAnalysis storeIds={storeIds} />
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs sm:text-sm">Chiffre d'Affaires</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {mockKPIData.revenue.toLocaleString('fr-FR')} CFA
                </p>
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-xs sm:text-sm">Marge Brute</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {mockKPIData.grossMargin.toLocaleString('fr-FR')} CFA
                </p>
              </div>
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xs sm:text-sm">Taux de perte</p>
                <p className="text-lg sm:text-2xl font-bold">{mockKPIData.lossRate}%</p>
              </div>
              <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs sm:text-sm">Rotation stock</p>
                <p className="text-lg sm:text-2xl font-bold">{mockKPIData.stockRotation} jours</p>
              </div>
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
              CA par Magasin (7 derniers jours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 sm:h-64 flex items-center justify-center text-slate-500 text-sm">
              Graphique des ventes par magasin
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
              Alertes & Tâches
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-800">Clôture manquante</p>
              <p className="text-xs text-red-600">Magasin Sandaga - J-1</p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-800">Transfert à valider</p>
              <p className="text-xs text-blue-600">BT-0128 vers Almadies</p>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm font-medium text-amber-800">Sur-stock détecté</p>
              <p className="text-xs text-amber-600">Soles au Hub (+25kg)</p>
            </div>
          </CardContent>
        </Card>
      </div>
        </>
      )}
    </div>
  );
};