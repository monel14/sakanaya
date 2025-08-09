import { z } from 'zod';
import { User, UserRole } from '../auth/types';
import { Employee } from '../hr/types';

// Extended User Management Types
export interface UserCreationRequest {
  username: string;
  password: string;
  name: string;
  role: UserRole;
  employeeId?: string;
  storeId?: string;
}

export interface PasswordResetRequest {
  userId: string;
  newPassword: string;
  resetBy: string;
  reason?: string;
}

export interface UserWithEmployee extends User {
  employee?: Employee;
  storeName?: string;
}

// Temporary Access Types
export interface TemporaryAccess {
  id: string;
  userId: string;
  grantedBy: string;
  expiresAt: Date;
  permissions: string[];
  reason: string;
  isActive: boolean;
  createdAt: Date;
}

// Zod Schemas
export const UserCreationRequestSchema = z.object({
  username: z.string()
    .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
    .regex(/^[a-zA-Z0-9_]+$/, 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores'),
  password: z.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  name: z.string().min(1, 'Le nom est requis'),
  role: z.enum(['director', 'manager']),
  employeeId: z.string().optional(),
  storeId: z.string().optional()
});

export const PasswordResetRequestSchema = z.object({
  userId: z.string().min(1, 'ID utilisateur requis'),
  newPassword: z.string().min(6, 'Le nouveau mot de passe doit contenir au moins 6 caractères'),
  resetBy: z.string().min(1, 'ID de l\'administrateur requis'),
  reason: z.string().optional()
});

export const TemporaryAccessSchema = z.object({
  id: z.string().min(1, 'ID requis'),
  userId: z.string().min(1, 'ID utilisateur requis'),
  grantedBy: z.string().min(1, 'ID de l\'administrateur requis'),
  expiresAt: z.date().refine(date => date > new Date(), 'La date d\'expiration doit être dans le futur'),
  permissions: z.array(z.string()).min(1, 'Au moins une permission est requise'),
  reason: z.string().min(1, 'La raison est requise'),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date())
});