import { 
  StockLevel, 
  StockMovement, 
  ProductStock,
  BonReception,
  TransfertStock,
  Inventaire
} from '../types';

// Cache configuration
interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of cached items
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Simple in-memory cache with TTL and LRU eviction
class MemoryCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private accessOrder = new Map<string, number>();
  private accessCounter = 0;
  
  constructor(private config: CacheConfig) {}

  set(key: string, data: T, customTtl?: number): void {
    const ttl = customTtl || this.config.ttl;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };

    // Evict expired entries
    this.evictExpired();

    // Evict LRU entries if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
    this.accessOrder.set(key, ++this.accessCounter);
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.accessOrder.delete(key);
      return null;
    }

    // Update access order
    this.accessOrder.set(key, ++this.accessCounter);
    return entry.data;
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      this.accessOrder.clear();
      return;
    }

    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        this.accessOrder.delete(key);
      }
    }
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        this.accessOrder.delete(key);
      }
    }
  }

  private evictLRU(): void {
    let oldestKey = '';
    let oldestAccess = Infinity;

    for (const [key, accessTime] of this.accessOrder.entries()) {
      if (accessTime < oldestAccess) {
        oldestAccess = accessTime;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.accessOrder.delete(oldestKey);
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: this.accessCounter > 0 ? (this.cache.size / this.accessCounter) : 0
    };
  }
}

// Pagination interface
interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Optimized Stock Service
class OptimizedStockService {
  private stockLevelsCache = new MemoryCache<StockLevel[]>({
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 100
  });

  private stockMovementsCache = new MemoryCache<StockMovement[]>({
    ttl: 2 * 60 * 1000, // 2 minutes
    maxSize: 200
  });

  private stockSummaryCache = new MemoryCache<any>({
    ttl: 10 * 60 * 1000, // 10 minutes
    maxSize: 50
  });

  private valorisationCache = new MemoryCache<any>({
    ttl: 15 * 60 * 1000, // 15 minutes
    maxSize: 30
  });

  // Optimized stock levels retrieval with caching
  async getStockLevels(storeId: string, useCache: boolean = true): Promise<StockLevel[]> {
    const cacheKey = `stock_levels_${storeId}`;
    
    if (useCache) {
      const cached = this.stockLevelsCache.get(cacheKey);
      if (cached) return cached;
    }

    // In a real implementation, this would be a database query
    // For now, we'll simulate with the existing service
    const stockLevels = await this.fetchStockLevelsFromDB(storeId);
    
    if (useCache) {
      this.stockLevelsCache.set(cacheKey, stockLevels);
    }
    
    return stockLevels;
  }

