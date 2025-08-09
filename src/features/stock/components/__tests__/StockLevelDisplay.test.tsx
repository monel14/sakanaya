import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StockLevelDisplay } from '../StockLevelDisplay';
import { useStockLevels } from '../../shared/hooks/useStockLevels';

// Mock the hook
vi.mock('../../hooks/useStockLevels', () => ({
  useStockLevels: vi.fn()
}));

const mockStockLevels = [
  {
    id: 'stock-1',
    storeId: 'store-1',
    productId: 'product-1',
    product: {
      id: 'product-1',
      name: 'Thon Rouge',
      category: 'Poisson',
      unit: 'kg',
      price: 8000
    },
    quantity: 25,
    reservedQuantity: 5,
    availableQuantity: 20,
    alertThreshold: 10,
    lastUpdated: new Date('2024-01-01')
  },
  {
    id: 'stock-2',
    storeId: 'store-1',
    productId: 'product-2',
    product: {
      id: 'product-2',
      name: 'Dorade',
      category: 'Poisson',
      unit: 'kg',
      price: 6000
    },
    quantity: 5,
    reservedQuantity: 0,
    availableQuantity: 5,
    alertThreshold: 10,
    lastUpdated: new Date('2024-01-01')
  },
  {
    id: 'stock-3',
    storeId: 'store-1',
    productId: 'product-3',
    product: {
      id: 'product-3',
      name: 'Crevettes',
      category: 'Crustacé',
      unit: 'kg',
      price: 12000
    },
    quantity: 0,
    reservedQuantity: 0,
    availableQuantity: 0,
    alertThreshold: 5,
    lastUpdated: new Date('2024-01-01')
  }
];

