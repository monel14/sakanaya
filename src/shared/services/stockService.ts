import { 
  StockMovement, 
  StockLevel, 
  LossRateReport, 
  StockMovementSchema, 
  StockLevelSchema,
  MouvementStock,
  ProductStock,
  BonReception,
  TransfertStock
} from '@/features/stock/types';
import { calculateCUMP, calculateStockValue } from '@/features/stock/utils/stockCalculations';

class StockService {
  private stockMovements: StockMovement[] = [];
  private stockLevels: StockLevel[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize some mock stock levels for testing with new structure
    this.stockLevels = [
      {
        storeId: 'store-1',
        productId: '1', // Thon Rouge
        quantity: 5.5,
        reservedQuantity: 0,
        availableQuantity: 5.5,
        lastUpdated: new Date()
      },
      {
        storeId: 'store-1',
        productId: '2', // Crevettes Roses
        quantity: 12.0,
        reservedQuantity: 2.0,
        availableQuantity: 10.0,
        lastUpdated: new Date()
      },
      {
        storeId: 'store-1',
        productId: '3', // Soles
        quantity: 2.0,
        reservedQuantity: 0,
        availableQuantity: 2.0,
        lastUpdated: new Date()
      },
      {
        storeId: 'store-1',
        productId: '4', // Pack Sardines
        quantity: 25,
        reservedQuantity: 5,
        availableQuantity: 20,
        lastUpdated: new Date()
      }
    ];

    // Initialize some mock movements for flow rate calculation
    const now = new Date();
    const movements: StockMovement[] = [];

    // Generate some historical movements for the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      
      // Add some arrivals
      if (i % 7 === 0) { // Weekly arrivals
        movements.push({
          id: `arrival-${i}-1`,
          type: 'arrival',
          productId: '1',
          storeId: 'store-1',
          quantity: 20,
          reason: 'Livraison hebdomadaire',
          recordedBy: 'manager-1',
          recordedAt: date
        });
        
        movements.push({
          id: `arrival-${i}-2`,
          type: 'arrival',
          productId: '2',
          storeId: 'store-1',
          quantity: 15,
          reason: 'Livraison hebdomadaire',
          recordedBy: 'manager-1',
          recordedAt: date
        });
      }

      // Add some daily losses (simulating sales and waste)
      movements.push({
        id: `loss-${i}-1`,
        type: 'loss',
        productId: '1',
        storeId: 'store-1',
        quantity: -2.5,
        lossCategory: 'spoilage',
        reason: 'Ventes quotidiennes',
        recordedBy: 'manager-1',
        recordedAt: date
      });

      movements.push({
        id: `loss-${i}-2`,
        type: 'loss',
        productId: '2',
        storeId: 'store-1',
        quantity: -1.8,
        lossCategory: 'spoilage',
        reason: 'Ventes quotidiennes',
        recordedBy: 'manager-1',
        recordedAt: date
      });

      // Occasional waste
      if (i % 5 === 0) {
        movements.push({
          id: `waste-${i}`,
          type: 'loss',
          productId: '3',
          storeId: 'store-1',
          quantity: -0.5,
          lossCategory: 'spoilage',
          reason: 'Produit avarié',
          recordedBy: 'manager-1',
          recordedAt: date
        });
      }
    }

