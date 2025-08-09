import { z } from 'zod';

// Store and Location Types
export interface Store {
  id: string;
  name: string;
  type: 'hub' | 'retail';
  address: string;
  managerId?: string;
  // New properties for multisite management
  phone: string;
  isActive: boolean;
  employees: string[]; // Employee IDs
  createdAt: Date;
}

// Navigation and UI Types
export type ViewType = 
  | 'dashboard' 
  | 'reports' 
  | 'stock' 
  | 'products' 
  | 'sales' 
  | 'hr' 
  | 'admin';

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  category?: string;
}

// Form and Validation Types
export interface FormErrors {
  [key: string]: string | undefined;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Zod Schemas
export const StoreTypeSchema = z.enum(['hub', 'retail']);

export const StoreSchema = z.object({
  id: z.string().min(1, 'ID est requis'),
  name: z.string().min(1, 'Le nom du magasin est requis'),
  type: StoreTypeSchema,
  address: z.string().min(1, 'L\'adresse est requise'),
  managerId: z.string().optional(),
  phone: z.string().min(1, 'Le téléphone est requis'),
  isActive: z.boolean().default(true),
  employees: z.array(z.string()).default([]),
  createdAt: z.date().default(() => new Date())
});

// Re-export notification and audit types
export * from './notifications';