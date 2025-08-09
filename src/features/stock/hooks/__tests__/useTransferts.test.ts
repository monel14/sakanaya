import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useTransferts } from '../useTransferts';
import { transfertService } from '../../services/transfertService';
import { TransfertStatus } from '../../types';

// Mock the transfert service
vi.mock('../../services/transfertService', () => ({
  transfertService: {
    getAllTransferts: vi.fn(),
    getTransfertById: vi.fn(),
    getTransfertsByStore: vi.fn(),
    getTransfertsByStatus: vi.fn(),
    createTransfert: vi.fn(),
    receiveTransfert: vi.fn(),
    cancelTransfert: vi.fn(),
    getTransfertStats: vi.fn()
  }
}));

const mockTransferts = [
  {
    id: 'transfert-1',
    numero: 'TR-2024-0001',
    dateCreation: new Date('2024-01-01'),
    storeSourceId: 'store-1',
    storeDestinationId: 'store-2',
    status: 'en_transit' as TransfertStatus,
    createdBy: 'user-1',
    createdAt: new Date('2024-01-01'),
    lignes: [
      {
        id: 'ligne-1',
        transfertId: 'transfert-1',
        productId: 'product-1',
        quantiteEnvoyee: 10
      }
    ]
  },
  {
    id: 'transfert-2',
    numero: 'TR-2024-0002',
    dateCreation: new Date('2024-01-02'),
    storeSourceId: 'store-2',
    storeDestinationId: 'store-1',
    status: 'termine' as TransfertStatus,
    createdBy: 'user-1',
    createdAt: new Date('2024-01-02'),
    receptionneBy: 'user-2',
    receptionneAt: new Date('2024-01-03'),
    lignes: [
      {
        id: 'ligne-2',
        transfertId: 'transfert-2',
        productId: 'product-2',
        quantiteEnvoyee: 5,
        quantiteRecue: 5,
        ecart: 0
      }
    ]
  }
];

const mockTransfertStats = {
  total: 2,
  enTransit: 1,
  termine: 1,
  termineAvecEcart: 0,
  annule: 0
};

