import { useState, useEffect, useCallback } from 'react';
import { Product, PriceHistory } from '../../features/sales/types';
import { productService } from '../services';
import { toast } from 'sonner';

export interface UsePriceManagementReturn {
  variableProducts: Product[];
  allProducts: Product[];
  loading: boolean;
  error: string | null;
  updateProductPrice: (productId: string, newPrice: number, reason?: string) => Promise<void>;
  getPriceHistory: (productId: string) => Promise<PriceHistory[]>;
  getCurrentPrice: (productId: string) => Promise<number>;
  validateQuantity: (product: Product, quantity: number) => boolean;
  formatQuantity: (product: Product, quantity: number) => string;
  refreshProducts: () => Promise<void>;
}

/**
 * Custom hook for managing product prices and variable pricing functionality
 */
export const usePriceManagement = (currentUserId?: string): UsePriceManagementReturn => {
  const [variableProducts, setVariableProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load products data
   */
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [variable, all] = await Promise.all([
        productService.getVariablePriceProducts(),
        productService.getActiveProducts()
      ]);

      setVariableProducts(variable);
      setAllProducts(all);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des produits';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update product price with validation and error handling
   */
  const updateProductPrice = useCallback(async (
    productId: string, 
    newPrice: number, 
    reason?: string
  ): Promise<void> => {
    if (!currentUserId) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      await productService.updatePrice(productId, newPrice, currentUserId, reason);
      
      // Refresh products to get updated prices
      await loadProducts();
      
      toast.success('Prix mis à jour avec succès');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du prix';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, [currentUserId, loadProducts]);

  /**
   * Get price history for a product
   */
  const getPriceHistory = useCallback(async (productId: string): Promise<PriceHistory[]> => {
    try {
      return await productService.getPriceHistory(productId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement de l\'historique';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    }
  }, []);

  /**
   * Get current price for a product
   */
  const getCurrentPrice = useCallback(async (productId: string): Promise<number> => {
    try {
      return await productService.getCurrentPrice(productId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération du prix';
      setError(errorMessage);
      toast.error(errorMessage);
      return 0;
    }
  }, []);

  /**
   * Validate quantity based on product unit type
   */
  const validateQuantity = useCallback((product: Product, quantity: number): boolean => {
    return productService.validateQuantity(product, quantity);
  }, []);

  /**
   * Format quantity display based on product unit type
   */
  const formatQuantity = useCallback((product: Product, quantity: number): string => {
    return productService.formatQuantity(product, quantity);
  }, []);

  /**
   * Refresh products data
   */
  const refreshProducts = useCallback(async (): Promise<void> => {
    await loadProducts();
  }, [loadProducts]);

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    variableProducts,
    allProducts,
    loading,
    error,
    updateProductPrice,
    getPriceHistory,
    getCurrentPrice,
    validateQuantity,
    formatQuantity,
    refreshProducts
  };
};