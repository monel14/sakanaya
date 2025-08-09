import { stockService } from './stockService';
import { notificationService } from './notificationService';

export interface StockVarianceAlert {
  id: string;
  type: 'abnormal_loss' | 'unusual_flow' | 'inventory_discrepancy' | 'threshold_exceeded';
  severity: 'low' | 'medium' | 'high' | 'critical';
  productId: string;
  storeId: string;
  title: string;
  message: string;
  details: {
    currentValue: number;
    expectedValue: number;
    variance: number;
    variancePercentage: number;
    threshold: number;
  };
  detectedAt: Date;
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

interface VarianceThresholds {
  lossRate: {
    warning: number; // percentage
    critical: number; // percentage
  };
  flowRate: {
    variancePercentage: number; // percentage change from average
  };
  dailyLoss: {
    multiplier: number; // times the average daily loss
  };
}

const DEFAULT_THRESHOLDS: VarianceThresholds = {
  lossRate: {
    warning: 10, // 10% loss rate triggers warning
    critical: 15 // 15% loss rate is critical
  },
  flowRate: {
    variancePercentage: 50 // 50% variance from normal flow rate
  },
  dailyLoss: {
    multiplier: 3 // 3x the average daily loss
  }
};

class StockAlertsService {
  private alerts: StockVarianceAlert[] = [];
  private thresholds: VarianceThresholds = DEFAULT_THRESHOLDS;

  constructor() {
    // Initialize with some mock alerts for testing
    this.initializeMockAlerts();
  }

  private initializeMockAlerts() {
    const now = new Date();
    
    this.alerts = [
      {
        id: 'alert-1',
        type: 'abnormal_loss',
        severity: 'high',
        productId: '1',
        storeId: 'store-1',
        title: 'Pertes anormalement élevées',
        message: 'Le taux de perte pour le Thon Rouge dépasse significativement la moyenne',
        details: {
          currentValue: 18.5,
          expectedValue: 8.2,
          variance: 10.3,
          variancePercentage: 125.6,
          threshold: 10
        },
        detectedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        isResolved: false
      },
      {
        id: 'alert-2',
        type: 'unusual_flow',
        severity: 'medium',
        productId: '2',
        storeId: 'store-1',
        title: 'Écoulement inhabituel',
        message: 'Le taux d\'écoulement des Crevettes Roses a chuté de 60% par rapport à la normale',
        details: {
          currentValue: 1.2,
          expectedValue: 3.0,
          variance: -1.8,
          variancePercentage: -60,
          threshold: 50
        },
        detectedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
        isResolved: false
      }
    ];
  }

  // Check for abnormal loss rates
  async checkAbnormalLossRates(storeId: string): Promise<StockVarianceAlert[]> {
    const alerts: StockVarianceAlert[] = [];
    
    try {
      // Get current week loss rate
      const currentReport = await stockService.calculateLossRates(storeId, 'week');
      
      // Check if loss rate exceeds thresholds
      if (currentReport.lossRate > this.thresholds.lossRate.critical) {
        alerts.push({
          id: `loss-critical-${Date.now()}`,
          type: 'abnormal_loss',
          severity: 'critical',
          productId: 'all',
          storeId,
          title: 'Taux de perte critique',
          message: `Le taux de perte hebdomadaire (${currentReport.lossRate.toFixed(1)}%) dépasse le seuil critique`,
          details: {
            currentValue: currentReport.lossRate,
            expectedValue: this.thresholds.lossRate.warning,
            variance: currentReport.lossRate - this.thresholds.lossRate.warning,
            variancePercentage: ((currentReport.lossRate - this.thresholds.lossRate.warning) / this.thresholds.lossRate.warning) * 100,
            threshold: this.thresholds.lossRate.critical
          },
          detectedAt: new Date(),
          isResolved: false
        });
      } else if (currentReport.lossRate > this.thresholds.lossRate.warning) {
        alerts.push({
          id: `loss-warning-${Date.now()}`,
          type: 'abnormal_loss',
          severity: 'medium',
          productId: 'all',
          storeId,
          title: 'Taux de perte élevé',
          message: `Le taux de perte hebdomadaire (${currentReport.lossRate.toFixed(1)}%) dépasse le seuil d'alerte`,
          details: {
            currentValue: currentReport.lossRate,
            expectedValue: this.thresholds.lossRate.warning,
            variance: currentReport.lossRate - this.thresholds.lossRate.warning,
            variancePercentage: ((currentReport.lossRate - this.thresholds.lossRate.warning) / this.thresholds.lossRate.warning) * 100,
            threshold: this.thresholds.lossRate.warning
          },
          detectedAt: new Date(),
          isResolved: false
        });
      }

      // Check for unusual loss patterns by category
      const totalLosses = currentReport.totalLosses;
      if (totalLosses > 0) {
        // Check if spoilage is abnormally high (>70% of total losses)
        const spoilagePercentage = (currentReport.lossBreakdown.spoilage / totalLosses) * 100;
        if (spoilagePercentage > 70) {
          alerts.push({
            id: `spoilage-high-${Date.now()}`,
            type: 'abnormal_loss',
            severity: 'high',
            productId: 'all',
            storeId,
            title: 'Avaries anormalement élevées',
            message: `Les avaries représentent ${spoilagePercentage.toFixed(1)}% des pertes totales`,
            details: {
              currentValue: spoilagePercentage,
              expectedValue: 50, // Expected normal spoilage rate
              variance: spoilagePercentage - 50,
              variancePercentage: ((spoilagePercentage - 50) / 50) * 100,
              threshold: 70
            },
            detectedAt: new Date(),
            isResolved: false
          });
        }
      }

    } catch (error) {
      console.error('Error checking abnormal loss rates:', error);
    }

    return alerts;
  }

