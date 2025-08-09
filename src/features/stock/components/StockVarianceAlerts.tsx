import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, Activity, CheckCircle, RefreshCw, Settings } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../shared/components/ui';
import { StockVarianceAlert, stockAlertsService } from '../../../shared/services/stockAlertsService';
import { Product } from '../../sales/types';
import { productService } from '../../../shared/services';
import { toast } from 'sonner';

interface StockVarianceAlertsProps {
  storeId: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  maxVisible?: number;
  showResolved?: boolean;
}

interface EnrichedAlert extends StockVarianceAlert {
  product?: Product;
}

export const StockVarianceAlerts: React.FC<StockVarianceAlertsProps> = ({
  storeId,
  autoRefresh = true,
  refreshInterval = 300000, // 5 minutes
  maxVisible = 10,
  showResolved = false
}) => {
  const [alerts, setAlerts] = useState<EnrichedAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<EnrichedAlert | null>(null);
  const [alertStats, setAlertStats] = useState<any>(null);

  useEffect(() => {
    loadAlerts();
    loadAlertStatistics();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadAlerts();
        loadAlertStatistics();
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [storeId, autoRefresh, refreshInterval, showResolved]);

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      // Get active alerts
      const rawAlerts = await stockAlertsService.getActiveAlerts(storeId);
      
      // Get all products to enrich alert data
      const products = await productService.getActiveProducts();
      const productMap = new Map(products.map(p => [p.id, p]));

      // Enrich alerts with product data
      const enrichedAlerts: EnrichedAlert[] = rawAlerts.map(alert => ({
        ...alert,
        product: alert.productId !== 'all' ? productMap.get(alert.productId) : undefined
      }));

      setAlerts(enrichedAlerts.slice(0, maxVisible));
      setLastUpdated(new Date());

    } catch (error) {
      console.error('Error loading alerts:', error);
      toast.error('Erreur lors du chargement des alertes');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAlertStatistics = async () => {
    try {
      const stats = await stockAlertsService.getAlertStatistics(storeId);
      setAlertStats(stats);
    } catch (error) {
      console.error('Error loading alert statistics:', error);
    }
  };

  const runVarianceAnalysis = async () => {
    setIsRunningAnalysis(true);
    try {
      const newAlerts = await stockAlertsService.runVarianceAnalysis(storeId);
      
      if (newAlerts.length > 0) {
        toast.success(`${newAlerts.length} nouvelle(s) alerte(s) détectée(s)`);
        await loadAlerts();
        await loadAlertStatistics();
      } else {
        toast.info('Aucune nouvelle alerte détectée');
      }

    } catch (error) {
      console.error('Error running variance analysis:', error);
      toast.error('Erreur lors de l\'analyse des écarts');
    } finally {
      setIsRunningAnalysis(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await stockAlertsService.resolveAlert(alertId, 'current-user'); // In real app, get current user
      toast.success('Alerte résolue');
      await loadAlerts();
      await loadAlertStatistics();
      setSelectedAlert(null);
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast.error('Erreur lors de la résolution de l\'alerte');
    }
  };

  const getAlertIcon = (alert: EnrichedAlert) => {
    switch (alert.type) {
      case 'abnormal_loss':
        return <TrendingDown className="h-4 w-4" />;
      case 'unusual_flow':
        return <Activity className="h-4 w-4" />;
      case 'inventory_discrepancy':
        return <AlertTriangle className="h-4 w-4" />;
      case 'threshold_exceeded':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'Critique';
      case 'high':
        return 'Élevé';
      case 'medium':
        return 'Moyen';
      case 'low':
        return 'Faible';
      default:
        return severity;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'abnormal_loss':
        return 'Perte anormale';
      case 'unusual_flow':
        return 'Écoulement inhabituel';
      case 'inventory_discrepancy':
        return 'Écart d\'inventaire';
      case 'threshold_exceeded':
        return 'Seuil dépassé';
      default:
        return type;
    }
  };

  const formatVariance = (alert: EnrichedAlert) => {
    const { variance, variancePercentage } = alert.details;
    const sign = variance >= 0 ? '+' : '';
    return `${sign}${variance.toFixed(1)} (${sign}${variancePercentage.toFixed(1)}%)`;
  };

  const getTimeSinceDetection = (detectedAt: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - detectedAt.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `il y a ${diffHours}h${diffMinutes > 0 ? ` ${diffMinutes}min` : ''}`;
    } else {
      return `il y a ${diffMinutes}min`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Alertes d'Écarts Anormaux
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
            onClick={runVarianceAnalysis}
            disabled={isRunningAnalysis}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRunningAnalysis ? 'animate-spin' : ''}`} />
            Analyser
          </Button>
        </div>
      </div>

      {/* Statistics Summary */}
      {alertStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-slate-900">{alertStats.total}</div>
              <div className="text-sm text-slate-600">Alertes (30j)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {(alertStats.bySeverity.critical || 0) + (alertStats.bySeverity.high || 0)}
              </div>
              <div className="text-sm text-slate-600">Critiques/Élevées</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{alertStats.resolved}</div>
              <div className="text-sm text-slate-600">Résolues</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-slate-900">
                {alertStats.averageResolutionTime.toFixed(1)}h
              </div>
              <div className="text-sm text-slate-600">Temps moyen résolution</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Alertes Actives ({alerts.length})</span>
            {alerts.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length} prioritaires
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              Chargement des alertes...
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              Aucune alerte active
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                    alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                    alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-full ${
                        alert.severity === 'critical' ? 'bg-red-100 text-red-600' :
                        alert.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                        alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {getAlertIcon(alert)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-slate-900">{alert.title}</h3>
                          <Badge variant={getSeverityBadgeVariant(alert.severity)} className="text-xs">
                            {getSeverityLabel(alert.severity)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(alert.type)}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-700 mb-2">{alert.message}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          {alert.product && (
                            <span>Produit: {alert.product.name}</span>
                          )}
                          <span>Écart: {formatVariance(alert)}</span>
                          <span>{getTimeSinceDetection(alert.detectedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedAlert(alert)}
                          >
                            Détails
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              {getAlertIcon(alert)}
                              {alert.title}
                            </DialogTitle>
                          </DialogHeader>
                          {selectedAlert && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-slate-700">Type</label>
                                  <div className="text-sm text-slate-900">{getTypeLabel(selectedAlert.type)}</div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-slate-700">Sévérité</label>
                                  <div>
                                    <Badge variant={getSeverityBadgeVariant(selectedAlert.severity)}>
                                      {getSeverityLabel(selectedAlert.severity)}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-slate-700">Produit</label>
                                  <div className="text-sm text-slate-900">
                                    {selectedAlert.product ? selectedAlert.product.name : 'Tous les produits'}
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-slate-700">Détecté</label>
                                  <div className="text-sm text-slate-900">
                                    {selectedAlert.detectedAt.toLocaleString('fr-FR')}
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label className="text-sm font-medium text-slate-700 mb-2 block">Détails de l'écart</label>
                                <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-slate-600">Valeur actuelle:</span>
                                    <span className="text-sm font-medium text-slate-900">
                                      {selectedAlert.details.currentValue.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-slate-600">Valeur attendue:</span>
                                    <span className="text-sm font-medium text-slate-900">
                                      {selectedAlert.details.expectedValue.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-slate-600">Écart:</span>
                                    <span className={`text-sm font-medium ${
                                      selectedAlert.details.variance >= 0 ? 'text-red-600' : 'text-green-600'
                                    }`}>
                                      {formatVariance(selectedAlert)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-slate-600">Seuil d'alerte:</span>
                                    <span className="text-sm font-medium text-slate-900">
                                      {selectedAlert.details.threshold.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setSelectedAlert(null)}
                                >
                                  Fermer
                                </Button>
                                <Button
                                  onClick={() => resolveAlert(selectedAlert.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Marquer comme résolu
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resolveAlert(alert.id)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Actions d'Analyse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={runVarianceAnalysis}
              disabled={isRunningAnalysis}
            >
              <Activity className="h-4 w-4 mr-2" />
              Analyse complète
            </Button>
            <Button
              variant="outline"
              onClick={() => stockAlertsService.checkAbnormalLossRates(storeId)}
            >
              <TrendingDown className="h-4 w-4 mr-2" />
              Vérifier les pertes
            </Button>
            <Button
              variant="outline"
              onClick={() => stockAlertsService.checkUnusualFlowRates(storeId)}
            >
              <Activity className="h-4 w-4 mr-2" />
              Analyser l'écoulement
            </Button>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            L'analyse automatique s'exécute toutes les {Math.floor(refreshInterval / 60000)} minutes
          </div>
        </CardContent>
      </Card>
    </div>
  );
};