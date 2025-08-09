import { z } from 'zod';

// Report Types for detailed analysis

// Sales Report Types
export interface SalesReportData {
  period: {
    start: Date;
    end: Date;
  };
  storeId?: string;
  productId?: string;
  totalRevenue: number;
  totalQuantity: number;
  averagePrice: number;
  salesCount: number;
  breakdown: SalesBreakdownItem[];
}

export interface SalesBreakdownItem {
  id: string;
  name: string; // Product or Store name
  type: 'product' | 'store';
  revenue: number;
  quantity: number;
  averagePrice: number;
  salesCount: number;
  percentage: number; // Percentage of total revenue
}

// Performance Report Types
export interface PerformanceReportData {
  period: {
    start: Date;
    end: Date;
  };
  storeId?: string;
  totalEmployees: number;
  totalRevenue: number;
  averageRevenuePerEmployee: number;
  employeePerformance: EmployeePerformanceItem[];
}

export interface EmployeePerformanceItem {
  employeeId: string;
  firstName: string;
  lastName: string;
  role: string;
  totalSales: number;
  totalRevenue: number;
  averageSaleValue: number;
  workingDays: number;
  revenuePerDay: number;
  ranking: number;
}

// Price Impact Report Types
export interface PriceImpactReportData {
  period: {
    start: Date;
    end: Date;
  };
  productId?: string;
  priceChanges: PriceChangeItem[];
  salesImpact: SalesImpactItem[];
  summary: PriceImpactSummary;
}

export interface PriceChangeItem {
  id: string;
  productId: string;
  productName: string;
  oldPrice: number;
  newPrice: number;
  changePercent: number;
  changeDate: Date;
  updatedBy: string;
  reason?: string;
}

export interface SalesImpactItem {
  productId: string;
  productName: string;
  priceChangeDate: Date;
  salesBefore: {
    quantity: number;
    revenue: number;
    averagePrice: number;
    period: number; // days
  };
  salesAfter: {
    quantity: number;
    revenue: number;
    averagePrice: number;
    period: number; // days
  };
  impact: {
    quantityChange: number; // percentage
    revenueChange: number; // percentage
    elasticity: number; // price elasticity of demand
  };
}

export interface PriceImpactSummary {
  totalPriceChanges: number;
  averagePriceIncrease: number;
  totalRevenueImpact: number;
  totalQuantityImpact: number;
  mostImpactedProduct: {
    productId: string;
    productName: string;
    revenueImpact: number;
  };
}

// Report Filter Types
export interface ReportFilters {
  startDate: Date;
  endDate: Date;
  storeId?: string;
  productId?: string;
  employeeId?: string;
  category?: string;
}

// Zod Schemas
export const ReportFiltersSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  storeId: z.string().optional(),
  productId: z.string().optional(),
  employeeId: z.string().optional(),
  category: z.string().optional()
}).refine(data => data.endDate >= data.startDate, {
  message: "La date de fin doit être postérieure à la date de début",
  path: ["endDate"]
});

export const SalesBreakdownItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['product', 'store']),
  revenue: z.number().min(0),
  quantity: z.number().min(0),
  averagePrice: z.number().min(0),
  salesCount: z.number().min(0),
  percentage: z.number().min(0).max(100)
});

export const EmployeePerformanceItemSchema = z.object({
  employeeId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.string(),
  totalSales: z.number().min(0),
  totalRevenue: z.number().min(0),
  averageSaleValue: z.number().min(0),
  workingDays: z.number().min(0),
  revenuePerDay: z.number().min(0),
  ranking: z.number().min(1)
});

export const PriceChangeItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  productName: z.string(),
  oldPrice: z.number().positive(),
  newPrice: z.number().positive(),
  changePercent: z.number(),
  changeDate: z.date(),
  updatedBy: z.string(),
  reason: z.string().optional()
});