  // Check for unusual flow rate patterns
  async checkUnusualFlowRates(storeId: string): Promise<StockVarianceAlert[]> {
    const alerts: StockVarianceAlert[] = [];
    
    try {
      const enrichedLevels = await stockService.getEnrichedStockLevels(storeId);
      
      for (const level of enrichedLevels) {
        // Calculate historical average flow rate (last 30 days)
        const historicalFlowRate = await this.calculateHistoricalFlowRate(storeId, level.productId, 30);
        
        if (historicalFlowRate > 0) {
          const currentFlowRate = level.flowRate;
          const variance = currentFlowRate - historicalFlowRate;
          const variancePercentage = (variance / historicalFlowRate) * 100;
          
          // Check if variance exceeds threshold
          if (Math.abs(variancePercentage) > this.thresholds.flowRate.variancePercentage) {
            const severity = Math.abs(variancePercentage) > 80 ? 'high' : 'medium';
            
            alerts.push({
              id: `flow-${level.productId}-${Date.now()}`,
              type: 'unusual_flow',
              severity,
              productId: level.productId,
              storeId,
              title: 'Écoulement inhabituel détecté',
              message: `Le taux d'écoulement a varié de ${Math.abs(variancePercentage).toFixed(1)}% par rapport à la normale`,
              details: {
                currentValue: currentFlowRate,
                expectedValue: historicalFlowRate,
                variance,
                variancePercentage,
                threshold: this.thresholds.flowRate.variancePercentage
              },
              detectedAt: new Date(),
              isResolved: false
            });
          }
        }
      }

    } catch (error) {
      console.error('Error checking unusual flow rates:', error);
    }

    return alerts;
  }

  // Check for excessive daily losses
  async checkExcessiveDailyLosses(storeId: string): Promise<StockVarianceAlert[]> {
    const alerts: StockVarianceAlert[] = [];
    
    try {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      
      // Get today's movements
      const todayMovements = await stockService.getStockMovements(storeId, [yesterday, today]);
      const todayLosses = todayMovements
        .filter(m => m.type === 'loss')
        .reduce((sum, m) => sum + Math.abs(m.quantity), 0);

      // Calculate average daily losses over the last 30 days
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const historicalMovements = await stockService.getStockMovements(storeId, [thirtyDaysAgo, yesterday]);
      const historicalLosses = historicalMovements
        .filter(m => m.type === 'loss')
        .reduce((sum, m) => sum + Math.abs(m.quantity), 0);
      
      const averageDailyLoss = historicalLosses / 30;
      const threshold = averageDailyLoss * this.thresholds.dailyLoss.multiplier;

      if (todayLosses > threshold && averageDailyLoss > 0) {
        const variancePercentage = ((todayLosses - averageDailyLoss) / averageDailyLoss) * 100;
        
        alerts.push({
          id: `daily-loss-${Date.now()}`,
          type: 'abnormal_loss',
          severity: todayLosses > threshold * 1.5 ? 'critical' : 'high',
          productId: 'all',
          storeId,
          title: 'Pertes journalières excessives',
          message: `Les pertes d'aujourd'hui (${todayLosses.toFixed(1)} unités) dépassent ${this.thresholds.dailyLoss.multiplier}x la moyenne`,
          details: {
            currentValue: todayLosses,
            expectedValue: averageDailyLoss,
            variance: todayLosses - averageDailyLoss,
            variancePercentage,
            threshold
          },
          detectedAt: new Date(),
          isResolved: false
        });
      }

    } catch (error) {
      console.error('Error checking excessive daily losses:', error);
    }

    return alerts;
  }

