import { DailySales } from '@/features/sales/types';

/**
 * Service for managing closing history and related operations
 * Handles retrieval, filtering, and analysis of daily sales closings
 */
export class ClosingHistoryService {
  private static instance: ClosingHistoryService;
  private closingHistory: DailySales[] = [];

  private constructor() {
    this.initializeMockData();
  }

  public static getInstance(): ClosingHistoryService {
    if (!ClosingHistoryService.instance) {
      ClosingHistoryService.instance = new ClosingHistoryService();
    }
    return ClosingHistoryService.instance;
  }

  /**
   * Initialize with mock data for development
   */
  private initializeMockData(): void {
    const now = new Date();
    
    // Generate mock closing history for the past 30 days
    this.closingHistory = Array.from({ length: 30 }, (_, index) => {
      const date = new Date(now.getTime() - (index * 24 * 60 * 60 * 1000));
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      // Skip some days randomly to simulate real business
      if (Math.random() < 0.1) return null;
      
      const baseTotal = isWeekend ? 15000 : 25000;
      const variation = (Math.random() - 0.5) * 0.4; // ±20% variation
      const total = Math.round(baseTotal * (1 + variation));
      
      const numEntries = Math.floor(Math.random() * 8) + 3; // 3-10 entries
      const entries = Array.from({ length: numEntries }, (_, entryIndex) => ({
        id: `entry-${date.getTime()}-${entryIndex}`,
        productId: ['1', '2', '3', '4'][Math.floor(Math.random() * 4)],
        product: {
          id: '1',
          name: 'Thon Rouge',
          unit: 'kg',
          unitPrice: 6500,
          category: 'Poisson',
          priceType: 'variable' as const,
          isActive: true,
          createdAt: new Date(),
          allowDecimals: true
        },
        quantity: Math.round((Math.random() * 3 + 0.5) * 100) / 100,
        unitPrice: Math.round((Math.random() * 2000 + 4000)),
        subtotal: Math.round(total / numEntries),
        date,
        storeId: 'store-1'
      }));

      return {
        id: `closing-${date.getTime()}`,
        date,
        storeId: 'store-1',
        entries,
        total,
        status: 'closed' as const,
        comments: Math.random() < 0.3 ? [
          'Journée normale',
          'Beaucoup de clients ce jour',
          'Promotion sur les crevettes',
          'Arrivage exceptionnel de thon',
          'Jour de marché - forte affluence'
        ][Math.floor(Math.random() * 5)] : undefined,
        isValidated: Math.random() < 0.8, // 80% validated
        validatedBy: Math.random() < 0.8 ? 'director-1' : undefined,
        validatedAt: Math.random() < 0.8 ? new Date(date.getTime() + 2 * 60 * 60 * 1000) : undefined,
        createdBy: `manager-${Math.floor(Math.random() * 3) + 1}`,
        createdAt: new Date(date.getTime() + 18 * 60 * 60 * 1000) // 6 PM closing
      };
    }).filter(Boolean) as DailySales[];
  }

