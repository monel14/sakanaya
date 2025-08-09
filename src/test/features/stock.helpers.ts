// Stock feature test helpers
import { BonReception, TransfertStock, Inventaire, StockLevel } from '../../features/stock/types';
import { generateTestId } from '../setup';

export const createMockBonReception = (overrides?: Partial<BonReception>): BonReception => ({
  id: generateTestId(),
  numero: `BR-${Date.now()}`,
  supplierId: 'supplier-1',
  supplierName: 'Test Supplier',
  storeId: 'store-1',
  storeName: 'Test Store',
  dateReception: new Date(),
  status: 'draft',
  lignes: [],
  totalHT: 0,
  totalTTC: 0,
  createdAt: new Date(),
  createdBy: 'test-user',
  ...overrides
});

export const createMockTransfert = (overrides?: Partial<TransfertStock>): TransfertStock => ({
  id: generateTestId(),
  numero: `TR-${Date.now()}`,
  storeSourceId: 'store-1',
  storeDestinationId: 'store-2',
  storeSourceName: 'Store 1',
  storeDestinationName: 'Store 2',
  dateCreation: new Date(),
  status: 'pending',
  lignes: [],
  createdBy: 'test-user',
  ...overrides
});

export const createMockInventaire = (overrides?: Partial<Inventaire>): Inventaire => ({
  id: generateTestId(),
  numero: `INV-${Date.now()}`,
  storeId: 'store-1',
  storeName: 'Test Store',
  dateInventaire: new Date(),
  status: 'draft',
  lignes: [],
  createdBy: 'test-user',
  createdAt: new Date(),
  ...overrides
});

export const createMockStockLevel = (overrides?: Partial<StockLevel>): StockLevel => ({
  id: generateTestId(),
  productId: 'product-1',
  productName: 'Test Product',
  storeId: 'store-1',
  storeName: 'Test Store',
  quantity: 100,
  unitPrice: 10,
  totalValue: 1000,
  lastUpdated: new Date(),
  ...overrides
});