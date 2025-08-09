import { useState, useEffect } from 'react';
import { productCatalogService } from '../services/productCatalogService';
import { Product, PriceHistory } from '../../sales/types';

interface ProductCreationRequest {
  name: string;
  category: string;
  unit: 'kg' | 'pack' | 'unit';
  unitPrice: number;
  priceType: 'fixed' | 'variable';
}

interface ProductUpdateRequest {
  name?: string;
  category?: string;
  unit?: 'kg' | 'pack' | 'unit';
  unitPrice?: number;
  priceType?: 'fixed' | 'variable';
  isActive?: boolean;
}

interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export const useProductCatalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const productsData = await productCatalogService.getAllProducts();
      setProducts(productsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await productCatalogService.getAllCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Erreur lors du chargement des catégories:', err);
    }
  };

  const createProduct = async (request: ProductCreationRequest) => {
    try {
      setLoading(true);
      setError(null);
      await productCatalogService.createProduct(request);
      await loadProducts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du produit';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: string, updates: ProductUpdateRequest) => {
    try {
      setLoading(true);
      setError(null);
      await productCatalogService.updateProduct(id, updates);
      await loadProducts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du produit';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deactivateProduct = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await productCatalogService.deactivateProduct(id);
      await loadProducts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la désactivation du produit';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const activateProduct = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await productCatalogService.activateProduct(id);
      await loadProducts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'activation du produit';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateProductPrice = async (id: string, newPrice: number, reason?: string) => {
    try {
      setLoading(true);
      setError(null);
      await productCatalogService.updateProductPrice(id, newPrice, 'current-user', reason);
      await loadProducts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du prix';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPriceHistory = async (productId: string): Promise<PriceHistory[]> => {
    try {
      return await productCatalogService.getPriceHistory(productId);
    } catch (err) {
      console.error('Erreur lors du chargement de l\'historique des prix:', err);
      return [];
    }
  };

  const createCategory = async (name: string, description?: string) => {
    try {
      setLoading(true);
      setError(null);
      await productCatalogService.createCategory(name, description);
      await loadCategories();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de la catégorie';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: string, updates: { name?: string; description?: string; isActive?: boolean }) => {
    try {
      setLoading(true);
      setError(null);
      await productCatalogService.updateCategory(id, updates);
      await loadCategories();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la catégorie';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deactivateCategory = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await productCatalogService.deactivateCategory(id);
      await loadCategories();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la désactivation de la catégorie';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getActiveProducts = async (): Promise<Product[]> => {
    try {
      return await productCatalogService.getActiveProducts();
    } catch (err) {
      console.error('Erreur lors du chargement des produits actifs:', err);
      return [];
    }
  };

  const getVariablePriceProducts = async (): Promise<Product[]> => {
    try {
      return await productCatalogService.getVariablePriceProducts();
    } catch (err) {
      console.error('Erreur lors du chargement des produits à prix variable:', err);
      return [];
    }
  };

  const getProductStatistics = async () => {
    try {
      return await productCatalogService.getProductStatistics();
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      return {
        totalProducts: 0,
        activeProducts: 0,
        inactiveProducts: 0,
        productsByType: { fixed: 0, variable: 0 },
        productsByUnit: { kg: 0, pack: 0, unit: 0 }
      };
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  return {
    products,
    categories,
    loading,
    error,
    createProduct,
    updateProduct,
    deactivateProduct,
    activateProduct,
    updateProductPrice,
    getPriceHistory,
    createCategory,
    updateCategory,
    deactivateCategory,
    getActiveProducts,
    getVariablePriceProducts,
    getProductStatistics,
    refreshData: () => {
      loadProducts();
      loadCategories();
    }
  };
};