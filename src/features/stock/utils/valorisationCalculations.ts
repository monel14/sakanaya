import { StockMovement, StockLevel } from '@/features/stock/types';

// Valorisation methods
export type ValorisationMethod = 'fifo' | 'lifo' | 'average' | 'standard';

interface StockEntry {
  date: Date;
  quantity: number;
  unitCost: number;
  remainingQuantity: number;
}

interface ValorisationResult {
  method: ValorisationMethod;
  totalValue: number;
  averageUnitCost: number;
  productBreakdown: ProductValorisation[];
  calculatedAt: Date;
  metadata: {
    totalQuantity: number;
    entriesProcessed: number;
    calculationTime: number;
  };
}

interface ProductValorisation {
  productId: string;
  quantity: number;
  unitCost: number;
  totalValue: number;
  entries?: StockEntry[];
}

// Optimized FIFO calculation
export function calculateFIFOValorisation(
  stockLevel: StockLevel,
  stockEntries: StockEntry[]
): ProductValorisation {
  const startTime = performance.now();
  
  // Sort entries by date (oldest first)
  const sortedEntries = [...stockEntries].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  let remainingQuantity = stockLevel.quantity;
  let totalValue = 0;
  const usedEntries: StockEntry[] = [];
  
  for (const entry of sortedEntries) {
    if (remainingQuantity <= 0) break;
    
    const quantityToUse = Math.min(remainingQuantity, entry.remainingQuantity);
    const entryValue = quantityToUse * entry.unitCost;
    
    totalValue += entryValue;
    remainingQuantity -= quantityToUse;
    
    usedEntries.push({
      ...entry,
      remainingQuantity: quantityToUse
    });
  }
  
  const averageUnitCost = stockLevel.quantity > 0 ? totalValue / stockLevel.quantity : 0;
  
  return {
    productId: stockLevel.productId,
    quantity: stockLevel.quantity,
    unitCost: averageUnitCost,
    totalValue,
    entries: usedEntries
  };
}

// Optimized LIFO calculation
export function calculateLIFOValorisation(
  stockLevel: StockLevel,
  stockEntries: StockEntry[]
): ProductValorisation {
  // Sort entries by date (newest first)
  const sortedEntries = [...stockEntries].sort((a, b) => b.date.getTime() - a.date.getTime());
  
  let remainingQuantity = stockLevel.quantity;
  let totalValue = 0;
  const usedEntries: StockEntry[] = [];
  
  for (const entry of sortedEntries) {
    if (remainingQuantity <= 0) break;
    
    const quantityToUse = Math.min(remainingQuantity, entry.remainingQuantity);
    const entryValue = quantityToUse * entry.unitCost;
    
    totalValue += entryValue;
    remainingQuantity -= quantityToUse;
    
    usedEntries.push({
      ...entry,
      remainingQuantity: quantityToUse
    });
  }
  
  const averageUnitCost = stockLevel.quantity > 0 ? totalValue / stockLevel.quantity : 0;
  
  return {
    productId: stockLevel.productId,
    quantity: stockLevel.quantity,
    unitCost: averageUnitCost,
    totalValue,
    entries: usedEntries
  };
}

// Optimized weighted average calculation
export function calculateAverageValorisation(
  stockLevel: StockLevel,
  stockEntries: StockEntry[]
): ProductValorisation {
  let totalQuantity = 0;
  let totalValue = 0;
  
  for (const entry of stockEntries) {
    totalQuantity += entry.remainingQuantity;
    totalValue += entry.remainingQuantity * entry.unitCost;
  }
  
  const averageUnitCost = totalQuantity > 0 ? totalValue / totalQuantity : 0;
  const stockValue = stockLevel.quantity * averageUnitCost;
  
  return {
    productId: stockLevel.productId,
    quantity: stockLevel.quantity,
    unitCost: averageUnitCost,
    totalValue: stockValue,
    entries: stockEntries
  };
}

