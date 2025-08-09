import { z } from 'zod';
import { Product } from '../sales/types';

// Extended Product interface for stock management
export interface ProductStock extends Product {
  // Stock data by store
  stockLevels: StockLevel[];
  // Weighted average cost (CUMP)
  averageCost: number;
  // Last arrival date
  lastArrivalDate?: Date;
  // Stock rotation (days)
  stockRotation?: number;
}

// Supplier Management
export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
}

// Reception Voucher (Bon de Réception)
export interface BonReception {
  id: string;
  numero: string; // Auto-generated
  dateReception: Date;
  supplierId: string;
  supplier: Supplier;
  storeId: string;
  store: { id: string; name: string };
  lignes: LigneReception[];
  totalValue: number;
  status: 'draft' | 'validated';
  createdBy: string;
  createdAt: Date;
  validatedBy?: string;
  validatedAt?: Date;
  commentaires?: string;
}

export interface LigneReception {
  id: string;
  bonReceptionId: string;
  productId: string;
  product: Product;
  quantiteRecue: number;
  coutUnitaire: number;
  sousTotal: number; // quantiteRecue * coutUnitaire
}

// Inter-Store Transfers
export interface TransfertStock {
  id: string;
  numero: string; // Auto-generated
  dateCreation: Date;
  storeSourceId: string;
  storeSource: { id: string; name: string };
  storeDestinationId: string;
  storeDestination: { id: string; name: string };
  lignes: LigneTransfert[];
  status: 'en_transit' | 'termine' | 'termine_avec_ecart';
  createdBy: string;
  createdAt: Date;
  receptionneBy?: string;
  receptionneAt?: Date;
  commentaires?: string;
  commentairesReception?: string;
}

export interface LigneTransfert {
  id: string;
  transfertId: string;
  productId: string;
  product: Product;
  quantiteEnvoyee: number;
  quantiteRecue?: number;
  ecart?: number;
  commentaire?: string;
}

// Loss Management (Extended)
export interface Perte {
  id: string;
  date: Date;
  storeId: string;
  store: { id: string; name: string };
  productId: string;
  product: Product;
  quantite: number;
  categorieId: string;
  categorie: PerteCategory;
  valeurPerte: number; // quantite * average cost
  commentaire?: string;
  createdBy: string;
  createdAt: Date;
}

export interface PerteCategory {
  id: string;
  name: string;
  description?: string;
  color: string; // For display
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}

// Physical Inventory
export interface Inventaire {
  id: string;
  numero: string; // Auto-generated
  date: Date;
  storeId: string;
  store: { id: string; name: string };
  lignes: LigneInventaire[];
  status: 'en_cours' | 'en_attente_validation' | 'valide';
  totalEcarts: number;
  valeurEcarts: number;
  createdBy: string;
  createdAt: Date;
  validatedBy?: string;
  validatedAt?: Date;
  commentaires?: string;
}

export interface LigneInventaire {
  id: string;
  inventaireId: string;
  productId: string;
  product: Product;
  quantiteTheorique: number;
  quantitePhysique?: number;
  ecart?: number;
  valeurEcart?: number;
  commentaire?: string;
}

// Stock and Inventory Types (Updated)
export interface StockItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  storeId: string;
  lastUpdated: Date;
}

export interface Transfer {
  id: string;
  transferNumber: string;
  fromStoreId: string;
  toStoreId: string;
  items: TransferItem[];
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  createdDate: Date;
  deliveryDate?: Date;
}

export interface TransferItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
}

export interface Arrival {
  id: string;
  date: Date;
  supplier: string;
  items: ArrivalItem[];
  totalQuantity: number;
  status: 'pending' | 'validated';
}

export interface ArrivalItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
}

// New types for stock movements and tracking
export interface StockMovement {
  id: string;
  type: 'arrival' | 'loss' | 'transfer';
  productId: string;
  storeId: string;
  quantity: number;
  reason?: string;
  lossCategory?: 'spoilage' | 'damage' | 'promotion';
  comments?: string;
  recordedBy: string;
  recordedAt: Date;
}

export interface StockLevel {
  storeId: string;
  productId: string;
  quantity: number;
  reservedQuantity: number; // In transit
  availableQuantity: number; // Available for sale
  lastUpdated: Date;
}

// Stock Movement Journal (Extended)
export interface MouvementStock {
  id: string;
  date: Date;
  type: 'arrivage' | 'transfert_sortie' | 'transfert_entree' | 'vente' | 'perte' | 'ajustement';
  storeId: string;
  store: { id: string; name: string };
  productId: string;
  product: Product;
  quantite: number; // Positive for entry, negative for exit
  coutUnitaire?: number;
  valeur?: number;
  referenceId: string; // Source document ID
  referenceType: string; // Source document type
  createdBy: string;
  createdAt: Date;
  commentaire?: string;
}

