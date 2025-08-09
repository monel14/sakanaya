import { 
  CostAnalysisData, 
  CostAnalysisReport, 
  StoreComparison, 
  TimeSeriesData, 
  CostBreakdown,
  CostKPIs 
} from '../../features/dashboard/types/costAnalysis';

class CostAnalysisService {
  /**
   * Calculate cost breakdown for a store in a given period
   */
  async calculateCostBreakdown(
    _storeId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<CostBreakdown> {
    // Mock data - in real implementation, this would fetch from actual data sources
    const mockPurchases = Math.random() * 500000 + 200000; // 200k-700k CFA
    const mockSalaries = await this.calculateSalaryCosts(_storeId, startDate, endDate);
    const mockLosses = await this.calculateLossCosts(_storeId, startDate, endDate);
    
    const total = mockPurchases + mockSalaries + mockLosses;
    
    return {
      purchases: mockPurchases,
      salaries: mockSalaries,
      losses: mockLosses,
      total
    };
  }

  /**
   * Calculate salary costs for a store in a given period
   */
  private async calculateSalaryCosts(
    _storeId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<number> {
    // Mock calculation - in real implementation, would sum PayrollSummary data
    const monthsDiff = this.getMonthsDifference(startDate, endDate);
    const baseMonthlySalary = Math.random() * 200000 + 150000; // 150k-350k CFA per month
    return baseMonthlySalary * monthsDiff;
  }

  /**
   * Calculate loss costs for a store in a given period
   */
  private async calculateLossCosts(
    _storeId: string, 
    _startDate: Date, 
    _endDate: Date
  ): Promise<number> {
    // Mock calculation - in real implementation, would sum StockMovement losses
    const mockLossValue = Math.random() * 50000 + 10000; // 10k-60k CFA
    return mockLossValue;
  }

  /**
   * Calculate revenue for a store in a given period
   */
  private async calculateRevenue(
    _storeId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<number> {
    // Mock calculation - in real implementation, would sum DailySales data
    const daysDiff = this.getDaysDifference(startDate, endDate);
    const avgDailyRevenue = Math.random() * 50000 + 30000; // 30k-80k CFA per day
    return avgDailyRevenue * daysDiff;
  }

  /**
   * Generate cost analysis data for a specific store
   */
  async generateStoreAnalysis(
    storeId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<CostAnalysisData> {
    const revenue = await this.calculateRevenue(storeId, startDate, endDate);
    const costs = await this.calculateCostBreakdown(storeId, startDate, endDate);
    
    // Calculate ratios
    const salaryCostRatio = revenue > 0 ? (costs.salaries / revenue) * 100 : 0;
    const lossRate = revenue > 0 ? (costs.losses / revenue) * 100 : 0;
    const grossMargin = revenue - costs.purchases;
    const profitMargin = revenue - costs.total;
    
    return {
      storeId,
      period: { start: startDate, end: endDate },
      revenue,
      costs,
      ratios: {
        salaryCostRatio,
        lossRate,
        grossMargin,
        profitMargin
      },
      calculatedAt: new Date()
    };
  }

  /**
   * Generate store comparison data
   */
  async generateStoreComparisons(
    storeIds: string[], 
    startDate: Date, 
    endDate: Date
  ): Promise<StoreComparison[]> {
    const comparisons: StoreComparison[] = [];
    
    for (const storeId of storeIds) {
      const analysis = await this.generateStoreAnalysis(storeId, startDate, endDate);
      
      // Mock store name - in real implementation, would fetch from store service
      const storeName = `Magasin ${storeId.slice(-3)}`;
      
      comparisons.push({
        storeId,
        storeName,
        revenue: analysis.revenue,
        costs: analysis.costs,
        ratios: analysis.ratios
      });
    }
    
    return comparisons;
  }

  /**
   * Generate time series data for trend analysis
   */
  async generateTimeSeriesData(
    storeId: string, 
    startDate: Date, 
    endDate: Date,
    interval: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): Promise<TimeSeriesData[]> {
    const timeSeriesData: TimeSeriesData[] = [];
    const dates = this.generateDateRange(startDate, endDate, interval);
    
    for (let i = 0; i < dates.length - 1; i++) {
      const periodStart = dates[i];
      const periodEnd = dates[i + 1];
      
      const analysis = await this.generateStoreAnalysis(storeId, periodStart, periodEnd);
      
      timeSeriesData.push({
        date: periodStart,
        revenue: analysis.revenue,
        costs: analysis.costs,
        ratios: analysis.ratios
      });
    }
    
    return timeSeriesData;
  }

  /**
   * Generate comprehensive cost analysis report
   */
  async generateCostAnalysisReport(
    storeIds: string[], 
    startDate: Date, 
    endDate: Date
  ): Promise<CostAnalysisReport> {
    // Generate global data (aggregated across all stores)
    const storeAnalyses = await Promise.all(
      storeIds.map(id => this.generateStoreAnalysis(id, startDate, endDate))
    );
    
    const globalRevenue = storeAnalyses.reduce((sum, analysis) => sum + analysis.revenue, 0);
    const globalCosts: CostBreakdown = {
      purchases: storeAnalyses.reduce((sum, analysis) => sum + analysis.costs.purchases, 0),
      salaries: storeAnalyses.reduce((sum, analysis) => sum + analysis.costs.salaries, 0),
      losses: storeAnalyses.reduce((sum, analysis) => sum + analysis.costs.losses, 0),
      total: storeAnalyses.reduce((sum, analysis) => sum + analysis.costs.total, 0)
    };
    
    const globalData: CostAnalysisData = {
      storeId: 'global',
      period: { start: startDate, end: endDate },
      revenue: globalRevenue,
      costs: globalCosts,
      ratios: {
        salaryCostRatio: globalRevenue > 0 ? (globalCosts.salaries / globalRevenue) * 100 : 0,
        lossRate: globalRevenue > 0 ? (globalCosts.losses / globalRevenue) * 100 : 0,
        grossMargin: globalRevenue - globalCosts.purchases,
        profitMargin: globalRevenue - globalCosts.total
      },
      calculatedAt: new Date()
    };
    
    // Generate store comparisons
    const storeComparisons = await this.generateStoreComparisons(storeIds, startDate, endDate);
    
    // Generate time series data (using first store as example)
    const timeSeriesData = storeIds.length > 0 
      ? await this.generateTimeSeriesData(storeIds[0], startDate, endDate)
      : [];
    
    // Generate insights
    const bestStore = storeComparisons.reduce((best, current) => 
      current.ratios.profitMargin > best.ratios.profitMargin ? current : best
    );
    
    const worstStore = storeComparisons.reduce((worst, current) => 
      current.ratios.profitMargin < worst.ratios.profitMargin ? current : worst
    );
    
    const avgSalaryCostRatio = storeComparisons.reduce((sum, store) => 
      sum + store.ratios.salaryCostRatio, 0) / storeComparisons.length;
    
    const avgLossRate = storeComparisons.reduce((sum, store) => 
      sum + store.ratios.lossRate, 0) / storeComparisons.length;
    
    // Analyze trends (simplified)
    const revenueTrend = this.analyzeTrend(timeSeriesData.map(d => d.revenue));
    const costsTrend = this.analyzeTrend(timeSeriesData.map(d => d.costs.total));
    const profitabilityTrend = this.analyzeProfitabilityTrend(timeSeriesData.map(d => d.ratios.profitMargin));
    
    return {
      period: { start: startDate, end: endDate },
      globalData,
      storeComparisons,
      timeSeriesData,
      insights: {
        bestPerformingStore: bestStore.storeId,
        worstPerformingStore: worstStore.storeId,
        averageSalaryCostRatio: avgSalaryCostRatio,
        averageLossRate: avgLossRate,
        trends: {
          revenue: revenueTrend,
          costs: costsTrend,
          profitability: profitabilityTrend
        }
      },
      generatedAt: new Date()
    };
  }

  /**
   * Get key performance indicators for cost analysis
   */
  async getCostKPIs(storeIds: string[], startDate: Date, endDate: Date): Promise<CostKPIs> {
    const report = await this.generateCostAnalysisReport(storeIds, startDate, endDate);
    
    const bestStore = report.storeComparisons.find(s => s.storeId === report.insights.bestPerformingStore);
    const worstStore = report.storeComparisons.find(s => s.storeId === report.insights.worstPerformingStore);
    
    return {
      totalRevenue: report.globalData.revenue,
      totalCosts: report.globalData.costs.total,
      averageSalaryCostRatio: report.insights.averageSalaryCostRatio,
      averageLossRate: report.insights.averageLossRate,
      bestStore: {
        id: bestStore?.storeId || '',
        name: bestStore?.storeName || '',
        profitMargin: bestStore?.ratios.profitMargin || 0
      },
      worstStore: {
        id: worstStore?.storeId || '',
        name: worstStore?.storeName || '',
        profitMargin: worstStore?.ratios.profitMargin || 0
      }
    };
  }

  // Utility methods
  private getMonthsDifference(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
  }

  private getDaysDifference(startDate: Date, endDate: Date): number {
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  private generateDateRange(
    startDate: Date, 
    endDate: Date, 
    interval: 'daily' | 'weekly' | 'monthly'
  ): Date[] {
    const dates: Date[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      dates.push(new Date(current));
      
      switch (interval) {
        case 'daily':
          current.setDate(current.getDate() + 1);
          break;
        case 'weekly':
          current.setDate(current.getDate() + 7);
          break;
        case 'monthly':
          current.setMonth(current.getMonth() + 1);
          break;
      }
    }
    
    dates.push(new Date(endDate));
    return dates;
  }

  private analyzeTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (changePercent > 5) return 'increasing';
    if (changePercent < -5) return 'decreasing';
    return 'stable';
  }

  private analyzeProfitabilityTrend(values: number[]): 'improving' | 'declining' | 'stable' {
    if (values.length < 2) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const changePercent = ((secondAvg - firstAvg) / Math.abs(firstAvg)) * 100;
    
    if (changePercent > 5) return 'improving';
    if (changePercent < -5) return 'declining';
    return 'stable';
  }
}

export const costAnalysisService = new CostAnalysisService();