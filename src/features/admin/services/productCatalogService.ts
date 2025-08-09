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

class ProductCatalogService {
  private products: Product[] = [
    {
      id: 'prod-1',
      name: 'Thon Rouge',
      category: 'Poisson frais',
      unit: 'kg',
      unitPrice: 6500,
      priceType: 'variable',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      allowDecimals: true
    },
    {
      id: 'prod-2',
      name: 'Saumon',
      category: 'Poisson frais',
      unit: 'kg',
      unitPrice: 8500,
      priceType: 'variable',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      allowDecimals: true
    },
    {
      id: 'prod-3',
      name: 'Crevettes',
      category: 'Crustacés',
      unit: 'kg',
      unitPrice: 12000,
      priceType: 'variable',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      allowDecimals: true
    },
    {
      id: 'prod-4',
      name: 'Glace (sac)',
      category: 'Accessoires',
      unit: 'pack',
      unitPrice: 500,
      priceType: 'fixed',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      allowDecimals: false
    },
    {
      id: 'prod-5',
      name: 'Sardines',
      category: 'Poisson frais',
      unit: 'kg',
      unitPrice: 2500,
      priceType: 'variable',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      allowDecimals: true
    }
  ];

  private categories: ProductCategory[] = [
    {
      id: 'cat-1',
      name: 'Poisson frais',
      description: 'Poissons frais du jour',
      isActive: true
    },
    {
      id: 'cat-2',
      name: 'Crustacés',
      description: 'Crevettes, crabes, homards',
      isActive: true
    },
    {
      id: 'cat-3',
      name: 'Mollusques',
      description: 'Huîtres, moules, coquillages',
      isActive: true
    },
    {
      id: 'cat-4',
      name: 'Poisson congelé',
      description: 'Poissons surgelés',
      isActive: true
    },
    {
      id: 'cat-5',
      name: 'Accessoires',
      description: 'Glace, sacs, condiments',
      isActive: true
    }
  ];

  private priceHistory: PriceHistory[] = [
    {
      id: 'ph-1',
      productId: 'prod-1',
      price: 6000,
      date: new Date('2024-01-01'),
      updatedBy: 'user-1',
      reason: 'Prix initial'
    },
    {
      id: 'ph-2',
      productId: 'prod-1',
      price: 6500,
      date: new Date('2024-01-15'),
      updatedBy: 'user-1',
      reason: 'Augmentation saisonnière'
    }
  ];

  async getAllProducts(): Promise<Product[]> {
    return [...this.products];
  }

  async getActiveProducts(): Promise<Product[]> {
    return this.products.filter(product => product.isActive);
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.products.find(product => product.id === id) || null;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.products.filter(product => 
      product.category === category && product.isActive
    );
  }

  async getVariablePriceProducts(): Promise<Product[]> {
    return this.products.filter(product => 
      product.priceType === 'variable' && product.isActive
    );
  }

  async createProduct(request: ProductCreationRequest): Promise<Product> {
    // Check if product name already exists
    const existingProduct = this.products.find(p => 
      p.name.toLowerCase() === request.name.toLowerCase()
    );
    if (existingProduct) {
      throw new Error('Un produit avec ce nom existe déjà');
    }

    // Validate category exists
    const categoryExists = this.categories.find(c => 
      c.name === request.category && c.isActive
    );
    if (!categoryExists) {
      throw new Error('Catégorie introuvable ou inactive');
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: request.name,
      category: request.category,
      unit: request.unit,
      unitPrice: request.unitPrice,
      priceType: request.priceType,
      isActive: true,
      createdAt: new Date(),
      allowDecimals: request.unit === 'kg'
    };

    this.products.push(newProduct);

    // Add initial price history entry
    const priceHistoryEntry: PriceHistory = {
      id: `ph-${Date.now()}`,
      productId: newProduct.id,
      price: request.unitPrice,
      date: new Date(),
      updatedBy: 'current-user', // In real app, this would be the current user's ID
      reason: 'Prix initial'
    };
    this.priceHistory.push(priceHistoryEntry);

    return newProduct;
  }

  async updateProduct(id: string, updates: ProductUpdateRequest): Promise<Product> {
    const productIndex = this.products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      throw new Error('Produit introuvable');
    }

    const currentProduct = this.products[productIndex];

    // Check if name is being changed and doesn't conflict
    if (updates.name && updates.name !== currentProduct.name) {
      const existingProduct = this.products.find(p => 
        p.name.toLowerCase() === updates.name!.toLowerCase() && p.id !== id
      );
      if (existingProduct) {
        throw new Error('Un produit avec ce nom existe déjà');
      }
    }

    // Validate category if being updated
    if (updates.category) {
      const categoryExists = this.categories.find(c => 
        c.name === updates.category && c.isActive
      );
      if (!categoryExists) {
        throw new Error('Catégorie introuvable ou inactive');
      }
    }

