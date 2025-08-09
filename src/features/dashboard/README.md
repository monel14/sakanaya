# Cost Analysis Module

## Overview

The Cost Analysis module provides comprehensive cost analysis and ratio calculations for the poissonnerie POS system. It enables directors to analyze costs, calculate key ratios, and compare performance across stores.

## Features

### 1. Cost Breakdown Analysis
- **Purchases**: Cost of goods sold
- **Salaries**: Employee salary costs
- **Losses**: Stock losses and waste
- **Total Costs**: Aggregated cost calculation

### 2. Key Performance Ratios
- **Salary Cost Ratio**: (Salary Costs / Revenue) × 100
- **Loss Rate**: (Losses / Revenue) × 100
- **Gross Margin**: Revenue - Purchase Costs
- **Profit Margin**: Revenue - Total Costs

### 3. Store Comparisons
- Side-by-side comparison of all stores
- Performance ranking and insights
- Best and worst performing store identification

### 4. Time Series Analysis
- Trend analysis for revenue, costs, and profitability
- Historical data visualization
- Period-over-period comparisons

## Components

### CostAnalysis
Main component that orchestrates the cost analysis dashboard.

**Props:**
- `storeIds: string[]` - Array of store IDs to analyze
- `className?: string` - Optional CSS classes

**Features:**
- KPI cards showing key metrics
- Performance insights with best/worst stores
- Interactive charts and tables
- Export functionality for reports

### CostRatiosChart
Bar chart component displaying key ratios by store.

**Props:**
- `data: StoreComparison[]` - Store comparison data
- `loading?: boolean` - Loading state

### CostTrendsChart
Line chart showing cost trends over time.

**Props:**
- `data: TimeSeriesData[]` - Time series data
- `loading?: boolean` - Loading state

### StoreComparisonTable
Detailed table comparing all stores with performance indicators.

**Props:**
- `data: StoreComparison[]` - Store comparison data
- `loading?: boolean` - Loading state

## Services

### CostAnalysisService
Core service handling cost calculations and analysis.

**Key Methods:**
- `generateStoreAnalysis()` - Analyze costs for a specific store
- `generateStoreComparisons()` - Compare multiple stores
- `generateCostAnalysisReport()` - Generate comprehensive report
- `getCostKPIs()` - Calculate key performance indicators

## Hooks

### useCostAnalysis
Main hook for cost analysis functionality.

**Parameters:**
- `storeIds: string[]` - Stores to analyze
- `startDate: Date` - Analysis start date
- `endDate: Date` - Analysis end date
- `autoRefresh?: boolean` - Enable auto-refresh
- `refreshInterval?: number` - Refresh interval in ms

**Returns:**
- `report: CostAnalysisReport | null` - Complete analysis report
- `kpis: CostKPIs | null` - Key performance indicators
- `storeComparisons: StoreComparison[]` - Store comparison data
- `timeSeriesData: TimeSeriesData[]` - Time series data
- `loading: boolean` - Loading state
- `error: string | null` - Error state
- `refreshData: () => Promise<void>` - Manual refresh function
- `generateReport: (storeIds, startDate, endDate) => Promise<void>` - Generate new report

### useStoreCostAnalysis
Hook for single store cost analysis.

**Parameters:**
- `storeId: string` - Store to analyze
- `startDate: Date` - Analysis start date
- `endDate: Date` - Analysis end date

**Returns:**
- `analysis: CostAnalysisData | null` - Store analysis data
- `loading: boolean` - Loading state
- `error: string | null` - Error state
- `refresh: () => Promise<void>` - Refresh function

## Types

### CostAnalysisData
Complete cost analysis for a single store.

### CostAnalysisReport
Comprehensive report including global data, store comparisons, and insights.

### StoreComparison
Comparison data for a single store.

### TimeSeriesData
Time-based data point for trend analysis.

### CostKPIs
Key performance indicators summary.

## Usage Example

```tsx
import { CostAnalysis } from '@/features/dashboard/components';

function DirectorDashboard() {
  const storeIds = ['store-1', 'store-2', 'store-3'];
  
  return (
    <div>
      <CostAnalysis storeIds={storeIds} />
    </div>
  );
}
```

## Integration

The Cost Analysis module is integrated into the DirectorDashboard component and can be accessed via the "Analyse des Coûts" tab. It automatically fetches data for all stores associated with the director's account.

## Data Sources

Currently uses mock data for demonstration. In production, it would integrate with:
- Sales data from `DailySales` records
- Payroll data from `PayrollSummary` records  
- Stock movement data from `StockMovement` records
- Store information from `Store` records

## Performance Considerations

- Data is cached and auto-refreshed every 5 minutes
- Charts use responsive containers for mobile compatibility
- Large datasets are paginated and virtualized
- Export functionality generates CSV files client-side