// Batch valorisation calculation for multiple products
export async function calculateBatchValorisation(
  stockLevels: StockLevel[],
  getStockEntries: (productId: string) => Promise<StockEntry[]>,
  method: ValorisationMethod = 'average'
): Promise<ValorisationResult> {
  const startTime = performance.now();
  const productBreakdown: ProductValorisation[] = [];
  let totalValue = 0;
  let totalQuantity = 0;
  let entriesProcessed = 0;

  // Process products in batches for better performance
  const batchSize = 10;
  const batches = [];
  
  for (let i = 0; i < stockLevels.length; i += batchSize) {
    batches.push(stockLevels.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    const batchPromises = batch.map(async (stockLevel) => {
      const stockEntries = await getStockEntries(stockLevel.productId);
      entriesProcessed += stockEntries.length;
      
      let productValorisation: ProductValorisation;
      
      switch (method) {
        case 'fifo':
          productValorisation = calculateFIFOValorisation(stockLevel, stockEntries);
          break;
        case 'lifo':
          productValorisation = calculateLIFOValorisation(stockLevel, stockEntries);
          break;
        case 'average':
          productValorisation = calculateAverageValorisation(stockLevel, stockEntries);
          break;
        default:
          productValorisation = calculateAverageValorisation(stockLevel, stockEntries);
      }
      
      return productValorisation;
    });

    const batchResults = await Promise.all(batchPromises);
    productBreakdown.push(...batchResults);
  }

  // Calculate totals
  for (const product of productBreakdown) {
    totalValue += product.totalValue;
    totalQuantity += product.quantity;
  }

  const averageUnitCost = totalQuantity > 0 ? totalValue / totalQuantity : 0;
  const calculationTime = performance.now() - startTime;

  return {
    method,
    totalValue,
    averageUnitCost,
    productBreakdown,
    calculatedAt: new Date(),
    metadata: {
      totalQuantity,
      entriesProcessed,
      calculationTime
    }
  };
}

// Optimized stock entries builder from movements
export function buildStockEntriesFromMovements(
  movements: StockMovement[],
  currentQuantity: number
): StockEntry[] {
  // Filter and sort arrival movements
  const arrivals = movements
    .filter(m => m.type === 'arrival' && m.quantity > 0)
    .sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime());

  // Filter and sort exit movements
  const exits = movements
    .filter(m => (m.type === 'loss' || m.type === 'transfer') && m.quantity < 0)
    .sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime());

  // Build stock entries with remaining quantities
  const stockEntries: StockEntry[] = [];
  let totalExits = Math.abs(exits.reduce((sum, m) => sum + m.quantity, 0));
  let remainingExits = totalExits;

  for (const arrival of arrivals) {
    const unitCost = (arrival as any).unitCost || 0; // Assuming unitCost is available
    let remainingQuantity = arrival.quantity;

    // Reduce by exits (FIFO consumption)
    if (remainingExits > 0) {
      const consumedQuantity = Math.min(remainingQuantity, remainingExits);
      remainingQuantity -= consumedQuantity;
      remainingExits -= consumedQuantity;
    }

    if (remainingQuantity > 0) {
      stockEntries.push({
        date: arrival.recordedAt,
        quantity: arrival.quantity,
        unitCost,
        remainingQuantity
      });
    }
  }

  return stockEntries;
}

// Performance monitoring for valorisation calculations
export class ValorisationPerformanceMonitor {
  private static calculations: Array<{
    method: ValorisationMethod;
    productsCount: number;
    calculationTime: number;
    timestamp: Date;
  }> = [];

  static recordCalculation(
    method: ValorisationMethod,
    productsCount: number,
    calculationTime: number
  ) {
    this.calculations.push({
      method,
      productsCount,
      calculationTime,
      timestamp: new Date()
    });

    // Keep only last 100 calculations
    if (this.calculations.length > 100) {
      this.calculations = this.calculations.slice(-100);
    }
  }

  static getPerformanceStats() {
    if (this.calculations.length === 0) {
      return null;
    }

    const byMethod = this.calculations.reduce((acc, calc) => {
      if (!acc[calc.method]) {
        acc[calc.method] = {
          count: 0,
          totalTime: 0,
          avgTime: 0,
          avgProducts: 0
        };
      }

      acc[calc.method].count++;
      acc[calc.method].totalTime += calc.calculationTime;
      acc[calc.method].avgTime = acc[calc.method].totalTime / acc[calc.method].count;
      acc[calc.method].avgProducts += calc.productsCount / acc[calc.method].count;

      return acc;
    }, {} as Record<ValorisationMethod, any>);

    return {
      totalCalculations: this.calculations.length,
      byMethod,
      lastCalculation: this.calculations[this.calculations.length - 1]
    };
  }

  static clearStats() {
    this.calculations = [];
  }
}

// Utility for comparing valorisation methods
export async function compareValorisationMethods(
  stockLevels: StockLevel[],
  getStockEntries: (productId: string) => Promise<StockEntry[]>
): Promise<{
  fifo: ValorisationResult;
  lifo: ValorisationResult;
  average: ValorisationResult;
  comparison: {
    totalValueDifference: {
      fifoVsLifo: number;
      fifoVsAverage: number;
      lifoVsAverage: number;
    };
    performanceComparison: {
      fastest: ValorisationMethod;
      slowest: ValorisationMethod;
    };
  };
}> {
  const [fifo, lifo, average] = await Promise.all([
    calculateBatchValorisation(stockLevels, getStockEntries, 'fifo'),
    calculateBatchValorisation(stockLevels, getStockEntries, 'lifo'),
    calculateBatchValorisation(stockLevels, getStockEntries, 'average')
  ]);

  // Calculate differences
  const totalValueDifference = {
    fifoVsLifo: fifo.totalValue - lifo.totalValue,
    fifoVsAverage: fifo.totalValue - average.totalValue,
    lifoVsAverage: lifo.totalValue - average.totalValue
  };

  // Performance comparison
  const methods = [
    { method: 'fifo' as const, time: fifo.metadata.calculationTime },
    { method: 'lifo' as const, time: lifo.metadata.calculationTime },
    { method: 'average' as const, time: average.metadata.calculationTime }
  ];

  methods.sort((a, b) => a.time - b.time);

  return {
    fifo,
    lifo,
    average,
    comparison: {
      totalValueDifference,
      performanceComparison: {
        fastest: methods[0].method,
        slowest: methods[methods.length - 1].method
      }
    }
  };
}