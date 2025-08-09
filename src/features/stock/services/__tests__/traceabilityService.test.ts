import { describe, it, expect, beforeEach, vi } from 'vitest';
import { traceabilityService, TraceabilityFilters } from '../traceabilityService';
import { MouvementStock, MouvementType } from '../../types';

// Mock the MCP Supabase calls
vi.mock('@/lib/mcp', () => ({
  mcp_supabase_execute_sql: vi.fn()
}));

describe('TraceabilityService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllMouvements', () => {
    it('should return all stock movements', async () => {
      const mouvements = await traceabilityService.getAllMouvements();
      
      expect(Array.isArray(mouvements)).toBe(true);
      
      if (mouvements.length > 0) {
        const mouvement = mouvements[0];
        expect(mouvement).toHaveProperty('id');
        expect(mouvement).toHaveProperty('date');
        expect(mouvement).toHaveProperty('type');
        expect(mouvement).toHaveProperty('storeId');
        expect(mouvement).toHaveProperty('productId');
        expect(mouvement).toHaveProperty('quantite');
        expect(mouvement).toHaveProperty('createdBy');
        expect(mouvement.date).toBeInstanceOf(Date);
      }
    });

    it('should return movements sorted by date descending by default', async () => {
      const mouvements = await traceabilityService.getAllMouvements();
      
      if (mouvements.length > 1) {
        for (let i = 0; i < mouvements.length - 1; i++) {
          expect(mouvements[i].date.getTime()).toBeGreaterThanOrEqual(
            mouvements[i + 1].date.getTime()
          );
        }
      }
    });
  });

  describe('getMouvementsByFilters', () => {
    it('should filter movements by store', async () => {
      const filters: TraceabilityFilters = {
        storeId: 'store-1'
      };
      
      const mouvements = await traceabilityService.getMouvementsByFilters(filters);
      
      expect(Array.isArray(mouvements)).toBe(true);
      mouvements.forEach(mouvement => {
        expect(mouvement.storeId).toBe('store-1');
      });
    });

    it('should filter movements by product', async () => {
      const filters: TraceabilityFilters = {
        productId: 'product-1'
      };
      
      const mouvements = await traceabilityService.getMouvementsByFilters(filters);
      
      expect(Array.isArray(mouvements)).toBe(true);
      mouvements.forEach(mouvement => {
        expect(mouvement.productId).toBe('product-1');
      });
    });

    it('should filter movements by type', async () => {
      const filters: TraceabilityFilters = {
        type: 'arrivage'
      };
      
      const mouvements = await traceabilityService.getMouvementsByFilters(filters);
      
      expect(Array.isArray(mouvements)).toBe(true);
      mouvements.forEach(mouvement => {
        expect(mouvement.type).toBe('arrivage');
      });
    });

    it('should filter movements by date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      
      const filters: TraceabilityFilters = {
        startDate,
        endDate
      };
      
      const mouvements = await traceabilityService.getMouvementsByFilters(filters);
      
      expect(Array.isArray(mouvements)).toBe(true);
      mouvements.forEach(mouvement => {
        expect(mouvement.date.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
        expect(mouvement.date.getTime()).toBeLessThanOrEqual(endDate.getTime());
      });
    });

    it('should filter movements by user', async () => {
      const filters: TraceabilityFilters = {
        userId: 'user-1'
      };
      
      const mouvements = await traceabilityService.getMouvementsByFilters(filters);
      
      expect(Array.isArray(mouvements)).toBe(true);
      mouvements.forEach(mouvement => {
        expect(mouvement.createdBy).toBe('user-1');
      });
    });

    it('should combine multiple filters', async () => {
      const filters: TraceabilityFilters = {
        storeId: 'store-1',
        type: 'arrivage',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      };
      
      const mouvements = await traceabilityService.getMouvementsByFilters(filters);
      
      expect(Array.isArray(mouvements)).toBe(true);
      mouvements.forEach(mouvement => {
        expect(mouvement.storeId).toBe('store-1');
        expect(mouvement.type).toBe('arrivage');
        expect(mouvement.date.getTime()).toBeGreaterThanOrEqual(filters.startDate!.getTime());
        expect(mouvement.date.getTime()).toBeLessThanOrEqual(filters.endDate!.getTime());
      });
    });
  });

  describe('getMouvementsByProduct', () => {
    it('should return movements for specific product', async () => {
      const productId = 'product-1';
      const mouvements = await traceabilityService.getMouvementsByProduct(productId);
      
      expect(Array.isArray(mouvements)).toBe(true);
      mouvements.forEach(mouvement => {
        expect(mouvement.productId).toBe(productId);
      });
    });

    it('should return movements sorted by date for product', async () => {
      const productId = 'product-1';
      const mouvements = await traceabilityService.getMouvementsByProduct(productId);
      
      if (mouvements.length > 1) {
        for (let i = 0; i < mouvements.length - 1; i++) {
          expect(mouvements[i].date.getTime()).toBeGreaterThanOrEqual(
            mouvements[i + 1].date.getTime()
          );
        }
      }
    });
  });

  describe('getMouvementsByStore', () => {
    it('should return movements for specific store', async () => {
      const storeId = 'store-1';
      const mouvements = await traceabilityService.getMouvementsByStore(storeId);
      
      expect(Array.isArray(mouvements)).toBe(true);
      mouvements.forEach(mouvement => {
        expect(mouvement.storeId).toBe(storeId);
      });
    });

    it('should return movements sorted by date for store', async () => {
      const storeId = 'store-1';
      const mouvements = await traceabilityService.getMouvementsByStore(storeId);
      
      if (mouvements.length > 1) {
        for (let i = 0; i < mouvements.length - 1; i++) {
          expect(mouvements[i].date.getTime()).toBeGreaterThanOrEqual(
            mouvements[i + 1].date.getTime()
          );
        }
      }
    });
  });

  describe('getMouvementsByType', () => {
    it('should return movements of specific type', async () => {
      const type: MouvementType = 'transfert_entree';
      const mouvements = await traceabilityService.getMouvementsByType(type);
      
      expect(Array.isArray(mouvements)).toBe(true);
      mouvements.forEach(mouvement => {
        expect(mouvement.type).toBe(type);
      });
    });
  });

  describe('getMovementStats', () => {
    it('should return correct movement statistics', async () => {
      const stats = await traceabilityService.getMovementStats();
      
      expect(stats).toHaveProperty('totalMovements');
      expect(stats).toHaveProperty('movementsByType');
      expect(stats).toHaveProperty('movementsByStore');
      expect(stats).toHaveProperty('recentMovements');
      expect(stats).toHaveProperty('totalValue');
      
      expect(typeof stats.totalMovements).toBe('number');
      expect(typeof stats.totalValue).toBe('number');
      expect(stats.totalMovements).toBeGreaterThanOrEqual(0);
      expect(stats.totalValue).toBeGreaterThanOrEqual(0);
      
      expect(typeof stats.movementsByType).toBe('object');
      expect(typeof stats.movementsByStore).toBe('object');
      expect(Array.isArray(stats.recentMovements)).toBe(true);
    });

    it('should return movement statistics by type', async () => {
      const stats = await traceabilityService.getMovementStats();
      
      const expectedTypes: MouvementType[] = [
        'arrivage', 'transfert_sortie', 'transfert_entree', 
        'vente', 'perte', 'ajustement'
      ];
      
      expectedTypes.forEach(type => {
        expect(stats.movementsByType).toHaveProperty(type);
        expect(typeof stats.movementsByType[type]).toBe('number');
        expect(stats.movementsByType[type]).toBeGreaterThanOrEqual(0);
      });
    });

    it('should return recent movements limited to specified count', async () => {
      const stats = await traceabilityService.getMovementStats();
      
      expect(stats.recentMovements.length).toBeLessThanOrEqual(10); // Default limit
      
      if (stats.recentMovements.length > 1) {
        for (let i = 0; i < stats.recentMovements.length - 1; i++) {
          expect(stats.recentMovements[i].date.getTime()).toBeGreaterThanOrEqual(
            stats.recentMovements[i + 1].date.getTime()
          );
        }
      }
    });
  });

  describe('getStockFlowAnalysis', () => {
    it('should return stock flow analysis for product', async () => {
      const productId = 'product-1';
      const analysis = await traceabilityService.getStockFlowAnalysis(productId);
      
      expect(analysis).toHaveProperty('productId');
      expect(analysis).toHaveProperty('totalEntries');
      expect(analysis).toHaveProperty('totalExits');
      expect(analysis).toHaveProperty('netFlow');
      expect(analysis).toHaveProperty('averageEntryQuantity');
      expect(analysis).toHaveProperty('averageExitQuantity');
      expect(analysis).toHaveProperty('movementFrequency');
      expect(analysis).toHaveProperty('lastMovementDate');
      
      expect(analysis.productId).toBe(productId);
      expect(typeof analysis.totalEntries).toBe('number');
      expect(typeof analysis.totalExits).toBe('number');
      expect(typeof analysis.netFlow).toBe('number');
      expect(typeof analysis.averageEntryQuantity).toBe('number');
      expect(typeof analysis.averageExitQuantity).toBe('number');
      expect(typeof analysis.movementFrequency).toBe('number');
      
      expect(analysis.totalEntries).toBeGreaterThanOrEqual(0);
      expect(analysis.totalExits).toBeGreaterThanOrEqual(0);
      expect(analysis.netFlow).toBe(analysis.totalEntries - analysis.totalExits);
      
      if (analysis.lastMovementDate) {
        expect(analysis.lastMovementDate).toBeInstanceOf(Date);
      }
    });

    it('should calculate correct averages', async () => {
      const productId = 'product-1';
      const analysis = await traceabilityService.getStockFlowAnalysis(productId);
      
      if (analysis.totalEntries > 0) {
        expect(analysis.averageEntryQuantity).toBeGreaterThan(0);
      } else {
        expect(analysis.averageEntryQuantity).toBe(0);
      }
      
      if (analysis.totalExits > 0) {
        expect(analysis.averageExitQuantity).toBeGreaterThan(0);
      } else {
        expect(analysis.averageExitQuantity).toBe(0);
      }
    });
  });

  describe('getStoreFlowAnalysis', () => {
    it('should return store flow analysis', async () => {
      const storeId = 'store-1';
      const analysis = await traceabilityService.getStoreFlowAnalysis(storeId);
      
      expect(analysis).toHaveProperty('storeId');
      expect(analysis).toHaveProperty('totalEntries');
      expect(analysis).toHaveProperty('totalExits');
      expect(analysis).toHaveProperty('netFlow');
      expect(analysis).toHaveProperty('productCount');
      expect(analysis).toHaveProperty('movementsByType');
      expect(analysis).toHaveProperty('averageDailyMovements');
      expect(analysis).toHaveProperty('lastMovementDate');
      
      expect(analysis.storeId).toBe(storeId);
      expect(typeof analysis.totalEntries).toBe('number');
      expect(typeof analysis.totalExits).toBe('number');
      expect(typeof analysis.netFlow).toBe('number');
      expect(typeof analysis.productCount).toBe('number');
      expect(typeof analysis.averageDailyMovements).toBe('number');
      
      expect(analysis.totalEntries).toBeGreaterThanOrEqual(0);
      expect(analysis.totalExits).toBeGreaterThanOrEqual(0);
      expect(analysis.productCount).toBeGreaterThanOrEqual(0);
      expect(analysis.netFlow).toBe(analysis.totalEntries - analysis.totalExits);
      
      expect(typeof analysis.movementsByType).toBe('object');
      
      if (analysis.lastMovementDate) {
        expect(analysis.lastMovementDate).toBeInstanceOf(Date);
      }
    });
  });

  describe('exportMovements', () => {
    it('should export movements to CSV format', async () => {
      const filters: TraceabilityFilters = {
        storeId: 'store-1'
      };
      
      const csvData = await traceabilityService.exportMovements(filters);
      
      expect(typeof csvData).toBe('string');
      expect(csvData).toContain('Date,Type,Magasin,Produit,Quantité,Valeur,Utilisateur,Commentaire');
      
      // Should contain data rows if movements exist
      const lines = csvData.split('\n');
      expect(lines.length).toBeGreaterThan(1); // Header + at least one data row or empty
    });

    it('should handle empty movement list', async () => {
      const filters: TraceabilityFilters = {
        storeId: 'non-existent-store'
      };
      
      const csvData = await traceabilityService.exportMovements(filters);
      
      expect(typeof csvData).toBe('string');
      expect(csvData).toContain('Date,Type,Magasin,Produit,Quantité,Valeur,Utilisateur,Commentaire');
      
      const lines = csvData.split('\n').filter(line => line.trim());
      expect(lines.length).toBe(1); // Only header
    });
  });

  describe('searchMovements', () => {
    it('should search movements by text query', async () => {
      const query = 'Thon';
      const results = await traceabilityService.searchMovements(query);
      
      expect(Array.isArray(results)).toBe(true);
      
      if (results.length > 0) {
        results.forEach(mouvement => {
          const searchableText = [
            mouvement.product?.name,
            mouvement.store?.name,
            mouvement.commentaire,
            mouvement.referenceId
          ].filter(Boolean).join(' ').toLowerCase();
          
          expect(searchableText).toContain(query.toLowerCase());
        });
      }
    });

    it('should return empty array for non-matching query', async () => {
      const query = 'NonExistentProduct12345';
      const results = await traceabilityService.searchMovements(query);
      
      expect(Array.isArray(results)).toBe(true);
      expect(results).toHaveLength(0);
    });

    it('should handle empty query', async () => {
      const query = '';
      const results = await traceabilityService.searchMovements(query);
      
      expect(Array.isArray(results)).toBe(true);
      // Should return all movements or empty array
    });
  });

  describe('validateFilters', () => {
    it('should validate correct filters', () => {
      const validFilters: TraceabilityFilters = {
        storeId: 'store-1',
        productId: 'product-1',
        type: 'arrivage',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        userId: 'user-1'
      };

      const result = traceabilityService.validateFilters(validFilters);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject filters with end date before start date', () => {
      const invalidFilters: TraceabilityFilters = {
        startDate: new Date('2024-12-31'),
        endDate: new Date('2024-01-01') // End before start
      };

      const result = traceabilityService.validateFilters(invalidFilters);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('endDate');
      expect(result.errors[0].code).toBe('END_DATE_BEFORE_START');
    });

    it('should reject filters with invalid movement type', () => {
      const invalidFilters: TraceabilityFilters = {
        type: 'invalid_type' as MouvementType
      };

      const result = traceabilityService.validateFilters(invalidFilters);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('type');
      expect(result.errors[0].code).toBe('INVALID_MOVEMENT_TYPE');
    });

    it('should accept empty filters', () => {
      const emptyFilters: TraceabilityFilters = {};

      const result = traceabilityService.validateFilters(emptyFilters);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});