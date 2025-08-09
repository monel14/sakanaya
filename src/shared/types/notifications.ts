import { z } from 'zod';

// Notification Types
export interface Notification {
  id: string;
  type: 'price_change' | 'validation_request' | 'stock_alert' | 'system_alert';
  title: string;
  message: string;
  userId: string;
  isRead: boolean;
  data?: any; // Additional data specific to notification type
  createdAt: Date;
  readAt?: Date;
}

// Audit and Logging Types
export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userName: string;
  changes?: Record<string, { old: any; new: any }>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

// Activity tracking for sensitive operations
export interface ActivityTracker {
  id: string;
  userId: string;
  action: 'view' | 'export' | 'modify' | 'delete';
  resource: string;
  resourceId: string;
  details?: string;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}

// Zod Schemas
export const NotificationTypeSchema = z.enum(['price_change', 'validation_request', 'stock_alert', 'system_alert']);

export const NotificationSchema = z.object({
  id: z.string().min(1, 'ID est requis'),
  type: NotificationTypeSchema,
  title: z.string().min(1, 'Le titre est requis'),
  message: z.string().min(1, 'Le message est requis'),
  userId: z.string().min(1, 'ID utilisateur est requis'),
  isRead: z.boolean().default(false),
  data: z.any().optional(),
  createdAt: z.date().default(() => new Date()),
  readAt: z.date().optional()
});

export const AuditLogSchema = z.object({
  id: z.string().min(1, 'ID est requis'),
  action: z.string().min(1, 'L\'action est requise'),
  entityType: z.string().min(1, 'Le type d\'entité est requis'),
  entityId: z.string().min(1, 'ID entité est requis'),
  userId: z.string().min(1, 'ID utilisateur est requis'),
  userName: z.string().min(1, 'Nom utilisateur est requis'),
  changes: z.record(z.object({
    old: z.any(),
    new: z.any()
  })).optional(),
  timestamp: z.date().default(() => new Date()),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional()
});

export const ActivityTrackerSchema = z.object({
  id: z.string().min(1, 'ID est requis'),
  userId: z.string().min(1, 'ID utilisateur est requis'),
  action: z.enum(['view', 'export', 'modify', 'delete']),
  resource: z.string().min(1, 'La ressource est requise'),
  resourceId: z.string().min(1, 'ID ressource est requis'),
  details: z.string().optional(),
  timestamp: z.date().default(() => new Date()),
  success: z.boolean(),
  errorMessage: z.string().optional()
});