// Type for loss rate reporting
export interface LossRateReport {
  storeId: string;
  period: 'week' | 'month';
  startDate: Date;
  endDate: Date;
  totalLosses: number;
  totalArrivals: number;
  lossRate: number; // percentage
  lossBreakdown: {
    spoilage: number;
    damage: number;
    promotion: number;
  };
  generatedAt: Date;
}

// Zod Schemas
export const TransferStatusSchema = z.enum(['pending', 'in_transit', 'delivered', 'cancelled']);
export const ArrivalStatusSchema = z.enum(['pending', 'validated']);
export const StockMovementTypeSchema = z.enum(['arrival', 'loss', 'transfer']);
export const LossCategorySchema = z.enum(['spoilage', 'damage', 'promotion']);
export const ReportPeriodSchema = z.enum(['week', 'month']);

// New Zod Schemas
export const BonReceptionStatusSchema = z.enum(['draft', 'validated']);
export const TransfertStockStatusSchema = z.enum(['en_transit', 'termine', 'termine_avec_ecart']);
export const InventaireStatusSchema = z.enum(['en_cours', 'en_attente_validation', 'valide']);
export const MouvementStockTypeSchema = z.enum(['arrivage', 'transfert_sortie', 'transfert_entree', 'vente', 'perte', 'ajustement']);

export const SupplierSchema = z.object({
  id: z.string().min(1, 'ID est requis'),
  name: z.string().min(1, 'Le nom du fournisseur est requis'),
  contact: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')).optional(),
  address: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  createdBy: z.string().min(1, 'Créateur requis')
});

export const LigneReceptionSchema = z.object({
  id: z.string().min(1, 'ID est requis'),
  bonReceptionId: z.string().min(1, 'ID bon de réception requis'),
  productId: z.string().min(1, 'ID produit requis'),
  product: z.any(), // Product schema from sales/types
  quantiteRecue: z.number().positive('La quantité reçue doit être positive'),
  coutUnitaire: z.number().positive('Le coût unitaire doit être positif'),
  sousTotal: z.number().positive('Le sous-total doit être positif')
});

export const BonReceptionSchema = z.object({
  id: z.string().min(1, 'ID est requis'),
  numero: z.string().min(1, 'Numéro de bon requis'),
  dateReception: z.date(),
  supplierId: z.string().min(1, 'Fournisseur requis'),
  supplier: SupplierSchema,
  storeId: z.string().min(1, 'Magasin requis'),
  store: z.object({
    id: z.string(),
    name: z.string()
  }),
  lignes: z.array(LigneReceptionSchema).min(1, 'Au moins une ligne est requise'),
  totalValue: z.number().min(0, 'La valeur totale ne peut pas être négative'),
  status: BonReceptionStatusSchema.default('draft'),
  createdBy: z.string().min(1, 'Créateur requis'),
  createdAt: z.date().default(() => new Date()),
  validatedBy: z.string().optional(),
  validatedAt: z.date().optional(),
  commentaires: z.string().optional()
});

export const LigneTransfertSchema = z.object({
  id: z.string().min(1, 'ID est requis'),
  transfertId: z.string().min(1, 'ID transfert requis'),
  productId: z.string().min(1, 'ID produit requis'),
  product: z.any(), // Product schema from sales/types
  quantiteEnvoyee: z.number().positive('La quantité envoyée doit être positive'),
  quantiteRecue: z.number().min(0, 'La quantité reçue ne peut pas être négative').optional(),
  ecart: z.number().optional(),
  commentaire: z.string().optional()
});

export const TransfertStockSchema = z.object({
  id: z.string().min(1, 'ID est requis'),
  numero: z.string().min(1, 'Numéro de transfert requis'),
  dateCreation: z.date().default(() => new Date()),
  storeSourceId: z.string().min(1, 'Magasin source requis'),
  storeSource: z.object({
    id: z.string(),
    name: z.string()
  }),
  storeDestinationId: z.string().min(1, 'Magasin destination requis'),
  storeDestination: z.object({
    id: z.string(),
    name: z.string()
  }),
  lignes: z.array(LigneTransfertSchema).min(1, 'Au moins une ligne est requise'),
  status: TransfertStockStatusSchema.default('en_transit'),
  createdBy: z.string().min(1, 'Créateur requis'),
  createdAt: z.date().default(() => new Date()),
  receptionneBy: z.string().optional(),
  receptionneAt: z.date().optional(),
  commentaires: z.string().optional(),
  commentairesReception: z.string().optional()
});

