import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useSuppliers } from '../useSuppliers';
import { supplierService } from '../../services/supplierService';

// Mock the supplier service
vi.mock('../../services/supplierService', () => ({
  supplierService: {
    getAllSuppliers: vi.fn(),
    getSupplierById: vi.fn(),
    createSupplier: vi.fn(),
    updateSupplier: vi.fn(),
    toggleSupplierStatus: vi.fn(),
    searchSuppliers: vi.fn(),
    getSupplierStats: vi.fn(),
    getSuppliersWithStats: vi.fn()
  }
}));

const mockSuppliers = [
  {
    id: 'supplier-1',
    name: 'Pêcherie Atlantique',
    contact: 'Jean Dupont',
    phone: '+221 77 123 45 67',
    email: 'jean@pecherie-atlantique.sn',
    address: 'Port de Dakar',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    createdBy: 'user-1'
  },
  {
    id: 'supplier-2',
    name: 'Marée Fraîche',
    contact: 'Marie Martin',
    phone: '+221 77 987 65 43',
    email: 'marie@maree-fraiche.sn',
    address: 'Marché Kermel',
    isActive: false,
    createdAt: new Date('2024-01-15'),
    createdBy: 'user-1'
  }
];

const mockSupplierStats = {
  total: 2,
  active: 1,
  inactive: 1,
  recentlyAdded: 1
};