describe('StockLevelDisplay', () => {
  let queryClient: QueryClient;

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

  const renderComponent = (props = {}) => {
    const defaultProps = {
      storeId: 'store-1',
      userRole: 'manager' as const,
      ...props
    };

    return render(
      <QueryClientProvider client={queryClient}>
        <StockLevelDisplay {...defaultProps} />
      </QueryClientProvider>
    );
  };

  describe('Loading and Error States', () => {
    it('should show loading state', () => {
      vi.mocked(useStockLevels).mockReturnValue({
        stockLevels: [],
        isLoading: true,
        error: null,
        refetch: vi.fn()
      });

      renderComponent();

      expect(screen.getByText(/chargement/i)).toBeInTheDocument();
    });

    it('should show error state', () => {
      const errorMessage = 'Failed to load stock levels';
      vi.mocked(useStockLevels).mockReturnValue({
        stockLevels: [],
        isLoading: false,
        error: new Error(errorMessage),
        refetch: vi.fn()
      });

      renderComponent();

      expect(screen.getByText(/erreur/i)).toBeInTheDocument();
    });

    it('should show empty state when no stock levels', () => {
      vi.mocked(useStockLevels).mockReturnValue({
        stockLevels: [],
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      renderComponent();

      expect(screen.getByText(/aucun produit/i)).toBeInTheDocument();
    });
  });

  describe('Stock Display', () => {
    beforeEach(() => {
      vi.mocked(useStockLevels).mockReturnValue({
        stockLevels: mockStockLevels,
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });
    });

    it('should display all stock levels', () => {
      renderComponent();

      expect(screen.getByText('Thon Rouge')).toBeInTheDocument();
      expect(screen.getByText('Dorade')).toBeInTheDocument();
      expect(screen.getByText('Crevettes')).toBeInTheDocument();
    });

    it('should display quantities correctly', () => {
      renderComponent();

      // Check quantities are displayed
      expect(screen.getByText('25 kg')).toBeInTheDocument(); // Thon Rouge
      expect(screen.getByText('5 kg')).toBeInTheDocument(); // Dorade
      expect(screen.getByText('0 kg')).toBeInTheDocument(); // Crevettes
    });

    it('should show alert indicators for low stock', () => {
      renderComponent();

      // Dorade should have alert (5 < 10)
      const doradeRow = screen.getByText('Dorade').closest('tr');
      expect(doradeRow).toHaveClass('bg-yellow-50');

      // Crevettes should have critical alert (0 < 5)
      const crevettesRow = screen.getByText('Crevettes').closest('tr');
      expect(crevettesRow).toHaveClass('bg-red-50');
    });

    it('should not show financial data for manager role', () => {
      renderComponent({ userRole: 'manager' });

      // Should not show prices or values
      expect(screen.queryByText('8000')).not.toBeInTheDocument();
      expect(screen.queryByText('Valeur')).not.toBeInTheDocument();
    });

    it('should show financial data for director role', () => {
      renderComponent({ userRole: 'director' });

      // Should show financial columns
      expect(screen.getByText(/coût unitaire/i)).toBeInTheDocument();
      expect(screen.getByText(/valeur totale/i)).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      vi.mocked(useStockLevels).mockReturnValue({
        stockLevels: mockStockLevels,
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });
    });

    it('should filter by product name', async () => {
      renderComponent();

      const searchInput = screen.getByPlaceholderText(/rechercher/i);
      fireEvent.change(searchInput, { target: { value: 'Thon' } });

      await waitFor(() => {
        expect(screen.getByText('Thon Rouge')).toBeInTheDocument();
        expect(screen.queryByText('Dorade')).not.toBeInTheDocument();
        expect(screen.queryByText('Crevettes')).not.toBeInTheDocument();
      });
    });

    it('should filter by category', async () => {
      renderComponent();

      const categoryFilter = screen.getByDisplayValue(/toutes les catégories/i);
      fireEvent.change(categoryFilter, { target: { value: 'Crustacé' } });

      await waitFor(() => {
        expect(screen.getByText('Crevettes')).toBeInTheDocument();
        expect(screen.queryByText('Thon Rouge')).not.toBeInTheDocument();
        expect(screen.queryByText('Dorade')).not.toBeInTheDocument();
      });
    });

    it('should filter by alert status', async () => {
      renderComponent();

      const alertFilter = screen.getByDisplayValue(/tous les statuts/i);
      fireEvent.change(alertFilter, { target: { value: 'alert' } });

      await waitFor(() => {
        expect(screen.getByText('Dorade')).toBeInTheDocument(); // Low stock
        expect(screen.getByText('Crevettes')).toBeInTheDocument(); // Out of stock
        expect(screen.queryByText('Thon Rouge')).not.toBeInTheDocument(); // Normal stock
      });
    });

    it('should show only out of stock items', async () => {
      renderComponent();

      const alertFilter = screen.getByDisplayValue(/tous les statuts/i);
      fireEvent.change(alertFilter, { target: { value: 'out_of_stock' } });

      await waitFor(() => {
        expect(screen.getByText('Crevettes')).toBeInTheDocument();
        expect(screen.queryByText('Thon Rouge')).not.toBeInTheDocument();
        expect(screen.queryByText('Dorade')).not.toBeInTheDocument();
      });
    });
  });

  describe('Sorting', () => {
    beforeEach(() => {
      vi.mocked(useStockLevels).mockReturnValue({
        stockLevels: mockStockLevels,
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });
    });

    it('should sort by product name', async () => {
      renderComponent();

      const nameHeader = screen.getByText(/produit/i);
      fireEvent.click(nameHeader);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        const productNames = rows.slice(1).map(row => 
          row.querySelector('td')?.textContent
        );
        
        // Should be sorted alphabetically
        expect(productNames[0]).toContain('Crevettes');
        expect(productNames[1]).toContain('Dorade');
        expect(productNames[2]).toContain('Thon Rouge');
      });
    });

    it('should sort by quantity', async () => {
      renderComponent();

      const quantityHeader = screen.getByText(/quantité/i);
      fireEvent.click(quantityHeader);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        const quantities = rows.slice(1).map(row => {
          const quantityCell = row.querySelectorAll('td')[1];
          return parseInt(quantityCell?.textContent || '0');
        });
        
        // Should be sorted by quantity (ascending)
        expect(quantities[0]).toBe(0); // Crevettes
        expect(quantities[1]).toBe(5); // Dorade
        expect(quantities[2]).toBe(25); // Thon Rouge
      });
    });

    it('should reverse sort on second click', async () => {
      renderComponent();

      const quantityHeader = screen.getByText(/quantité/i);
      
      // First click - ascending
      fireEvent.click(quantityHeader);
      
      // Second click - descending
      fireEvent.click(quantityHeader);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        const quantities = rows.slice(1).map(row => {
          const quantityCell = row.querySelectorAll('td')[1];
          return parseInt(quantityCell?.textContent || '0');
        });
        
        // Should be sorted by quantity (descending)
        expect(quantities[0]).toBe(25); // Thon Rouge
        expect(quantities[1]).toBe(5); // Dorade
        expect(quantities[2]).toBe(0); // Crevettes
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('should call refetch when refresh button is clicked', async () => {
      const mockRefetch = vi.fn();
      vi.mocked(useStockLevels).mockReturnValue({
        stockLevels: mockStockLevels,
        isLoading: false,
        error: null,
        refetch: mockRefetch
      });

      renderComponent();

      const refreshButton = screen.getByRole('button', { name: /actualiser/i });
      fireEvent.click(refreshButton);

      expect(mockRefetch).toHaveBeenCalled();
    });

    it('should show loading state during refresh', async () => {
      const mockRefetch = vi.fn();
      vi.mocked(useStockLevels).mockReturnValue({
        stockLevels: mockStockLevels,
        isLoading: true,
        error: null,
        refetch: mockRefetch
      });

      renderComponent();

      expect(screen.getByText(/chargement/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      vi.mocked(useStockLevels).mockReturnValue({
        stockLevels: mockStockLevels,
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });
    });

    it('should have proper table structure', () => {
      renderComponent();

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader')).toHaveLength(3); // For manager role
      expect(screen.getAllByRole('row')).toHaveLength(4); // Header + 3 data rows
    });

    it('should have proper ARIA labels', () => {
      renderComponent();

      expect(screen.getByLabelText(/rechercher un produit/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/filtrer par catégorie/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/filtrer par statut/i)).toBeInTheDocument();
    });

    it('should have proper button labels', () => {
      renderComponent();

      expect(screen.getByRole('button', { name: /actualiser/i })).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    beforeEach(() => {
      vi.mocked(useStockLevels).mockReturnValue({
        stockLevels: mockStockLevels,
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });
    });

    it('should have responsive classes', () => {
      renderComponent();

      const table = screen.getByRole('table');
      expect(table.closest('div')).toHaveClass('overflow-x-auto');
    });

    it('should show mobile-friendly layout on small screens', () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 640,
      });

      renderComponent();

      // Should still render table but with responsive wrapper
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByRole('table').closest('div')).toHaveClass('overflow-x-auto');
    });
  });
});