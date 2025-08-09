import { describe, it, expect } from 'vitest';
import {
  validateQuantity,
  validateUnitCost,
  validateBonReception,
  validateBonReceptionDraft,
  validateSupplier,
  validateTransfert,
  ValidationResult,
  StockValidationError,
  StockValidationErrorType
} from '../stockValidations';
import { BonReception, Supplier, TransfertStock, StockLevel } from '../../types';

describe('StockValidations', () => {
  describe('validateQuantity', () => {
    it('should accept positive quantities', () => {
      expect(validateQuantity(10)).toHaveLength(0);
      expect(validateQuantity(0.5)).toHaveLength(0);
      expect(validateQuantity(1000)).toHaveLength(0);
    });

    it('should reject negative quantities', () => {
      const errors = validateQuantity(-1);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe(StockValidationErrorType.NEGATIVE_QUANTITY);
    });

    it('should reject zero quantities', () => {
      const errors = validateQuantity(0);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe(StockValidationErrorType.ZERO_QUANTITY);
    });

    it('should handle edge cases', () => {
      expect(validateQuantity(Number.MAX_SAFE_INTEGER)).toHaveLength(0);
      expect(validateQuantity(Number.MIN_VALUE)).toHaveLength(0);
      
      const nanErrors = validateQuantity(NaN);
      expect(nanErrors).toHaveLength(1);
      expect(nanErrors[0].type).toBe(StockValidationErrorType.INVALID_QUANTITY);
    });
  });

  describe('validateUnitCost', () => {
    it('should accept positive costs', () => {
      expect(validateUnitCost(100)).toHaveLength(0);
      expect(validateUnitCost(0.01)).toHaveLength(0);
      expect(validateUnitCost(999999)).toHaveLength(0);
    });

    it('should reject negative costs', () => {
      const errors = validateUnitCost(-1);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe(StockValidationErrorType.NEGATIVE_COST);
    });

    it('should reject zero cost', () => {
      const errors = validateUnitCost(0);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe(StockValidationErrorType.ZERO_COST);
    });

    it('should handle edge cases', () => {
      const nanErrors = validateUnitCost(NaN);
      expect(nanErrors).toHaveLength(1);
      expect(nanErrors[0].type).toBe(StockValidationErrorType.INVALID_COST);
    });
  });



  describe('validateSupplier', () => {
    it('should validate correct supplier data', () => {
      const validData: Partial<Supplier> = {
        name: 'Test Supplier',
        contact: 'John Doe',
        phone: '+221 77 123 45 67',
        email: 'test@supplier.com',
        address: 'Test Address'
      };

      const result = validateSupplier(validData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject supplier without name', () => {
      const invalidData: Partial<Supplier> = {
        name: '',
        contact: 'John Doe'
      };

      const result = validateSupplier(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('name');
      expect(result.errors[0].type).toBe(StockValidationErrorType.MISSING_SUPPLIER);
    });

    it('should reject supplier with invalid email', () => {
      const invalidData: Partial<Supplier> = {
        name: 'Test Supplier',
        email: 'invalid-email'
      };

      const result = validateSupplier(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('email');
      expect(result.errors[0].type).toBe(StockValidationErrorType.INVALID_COST);
    });

    it('should accept supplier with minimal data', () => {
      const minimalData: Partial<Supplier> = {
        name: 'Minimal Supplier'
      };

      const result = validateSupplier(minimalData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateBonReception', () => {
    it('should validate correct bon reception data', () => {
      const validData: Partial<BonReception> = {
        supplierId: 'supplier-1',
        storeId: 'store-1',
        dateReception: new Date(),
        lignes: [
          {
            id: 'ligne-1',
            bonReceptionId: 'bon-1',
            productId: 'product-1',
            quantiteRecue: 10,
            coutUnitaire: 5000,
            sousTotal: 50000
          }
        ],
        totalValue: 50000
      };

      const result = validateBonReception(validData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject bon reception without supplier', () => {
      const invalidData: Partial<BonReception> = {
        supplierId: '',
        storeId: 'store-1',
        dateReception: new Date(),
        lignes: []
      };

      const result = validateBonReception(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'supplierId')).toBe(true);
    });

    it('should reject bon reception without store', () => {
      const invalidData: Partial<BonReception> = {
        supplierId: 'supplier-1',
        storeId: '',
        dateReception: new Date(),
        lignes: []
      };

      const result = validateBonReception(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'storeId')).toBe(true);
    });

    it('should reject bon reception without lines for validation', () => {
      const invalidData: Partial<BonReception> = {
        supplierId: 'supplier-1',
        storeId: 'store-1',
        dateReception: new Date(),
        lignes: []
      };

      const result = validateBonReception(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'lignes')).toBe(true);
    });

    it('should accept bon reception draft without lines', () => {
      const draftData: Partial<BonReception> = {
        supplierId: 'supplier-1',
        storeId: 'store-1',
        dateReception: new Date(),
        lignes: []
      };

      const result = validateBonReceptionDraft(draftData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject bon reception with invalid line quantities', () => {
      const invalidData: Partial<BonReception> = {
        supplierId: 'supplier-1',
        storeId: 'store-1',
        dateReception: new Date(),
        lignes: [
          {
            id: 'ligne-1',
            bonReceptionId: 'bon-1',
            productId: 'product-1',
            quantiteRecue: -5, // Negative quantity
            coutUnitaire: 5000,
            sousTotal: -25000
          }
        ]
      };

      const result = validateBonReception(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.lineIndex !== undefined)).toBe(true);
    });

    it('should reject bon reception with invalid line costs', () => {
      const invalidData: Partial<BonReception> = {
        supplierId: 'supplier-1',
        storeId: 'store-1',
        dateReception: new Date(),
        lignes: [
          {
            id: 'ligne-1',
            bonReceptionId: 'bon-1',
            productId: 'product-1',
            quantiteRecue: 10,
            coutUnitaire: 0, // Zero cost
            sousTotal: 0
          }
        ]
      };

      const result = validateBonReception(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'coutUnitaire')).toBe(true);
    });

    it('should reject bon reception with incorrect subtotals', () => {
      const invalidData: Partial<BonReception> = {
        supplierId: 'supplier-1',
        storeId: 'store-1',
        dateReception: new Date(),
        lignes: [
          {
            id: 'ligne-1',
            bonReceptionId: 'bon-1',
            productId: 'product-1',
            quantiteRecue: 10,
            coutUnitaire: 5000,
            sousTotal: 40000 // Should be 50000
          }
        ],
        totalValue: 40000
      };

      const result = validateBonReception(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'sousTotal')).toBe(true);
    });
  });

  describe('validateTransfert', () => {
    const mockStockLevels: StockLevel[] = [
      {
        id: 'stock-1',
        storeId: 'store-1',
        productId: 'product-1',
        quantity: 20,
        reservedQuantity: 5,
        availableQuantity: 15,
        lastUpdated: new Date()
      }
    ];

    it('should validate correct transfert data', () => {
      const validData: Partial<TransfertStock> = {
        storeSourceId: 'store-1',
        storeDestinationId: 'store-2',
        lignes: [
          {
            id: 'ligne-1',
            transfertId: 'transfert-1',
            productId: 'product-1',
            quantiteEnvoyee: 10
          }
        ]
      };

      const result = validateTransfert(validData, mockStockLevels);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject transfert with same source and destination', () => {
      const invalidData: Partial<TransfertStock> = {
        storeSourceId: 'store-1',
        storeDestinationId: 'store-1', // Same as source
        lignes: [
          {
            id: 'ligne-1',
            transfertId: 'transfert-1',
            productId: 'product-1',
            quantiteEnvoyee: 10
          }
        ]
      };

      const result = validateTransfert(invalidData, mockStockLevels);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.type === StockValidationErrorType.SAME_SOURCE_DESTINATION)).toBe(true);
    });

    it('should reject transfert without lines', () => {
      const invalidData: Partial<TransfertStock> = {
        storeSourceId: 'store-1',
        storeDestinationId: 'store-2',
        lignes: []
      };

      const result = validateTransfert(invalidData, mockStockLevels);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.type === StockValidationErrorType.MISSING_LINES)).toBe(true);
    });

    it('should reject transfert with insufficient stock', () => {
      const invalidData: Partial<TransfertStock> = {
        storeSourceId: 'store-1',
        storeDestinationId: 'store-2',
        lignes: [
          {
            id: 'ligne-1',
            transfertId: 'transfert-1',
            productId: 'product-1',
            quantiteEnvoyee: 20 // More than available (15)
          }
        ]
      };

      const result = validateTransfert(invalidData, mockStockLevels);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.type === StockValidationErrorType.INSUFFICIENT_STOCK)).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should create proper validation errors', () => {
      const error: StockValidationError = {
        field: 'quantity',
        code: 'INVALID_QUANTITY',
        message: 'La quantité doit être positive'
      };

      expect(error.field).toBe('quantity');
      expect(error.code).toBe('INVALID_QUANTITY');
      expect(error.message).toBe('La quantité doit être positive');
    });

    it('should create validation results correctly', () => {
      const validResult: ValidationResult = {
        isValid: true,
        errors: []
      };

      const invalidResult: ValidationResult = {
        isValid: false,
        errors: [
          {
            field: 'name',
            code: 'NAME_REQUIRED',
            message: 'Le nom est requis'
          }
        ]
      };

      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toHaveLength(0);
      
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toHaveLength(1);
      expect(invalidResult.errors[0].field).toBe('name');
    });
  });

  describe('Complex validation scenarios', () => {
    it('should handle multiple validation errors', () => {
      const invalidData: Partial<BonReception> = {
        supplierId: '', // Missing supplier
        storeId: '', // Missing store
        dateReception: new Date(),
        lignes: [
          {
            id: 'ligne-1',
            bonReceptionId: 'bon-1',
            productId: 'product-1',
            quantiteRecue: -5, // Invalid quantity
            coutUnitaire: 0, // Invalid cost
            sousTotal: 0
          }
        ]
      };

      const result = validateBonReception(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      
      // Should have errors for supplier, store, quantity, and cost
      const errorFields = result.errors.map(e => e.field);
      expect(errorFields).toContain('supplierId');
      expect(errorFields).toContain('storeId');
      expect(errorFields.some(f => f === 'quantiteRecue')).toBe(true);
      expect(errorFields.some(f => f === 'coutUnitaire')).toBe(true);
    });

    it('should validate business rules correctly', () => {
      // Test that subtotal calculation is enforced
      const dataWithWrongSubtotal: Partial<BonReception> = {
        supplierId: 'supplier-1',
        storeId: 'store-1',
        dateReception: new Date(),
        lignes: [
          {
            id: 'ligne-1',
            bonReceptionId: 'bon-1',
            productId: 'product-1',
            quantiteRecue: 10,
            coutUnitaire: 5000,
            sousTotal: 60000 // Should be 50000 (10 * 5000)
          }
        ],
        totalValue: 60000
      };

      const result = validateBonReception(dataWithWrongSubtotal);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => 
        e.field === 'sousTotal' && e.type === StockValidationErrorType.CALCULATION_ERROR
      )).toBe(true);
    });
  });
});