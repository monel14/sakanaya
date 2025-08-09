import { ProductStock, LigneReception, StockLevel } from '../types';

/**
 * Calculate Weighted Average Cost (CUMP - Coût Unitaire Moyen Pondéré)
 * Formula: (Old_Stock × Old_CUMP + Received_Quantity × Unit_Cost) / (Old_Stock + Received_Quantity)
 */
export function calculateCUMP(
  currentStock: number,
  currentCUMP: number,
  receivedQuantity: number,
  unitCost: number
): number {
  if (currentStock + receivedQuantity === 0) {
    return 0;
  }
  
  const totalValue = (currentStock * currentCUMP) + (receivedQuantity * unitCost);
  const totalQuantity = currentStock + receivedQuantity;
  
  return totalValue / totalQuantity;
}

/**
 * Calculate total value of a reception voucher
 */
export function calculateBonReceptionTotal(lignes: LigneReception[]): number {
  return lignes.reduce((total, ligne) => total + ligne.sousTotal, 0);
}

/**
 * Calculate subtotal for a reception line
 */
export function calculateLigneReceptionSousTotal(quantite: number, coutUnitaire: number): number {
  return quantite * coutUnitaire;
}

/**
 * Calculate available quantity (quantity - reserved)
 */
export function calculateAvailableQuantity(quantity: number, reservedQuantity: number): number {
  return Math.max(0, quantity - reservedQuantity);
}

/**
 * Calculate stock value based on CUMP
 */
export function calculateStockValue(quantity: number, averageCost: number): number {
  return quantity * averageCost;
}

/**
 * Calculate loss value based on average cost
 */
export function calculateLossValue(quantity: number, averageCost: number): number {
  return quantity * averageCost;
}

/**
 * Calculate stock rotation in days
 * Based on average daily consumption over a period
 */
export function calculateStockRotation(
  currentStock: number,
  averageDailyConsumption: number
): number {
  if (averageDailyConsumption <= 0) {
    return Infinity;
  }
  
  return currentStock / averageDailyConsumption;
}

/**
 * Calculate transfer variance (difference between sent and received)
 */
export function calculateTransferVariance(quantitySent: number, quantityReceived: number): number {
  return quantityReceived - quantitySent;
}

/**
 * Calculate inventory variance (difference between theoretical and physical)
 */
export function calculateInventoryVariance(theoretical: number, physical: number): number {
  return physical - theoretical;
}

/**
 * Calculate inventory variance value
 */
export function calculateInventoryVarianceValue(variance: number, averageCost: number): number {
  return variance * averageCost;
}

/**
 * Generate automatic reception voucher number
 * Format: BR-YYYY-NNNN
 */
export function generateBonReceptionNumber(year: number, sequence: number): string {
  return `BR-${year}-${sequence.toString().padStart(4, '0')}`;
}

/**
 * Generate automatic transfer number
 * Format: TR-YYYY-NNNN
 */
export function generateTransferNumber(year: number, sequence: number): string {
  return `TR-${year}-${sequence.toString().padStart(4, '0')}`;
}

/**
 * Generate automatic inventory number
 * Format: INV-YYYY-NNNN
 */
export function generateInventoryNumber(year: number, sequence: number): string {
  return `INV-${year}-${sequence.toString().padStart(4, '0')}`;
}

/**
 * Calculate total variance for an inventory
 */
export function calculateInventoryTotalVariance(
  lignes: Array<{ quantiteTheorique: number; quantitePhysique?: number }>
): number {
  return lignes.reduce((total, ligne) => {
    if (ligne.quantitePhysique !== undefined) {
      return total + calculateInventoryVariance(ligne.quantiteTheorique, ligne.quantitePhysique);
    }
    return total;
  }, 0);
}

/**
 * Calculate total variance value for an inventory
 */
export function calculateInventoryTotalVarianceValue(
  lignes: Array<{ 
    quantiteTheorique: number; 
    quantitePhysique?: number; 
    product: { averageCost: number } 
  }>
): number {
  return lignes.reduce((total, ligne) => {
    if (ligne.quantitePhysique !== undefined) {
      const variance = calculateInventoryVariance(ligne.quantiteTheorique, ligne.quantitePhysique);
      return total + calculateInventoryVarianceValue(variance, ligne.product.averageCost);
    }
    return total;
  }, 0);
}

/**
 * Check if stock level is sufficient for a transfer
 */
export function isStockSufficient(availableStock: number, requestedQuantity: number): boolean {
  return availableStock >= requestedQuantity;
}

/**
 * Calculate stock coverage in days
 */
export function calculateStockCoverage(
  currentStock: number,
  averageDailyConsumption: number
): number {
  if (averageDailyConsumption <= 0) {
    return Infinity;
  }
  
  return Math.floor(currentStock / averageDailyConsumption);
}

/**
 * Calculate reorder point based on lead time and consumption
 */
export function calculateReorderPoint(
  averageDailyConsumption: number,
  leadTimeDays: number,
  safetyStock: number = 0
): number {
  return (averageDailyConsumption * leadTimeDays) + safetyStock;
}