export const PerteSchema = z.object({
  id: z.string().min(1, 'ID est requis'),
  date: z.date().default(() => new Date()),
  storeId: z.string().min(1, 'Magasin requis'),
  store: z.object({
    id: z.string(),
    name: z.string()
  }),
  productId: z.string().min(1, 'Produit requis'),
  product: z.any(), // Product schema from sales/types
  quantite: z.number().positive('La quantité doit être positive'),
  categorieId: z.string().min(1, 'Catégorie requise'),
  categorie: z.any(), // PerteCategory schema
  valeurPerte: z.number().min(0, 'La valeur de perte ne peut pas être négative'),
  commentaire: z.string().optional(),
  createdBy: z.string().min(1, 'Créateur requis'),
  createdAt: z.date().default(() => new Date())
});

export const MouvementStockSchema = z.object({
  id: z.string().min(1, 'ID est requis'),
  date: z.date().default(() => new Date()),
  type: MouvementStockTypeSchema,
  storeId: z.string().min(1, 'Magasin requis'),
  store: z.object({
    id: z.string(),
    name: z.string()
  }),
  productId: z.string().min(1, 'Produit requis'),
  product: z.any(), // Product schema from sales/types
  quantite: z.number(), // Can be positive or negative
  coutUnitaire: z.number().positive('Le coût unitaire doit être positif').optional(),
  valeur: z.number().optional(),
  referenceId: z.string().min(1, 'ID de référence requis'),
  referenceType: z.string().min(1, 'Type de référence requis'),
  createdBy: z.string().min(1, 'Créateur requis'),
  createdAt: z.date().default(() => new Date()),
  commentaire: z.string().optional()
});

export const StockItemSchema = z.object({
  id: z.string().min(1, 'ID est requis'),
  productId: z.string().min(1, 'ID produit est requis'),
  product: z.any(), // Product schema is defined in sales/types
  quantity: z.number().min(0, 'La quantité ne peut pas être négative'),
  storeId: z.string().min(1, 'ID magasin est requis'),
  lastUpdated: z.date().default(() => new Date())
});

export const StockMovementSchema = z.object({
  id: z.string().min(1, 'ID est requis'),
  type: StockMovementTypeSchema,
  productId: z.string().min(1, 'ID produit est requis'),
  storeId: z.string().min(1, 'ID magasin est requis'),
  quantity: z.number().positive('La quantité doit être positive'),
  reason: z.string().optional(),
  lossCategory: LossCategorySchema.optional(),
  comments: z.string().optional(),
  recordedBy: z.string().min(1, 'Enregistré par requis'),
  recordedAt: z.date().default(() => new Date())
});

export const StockLevelSchema = z.object({
  storeId: z.string().min(1, 'ID magasin est requis'),
  productId: z.string().min(1, 'ID produit est requis'),
  quantity: z.number().min(0, 'La quantité ne peut pas être négative'),
  reservedQuantity: z.number().min(0, 'La quantité réservée ne peut pas être négative').default(0),
  availableQuantity: z.number().min(0, 'La quantité disponible ne peut pas être négative'),
  lastUpdated: z.date().default(() => new Date())
});

export const TransferSchema = z.object({
  id: z.string().min(1, 'ID est requis'),
  transferNumber: z.string().min(1, 'Numéro de transfert requis'),
  fromStoreId: z.string().min(1, 'Magasin source requis'),
  toStoreId: z.string().min(1, 'Magasin destination requis'),
  items: z.array(z.any()).min(1, 'Au moins un article est requis'),
  status: TransferStatusSchema.default('pending'),
  createdDate: z.date().default(() => new Date()),
  deliveryDate: z.date().optional()
});

export const ArrivalSchema = z.object({
  id: z.string().min(1, 'ID est requis'),
  date: z.date(),
  supplier: z.string().min(1, 'Le fournisseur est requis'),
  items: z.array(z.any()).min(1, 'Au moins un article est requis'),
  totalQuantity: z.number().positive('La quantité totale doit être positive'),
  status: ArrivalStatusSchema.default('pending')
});

export const LossRateReportSchema = z.object({
  storeId: z.string().min(1, 'ID magasin est requis'),
  period: ReportPeriodSchema,
  startDate: z.date(),
  endDate: z.date(),
  totalLosses: z.number().min(0, 'Les pertes ne peuvent pas être négatives'),
  totalArrivals: z.number().min(0, 'Les arrivages ne peuvent pas être négatifs'),
  lossRate: z.number().min(0).max(100, 'Le taux de perte doit être entre 0 et 100'),
  lossBreakdown: z.object({
    spoilage: z.number().min(0),
    damage: z.number().min(0),
    promotion: z.number().min(0)
  }),
  generatedAt: z.date().default(() => new Date())
});

// Types for real-time stock monitoring
export interface StockSummary {
  totalProducts: number;
  criticalStock: number;
  lowStock: number;
  overstock: number;
  averageFlowRate: number;
  lastUpdated: Date;
}

export interface FlowRateData {
  productId: string;
  flowRate: number; // units per day
  period: number; // days analyzed
  calculatedAt: Date;
}