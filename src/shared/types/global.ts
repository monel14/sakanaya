// Types globaux réutilisables dans tout le projet

// Types de base pour l'application
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Types d'erreur
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

// Types de notification
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// Types de statut génériques
export type Status = 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled';

// Types de dates
export interface DateRange {
  startDate: Date;
  endDate: Date;
}