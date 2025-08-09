// Dashboard and Analytics Types
export interface KPIData {
  revenue: number;
  grossMargin: number;
  lossRate: number;
  stockRotation: number;
}

export interface ChartData {
  label: string;
  value: number;
  color?: string;
}

// Re-export cost analysis types
export * from './types/costAnalysis';