describe('useSuppliers', () => {
  let queryClient: QueryClient;

  const createWrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  describe('useSuppliers hook', () => {
    it('should fetch all suppliers by default', async () => {
      vi.mocked(supplierService.getAllSuppliers).mockResolvedValue(mockSuppliers.filter(s => s.isActive));

      const { result } = renderHook(() => useSuppliers(), {
        wrapper: createWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.suppliers).toHaveLength(1);
      expect(result.current.suppliers[0].isActive).toBe(true);
      expect(supplierService.getAllSuppliers).toHaveBeenCalledWith(false);
    });

    it('should fetch all suppliers including inactive when requested', async () => {
      vi.mocked(supplierService.getAllSuppliers).mockResolvedValue(mockSuppliers);

      const { result } = renderHook(() => useSuppliers({ includeInactive: true }), {
        wrapper: createWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.suppliers).toHaveLength(2);
      expect(supplierService.getAllSuppliers).toHaveBeenCalledWith(true);
    });

    it('should handle loading state', () => {
      vi.mocked(supplierService.getAllSuppliers).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockSuppliers), 100))
      );

      const { result } = renderHook(() => useSuppliers(), {
        wrapper: createWrapper,
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.suppliers).toEqual([]);
    });

    it('should handle error state', async () => {
      const errorMessage = 'Failed to fetch suppliers';
      vi.mocked(supplierService.getAllSuppliers).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useSuppliers(), {
        wrapper: createWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.suppliers).toEqual([]);
    });
  });

  describe('useSupplier hook', () => {
    it('should fetch specific supplier by id', async () => {
      const supplierId = 'supplier-1';
      vi.mocked(supplierService.getSupplierById).mockResolvedValue(mockSuppliers[0]);

      const { result } = renderHook(() => useSuppliers({ supplierId }), {
        wrapper: createWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.supplier).toEqual(mockSuppliers[0]);
      expect(supplierService.getSupplierById).toHaveBeenCalledWith(supplierId);
    });

    it('should handle supplier not found', async () => {
      const supplierId = 'non-existent-supplier';
      vi.mocked(supplierService.getSupplierById).mockResolvedValue(null);

      const { result } = renderHook(() => useSuppliers({ supplierId }), {
        wrapper: createWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.supplier).toBeNull();
      expect(supplierService.getSupplierById).toHaveBeenCalledWith(supplierId);
    });
  });

  describe('useSupplierStats hook', () => {
    it('should fetch supplier statistics', async () => {
      vi.mocked(supplierService.getSupplierStats).mockResolvedValue(mockSupplierStats);

      const { result } = renderHook(() => useSuppliers({ withStats: true }), {
        wrapper: createWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.stats).toEqual(mockSupplierStats);
      expect(supplierService.getSupplierStats).toHaveBeenCalled();
    });
  });

  describe('Mutations', () => {
    it('should create supplier successfully', async () => {
      const newSupplier = {
        id: 'supplier-3',
        name: 'Nouveau Fournisseur',
        contact: 'Test Contact',
        isActive: true,
        createdAt: new Date(),
        createdBy: 'user-1'
      };

      vi.mocked(supplierService.createSupplier).mockResolvedValue(newSupplier);
      vi.mocked(supplierService.getAllSuppliers).mockResolvedValue([...mockSuppliers, newSupplier]);

      const { result } = renderHook(() => useSuppliers(), {
        wrapper: createWrapper,
      });

      await act(async () => {
        await result.current.createSupplier({
          name: 'Nouveau Fournisseur',
          contact: 'Test Contact'
        });
      });

      expect(supplierService.createSupplier).toHaveBeenCalledWith(
        {
          name: 'Nouveau Fournisseur',
          contact: 'Test Contact'
        },
        expect.any(String)
      );
    });

    it('should handle create supplier error', async () => {
      const errorMessage = 'Failed to create supplier';
      vi.mocked(supplierService.createSupplier).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useSuppliers(), {
        wrapper: createWrapper,
      });

      await act(async () => {
        try {
          await result.current.createSupplier({
            name: 'Test Supplier'
          });
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toBe(errorMessage);
        }
      });
    });

    it('should update supplier successfully', async () => {
      const updatedSupplier = {
        ...mockSuppliers[0],
        name: 'Updated Supplier Name'
      };

      vi.mocked(supplierService.updateSupplier).mockResolvedValue(updatedSupplier);

      const { result } = renderHook(() => useSuppliers(), {
        wrapper: createWrapper,
      });

      await act(async () => {
        await result.current.updateSupplier({
          id: 'supplier-1',
          name: 'Updated Supplier Name'
        });
      });

      expect(supplierService.updateSupplier).toHaveBeenCalledWith(
        {
          id: 'supplier-1',
          name: 'Updated Supplier Name'
        },
        expect.any(String)
      );
    });

    it('should toggle supplier status successfully', async () => {
      const toggledSupplier = {
        ...mockSuppliers[1],
        isActive: true
      };

      vi.mocked(supplierService.toggleSupplierStatus).mockResolvedValue(toggledSupplier);

      const { result } = renderHook(() => useSuppliers(), {
        wrapper: createWrapper,
      });

      await act(async () => {
        await result.current.toggleSupplierStatus('supplier-2', true);
      });

      expect(supplierService.toggleSupplierStatus).toHaveBeenCalledWith(
        'supplier-2',
        true,
        expect.any(String)
      );
    });
  });

  describe('Search functionality', () => {
    it('should search suppliers', async () => {
      const searchResults = [mockSuppliers[0]];
      vi.mocked(supplierService.searchSuppliers).mockResolvedValue(searchResults);

      const { result } = renderHook(() => useSuppliers(), {
        wrapper: createWrapper,
      });

      await act(async () => {
        await result.current.searchSuppliers('Atlantique');
      });

      expect(supplierService.searchSuppliers).toHaveBeenCalledWith('Atlantique');
    });

    it('should handle empty search results', async () => {
      vi.mocked(supplierService.searchSuppliers).mockResolvedValue([]);

      const { result } = renderHook(() => useSuppliers(), {
        wrapper: createWrapper,
      });

      await act(async () => {
        const results = await result.current.searchSuppliers('NonExistent');
        expect(results).toEqual([]);
      });
    });
  });

  describe('Cache invalidation', () => {
    it('should invalidate cache after creating supplier', async () => {
      const newSupplier = {
        id: 'supplier-3',
        name: 'New Supplier',
        isActive: true,
        createdAt: new Date(),
        createdBy: 'user-1'
      };

      vi.mocked(supplierService.createSupplier).mockResolvedValue(newSupplier);
      vi.mocked(supplierService.getAllSuppliers)
        .mockResolvedValueOnce(mockSuppliers.filter(s => s.isActive))
        .mockResolvedValueOnce([...mockSuppliers.filter(s => s.isActive), newSupplier]);

      const { result } = renderHook(() => useSuppliers(), {
        wrapper: createWrapper,
      });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.suppliers).toHaveLength(1);

      // Create new supplier
      await act(async () => {
        await result.current.createSupplier({
          name: 'New Supplier'
        });
      });

      // Wait for cache invalidation and refetch
      await waitFor(() => {
        expect(result.current.suppliers).toHaveLength(2);
      });
    });

    it('should invalidate cache after updating supplier', async () => {
      const updatedSupplier = {
        ...mockSuppliers[0],
        name: 'Updated Name'
      };

      vi.mocked(supplierService.updateSupplier).mockResolvedValue(updatedSupplier);
      vi.mocked(supplierService.getAllSuppliers)
        .mockResolvedValueOnce(mockSuppliers.filter(s => s.isActive))
        .mockResolvedValueOnce([updatedSupplier]);

      const { result } = renderHook(() => useSuppliers(), {
        wrapper: createWrapper,
      });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.suppliers[0].name).toBe('Pêcherie Atlantique');

      // Update supplier
      await act(async () => {
        await result.current.updateSupplier({
          id: 'supplier-1',
          name: 'Updated Name'
        });
      });

      // Wait for cache invalidation and refetch
      await waitFor(() => {
        expect(result.current.suppliers[0].name).toBe('Updated Name');
      });
    });
  });

  describe('Loading states', () => {
    it('should show loading state for mutations', async () => {
      vi.mocked(supplierService.createSupplier).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          id: 'supplier-3',
          name: 'New Supplier',
          isActive: true,
          createdAt: new Date(),
          createdBy: 'user-1'
        }), 100))
      );

      const { result } = renderHook(() => useSuppliers(), {
        wrapper: createWrapper,
      });

      act(() => {
        result.current.createSupplier({ name: 'New Supplier' });
      });

      expect(result.current.isCreating).toBe(true);

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false);
      });
    });

    it('should show loading state for updates', async () => {
      vi.mocked(supplierService.updateSupplier).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          ...mockSuppliers[0],
          name: 'Updated Name'
        }), 100))
      );

      const { result } = renderHook(() => useSuppliers(), {
        wrapper: createWrapper,
      });

      act(() => {
        result.current.updateSupplier({
          id: 'supplier-1',
          name: 'Updated Name'
        });
      });

      expect(result.current.isUpdating).toBe(true);

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });
    });
  });
});