    // Update allowDecimals if unit is being changed
    if (updates.unit) {
      updates = { ...updates, allowDecimals: updates.unit === 'kg' };
    }

    // If price is being updated, add to price history
    if (updates.unitPrice && updates.unitPrice !== currentProduct.unitPrice) {
      const priceHistoryEntry: PriceHistory = {
        id: `ph-${Date.now()}`,
        productId: id,
        price: updates.unitPrice,
        date: new Date(),
        updatedBy: 'current-user', // In real app, this would be the current user's ID
        reason: 'Mise à jour manuelle'
      };
      this.priceHistory.push(priceHistoryEntry);
    }

    this.products[productIndex] = { ...currentProduct, ...updates };
    return this.products[productIndex];
  }

  async deactivateProduct(id: string): Promise<void> {
    const productIndex = this.products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      throw new Error('Produit introuvable');
    }

    this.products[productIndex].isActive = false;
  }

  async activateProduct(id: string): Promise<void> {
    const productIndex = this.products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      throw new Error('Produit introuvable');
    }

    this.products[productIndex].isActive = true;
  }

  async updateProductPrice(id: string, newPrice: number, updatedBy: string, reason?: string): Promise<void> {
    const productIndex = this.products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      throw new Error('Produit introuvable');
    }

    const currentProduct = this.products[productIndex];
    
    if (currentProduct.unitPrice === newPrice) {
      throw new Error('Le nouveau prix est identique au prix actuel');
    }

    // Update product price
    this.products[productIndex].unitPrice = newPrice;

    // Add to price history
    const priceHistoryEntry: PriceHistory = {
      id: `ph-${Date.now()}`,
      productId: id,
      price: newPrice,
      date: new Date(),
      updatedBy,
      reason: reason || 'Mise à jour de prix'
    };
    this.priceHistory.push(priceHistoryEntry);
  }

  async getPriceHistory(productId: string): Promise<PriceHistory[]> {
    return this.priceHistory
      .filter(ph => ph.productId === productId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  // Category Management
  async getAllCategories(): Promise<ProductCategory[]> {
    return [...this.categories];
  }

  async getActiveCategories(): Promise<ProductCategory[]> {
    return this.categories.filter(category => category.isActive);
  }

  async createCategory(name: string, description?: string): Promise<ProductCategory> {
    // Check if category name already exists
    const existingCategory = this.categories.find(c => 
      c.name.toLowerCase() === name.toLowerCase()
    );
    if (existingCategory) {
      throw new Error('Une catégorie avec ce nom existe déjà');
    }

    const newCategory: ProductCategory = {
      id: `cat-${Date.now()}`,
      name,
      description,
      isActive: true
    };

    this.categories.push(newCategory);
    return newCategory;
  }

  async updateCategory(id: string, updates: { name?: string; description?: string; isActive?: boolean }): Promise<ProductCategory> {
    const categoryIndex = this.categories.findIndex(c => c.id === id);
    if (categoryIndex === -1) {
      throw new Error('Catégorie introuvable');
    }

    const currentCategory = this.categories[categoryIndex];

    // Check if name is being changed and doesn't conflict
    if (updates.name && updates.name !== currentCategory.name) {
      const existingCategory = this.categories.find(c => 
        c.name.toLowerCase() === updates.name!.toLowerCase() && c.id !== id
      );
      if (existingCategory) {
        throw new Error('Une catégorie avec ce nom existe déjà');
      }
    }

    this.categories[categoryIndex] = { ...currentCategory, ...updates };
    return this.categories[categoryIndex];
  }

  async deactivateCategory(id: string): Promise<void> {
    const categoryIndex = this.categories.findIndex(c => c.id === id);
    if (categoryIndex === -1) {
      throw new Error('Catégorie introuvable');
    }

    // Check if category has active products
    const hasActiveProducts = this.products.some(p => 
      p.category === this.categories[categoryIndex].name && p.isActive
    );
    
    if (hasActiveProducts) {
      throw new Error('Impossible de désactiver une catégorie contenant des produits actifs');
    }

    this.categories[categoryIndex].isActive = false;
  }

  async getProductStatistics(): Promise<{
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    productsByType: { fixed: number; variable: number };
    productsByUnit: { kg: number; pack: number; unit: number };
  }> {
    const activeProducts = this.products.filter(p => p.isActive);
    const inactiveProducts = this.products.filter(p => !p.isActive);
    
    return {
      totalProducts: this.products.length,
      activeProducts: activeProducts.length,
      inactiveProducts: inactiveProducts.length,
      productsByType: {
        fixed: this.products.filter(p => p.priceType === 'fixed').length,
        variable: this.products.filter(p => p.priceType === 'variable').length
      },
      productsByUnit: {
        kg: this.products.filter(p => p.unit === 'kg').length,
        pack: this.products.filter(p => p.unit === 'pack').length,
        unit: this.products.filter(p => p.unit === 'unit').length
      }
    };
  }
}

export const productCatalogService = new ProductCatalogService();