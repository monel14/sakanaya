import React from 'react';
import { AlertTriangle, TrendingDown, TrendingUp, Package } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '../../../shared/components/ui';
import { StockAlert } from '../hooks/useStockLevels';

interface StockAlertsProps {
  alerts: StockAlert[];
  maxVisible?: number;
  showTitle?: boolean;
  compact?: boolean;
}

export const StockAlerts: React.FC<StockAlertsProps> = ({ 
  alerts, 
  maxVisible = 5,
  showTitle = true,
  compact = false 
}) => {
  if (alerts.length === 0) {
    return null;
  }

  const getAlertIcon = (type: StockAlert['type']) => {
    switch (type) {
      case 'critical_stock':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'low_stock':
        return <TrendingDown className="h-4 w-4 text-orange-600" />;
      case 'overstock':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      default:
        return <Package className="h-4 w-4 text-slate-600" />;
    }
  };

  const getAlertBadgeVariant = (type: StockAlert['type']) => {
    switch (type) {
      case 'critical_stock':
        return 'destructive';
      case 'low_stock':
        return 'secondary';
      case 'overstock':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getAlertTypeLabel = (type: StockAlert['type']) => {
    switch (type) {
      case 'critical_stock':
        return 'Critique';
      case 'low_stock':
        return 'Faible';
      case 'overstock':
        return 'Surstock';
      default:
        return 'Alerte';
    }
  };

  const getAlertPriority = (type: StockAlert['type']) => {
    switch (type) {
      case 'critical_stock':
        return 0;
      case 'low_stock':
        return 1;
      case 'overstock':
        return 2;
      default:
        return 3;
    }
  };

  // Sort alerts by priority (critical first)
  const sortedAlerts = [...alerts].sort((a, b) => 
    getAlertPriority(a.type) - getAlertPriority(b.type)
  );

  const visibleAlerts = sortedAlerts.slice(0, maxVisible);
  const hiddenCount = sortedAlerts.length - maxVisible;

  if (compact) {
    return (
      <div className="space-y-2">
        {visibleAlerts.map((alert) => (
          <div 
            key={`${alert.productId}-${alert.type}`}
            className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg"
          >
            {getAlertIcon(alert.type)}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-900 truncate">
                {alert.productName}
              </div>
              <div className="text-xs text-slate-600">
                {alert.currentStock} unités
              </div>
            </div>
            <Badge variant={getAlertBadgeVariant(alert.type)} className="text-xs">
              {getAlertTypeLabel(alert.type)}
            </Badge>
          </div>
        ))}
        {hiddenCount > 0 && (
          <div className="text-xs text-slate-500 text-center py-1">
            +{hiddenCount} autre{hiddenCount > 1 ? 's' : ''} alerte{hiddenCount > 1 ? 's' : ''}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      {showTitle && (
        <CardHeader className="pb-3">
          <CardTitle className="text-orange-800 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertes Stock ({alerts.length})
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={showTitle ? '' : 'pt-6'}>
        <div className="space-y-3">
          {visibleAlerts.map((alert) => (
            <div 
              key={`${alert.productId}-${alert.type}`}
              className="flex items-start gap-3 p-3 bg-white rounded-lg border border-orange-200"
            >
              {getAlertIcon(alert.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-slate-900">
                    {alert.productName}
                  </span>
                  <Badge variant={getAlertBadgeVariant(alert.type)} className="text-xs">
                    {getAlertTypeLabel(alert.type)}
                  </Badge>
                </div>
                <div className="text-sm text-slate-700">
                  {alert.message}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Stock actuel: {alert.currentStock} unités
                </div>
              </div>
            </div>
          ))}
          
          {hiddenCount > 0 && (
            <div className="text-sm text-orange-600 font-medium text-center py-2 border-t border-orange-200">
              ... et {hiddenCount} autre{hiddenCount > 1 ? 's' : ''} alerte{hiddenCount > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};