    this.stockMovements = movements;
  }

  // Record arrival of merchandise
  async recordArrival(movement: Omit<StockMovement, 'id' | 'type'>): Promise<StockMovement> {
    const arrivalMovement: StockMovement = {
      ...movement,
      id: `arrival-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'arrival'
    };

    // Validate the movement
    const validatedMovement = StockMovementSchema.parse(arrivalMovement);
    
    // Store the movement
    this.stockMovements.push(validatedMovement);
    
    // Update stock levels
    await this.updateStockLevel(movement.storeId, movement.productId, movement.quantity);
    
    return validatedMovement;
  }

  // Record loss of merchandise with categorization
  async recordLoss(movement: Omit<StockMovement, 'id' | 'type'>, category: 'spoilage' | 'damage' | 'promotion'): Promise<StockMovement> {
    const lossMovement: StockMovement = {
      ...movement,
      id: `loss-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'loss',
      lossCategory: category,
      quantity: -Math.abs(movement.quantity) // Ensure negative for losses
    };

    // Validate the movement
    const validatedMovement = StockMovementSchema.parse(lossMovement);
    
    // Store the movement
    this.stockMovements.push(validatedMovement);
    
    // Update stock levels (subtract the loss)
    await this.updateStockLevel(movement.storeId, movement.productId, lossMovement.quantity);
    
    return validatedMovement;
  }

  // Get current stock levels for a store
  async getCurrentStock(storeId: string): Promise<StockLevel[]> {
    return this.stockLevels.filter(level => level.storeId === storeId);
  }

  // Get stock movements for a store within a date range
  async getStockMovements(storeId: string, dateRange?: [Date, Date]): Promise<StockMovement[]> {
    let movements = this.stockMovements.filter(movement => movement.storeId === storeId);
    
    if (dateRange) {
      const [startDate, endDate] = dateRange;
      movements = movements.filter(movement => 
        movement.recordedAt >= startDate && movement.recordedAt <= endDate
      );
    }
    
    return movements.sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime());
  }

  // Calculate loss rates for a store and period
  async calculateLossRates(storeId: string, period: 'week' | 'month'): Promise<LossRateReport> {
    const now = new Date();
    const startDate = new Date();
    
    if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate.setMonth(now.getMonth() - 1);
    }

    const movements = await this.getStockMovements(storeId, [startDate, now]);
    
    const arrivals = movements.filter(m => m.type === 'arrival');
    const losses = movements.filter(m => m.type === 'loss');
    
    const totalArrivals = arrivals.reduce((sum, m) => sum + m.quantity, 0);
    const totalLosses = Math.abs(losses.reduce((sum, m) => sum + m.quantity, 0));
    
    const lossBreakdown = {
      spoilage: Math.abs(losses.filter(m => m.lossCategory === 'spoilage').reduce((sum, m) => sum + m.quantity, 0)),
      damage: Math.abs(losses.filter(m => m.lossCategory === 'damage').reduce((sum, m) => sum + m.quantity, 0)),
      promotion: Math.abs(losses.filter(m => m.lossCategory === 'promotion').reduce((sum, m) => sum + m.quantity, 0))
    };

    const lossRate = totalArrivals > 0 ? (totalLosses / totalArrivals) * 100 : 0;

    return {
      storeId,
      period,
      startDate,
      endDate: now,
      totalLosses,
      totalArrivals,
      lossRate,
      lossBreakdown,
      generatedAt: new Date()
    };
  }

  // Private method to update stock levels
  private async updateStockLevel(storeId: string, productId: string, quantityChange: number): Promise<void> {
    const existingLevelIndex = this.stockLevels.findIndex(
      level => level.storeId === storeId && level.productId === productId
    );

    if (existingLevelIndex >= 0) {
      // Update existing stock level
      this.stockLevels[existingLevelIndex].quantity += quantityChange;
      this.stockLevels[existingLevelIndex].availableQuantity = Math.max(0, 
        this.stockLevels[existingLevelIndex].quantity - this.stockLevels[existingLevelIndex].reservedQuantity
      );
      this.stockLevels[existingLevelIndex].lastUpdated = new Date();
      
      // Ensure stock doesn't go negative
      if (this.stockLevels[existingLevelIndex].quantity < 0) {
        this.stockLevels[existingLevelIndex].quantity = 0;
        this.stockLevels[existingLevelIndex].availableQuantity = 0;
      }
    } else {
      // Create new stock level entry
      const newLevel: StockLevel = {
        storeId,
        productId,
        quantity: Math.max(0, quantityChange),
        reservedQuantity: 0,
        availableQuantity: Math.max(0, quantityChange),
        lastUpdated: new Date()
      };
      
      this.stockLevels.push(StockLevelSchema.parse(newLevel));
    }
  }

  // New method to update reserved quantities
  async updateReservedQuantity(storeId: string, productId: string, reservedChange: number): Promise<void> {
    const existingLevelIndex = this.stockLevels.findIndex(
      level => level.storeId === storeId && level.productId === productId
    );

    if (existingLevelIndex >= 0) {
      this.stockLevels[existingLevelIndex].reservedQuantity += reservedChange;
      this.stockLevels[existingLevelIndex].availableQuantity = Math.max(0,
        this.stockLevels[existingLevelIndex].quantity - this.stockLevels[existingLevelIndex].reservedQuantity
      );
      this.stockLevels[existingLevelIndex].lastUpdated = new Date();
      
      // Ensure reserved quantity doesn't go negative
      if (this.stockLevels[existingLevelIndex].reservedQuantity < 0) {
        this.stockLevels[existingLevelIndex].reservedQuantity = 0;
        this.stockLevels[existingLevelIndex].availableQuantity = this.stockLevels[existingLevelIndex].quantity;
      }
    }
  }

  // Process reception voucher validation
  async processBonReceptionValidation(bonReception: BonReception, productAverageCosts: Record<string, number>): Promise<void> {
    for (const ligne of bonReception.lignes) {
      // Update stock level
      await this.updateStockLevel(bonReception.storeId, ligne.productId, ligne.quantiteRecue);
      
      // Calculate new CUMP
      const currentStock = this.stockLevels.find(
        level => level.storeId === bonReception.storeId && level.productId === ligne.productId
      );
      
      if (currentStock) {
        const currentCUMP = productAverageCosts[ligne.productId] || 0;
        const newCUMP = calculateCUMP(
          currentStock.quantity - ligne.quantiteRecue, // Previous stock
          currentCUMP,
          ligne.quantiteRecue,
          ligne.coutUnitaire
        );
        
        // Update product average cost (in a real app, this would update the product record)
        productAverageCosts[ligne.productId] = newCUMP;
      }

      // Create stock movement record
      const movement: StockMovement = {
        id: `movement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'arrival',
        productId: ligne.productId,
        storeId: bonReception.storeId,
        quantity: ligne.quantiteRecue,
        reason: `Bon de réception ${bonReception.numero}`,
        recordedBy: bonReception.validatedBy || bonReception.createdBy,
        recordedAt: bonReception.validatedAt || new Date()
      };

      this.stockMovements.push(movement);
    }
  }

  // Process transfer creation
  async processTransfertCreation(transfert: TransfertStock): Promise<void> {
    for (const ligne of transfert.lignes) {
      // Decrement source store stock
      await this.updateStockLevel(transfert.storeSourceId, ligne.productId, -ligne.quantiteEnvoyee);
      
      // Increment reserved quantity at destination
      await this.updateReservedQuantity(transfert.storeDestinationId, ligne.productId, ligne.quantiteEnvoyee);

      // Create stock movement for source (exit)
      const exitMovement: StockMovement = {
        id: `movement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'transfer',
        productId: ligne.productId,
        storeId: transfert.storeSourceId,
        quantity: -ligne.quantiteEnvoyee,
        reason: `Transfert ${transfert.numero} vers ${transfert.storeDestination.name}`,
        recordedBy: transfert.createdBy,
        recordedAt: transfert.createdAt
      };

      this.stockMovements.push(exitMovement);
    }
  }

  // Process transfer reception
  async processTransfertReception(transfert: TransfertStock): Promise<void> {
    for (const ligne of transfert.lignes) {
      if (ligne.quantiteRecue !== undefined) {
        // Remove from reserved quantity
        await this.updateReservedQuantity(transfert.storeDestinationId, ligne.productId, -ligne.quantiteEnvoyee);
        
        // Add actual received quantity
        await this.updateStockLevel(transfert.storeDestinationId, ligne.productId, ligne.quantiteRecue);

        // Create stock movement for destination (entry)
        const entryMovement: StockMovement = {
          id: `movement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'transfer',
          productId: ligne.productId,
          storeId: transfert.storeDestinationId,
          quantity: ligne.quantiteRecue,
          reason: `Réception transfert ${transfert.numero} de ${transfert.storeSource.name}`,
          recordedBy: transfert.receptionneBy || transfert.createdBy,
          recordedAt: transfert.receptionneAt || new Date()
        };

        this.stockMovements.push(entryMovement);

        // If there's a variance, record it as loss in transit
        if (ligne.ecart && Math.abs(ligne.ecart) > 0.01) {
          const lossMovement: StockMovement = {
            id: `movement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'loss',
            productId: ligne.productId,
            storeId: transfert.storeDestinationId,
            quantity: ligne.ecart, // Can be positive (gain) or negative (loss)
            reason: `Écart transfert ${transfert.numero}: ${ligne.commentaire || 'Perte en transit'}`,
            lossCategory: 'damage',
            recordedBy: transfert.receptionneBy || transfert.createdBy,
            recordedAt: transfert.receptionneAt || new Date()
          };

          this.stockMovements.push(lossMovement);
        }
      }
    }
  }

  // Get recent movements for display
  async getRecentMovements(storeId: string, limit: number = 10): Promise<StockMovement[]> {
    const movements = await this.getStockMovements(storeId);
    return movements.slice(0, limit);
  }

  // Check if loss rates exceed threshold
  async checkLossThresholds(storeId: string, threshold: number = 10): Promise<boolean> {
    const weeklyReport = await this.calculateLossRates(storeId, 'week');
    return weeklyReport.lossRate > threshold;
  }

  // Calculate flow rate for a specific product (units per day)
  async calculateProductFlowRate(storeId: string, productId: string, days: number = 30): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const movements = await this.getStockMovements(storeId, [startDate, new Date()]);
    
    // Calculate total outflow (sales + losses)
    const productMovements = movements.filter(m => m.productId === productId);
    const totalOutflow = productMovements
      .filter(m => m.type === 'loss' || m.quantity < 0)
      .reduce((sum, m) => sum + Math.abs(m.quantity), 0);
    
    return totalOutflow / days;
  }

  // Get stock levels with flow rate calculations
  async getEnrichedStockLevels(storeId: string): Promise<Array<StockLevel & { flowRate: number; daysOfStock: number }>> {
    const stockLevels = await this.getCurrentStock(storeId);
    
    const enrichedLevels = await Promise.all(
      stockLevels.map(async (level) => {
        const flowRate = await this.calculateProductFlowRate(storeId, level.productId);
        const daysOfStock = flowRate > 0 ? level.availableQuantity / flowRate : Infinity;
        
        return {
          ...level,
          flowRate,
          daysOfStock
        };
      })
    );
    
    return enrichedLevels;
  }

  // Check for stock alerts based on configurable thresholds
  async checkStockAlerts(storeId: string, thresholds: { critical: number; low: number; overstock: number }) {
    const enrichedLevels = await this.getEnrichedStockLevels(storeId);
    
    const alerts = enrichedLevels
      .map(level => {
        if (level.daysOfStock <= thresholds.critical) {
          return {
            type: 'critical_stock' as const,
            productId: level.productId,
            currentStock: level.quantity,
            daysOfStock: level.daysOfStock,
            threshold: thresholds.critical
          };
        } else if (level.daysOfStock <= thresholds.low) {
          return {
            type: 'low_stock' as const,
            productId: level.productId,
            currentStock: level.quantity,
            daysOfStock: level.daysOfStock,
            threshold: thresholds.low
          };
        } else if (level.daysOfStock > thresholds.overstock) {
          return {
            type: 'overstock' as const,
            productId: level.productId,
            currentStock: level.quantity,
            daysOfStock: level.daysOfStock,
            threshold: thresholds.overstock
          };
        }
        return null;
      })
      .filter(alert => alert !== null);
    
    return alerts;
  }

  // Get real-time stock summary for dashboard
  async getStockSummary(storeId: string) {
    const enrichedLevels = await this.getEnrichedStockLevels(storeId);
    
    const summary = {
      totalProducts: enrichedLevels.length,
      criticalStock: enrichedLevels.filter(l => l.daysOfStock <= 2).length,
      lowStock: enrichedLevels.filter(l => l.daysOfStock <= 7 && l.daysOfStock > 2).length,
      overstock: enrichedLevels.filter(l => l.daysOfStock > 30).length,
      averageFlowRate: enrichedLevels.reduce((sum, l) => sum + l.flowRate, 0) / enrichedLevels.length,
      lastUpdated: new Date()
    };
    
    return summary;
  }
}

export const stockService = new StockService();