import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supplierService, CreateSupplierData, UpdateSupplierData } from '../supplierService';
import { Supplier } from '../../shared/types';

// Mock the MCP Supabase calls
vi.mock('@/lib/mcp', () => ({
  mcp_supabase_execute_sql: vi.fn()
}));

describe('SupplierService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllSuppliers', () => {
    it('should return all active suppliers by default', async () => {
      const suppliers = await supplierService.getAllSuppliers();
      
      expect(Array.isArray(suppliers)).toBe(true);
      suppliers.forEach(supplier => {
        expect(supplier.isActive).toBe(true);
      });
    });

    it('should return all suppliers including inactive when requested', async () => {
      const suppliers = await supplierService.getAllSuppliers(true);
      
      expect(Array.isArray(suppliers)).toBe(true);
      // Should include both active and inactive suppliers
      const hasInactive = suppliers.some(s => !s.isActive);
      expect(hasInactive).toBe(true);
    });

    it('should return suppliers with correct structure', async () => {
      const suppliers = await supplierService.getAllSuppliers();
      
      if (suppliers.length > 0) {
        const supplier = suppliers[0];
        expect(supplier).toHaveProperty('id');
        expect(supplier).toHaveProperty('name');
        expect(supplier).toHaveProperty('isActive');
        expect(supplier).toHaveProperty('createdAt');
        expect(supplier).toHaveProperty('createdBy');
        expect(typeof supplier.id).toBe('string');
        expect(typeof supplier.name).toBe('string');
        expect(typeof supplier.isActive).toBe('boolean');
        expect(supplier.createdAt).toBeInstanceOf(Date);
      }
    });
  });

  describe('getSupplierById', () => {
    it('should return supplier when found', async () => {
      const suppliers = await supplierService.getAllSuppliers(true);
      if (suppliers.length > 0) {
        const firstSupplier = suppliers[0];
        const foundSupplier = await supplierService.getSupplierById(firstSupplier.id);
        
        expect(foundSupplier).not.toBeNull();
        expect(foundSupplier?.id).toBe(firstSupplier.id);
        expect(foundSupplier?.name).toBe(firstSupplier.name);
      }
    });

    it('should return null when supplier not found', async () => {
      const nonExistentId = 'non-existent-id';
      const supplier = await supplierService.getSupplierById(nonExistentId);
      
      expect(supplier).toBeNull();
    });
  });

  describe('createSupplier', () => {
    const validSupplierData: CreateSupplierData = {
      name: 'Test Supplier',
      contact: 'John Doe',
      phone: '+221 77 123 45 67',
      email: 'test@supplier.com',
      address: 'Test Address',
      isActive: true
    };

    it('should create supplier with valid data', async () => {
      const createdBy = 'test-user-id';
      const supplier = await supplierService.createSupplier(validSupplierData, createdBy);
      
      expect(supplier).toBeDefined();
      expect(supplier.name).toBe(validSupplierData.name);
      expect(supplier.contact).toBe(validSupplierData.contact);
      expect(supplier.phone).toBe(validSupplierData.phone);
      expect(supplier.email).toBe(validSupplierData.email);
      expect(supplier.address).toBe(validSupplierData.address);
      expect(supplier.isActive).toBe(validSupplierData.isActive);
      expect(supplier.createdBy).toBe(createdBy);
      expect(supplier.id).toBeDefined();
      expect(supplier.createdAt).toBeInstanceOf(Date);
    });

    it('should throw error when creating supplier with duplicate name', async () => {
      const duplicateData: CreateSupplierData = {
        name: 'Pêcherie Atlantique', // This name already exists in mock data
        contact: 'Test Contact'
      };

      await expect(
        supplierService.createSupplier(duplicateData, 'test-user-id')
      ).rejects.toThrow('Un fournisseur avec ce nom existe déjà');
    });

    it('should create supplier with minimal required data', async () => {
      const minimalData: CreateSupplierData = {
        name: 'Minimal Supplier'
      };

      const supplier = await supplierService.createSupplier(minimalData, 'test-user-id');
      
      expect(supplier.name).toBe(minimalData.name);
      expect(supplier.isActive).toBe(true); // Default value
      expect(supplier.contact).toBeUndefined();
      expect(supplier.phone).toBeUndefined();
      expect(supplier.email).toBeUndefined();
      expect(supplier.address).toBeUndefined();
    });
  });

  describe('updateSupplier', () => {
    it('should update supplier with valid data', async () => {
      const suppliers = await supplierService.getAllSuppliers(true);
      if (suppliers.length > 0) {
        const existingSupplier = suppliers[0];
        const updateData: UpdateSupplierData = {
          id: existingSupplier.id,
          name: 'Updated Supplier Name',
          contact: 'Updated Contact'
        };

        const updatedSupplier = await supplierService.updateSupplier(updateData, 'test-user-id');
        
        expect(updatedSupplier.id).toBe(existingSupplier.id);
        expect(updatedSupplier.name).toBe(updateData.name);
        expect(updatedSupplier.contact).toBe(updateData.contact);
        expect(updatedSupplier.createdAt).toEqual(existingSupplier.createdAt);
        expect(updatedSupplier.createdBy).toBe(existingSupplier.createdBy);
      }
    });

    it('should throw error when updating non-existent supplier', async () => {
      const updateData: UpdateSupplierData = {
        id: 'non-existent-id',
        name: 'Updated Name'
      };

      await expect(
        supplierService.updateSupplier(updateData, 'test-user-id')
      ).rejects.toThrow('Fournisseur non trouvé');
    });

    it('should throw error when updating to duplicate name', async () => {
      const suppliers = await supplierService.getAllSuppliers(true);
      if (suppliers.length >= 2) {
        const firstSupplier = suppliers[0];
        const secondSupplier = suppliers[1];
        
        const updateData: UpdateSupplierData = {
          id: firstSupplier.id,
          name: secondSupplier.name // Try to use second supplier's name
        };

        await expect(
          supplierService.updateSupplier(updateData, 'test-user-id')
        ).rejects.toThrow('Un fournisseur avec ce nom existe déjà');
      }
    });
  });

  describe('toggleSupplierStatus', () => {
    it('should activate inactive supplier', async () => {
      const suppliers = await supplierService.getAllSuppliers(true);
      const inactiveSupplier = suppliers.find(s => !s.isActive);
      
      if (inactiveSupplier) {
        const updatedSupplier = await supplierService.toggleSupplierStatus(
          inactiveSupplier.id, 
          true, 
          'test-user-id'
        );
        
        expect(updatedSupplier.isActive).toBe(true);
      }
    });

    it('should deactivate active supplier', async () => {
      const suppliers = await supplierService.getAllSuppliers();
      if (suppliers.length > 0) {
        const activeSupplier = suppliers[0];
        
        const updatedSupplier = await supplierService.toggleSupplierStatus(
          activeSupplier.id, 
          false, 
          'test-user-id'
        );
        
        expect(updatedSupplier.isActive).toBe(false);
      }
    });
  });

  describe('searchSuppliers', () => {
    it('should return all suppliers when query is empty', async () => {
      const allSuppliers = await supplierService.getAllSuppliers();
      const searchResults = await supplierService.searchSuppliers('');
      
      expect(searchResults).toEqual(allSuppliers);
    });

    it('should search suppliers by name', async () => {
      const searchResults = await supplierService.searchSuppliers('Atlantique');
      
      expect(searchResults.length).toBeGreaterThan(0);
      searchResults.forEach(supplier => {
        expect(supplier.name.toLowerCase()).toContain('atlantique');
      });
    });

    it('should search suppliers by contact', async () => {
      const searchResults = await supplierService.searchSuppliers('Jean');
      
      expect(searchResults.length).toBeGreaterThan(0);
      searchResults.forEach(supplier => {
        expect(supplier.contact?.toLowerCase()).toContain('jean');
      });
    });

    it('should search suppliers by phone', async () => {
      const searchResults = await supplierService.searchSuppliers('77 123');
      
      expect(searchResults.length).toBeGreaterThan(0);
      searchResults.forEach(supplier => {
        expect(supplier.phone).toContain('77 123');
      });
    });

    it('should search suppliers by email', async () => {
      const searchResults = await supplierService.searchSuppliers('pecherie-atlantique');
      
      expect(searchResults.length).toBeGreaterThan(0);
      searchResults.forEach(supplier => {
        expect(supplier.email?.toLowerCase()).toContain('pecherie-atlantique');
      });
    });
  });

  describe('validateSupplierData', () => {
    it('should validate correct supplier data', () => {
      const validData: CreateSupplierData = {
        name: 'Valid Supplier',
        contact: 'John Doe',
        phone: '+221 77 123 45 67',
        email: 'valid@email.com',
        address: 'Valid Address'
      };

      const result = supplierService.validateSupplierData(validData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject supplier data without name', () => {
      const invalidData: CreateSupplierData = {
        name: '', // Empty name
        contact: 'John Doe'
      };

      const result = supplierService.validateSupplierData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('name');
      expect(result.errors[0].code).toBe('NAME_REQUIRED');
    });

    it('should reject invalid email format', () => {
      const invalidData: CreateSupplierData = {
        name: 'Valid Supplier',
        email: 'invalid-email' // Invalid email format
      };

      const result = supplierService.validateSupplierData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('email');
      expect(result.errors[0].code).toBe('INVALID_EMAIL');
    });

    it('should reject invalid phone format', () => {
      const invalidData: CreateSupplierData = {
        name: 'Valid Supplier',
        phone: '123' // Too short phone number
      };

      const result = supplierService.validateSupplierData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('phone');
      expect(result.errors[0].code).toBe('INVALID_PHONE');
    });
  });

  describe('getSupplierStats', () => {
    it('should return correct supplier statistics', async () => {
      const stats = await supplierService.getSupplierStats();
      
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('active');
      expect(stats).toHaveProperty('inactive');
      expect(stats).toHaveProperty('recentlyAdded');
      
      expect(typeof stats.total).toBe('number');
      expect(typeof stats.active).toBe('number');
      expect(typeof stats.inactive).toBe('number');
      expect(typeof stats.recentlyAdded).toBe('number');
      
      expect(stats.total).toBe(stats.active + stats.inactive);
      expect(stats.total).toBeGreaterThanOrEqual(0);
      expect(stats.active).toBeGreaterThanOrEqual(0);
      expect(stats.inactive).toBeGreaterThanOrEqual(0);
      expect(stats.recentlyAdded).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getSuppliersWithStats', () => {
    it('should return suppliers with reception statistics', async () => {
      const suppliersWithStats = await supplierService.getSuppliersWithStats();
      
      expect(Array.isArray(suppliersWithStats)).toBe(true);
      
      if (suppliersWithStats.length > 0) {
        const supplierWithStats = suppliersWithStats[0];
        
        // Should have all supplier properties
        expect(supplierWithStats).toHaveProperty('id');
        expect(supplierWithStats).toHaveProperty('name');
        expect(supplierWithStats).toHaveProperty('isActive');
        
        // Should have statistics properties
        expect(supplierWithStats).toHaveProperty('receptionCount');
        expect(supplierWithStats).toHaveProperty('lastReceptionDate');
        
        expect(typeof supplierWithStats.receptionCount).toBe('number');
        expect(supplierWithStats.receptionCount).toBeGreaterThanOrEqual(0);
        
        if (supplierWithStats.lastReceptionDate) {
          expect(supplierWithStats.lastReceptionDate).toBeInstanceOf(Date);
        }
      }
    });
  });
});