  /**
   * Get closing history for a store with optional date filtering
   */
  public async getClosingHistory(
    storeId: string, 
    period: 'all' | 'week' | 'month' | 'quarter' = 'month'
  ): Promise<DailySales[]> {
    let filteredHistory = this.closingHistory.filter(closing => 
      closing.storeId === storeId || storeId === ''
    );

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1);
        break;
      default:
        startDate = new Date(0); // All time
    }

    if (period !== 'all') {
      filteredHistory = filteredHistory.filter(closing => 
        new Date(closing.date) >= startDate
      );
    }

    return filteredHistory.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  /**
   * Get closing by ID
   */
  public async getClosingById(closingId: string): Promise<DailySales | null> {
    return this.closingHistory.find(closing => closing.id === closingId) || null;
  }

  /**
   * Get closings for a specific date range
   */
  public async getClosingsByDateRange(
    storeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<DailySales[]> {
    return this.closingHistory
      .filter(closing => {
        const closingDate = new Date(closing.date);
        return (
          (closing.storeId === storeId || storeId === '') &&
          closingDate >= startDate &&
          closingDate <= endDate
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Get closing statistics for a period
   */
  public async getClosingStats(
    storeId: string,
    period: 'week' | 'month' | 'quarter' = 'month'
  ): Promise<{
    totalSales: number;
    averageDaily: number;
    totalDays: number;
    validatedCount: number;
    pendingCount: number;
    totalItems: number;
    topSellingDay: { date: Date; total: number } | null;
    trend: {
      current: number;
      previous: number;
      change: number;
      isPositive: boolean;
    } | null;
  }> {
    const closings = await this.getClosingHistory(storeId, period);
    
    if (closings.length === 0) {
      return {
        totalSales: 0,
        averageDaily: 0,
        totalDays: 0,
        validatedCount: 0,
        pendingCount: 0,
        totalItems: 0,
        topSellingDay: null,
        trend: null
      };
    }

    const totalSales = closings.reduce((sum, closing) => sum + closing.total, 0);
    const totalItems = closings.reduce((sum, closing) => sum + closing.entries.length, 0);
    const validatedCount = closings.filter(closing => closing.isValidated).length;
    const pendingCount = closings.length - validatedCount;

    // Find top selling day
    const topSellingDay = closings.reduce((top, closing) => {
      return !top || closing.total > top.total 
        ? { date: closing.date, total: closing.total }
        : top;
    }, null as { date: Date; total: number } | null);

    // Calculate trend (compare with previous period)
    let trend = null;
    try {
      const now = new Date();
      let previousStartDate: Date;
      let previousEndDate: Date;

      switch (period) {
        case 'week':
          previousEndDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          previousEndDate = new Date(currentMonth.getTime() - 1);
          previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          break;
        case 'quarter':
          const currentQuarter = Math.floor(now.getMonth() / 3) * 3;
          const currentQuarterStart = new Date(now.getFullYear(), currentQuarter, 1);
          previousEndDate = new Date(currentQuarterStart.getTime() - 1);
          previousStartDate = new Date(now.getFullYear(), currentQuarter - 3, 1);
          break;
      }

      const previousClosings = await this.getClosingsByDateRange(
        storeId, 
        previousStartDate, 
        previousEndDate
      );

      if (previousClosings.length > 0) {
        const previousTotal = previousClosings.reduce((sum, closing) => sum + closing.total, 0);
        const change = ((totalSales - previousTotal) / previousTotal) * 100;
        
        trend = {
          current: totalSales,
          previous: previousTotal,
          change: Math.round(change * 100) / 100,
          isPositive: change > 0
        };
      }
    } catch (error) {
      console.warn('Could not calculate trend:', error);
    }

    return {
      totalSales,
      averageDaily: Math.round(totalSales / closings.length),
      totalDays: closings.length,
      validatedCount,
      pendingCount,
      totalItems,
      topSellingDay,
      trend
    };
  }

  /**
   * Search closings by various criteria
   */
  public async searchClosings(
    storeId: string,
    searchCriteria: {
      query?: string;
      startDate?: Date;
      endDate?: Date;
      minAmount?: number;
      maxAmount?: number;
      isValidated?: boolean;
      createdBy?: string;
    }
  ): Promise<DailySales[]> {
    let results = this.closingHistory.filter(closing => 
      closing.storeId === storeId || storeId === ''
    );

    const { query, startDate, endDate, minAmount, maxAmount, isValidated, createdBy } = searchCriteria;

    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(closing =>
        closing.comments?.toLowerCase().includes(searchTerm) ||
        closing.createdBy.toLowerCase().includes(searchTerm) ||
        closing.id.toLowerCase().includes(searchTerm)
      );
    }

    if (startDate) {
      results = results.filter(closing => new Date(closing.date) >= startDate);
    }

    if (endDate) {
      results = results.filter(closing => new Date(closing.date) <= endDate);
    }

    if (minAmount !== undefined) {
      results = results.filter(closing => closing.total >= minAmount);
    }

    if (maxAmount !== undefined) {
      results = results.filter(closing => closing.total <= maxAmount);
    }

    if (isValidated !== undefined) {
      results = results.filter(closing => closing.isValidated === isValidated);
    }

    if (createdBy) {
      results = results.filter(closing => 
        closing.createdBy.toLowerCase().includes(createdBy.toLowerCase())
      );
    }

    return results.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  /**
   * Add a new closing to history
   */
  public async addClosing(closing: DailySales): Promise<void> {
    this.closingHistory.unshift(closing);
  }

  /**
   * Update an existing closing
   */
  public async updateClosing(closingId: string, updates: Partial<DailySales>): Promise<void> {
    const index = this.closingHistory.findIndex(closing => closing.id === closingId);
    if (index !== -1) {
      this.closingHistory[index] = { ...this.closingHistory[index], ...updates };
    }
  }

  /**
   * Get monthly summary for reporting
   */
  public async getMonthlySummary(storeId: string, year: number, month: number): Promise<{
    totalSales: number;
    totalDays: number;
    averageDaily: number;
    bestDay: { date: Date; total: number } | null;
    worstDay: { date: Date; total: number } | null;
    dailyBreakdown: Array<{ date: Date; total: number; items: number; isValidated: boolean }>;
  }> {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    const closings = await this.getClosingsByDateRange(storeId, startDate, endDate);
    
    if (closings.length === 0) {
      return {
        totalSales: 0,
        totalDays: 0,
        averageDaily: 0,
        bestDay: null,
        worstDay: null,
        dailyBreakdown: []
      };
    }

    const totalSales = closings.reduce((sum, closing) => sum + closing.total, 0);
    
    const bestDay = closings.reduce((best, closing) => 
      !best || closing.total > best.total 
        ? { date: closing.date, total: closing.total }
        : best
    , null as { date: Date; total: number } | null);

    const worstDay = closings.reduce((worst, closing) => 
      !worst || closing.total < worst.total 
        ? { date: closing.date, total: closing.total }
        : worst
    , null as { date: Date; total: number } | null);

    const dailyBreakdown = closings.map(closing => ({
      date: closing.date,
      total: closing.total,
      items: closing.entries.length,
      isValidated: closing.isValidated
    }));

    return {
      totalSales,
      totalDays: closings.length,
      averageDaily: Math.round(totalSales / closings.length),
      bestDay,
      worstDay,
      dailyBreakdown
    };
  }
}

// Export singleton instance
export const closingHistoryService = ClosingHistoryService.getInstance();