  // Paginated stock movements with optimized queries
  async getStockMovementsPaginated(
    storeId: string, 
    params: PaginationParams,
    filters?: {
      productId?: string;
      type?: string;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ): Promise<PaginatedResult<StockMovement>> {
    const cacheKey = `movements_${storeId}_${JSON.stringify(params)}_${JSON.stringify(filters)}`;
    
    const cached = this.stockMovementsCache.get(cacheKey);
    if (cached) {
      return this.paginateArray(cached, params);
    }

    // Optimized database query with indexes
    const movements = await this.fetchStockMovementsFromDB(storeId, filters);
    
    this.stockMovementsCache.set(cacheKey, movements);
    
    return this.paginateArray(movements, params);
  }

  // Optimized valorisation calculations with caching
  async calculateStockValorisation(
    storeId: string, 
    method: 'fifo' | 'lifo' | 'average' = 'average'
  ): Promise<{
    totalValue: number;
    productBreakdown: Array<{
      productId: string;
      quantity: number;
      unitCost: number;
      totalValue: number;
    }>;
    calculatedAt: Date;
  }> {
    const cacheKey = `valorisation_${storeId}_${method}`;
    
    const cached = this.valorisationCache.get(cacheKey);
    if (cached) return cached;

    const stockLevels = await this.getStockLevels(storeId);
    const productBreakdown = [];
    let totalValue = 0;

    for (const level of stockLevels) {
      const unitCost = await this.calculateOptimizedUnitCost(level.productId, method);
      const productValue = level.quantity * unitCost;
      
      productBreakdown.push({
        productId: level.productId,
        quantity: level.quantity,
        unitCost,
        totalValue: productValue
      });
      
      totalValue += productValue;
    }

    const result = {
      totalValue,
      productBreakdown,
      calculatedAt: new Date()
    };

    this.valorisationCache.set(cacheKey, result);
    return result;
  }

  // Batch operations for better performance
  async batchUpdateStockLevels(updates: Array<{
    storeId: string;
    productId: string;
    quantityChange: number;
    reason: string;
  }>): Promise<void> {
    // Group updates by store for better performance
    const updatesByStore = updates.reduce((acc, update) => {
      if (!acc[update.storeId]) acc[update.storeId] = [];
      acc[update.storeId].push(update);
      return acc;
    }, {} as Record<string, typeof updates>);

    // Process updates in batches
    const promises = Object.entries(updatesByStore).map(([storeId, storeUpdates]) =>
      this.processBatchStockUpdates(storeId, storeUpdates)
    );

    await Promise.all(promises);

    // Invalidate relevant caches
    Object.keys(updatesByStore).forEach(storeId => {
      this.invalidateStockCaches(storeId);
    });
  }

  // Optimized stock alerts with smart thresholds
  async getStockAlerts(storeId: string): Promise<Array<{
    type: 'critical' | 'low' | 'overstock' | 'negative';
    productId: string;
    currentStock: number;
    threshold: number;
    daysOfStock?: number;
    priority: number;
  }>> {
    const cacheKey = `alerts_${storeId}`;
    
    const cached = this.stockSummaryCache.get(cacheKey);
    if (cached) return cached;

    const stockLevels = await this.getStockLevels(storeId);
    const alerts = [];

    for (const level of stockLevels) {
      // Calculate dynamic thresholds based on flow rate
      const flowRate = await this.calculateProductFlowRate(level.productId, storeId);
      const daysOfStock = flowRate > 0 ? level.availableQuantity / flowRate : Infinity;
      
      let alert = null;
      let priority = 0;

      if (level.quantity < 0) {
        alert = {
          type: 'negative' as const,
          productId: level.productId,
          currentStock: level.quantity,
          threshold: 0,
          priority: 10
        };
      } else if (daysOfStock <= 1) {
        alert = {
          type: 'critical' as const,
          productId: level.productId,
          currentStock: level.quantity,
          threshold: flowRate,
          daysOfStock,
          priority: 9
        };
      } else if (daysOfStock <= 3) {
        alert = {
          type: 'low' as const,
          productId: level.productId,
          currentStock: level.quantity,
          threshold: flowRate * 3,
          daysOfStock,
          priority: 5
        };
      } else if (daysOfStock > 30) {
        alert = {
          type: 'overstock' as const,
          productId: level.productId,
          currentStock: level.quantity,
          threshold: flowRate * 30,
          daysOfStock,
          priority: 2
        };
      }

      if (alert) alerts.push(alert);
    }

    // Sort by priority
    alerts.sort((a, b) => b.priority - a.priority);

    this.stockSummaryCache.set(cacheKey, alerts, 3 * 60 * 1000); // 3 minutes TTL
    return alerts;
  }

  // Performance monitoring
  getCacheStats() {
    return {
      stockLevels: this.stockLevelsCache.getStats(),
      stockMovements: this.stockMovementsCache.getStats(),
      stockSummary: this.stockSummaryCache.getStats(),
      valorisation: this.valorisationCache.getStats()
    };
  }

  // Cache management
  invalidateStockCaches(storeId?: string) {
    if (storeId) {
      this.stockLevelsCache.invalidate(`stock_levels_${storeId}`);
      this.stockMovementsCache.invalidate(`movements_${storeId}`);
      this.stockSummaryCache.invalidate(`alerts_${storeId}`);
      this.valorisationCache.invalidate(`valorisation_${storeId}`);
    } else {
      this.stockLevelsCache.invalidate();
      this.stockMovementsCache.invalidate();
      this.stockSummaryCache.invalidate();
      this.valorisationCache.invalidate();
    }
  }

  // Private helper methods
  private async fetchStockLevelsFromDB(storeId: string): Promise<StockLevel[]> {
    // This would be replaced with actual Supabase query using the optimized indexes
    // SELECT * FROM stock_levels WHERE store_id = $1 AND quantity > 0
    // ORDER BY last_updated DESC
    
    // For now, return mock data
    return [
      {
        storeId,
        productId: '1',
        quantity: 10,
        reservedQuantity: 2,
        availableQuantity: 8,
        lastUpdated: new Date()
      }
    ];
  }

  private async fetchStockMovementsFromDB(
    storeId: string, 
    filters?: any
  ): Promise<StockMovement[]> {
    // This would use the optimized indexes:
    // SELECT * FROM stock_movements 
    // WHERE store_id = $1 
    // AND ($2::text IS NULL OR product_id = $2)
    // AND ($3::text IS NULL OR type = $3)
    // AND date BETWEEN $4 AND $5
    // ORDER BY date DESC
    // LIMIT $6 OFFSET $7
    
    return [];
  }

  private paginateArray<T>(array: T[], params: PaginationParams): PaginatedResult<T> {
    const { page, limit, sortBy, sortOrder = 'desc' } = params;
    const offset = (page - 1) * limit;
    
    // Sort if needed
    let sortedArray = [...array];
    if (sortBy) {
      sortedArray.sort((a, b) => {
        const aVal = (a as any)[sortBy];
        const bVal = (b as any)[sortBy];
        const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    const data = sortedArray.slice(offset, offset + limit);
    const total = array.length;
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  private async calculateOptimizedUnitCost(
    productId: string, 
    method: 'fifo' | 'lifo' | 'average'
  ): Promise<number> {
    // This would implement optimized cost calculation based on method
    // Using indexed queries on stock_movements table
    return 0;
  }

  private async calculateProductFlowRate(productId: string, storeId: string): Promise<number> {
    // Calculate based on recent movements using indexed query
    return 1;
  }

  private async processBatchStockUpdates(
    storeId: string, 
    updates: Array<any>
  ): Promise<void> {
    // Process multiple updates in a single transaction
    // UPDATE stock_levels SET quantity = quantity + $1 WHERE store_id = $2 AND product_id = $3
  }
}

export const optimizedStockService = new OptimizedStockService();