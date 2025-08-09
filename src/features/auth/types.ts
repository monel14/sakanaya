import { z } from 'zod';

// User and Authentication Types
export type UserRole = 'director' | 'manager';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  username: string;
  store?: string;
  // New properties for multisite management
  employeeId?: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Zod Schemas
export const UserRoleSchema = z.enum(['director', 'manager']);

export const UserSchema = z.object({
  id: z.string().min(1, 'ID est requis'),
  role: UserRoleSchema,
  name: z.string().min(1, 'Le nom est requis'),
  username: z.string().min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères'),
  store: z.string().optional(),
  employeeId: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  lastLogin: z.date().optional()
});

export const LoginCredentialsSchema = z.object({
  username: z.string().min(1, 'Le nom d\'utilisateur est requis'),
  password: z.string().min(1, 'Le mot de passe est requis')
});