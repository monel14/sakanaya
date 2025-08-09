import { z } from 'zod';

// Cost Analysis Types
export interface CostBreakdown {
  purchases: number;
  salaries: number;
  losses: number;
  total: number;
}

export interface CostAnalysisData {
  storeId: string;
  period: {
    start: Date;
    end: Date;
  };
  revenue: number;
  costs: CostBreakdown;
  ratios: {
    salaryCostRatio: number; // coût salarial / CA
    lossRate: number; // taux de perte
    grossMargin: number; // marge brute
    profitMargin: number; // marge nette
  };
  calculatedAt: Date;
}

export interface StoreComparison {
  storeId: string;
  storeName: string;
  revenue: number;
  costs: CostBreakdown;
  ratios: {
    salaryCostRatio: number;
    lossRate: number;
    grossMargin: number;
    profitMargin: number;
  };
}

export interface TimeSeriesData {
  date: Date;
  revenue: number;
  costs: CostBreakdown;
  ratios: {
    salaryCostRatio: number;
    lossRate: number;
    grossMargin: number;
    profitMargin: number;
  };
}

export interface CostAnalysisReport {
  period: {
    start: Date;
    end: Date;
  };
  globalData: CostAnalysisData;
  storeComparisons: StoreComparison[];
  timeSeriesData: TimeSeriesData[];
  insights: {
    bestPerformingStore: string;
    worstPerformingStore: string;
    averageSalaryCostRatio: number;
    averageLossRate: number;
    trends: {
      revenue: 'increasing' | 'decreasing' | 'stable';
      costs: 'increasing' | 'decreasing' | 'stable';
      profitability: 'improving' | 'declining' | 'stable';
    };
  };
  generatedAt: Date;
}

// Key Performance Indicators for cost analysis
export interface CostKPIs {
  totalRevenue: number;
  totalCosts: number;
  averageSalaryCostRatio: number;
  averageLossRate: number;
  bestStore: {
    id: string;
    name: string;
    profitMargin: number;
  };
  worstStore: {
    id: string;
    name: string;
    profitMargin: number;
  };
}

// Zod Schemas
export const CostBreakdownSchema = z.object({
  purchases: z.number().min(0, 'Les achats ne peuvent pas être négatifs'),
  salaries: z.number().min(0, 'Les salaires ne peuvent pas être négatifs'),
  losses: z.number().min(0, 'Les pertes ne peuvent pas être négatives'),
  total: z.number().min(0, 'Le total ne peut pas être négatif')
});

export const CostAnalysisDataSchema = z.object({
  storeId: z.string().min(1, 'ID magasin est requis'),
  period: z.object({
    start: z.date(),
    end: z.date()
  }),
  revenue: z.number().min(0, 'Le chiffre d\'affaires ne peut pas être négatif'),
  costs: CostBreakdownSchema,
  ratios: z.object({
    salaryCostRatio: z.number().min(0).max(100, 'Le ratio doit être entre 0 et 100'),
    lossRate: z.number().min(0).max(100, 'Le taux de perte doit être entre 0 et 100'),
    grossMargin: z.number(),
    profitMargin: z.number()
  }),
  calculatedAt: z.date().default(() => new Date())
});

export const StoreComparisonSchema = z.object({
  storeId: z.string().min(1, 'ID magasin est requis'),
  storeName: z.string().min(1, 'Nom du magasin est requis'),
  revenue: z.number().min(0, 'Le chiffre d\'affaires ne peut pas être négatif'),
  costs: CostBreakdownSchema,
  ratios: z.object({
    salaryCostRatio: z.number().min(0).max(100),
    lossRate: z.number().min(0).max(100),
    grossMargin: z.number(),
    profitMargin: z.number()
  })
});

export const TimeSeriesDataSchema = z.object({
  date: z.date(),
  revenue: z.number().min(0),
  costs: CostBreakdownSchema,
  ratios: z.object({
    salaryCostRatio: z.number().min(0).max(100),
    lossRate: z.number().min(0).max(100),
    grossMargin: z.number(),
    profitMargin: z.number()
  })
});

export const CostAnalysisReportSchema = z.object({
  period: z.object({
    start: z.date(),
    end: z.date()
  }),
  globalData: CostAnalysisDataSchema,
  storeComparisons: z.array(StoreComparisonSchema),
  timeSeriesData: z.array(TimeSeriesDataSchema),
  insights: z.object({
    bestPerformingStore: z.string(),
    worstPerformingStore: z.string(),
    averageSalaryCostRatio: z.number(),
    averageLossRate: z.number(),
    trends: z.object({
      revenue: z.enum(['increasing', 'decreasing', 'stable']),
      costs: z.enum(['increasing', 'decreasing', 'stable']),
      profitability: z.enum(['improving', 'declining', 'stable'])
    })
  }),
  generatedAt: z.date().default(() => new Date())
});