import { useState, useEffect, useCallback } from 'react';
import { 
  CostAnalysisData, 
  CostAnalysisReport, 
  StoreComparison, 
  TimeSeriesData,
  CostKPIs 
} from '../../features/dashboard/types/costAnalysis';
import { costAnalysisService } from '../services/costAnalysisService';

interface UseCostAnalysisOptions {
  storeIds: string[];
  startDate: Date;
  endDate: Date;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UseCostAnalysisReturn {
  // Data
  report: CostAnalysisReport | null;
  kpis: CostKPIs | null;
  storeComparisons: StoreComparison[];
  timeSeriesData: TimeSeriesData[];
  
  // State
  loading: boolean;
  error: string | null;
  
  // Actions
  refreshData: () => Promise<void>;
  generateReport: (storeIds: string[], startDate: Date, endDate: Date) => Promise<void>;
  getStoreAnalysis: (storeId: string, startDate: Date, endDate: Date) => Promise<CostAnalysisData | null>;
}

export const useCostAnalysis = (options: UseCostAnalysisOptions): UseCostAnalysisReturn => {
  const { storeIds, startDate, endDate, autoRefresh = false, refreshInterval = 300000 } = options;
  
  const [report, setReport] = useState<CostAnalysisReport | null>(null);
  const [kpis, setKpis] = useState<CostKPIs | null>(null);
  const [storeComparisons, setStoreComparisons] = useState<StoreComparison[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    if (storeIds.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Generate comprehensive report
      const newReport = await costAnalysisService.generateCostAnalysisReport(
        storeIds, 
        startDate, 
        endDate
      );
      setReport(newReport);
      setStoreComparisons(newReport.storeComparisons);
      setTimeSeriesData(newReport.timeSeriesData);
      
      // Get KPIs
      const newKpis = await costAnalysisService.getCostKPIs(storeIds, startDate, endDate);
      setKpis(newKpis);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des données';
      setError(errorMessage);
      console.error('Cost analysis error:', err);
    } finally {
      setLoading(false);
    }
  }, [storeIds, startDate, endDate]);

  const generateReport = useCallback(async (
    newStoreIds: string[], 
    newStartDate: Date, 
    newEndDate: Date
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const newReport = await costAnalysisService.generateCostAnalysisReport(
        newStoreIds, 
        newStartDate, 
        newEndDate
      );
      setReport(newReport);
      setStoreComparisons(newReport.storeComparisons);
      setTimeSeriesData(newReport.timeSeriesData);
      
      const newKpis = await costAnalysisService.getCostKPIs(newStoreIds, newStartDate, newEndDate);
      setKpis(newKpis);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la génération du rapport';
      setError(errorMessage);
      console.error('Report generation error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getStoreAnalysis = useCallback(async (
    storeId: string, 
    analysisStartDate: Date, 
    analysisEndDate: Date
  ): Promise<CostAnalysisData | null> => {
    try {
      return await costAnalysisService.generateStoreAnalysis(storeId, analysisStartDate, analysisEndDate);
    } catch (err) {
      console.error('Store analysis error:', err);
      return null;
    }
  }, []);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(refreshData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshData]);

  return {
    // Data
    report,
    kpis,
    storeComparisons,
    timeSeriesData,
    
    // State
    loading,
    error,
    
    // Actions
    refreshData,
    generateReport,
    getStoreAnalysis
  };
};

// Hook for single store cost analysis
export const useStoreCostAnalysis = (storeId: string, startDate: Date, endDate: Date) => {
  const [analysis, setAnalysis] = useState<CostAnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalysis = useCallback(async () => {
    if (!storeId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await costAnalysisService.generateStoreAnalysis(storeId, startDate, endDate);
      setAnalysis(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement de l\'analyse';
      setError(errorMessage);
      console.error('Store cost analysis error:', err);
    } finally {
      setLoading(false);
    }
  }, [storeId, startDate, endDate]);

  useEffect(() => {
    loadAnalysis();
  }, [loadAnalysis]);

  return {
    analysis,
    loading,
    error,
    refresh: loadAnalysis
  };
};