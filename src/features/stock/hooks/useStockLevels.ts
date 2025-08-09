import { useState, useEffect, useCallback } from 'react';
import { StockLevel } from '../types';
import { Product } from '@/features/sales/types';
import { stockService } from '@/shared/services';
import { productService } from '@/shared/services';

export interface EnrichedStockLevel extends StockLevel {
  product: Product;
  flowRate: number; // units per day
  daysOfStock: number; // days until stock runs out
  alertLevel: 'none' | 'low' | 'critical' | 'overstock';
}

export interface StockAlert {
  type: 'low_stock' | 'critical_stock' | 'overstock';
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
  message: string;
}

export interface StockThresholds {
  critical: number; // days
  low: number; // days
  overstock: number; // days
}

const DEFAULT_THRESHOLDS: StockThresholds = {
  critical: 2,
  low: 7,
  overstock: 30
};

export const useStockLevels = (
  storeId: string, 
  thresholds: StockThresholds = DEFAULT_THRESHOLDS,
  autoRefresh: boolean = true,
  refreshInterval: number = 30000
) => {
  const [stockLevels, setStockLevels] = useState<EnrichedStockLevel[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateFlowRate = useCallback(async (storeId: string, productId: string): Promise<number> => {
    try {
      // Get movements from the last 30 days to calculate average daily flow
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const movements = await stockService.getStockMovements(storeId, [thirtyDaysAgo, new Date()]);
      
      // Calculate total outflow (sales + losses)
      const productMovements = movements.filter(m => m.productId === productId);
      const totalOutflow = productMovements
        .filter(m => m.type === 'loss' || m.quantity < 0)
        .reduce((sum, m) => sum + Math.abs(m.quantity), 0);
      
      // Calculate average daily flow rate
      const days = 30;
      return totalOutflow / days;
    } catch (error) {
      console.error('Error calculating flow rate:', error);
      return 0;
    }
  }, []);

  const determineAlertLevel = useCallback((daysOfStock: number): EnrichedStockLevel['alertLevel'] => {
    if (daysOfStock <= thresholds.critical) {
      return 'critical';
    } else if (daysOfStock <= thresholds.low) {
      return 'low';
    } else if (daysOfStock > thresholds.overstock) {
      return 'overstock';
    }
    return 'none';
  }, [thresholds]);

  const generateAlert = useCallback((level: EnrichedStockLevel): StockAlert | null => {
    switch (level.alertLevel) {
      case 'critical':
        return {
          type: 'critical_stock',
          productId: level.productId,
          productName: level.product.name,
          currentStock: level.quantity,
          threshold: thresholds.critical,
          message: `Stock critique: ${level.product.name} (${level.quantity} ${level.product.unit}, ${Math.round(level.daysOfStock)} jours restants)`
        };
      case 'low':
        return {
          type: 'low_stock',
          productId: level.productId,
          productName: level.product.name,
          currentStock: level.quantity,
          threshold: thresholds.low,
          message: `Stock faible: ${level.product.name} (${level.quantity} ${level.product.unit}, ${Math.round(level.daysOfStock)} jours restants)`
        };
      case 'overstock':
        return {
          type: 'overstock',
          productId: level.productId,
          productName: level.product.name,
          currentStock: level.quantity,
          threshold: thresholds.overstock,
          message: `Surstock: ${level.product.name} (${level.quantity} ${level.product.unit}, ${Math.round(level.daysOfStock)} jours de stock)`
        };
      default:
        return null;
    }
  }, [thresholds]);

  const loadStockData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get current stock levels
      const levels = await stockService.getCurrentStock(storeId);
      
      // Get all products to enrich stock data
      const products = await productService.getActiveProducts();
      const productMap = new Map(products.map(p => [p.id, p]));
      
      // Enrich stock levels with product data and calculations
      const enrichedLevels: EnrichedStockLevel[] = [];
      const newAlerts: StockAlert[] = [];
      
      for (const level of levels) {
        const product = productMap.get(level.productId);
        if (!product) continue;
        
        // Calculate flow rate (average daily consumption)
        const flowRate = await calculateFlowRate(storeId, level.productId);
        
        // Calculate days of stock remaining
        const daysOfStock = flowRate > 0 ? level.quantity / flowRate : Infinity;
        
        // Determine alert level
        const alertLevel = determineAlertLevel(daysOfStock);
        
        const enrichedLevel: EnrichedStockLevel = {
          ...level,
          product,
          flowRate,
          daysOfStock,
          alertLevel
        };
        
        enrichedLevels.push(enrichedLevel);
        
        // Generate alerts
        const alert = generateAlert(enrichedLevel);
        if (alert) {
          newAlerts.push(alert);
        }
      }
      
      // Sort by alert level (critical first) then by days of stock
      enrichedLevels.sort((a, b) => {
        const alertPriority = { critical: 0, low: 1, overstock: 2, none: 3 };
        const aPriority = alertPriority[a.alertLevel];
        const bPriority = alertPriority[b.alertLevel];
        
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        
        return a.daysOfStock - b.daysOfStock;
      });
      
      setStockLevels(enrichedLevels);
      setAlerts(newAlerts);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Error loading stock data:', error);
      setError('Erreur lors du chargement des données de stock');
    } finally {
      setIsLoading(false);
    }
  }, [storeId, calculateFlowRate, determineAlertLevel, generateAlert]);

  // Initial load and auto-refresh setup
  useEffect(() => {
    loadStockData();
    
    if (autoRefresh) {
      const interval = setInterval(loadStockData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [loadStockData, autoRefresh, refreshInterval]);

  // Utility functions
  const getStockByProduct = useCallback((productId: string): EnrichedStockLevel | undefined => {
    return stockLevels.find(level => level.productId === productId);
  }, [stockLevels]);

  const getCriticalStockItems = useCallback((): EnrichedStockLevel[] => {
    return stockLevels.filter(level => level.alertLevel === 'critical');
  }, [stockLevels]);

  const getLowStockItems = useCallback((): EnrichedStockLevel[] => {
    return stockLevels.filter(level => level.alertLevel === 'low');
  }, [stockLevels]);

  const getOverstockItems = useCallback((): EnrichedStockLevel[] => {
    return stockLevels.filter(level => level.alertLevel === 'overstock');
  }, [stockLevels]);

  const getTotalStockValue = useCallback((): number => {
    return stockLevels.reduce((total, level) => {
      return total + (level.quantity * level.product.unitPrice);
    }, 0);
  }, [stockLevels]);

  const getAverageFlowRate = useCallback((): number => {
    if (stockLevels.length === 0) return 0;
    const totalFlow = stockLevels.reduce((sum, level) => sum + level.flowRate, 0);
    return totalFlow / stockLevels.length;
  }, [stockLevels]);

  return {
    // Data
    stockLevels,
    alerts,
    lastUpdated,
    error,
    
    // State
    isLoading,
    
    // Actions
    refresh: loadStockData,
    
    // Utilities
    getStockByProduct,
    getCriticalStockItems,
    getLowStockItems,
    getOverstockItems,
    getTotalStockValue,
    getAverageFlowRate,
    
    // Configuration
    thresholds
  };
};