  // Calculate historical flow rate for comparison
  private async calculateHistoricalFlowRate(storeId: string, productId: string, days: number): Promise<number> {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 7); // Exclude last 7 days to avoid current period bias
    
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);
    
    const movements = await stockService.getStockMovements(storeId, [startDate, endDate]);
    const productMovements = movements.filter(m => m.productId === productId);
    
    const totalOutflow = productMovements
      .filter(m => m.type === 'loss' || m.quantity < 0)
      .reduce((sum, m) => sum + Math.abs(m.quantity), 0);
    
    return totalOutflow / days;
  }

  // Run comprehensive variance analysis
  async runVarianceAnalysis(storeId: string): Promise<StockVarianceAlert[]> {
    const [lossRateAlerts, flowRateAlerts, dailyLossAlerts] = await Promise.all([
      this.checkAbnormalLossRates(storeId),
      this.checkUnusualFlowRates(storeId),
      this.checkExcessiveDailyLosses(storeId)
    ]);

    const newAlerts = [...lossRateAlerts, ...flowRateAlerts, ...dailyLossAlerts];
    
    // Add new alerts to the collection
    for (const alert of newAlerts) {
      // Check if similar alert already exists
      const existingAlert = this.alerts.find(a => 
        a.type === alert.type && 
        a.productId === alert.productId && 
        a.storeId === alert.storeId &&
        !a.isResolved
      );
      
      if (!existingAlert) {
        this.alerts.push(alert);
        
        // Send notification for high and critical alerts
        if (alert.severity === 'high' || alert.severity === 'critical') {
          await this.sendAlertNotification(alert);
        }
      }
    }

    return newAlerts;
  }

  // Send notification for alert
  private async sendAlertNotification(alert: StockVarianceAlert) {
    try {
      await notificationService.sendStockAlert(
        alert.type === 'abnormal_loss' ? 'high_loss' : 'low_stock',
        alert.productId !== 'all' ? `Produit ${alert.productId}` : 'Tous les produits',
        alert.storeId,
        {
          title: alert.title,
          message: alert.message,
          severity: alert.severity,
          details: alert.details
        }
      );
    } catch (error) {
      console.error('Error sending alert notification:', error);
    }
  }

  // Get all active alerts for a store
  async getActiveAlerts(storeId: string): Promise<StockVarianceAlert[]> {
    return this.alerts.filter(alert => 
      alert.storeId === storeId && !alert.isResolved
    ).sort((a, b) => {
      // Sort by severity (critical first) then by detection time
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const aSeverity = severityOrder[a.severity];
      const bSeverity = severityOrder[b.severity];
      
      if (aSeverity !== bSeverity) {
        return aSeverity - bSeverity;
      }
      
      return b.detectedAt.getTime() - a.detectedAt.getTime();
    });
  }

  // Resolve an alert
  async resolveAlert(alertId: string, resolvedBy: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isResolved = true;
      alert.resolvedAt = new Date();
      alert.resolvedBy = resolvedBy;
    }
  }

  // Get alert statistics
  async getAlertStatistics(storeId: string, days: number = 30): Promise<{
    total: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
    resolved: number;
    averageResolutionTime: number; // in hours
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const relevantAlerts = this.alerts.filter(alert => 
      alert.storeId === storeId && alert.detectedAt >= cutoffDate
    );

    const bySeverity = relevantAlerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byType = relevantAlerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const resolvedAlerts = relevantAlerts.filter(alert => alert.isResolved);
    const totalResolutionTime = resolvedAlerts.reduce((sum, alert) => {
      if (alert.resolvedAt) {
        return sum + (alert.resolvedAt.getTime() - alert.detectedAt.getTime());
      }
      return sum;
    }, 0);

    const averageResolutionTime = resolvedAlerts.length > 0 
      ? totalResolutionTime / resolvedAlerts.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    return {
      total: relevantAlerts.length,
      bySeverity,
      byType,
      resolved: resolvedAlerts.length,
      averageResolutionTime
    };
  }

  // Update thresholds
  updateThresholds(newThresholds: Partial<VarianceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  // Get current thresholds
  getThresholds(): VarianceThresholds {
    return { ...this.thresholds };
  }
}

export const stockAlertsService = new StockAlertsService();