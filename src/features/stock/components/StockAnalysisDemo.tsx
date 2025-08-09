import React, { useState } from 'react';
import { BarChart3, History, AlertTriangle, TrendingDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../../../shared/components/ui';
import { StockMovementHistory } from './StockMovementHistory';
import { LossRateReport } from './LossRateReport';
import { StockVarianceAlerts } from './StockVarianceAlerts';

interface StockAnalysisDemoProps {
  storeId: string;
}

type ActiveTab = 'history' | 'lossRate' | 'alerts';

export const StockAnalysisDemo: React.FC<StockAnalysisDemoProps> = ({ storeId }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('alerts');

  const tabs = [
    {
      id: 'alerts' as const,
      label: 'Alertes d\'Écarts',
      icon: AlertTriangle,
      description: 'Détection automatique des écarts anormaux'
    },
    {
      id: 'history' as const,
      label: 'Historique des Mouvements',
      icon: History,
      description: 'Traçabilité complète des mouvements de stock'
    },
    {
      id: 'lossRate' as const,
      label: 'Analyse des Pertes',
      icon: TrendingDown,
      description: 'Rapports détaillés des taux de perte'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2 flex items-center justify-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Analyse Avancée des Stocks
        </h1>
        <p className="text-slate-600">
          Outils d'analyse pour la traçabilité, les taux de perte et la détection d'écarts anormaux
        </p>
      </div>

      {/* Tab Navigation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Modules d'Analyse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'outline'}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">{tab.label}</div>
                    <div className="text-xs opacity-75 mt-1">{tab.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'alerts' && (
          <StockVarianceAlerts 
            storeId={storeId}
            autoRefresh={true}
            refreshInterval={300000} // 5 minutes
            maxVisible={10}
          />
        )}
        
        {activeTab === 'history' && (
          <StockMovementHistory 
            storeId={storeId}
            maxItems={50}
          />
        )}
        
        {activeTab === 'lossRate' && (
          <LossRateReport 
            storeId={storeId}
            autoRefresh={true}
            refreshInterval={300000} // 5 minutes
          />
        )}
      </div>

      {/* Feature Summary */}
      <Card className="bg-slate-50">
        <CardHeader>
          <CardTitle className="text-base">Fonctionnalités Implémentées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                Alertes d'Écarts
              </h4>
              <ul className="space-y-1 text-slate-600">
                <li>• Détection automatique des pertes anormales</li>
                <li>• Analyse des écoulements inhabituels</li>
                <li>• Notifications en temps réel</li>
                <li>• Statistiques et tendances</li>
                <li>• Résolution et suivi des alertes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                <History className="h-4 w-4 text-blue-600" />
                Historique des Mouvements
              </h4>
              <ul className="space-y-1 text-slate-600">
                <li>• Traçabilité complète des mouvements</li>
                <li>• Filtrage par type, période, produit</li>
                <li>• Export CSV des données</li>
                <li>• Recherche et tri avancés</li>
                <li>• Détails des arrivages et pertes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                Analyse des Pertes
              </h4>
              <ul className="space-y-1 text-slate-600">
                <li>• Rapports hebdomadaires et mensuels</li>
                <li>• Répartition par catégorie de perte</li>
                <li>• Comparaison avec périodes précédentes</li>
                <li>• Alertes sur seuils dépassés</li>
                <li>• Recommandations automatiques</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};