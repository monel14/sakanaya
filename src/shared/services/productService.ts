import { Product, PriceHistory } from '@/features/sales/types';
import { NotificationService } from './notificationService';

/**
 * Service for managing products and variable pricing
 * Handles price updates, history tracking, and notifications
 */
export class ProductService {
  private static instance: ProductService;
  private products: Product[] = [];
  private priceHistory: PriceHistory[] = [];

  private constructor() {
    this.initializeMockData();
  }

  public static getInstance(): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService();
    }
    return ProductService.instance;
  }

  /**
   * Initialize with mock data for development
   * TOUS LES PRODUITS SONT VARIABLES - Prix basés sur prix d'achat + marge
   */
  private initializeMockData(): void {
    this.products = [
      {
        id: '1',
        name: 'Thon Rouge',
        unit: 'kg',
        unitPrice: 6500,        // Prix de vente
        purchasePrice: 5200,    // Prix d'achat
        margin: 25,             // Marge en %
        category: 'Poisson',
        priceType: 'variable',  // TOUS VARIABLES
        isActive: true,
        createdAt: new Date(),
        allowDecimals: true
      },
      {
        id: '2',
        name: 'Crevettes Roses',
        unit: 'kg',
        unitPrice: 8000,
        purchasePrice: 6400,
        margin: 25,
        category: 'Crustacé',
        priceType: 'variable',
        isActive: true,
        createdAt: new Date(),
        allowDecimals: true
      },
      {
        id: '3',
        name: 'Soles',
        unit: 'kg',
        unitPrice: 4500,
        purchasePrice: 3600,
        margin: 25,
        category: 'Poisson',
        priceType: 'variable',  // Changé de 'fixed' à 'variable'
        isActive: true,
        createdAt: new Date(),
        allowDecimals: true
      },
      {
        id: '4',
        name: 'Bars',
        unit: 'kg',
        unitPrice: 5200,
        purchasePrice: 4160,
        margin: 25,
        category: 'Poisson',
        priceType: 'variable',  // Changé de 'fixed' à 'variable'
        isActive: true,
        createdAt: new Date(),
        allowDecimals: true
      },
      {
        id: '5',
        name: 'Sardines',
        unit: 'kg',
        unitPrice: 2000,
        purchasePrice: 1600,
        margin: 25,
        category: 'Poisson',
        priceType: 'variable',
        isActive: true,
        createdAt: new Date(),
        allowDecimals: true
      }
    ];

    // Initialize some price history
    this.priceHistory = [
      {
        id: '1',
        productId: '1',
        price: 6000,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        updatedBy: 'director-1',
        reason: 'Ajustement marché'
      },
      {
        id: '2',
        productId: '2',
        price: 7500,
        date: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
        updatedBy: 'director-1',
        reason: 'Prix fournisseur'
      }
    ];
  }

  /**
   * Get all active products
   */
  public async getActiveProducts(): Promise<Product[]> {
    return this.products.filter(product => product.isActive);
  }

  /**
   * Get all products with variable pricing
   */
  public async getVariablePriceProducts(): Promise<Product[]> {
    return this.products.filter(product => 
      product.isActive && product.priceType === 'variable'
    );
  }

  /**
   * Get product by ID
   */
  public async getProductById(productId: string): Promise<Product | null> {
    return this.products.find(product => product.id === productId) || null;
  }

  /**
   * Update product price with history tracking and notifications
   */
  public async updatePrice(
    productId: string, 
    newPrice: number, 
    updatedBy: string, 
    reason?: string
  ): Promise<void> {
    const product = this.products.find(p => p.id === productId);
    
    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    if (!product.isActive) {
      throw new Error('Cannot update price for inactive product');
    }

    // Tous les produits sont maintenant variables, pas besoin de cette vérification

    if (newPrice <= 0) {
      throw new Error('Price must be positive');
    }

    // Store old price in history
    const historyEntry: PriceHistory = {
      id: `history-${Date.now()}`,
      productId,
      price: product.unitPrice,
      date: new Date(),
      updatedBy,
      reason
    };

    this.priceHistory.push(historyEntry);

    // Update current price
    product.unitPrice = newPrice;

    // Notify all stores about price change
    await this.notifyPriceChange(productId, newPrice);
  }

  /**
   * Get price history for a product
   */
  public async getPriceHistory(productId: string): Promise<PriceHistory[]> {
    return this.priceHistory
      .filter(entry => entry.productId === productId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * Get current price for a product (used in sales entry)
   */
  public async getCurrentPrice(productId: string): Promise<number> {
    const product = await this.getProductById(productId);
    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }
    return product.unitPrice;
  }

  /**
   * Notify all stores about price changes
   */
  public async notifyPriceChange(productId: string, newPrice: number): Promise<void> {
    const product = await this.getProductById(productId);
    if (!product) return;

    const notificationService = NotificationService.getInstance();
    
    // Create notification for all store managers
    await notificationService.createNotification({
      type: 'price_change',
      title: 'Changement de prix',
      message: `Le prix de ${product.name} a été mis à jour à ${newPrice.toLocaleString('fr-FR')} CFA`,
      data: {
        productId,
        productName: product.name,
        newPrice,
        oldPrice: product.unitPrice
      },
      targetRoles: ['manager'],
      createdAt: new Date()
    });
  }

  /**
   * Validate quantity input based on product unit type
   */
  public validateQuantity(product: Product, quantity: number): boolean {
    if (quantity <= 0) return false;
    
    // For products that don't allow decimals (packs, units), ensure integer values
    if (!product.allowDecimals && quantity % 1 !== 0) {
      return false;
    }
    
    return true;
  }

  /**
   * Format quantity display based on product unit type
   */
  public formatQuantity(product: Product, quantity: number): string {
    if (product.allowDecimals) {
      return quantity.toFixed(2);
    }
    return Math.floor(quantity).toString();
  }

  /**
   * Get products by category
   */
  public async getProductsByCategory(category: string): Promise<Product[]> {
    return this.products.filter(product => 
      product.isActive && product.category === category
    );
  }

  /**
   * Search products by name
   */
  public async searchProducts(query: string): Promise<Product[]> {
    const searchTerm = query.toLowerCase();
    return this.products.filter(product => 
      product.isActive && 
      product.name.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Calculate sale price based on purchase price and margin
   */
  public calculateSalePrice(purchasePrice: number, margin: number): number {
    return Math.round(purchasePrice * (1 + margin / 100));
  }

  /**
   * Update product purchase price and recalculate sale price
   */
  public async updatePurchasePrice(
    productId: string, 
    newPurchasePrice: number, 
    updatedBy: string, 
    reason?: string
  ): Promise<void> {
    const product = this.products.find(p => p.id === productId);
    
    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    if (!product.isActive) {
      throw new Error('Cannot update price for inactive product');
    }

    if (newPurchasePrice <= 0) {
      throw new Error('Purchase price must be positive');
    }

    // Store old prices in history
    const historyEntry: PriceHistory = {
      id: `history-${Date.now()}`,
      productId,
      price: product.unitPrice,
      purchasePrice: product.purchasePrice,
      date: new Date(),
      updatedBy,
      reason: reason || `Nouveau prix d'achat: ${newPurchasePrice} CFA`
    };

    this.priceHistory.push(historyEntry);

    // Update purchase price and recalculate sale price
    product.purchasePrice = newPurchasePrice;
    product.unitPrice = this.calculateSalePrice(newPurchasePrice, product.margin || 25);

    // Notify all stores about price change
    await this.notifyPriceChange(productId, product.unitPrice);
  }

  /**
   * Update product margin and recalculate sale price
   */
  public async updateMargin(
    productId: string, 
    newMargin: number, 
    updatedBy: string, 
    reason?: string
  ): Promise<void> {
    const product = this.products.find(p => p.id === productId);
    
    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    if (!product.isActive) {
      throw new Error('Cannot update margin for inactive product');
    }

    if (newMargin < 0) {
      throw new Error('Margin cannot be negative');
    }

    // Store old prices in history
    const historyEntry: PriceHistory = {
      id: `history-${Date.now()}`,
      productId,
      price: product.unitPrice,
      margin: product.margin,
      date: new Date(),
      updatedBy,
      reason: reason || `Nouvelle marge: ${newMargin}%`
    };

    this.priceHistory.push(historyEntry);

    // Update margin and recalculate sale price
    product.margin = newMargin;
    product.unitPrice = this.calculateSalePrice(product.purchasePrice || 0, newMargin);

    // Notify all stores about price change
    await this.notifyPriceChange(productId, product.unitPrice);
  }
}

// Export singleton instance
export const productService = ProductService.getInstance();