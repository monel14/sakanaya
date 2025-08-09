import { z } from 'zod';

// Product and Sales Types
export interface Product {
  id: string;
  name: string;
  unit: string;
  unitPrice: number; // Prix de vente calculé
  purchasePrice?: number; // Prix d'achat
  margin?: number; // Marge en pourcentage
  category: string;
  // New properties for variable pricing and decimal support
  priceType: 'fixed' | 'variable';
  isActive: boolean;
  createdAt: Date;
  allowDecimals: boolean; // true for kg, false for pack/unit
  // Stock management properties
  averageCost?: number; // CUMP - Coût Unitaire Moyen Pondéré
  lastArrivalDate?: Date; // Date du dernier arrivage
  stockRotation?: number; // Rotation du stock en jours
}

export interface SalesEntry {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  date: Date;
  storeId: string;
}

export interface DailySales {
  id: string;
  date: Date;
  storeId: string;
  entries: SalesEntry[];
  total: number;
  status: 'open' | 'closed';
  // New properties for validation and comments
  comments?: string;
  isValidated: boolean;
  validatedBy?: string;
  validatedAt?: Date;
  createdBy: string; // User ID
  createdAt: Date;
}

// New type for price history
export interface PriceHistory {
  id: string;
  productId: string;
  price: number;
  purchasePrice?: number; // Prix d'achat historique
  margin?: number; // Marge historique
  date: Date;
  updatedBy: string; // User ID
  reason?: string;
}

// Zod Schemas
export const ProductUnitSchema = z.enum(['kg', 'pack', 'unit']);
export const PriceTypeSchema = z.enum(['fixed', 'variable']);
export const SalesStatusSchema = z.enum(['open', 'closed']);

export const ProductSchema = z.object({
  id: z.string().min(1, 'ID est requis'),
  name: z.string().min(1, 'Le nom du produit est requis'),
  unit: ProductUnitSchema,
  unitPrice: z.number().positive('Le prix doit être positif'),
  purchasePrice: z.number().positive('Le prix d\'achat doit être positif').optional(),
  margin: z.number().min(0, 'La marge ne peut pas être négative').optional(),
  category: z.string().min(1, 'La catégorie est requise'),
  priceType: PriceTypeSchema,
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  allowDecimals: z.boolean(),
  // Stock management properties
  averageCost: z.number().min(0, 'Le coût moyen ne peut pas être négatif').optional(),
  lastArrivalDate: z.date().optional(),
  stockRotation: z.number().min(0, 'La rotation ne peut pas être négative').optional()
});

export const SalesEntrySchema = z.object({
  id: z.string().min(1, 'ID est requis'),
  productId: z.string().min(1, 'ID produit est requis'),
  product: ProductSchema,
  quantity: z.number().positive('La quantité doit être positive'),
  unitPrice: z.number().positive('Le prix unitaire doit être positif'),
  subtotal: z.number().positive('Le sous-total doit être positif'),
  date: z.date(),
  storeId: z.string().min(1, 'ID magasin est requis')
});

export const DailySalesSchema = z.object({
  id: z.string().min(1, 'ID est requis'),
  date: z.date(),
  storeId: z.string().min(1, 'ID magasin est requis'),
  entries: z.array(SalesEntrySchema).min(1, 'Au moins une vente est requise'),
  total: z.number().min(0, 'Le total ne peut pas être négatif'),
  status: SalesStatusSchema,
  comments: z.string().optional(),
  isValidated: z.boolean().default(false),
  validatedBy: z.string().optional(),
  validatedAt: z.date().optional(),
  createdBy: z.string().min(1, 'Créateur requis'),
  createdAt: z.date().default(() => new Date())
});

export const PriceHistorySchema = z.object({
  id: z.string().min(1, 'ID est requis'),
  productId: z.string().min(1, 'ID produit est requis'),
  price: z.number().positive('Le prix doit être positif'),
  purchasePrice: z.number().positive('Le prix d\'achat doit être positif').optional(),
  margin: z.number().min(0, 'La marge ne peut pas être négative').optional(),
  date: z.date().default(() => new Date()),
  updatedBy: z.string().min(1, 'Utilisateur requis'),
  reason: z.string().optional()
});