describe('useTransferts', () => {
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

  describe('useTransferts hook', () => {
    it('should fetch all transferts by default', async () => {
      vi.mocked(transfertService.getAllTransferts).mockResolvedValue(mockTransferts);

      const { result } = renderHook(() => useTransferts(), {
        wrapper: createWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.transferts).toHaveLength(2);
      expect(transfertService.getAllTransferts).toHaveBeenCalled();
    });

    it('should filter transferts by store when specified', async () => {
      const storeTransferts = [mockTransferts[0]];
      vi.mocked(transfertService.getTransfertsByStore).mockResolvedValue(storeTransferts);

      const { result } = renderHook(() => useTransferts({ storeId: 'store-1' }), {
        wrapper: createWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.transferts).toHaveLength(1);
      expect(transfertService.getTransfertsByStore).toHaveBeenCalledWith('store-1');
    });

    it('should filter transferts by status when specified', async () => {
      const statusTransferts = [mockTransferts[0]];
      vi.mocked(transfertService.getTransfertsByStatus).mockResolvedValue(statusTransferts);

      const { result } = renderHook(() => useTransferts({ status: 'en_transit' }), {
        wrapper: createWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.transferts).toHaveLength(1);
      expect(transfertService.getTransfertsByStatus).toHaveBeenCalledWith('en_transit');
    });

    it('should handle loading state', () => {
      vi.mocked(transfertService.getAllTransferts).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockTransferts), 100))
      );

      const { result } = renderHook(() => useTransferts(), {
        wrapper: createWrapper,
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.transferts).toEqual([]);
    });

    it('should handle error state', async () => {
      const errorMessage = 'Failed to fetch transferts';
      vi.mocked(transfertService.getAllTransferts).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useTransferts(), {
        wrapper: createWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.transferts).toEqual([]);
    });
  });

  describe('useTransfert hook', () => {
    it('should fetch specific transfert by id', async () => {
      const transfertId = 'transfert-1';
      vi.mocked(transfertService.getTransfertById).mockResolvedValue(mockTransferts[0]);

      const { result } = renderHook(() => useTransferts({ transfertId }), {
        wrapper: createWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.transfert).toEqual(mockTransferts[0]);
      expect(transfertService.getTransfertById).toHaveBeenCalledWith(transfertId);
    });

    it('should handle transfert not found', async () => {
      const transfertId = 'non-existent-transfert';
      vi.mocked(transfertService.getTransfertById).mockResolvedValue(null);

      const { result } = renderHook(() => useTransferts({ transfertId }), {
        wrapper: createWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.transfert).toBeNull();
      expect(transfertService.getTransfertById).toHaveBeenCalledWith(transfertId);
    });
  });

  describe('useTransfertStats hook', () => {
    it('should fetch transfert statistics', async () => {
      vi.mocked(transfertService.getTransfertStats).mockResolvedValue(mockTransfertStats);

      const { result } = renderHook(() => useTransferts({ withStats: true }), {
        wrapper: createWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.stats).toEqual(mockTransfertStats);
      expect(transfertService.getTransfertStats).toHaveBeenCalled();
    });
  });

  describe('Mutations', () => {
    it('should create transfert successfully', async () => {
      const newTransfert = {
        id: 'transfert-3',
        numero: 'TR-2024-0003',
        dateCreation: new Date(),
        storeSourceId: 'store-1',
        storeDestinationId: 'store-2',
        status: 'en_transit' as TransfertStatus,
        createdBy: 'user-1',
        createdAt: new Date(),
        lignes: [
          {
            id: 'ligne-3',
            transfertId: 'transfert-3',
            productId: 'product-1',
            quantiteEnvoyee: 15
          }
        ]
      };

      vi.mocked(transfertService.createTransfert).mockResolvedValue(newTransfert);

      const { result } = renderHook(() => useTransferts(), {
        wrapper: createWrapper,
      });

      await act(async () => {
        await result.current.createTransfert({
          storeSourceId: 'store-1',
          storeDestinationId: 'store-2',
          lignes: [
            {
              productId: 'product-1',
              quantiteEnvoyee: 15
            }
          ]
        });
      });

      expect(transfertService.createTransfert).toHaveBeenCalledWith(
        {
          storeSourceId: 'store-1',
          storeDestinationId: 'store-2',
          lignes: [
            {
              productId: 'product-1',
              quantiteEnvoyee: 15
            }
          ]
        },
        expect.any(String)
      );
    });

    it('should handle create transfert error', async () => {
      const errorMessage = 'Failed to create transfert';
      vi.mocked(transfertService.createTransfert).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useTransferts(), {
        wrapper: createWrapper,
      });

      await act(async () => {
        try {
          await result.current.createTransfert({
            storeSourceId: 'store-1',
            storeDestinationId: 'store-2',
            lignes: []
          });
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toBe(errorMessage);
        }
      });
    });

    it('should receive transfert successfully', async () => {
      const receivedTransfert = {
        ...mockTransferts[0],
        status: 'termine' as TransfertStatus,
        receptionneBy: 'user-2',
        receptionneAt: new Date(),
        lignes: [
          {
            ...mockTransferts[0].lignes[0],
            quantiteRecue: 8,
            ecart: -2
          }
        ]
      };

      vi.mocked(transfertService.receiveTransfert).mockResolvedValue(receivedTransfert);

      const { result } = renderHook(() => useTransferts(), {
        wrapper: createWrapper,
      });

      await act(async () => {
        await result.current.receiveTransfert('transfert-1', {
          lignes: [
            {
              ligneTransfertId: 'ligne-1',
              quantiteRecue: 8,
              commentaire: 'Légère perte'
            }
          ]
        });
      });

      expect(transfertService.receiveTransfert).toHaveBeenCalledWith(
        'transfert-1',
        {
          lignes: [
            {
              ligneTransfertId: 'ligne-1',
              quantiteRecue: 8,
              commentaire: 'Légère perte'
            }
          ]
        },
        expect.any(String)
      );
    });

    it('should cancel transfert successfully', async () => {
      const cancelledTransfert = {
        ...mockTransferts[0],
        status: 'annule' as TransfertStatus
      };

      vi.mocked(transfertService.cancelTransfert).mockResolvedValue(cancelledTransfert);

      const { result } = renderHook(() => useTransferts(), {
        wrapper: createWrapper,
      });

      await act(async () => {
        await result.current.cancelTransfert('transfert-1', 'Annulation test');
      });

      expect(transfertService.cancelTransfert).toHaveBeenCalledWith(
        'transfert-1',
        expect.any(String),
        'Annulation test'
      );
    });
  });

  describe('Filtering and sorting', () => {
    it('should provide filtered transferts by direction', async () => {
      vi.mocked(transfertService.getAllTransferts).mockResolvedValue(mockTransferts);

      const { result } = renderHook(() => useTransferts(), {
        wrapper: createWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Test outgoing transferts for store-1
      const outgoing = result.current.getTransfertsByDirection('store-1', 'sortant');
      expect(outgoing).toHaveLength(1);
      expect(outgoing[0].storeSourceId).toBe('store-1');

      // Test incoming transferts for store-1
      const incoming = result.current.getTransfertsByDirection('store-1', 'entrant');
      expect(incoming).toHaveLength(1);
      expect(incoming[0].storeDestinationId).toBe('store-1');
    });

    it('should provide pending transferts for store', async () => {
      vi.mocked(transfertService.getAllTransferts).mockResolvedValue(mockTransferts);

      const { result } = renderHook(() => useTransferts(), {
        wrapper: createWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const pending = result.current.getPendingTransferts('store-2');
      expect(pending).toHaveLength(1);
      expect(pending[0].status).toBe('en_transit');
      expect(pending[0].storeDestinationId).toBe('store-2');
    });
  });

  describe('Cache invalidation', () => {
    it('should invalidate cache after creating transfert', async () => {
      const newTransfert = {
        id: 'transfert-3',
        numero: 'TR-2024-0003',
        dateCreation: new Date(),
        storeSourceId: 'store-1',
        storeDestinationId: 'store-2',
        status: 'en_transit' as TransfertStatus,
        createdBy: 'user-1',
        createdAt: new Date(),
        lignes: []
      };

      vi.mocked(transfertService.getAllTransferts)
        .mockResolvedValueOnce(mockTransferts)
        .mockResolvedValueOnce([...mockTransferts, newTransfert]);

      vi.mocked(transfertService.createTransfert).mockResolvedValue(newTransfert);

      const { result } = renderHook(() => useTransferts(), {
        wrapper: createWrapper,
      });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.transferts).toHaveLength(2);

      // Create new transfert
      await act(async () => {
        await result.current.createTransfert({
          storeSourceId: 'store-1',
          storeDestinationId: 'store-2',
          lignes: []
        });
      });

      // Wait for cache invalidation and refetch
      await waitFor(() => {
        expect(result.current.transferts).toHaveLength(3);
      });
    });

    it('should invalidate cache after receiving transfert', async () => {
      const receivedTransfert = {
        ...mockTransferts[0],
        status: 'termine' as TransfertStatus,
        receptionneBy: 'user-2',
        receptionneAt: new Date()
      };

      vi.mocked(transfertService.getAllTransferts)
        .mockResolvedValueOnce(mockTransferts)
        .mockResolvedValueOnce([receivedTransfert, mockTransferts[1]]);

      vi.mocked(transfertService.receiveTransfert).mockResolvedValue(receivedTransfert);

      const { result } = renderHook(() => useTransferts(), {
        wrapper: createWrapper,
      });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.transferts[0].status).toBe('en_transit');

      // Receive transfert
      await act(async () => {
        await result.current.receiveTransfert('transfert-1', {
          lignes: []
        });
      });

      // Wait for cache invalidation and refetch
      await waitFor(() => {
        expect(result.current.transferts[0].status).toBe('termine');
      });
    });
  });

  describe('Loading states', () => {
    it('should show loading state for create mutation', async () => {
      vi.mocked(transfertService.createTransfert).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          id: 'transfert-3',
          numero: 'TR-2024-0003',
          dateCreation: new Date(),
          storeSourceId: 'store-1',
          storeDestinationId: 'store-2',
          status: 'en_transit' as TransfertStatus,
          createdBy: 'user-1',
          createdAt: new Date(),
          lignes: []
        }), 100))
      );

      const { result } = renderHook(() => useTransferts(), {
        wrapper: createWrapper,
      });

      act(() => {
        result.current.createTransfert({
          storeSourceId: 'store-1',
          storeDestinationId: 'store-2',
          lignes: []
        });
      });

      expect(result.current.isCreating).toBe(true);

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false);
      });
    });

    it('should show loading state for receive mutation', async () => {
      vi.mocked(transfertService.receiveTransfert).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          ...mockTransferts[0],
          status: 'termine' as TransfertStatus
        }), 100))
      );

      const { result } = renderHook(() => useTransferts(), {
        wrapper: createWrapper,
      });

      act(() => {
        result.current.receiveTransfert('transfert-1', {
          lignes: []
        });
      });

      expect(result.current.isReceiving).toBe(true);

      await waitFor(() => {
        expect(result.current.isReceiving).toBe(false);
      });
    });
  });
});