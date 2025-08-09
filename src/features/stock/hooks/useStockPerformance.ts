import { useState, useEffect, useCallback } from 'react';
import { optimizedStockService } from '../services/optimizedStockService';

interface PerformanceMetrics {
  cacheStats: {
    stockLevels: {
      size: number;
      maxSize: number;
      hitRate: number;
    };
    stockMovements: {
      size: number;
      maxSize: number;
      hitRate: number;
    };
    stockSummary: {
      size: number;
      maxSize: number;
      hitRate: number;
    };
    valorisation: {
      size: number;
      maxSize: number;
      hitRate: number;
    };
  };
  queryTimes: {
    averageStockLevelsQuery: number;
    averageMovementsQuery: number;
    averageValorisationQuery: number;
  };
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  lastUpdated: Date;
}

interface QueryPerformanceEntry {
  operation: string;
  duration: number;
  timestamp: Date;
  cacheHit: boolean;
}

export function useStockPerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [queryHistory, setQueryHistory] = useState<QueryPerformanceEntry[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Collect performance metrics
  const collectMetrics = useCallback(async () => {
    try {
      const cacheStats = optimizedStockService.getCacheStats();
      
      // Calculate average query times from history
      const recentQueries = queryHistory.slice(-50); // Last 50 queries
      const queryTimes = {
        averageStockLevelsQuery: calculateAverageTime(recentQueries, 'stockLevels'),
        averageMovementsQuery: calculateAverageTime(recentQueries, 'movements'),
        averageValorisationQuery: calculateAverageTime(recentQueries, 'valorisation')
      };

      // Get memory usage (if available)
      const memoryUsage = getMemoryUsage();

      setMetrics({
        cacheStats,
        queryTimes,
        memoryUsage,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error collecting performance metrics:', error);
    }
  }, [queryHistory]);

  // Record query performance
  const recordQuery = useCallback((
    operation: string,
    duration: number,
    cacheHit: boolean = false
  ) => {
    const entry: QueryPerformanceEntry = {
      operation,
      duration,
      timestamp: new Date(),
      cacheHit
    };

    setQueryHistory(prev => {
      const updated = [...prev, entry];
      // Keep only last 100 entries
      return updated.slice(-100);
    });
  }, []);

  // Start/stop monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
  }, []);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  // Clear performance data
  const clearMetrics = useCallback(() => {
    setQueryHistory([]);
    setMetrics(null);
    optimizedStockService.invalidateStockCaches();
  }, []);

  // Auto-collect metrics when monitoring is enabled
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(collectMetrics, 5000); // Every 5 seconds
    collectMetrics(); // Initial collection

    return () => clearInterval(interval);
  }, [isMonitoring, collectMetrics]);

  // Performance analysis
  const getPerformanceAnalysis = useCallback(() => {
    if (!metrics || queryHistory.length === 0) return null;

    const recentQueries = queryHistory.slice(-20);
    const cacheHitRate = recentQueries.filter(q => q.cacheHit).length / recentQueries.length;
    
    const slowQueries = recentQueries.filter(q => q.duration > 1000); // > 1 second
    const averageQueryTime = recentQueries.reduce((sum, q) => sum + q.duration, 0) / recentQueries.length;

    const recommendations = [];

    // Cache recommendations
    if (cacheHitRate < 0.5) {
      recommendations.push({
        type: 'cache',
        severity: 'warning',
        message: 'Taux de cache faible. Considérez augmenter la durée de vie du cache.',
        value: `${(cacheHitRate * 100).toFixed(1)}%`
      });
    }

    // Query performance recommendations
    if (averageQueryTime > 500) {
      recommendations.push({
        type: 'query',
        severity: 'error',
        message: 'Temps de requête élevé. Vérifiez les index de base de données.',
        value: `${averageQueryTime.toFixed(0)}ms`
      });
    }

    // Memory recommendations
    if (metrics.memoryUsage.percentage > 80) {
      recommendations.push({
        type: 'memory',
        severity: 'warning',
        message: 'Utilisation mémoire élevée. Considérez réduire la taille du cache.',
        value: `${metrics.memoryUsage.percentage.toFixed(1)}%`
      });
    }

    return {
      cacheHitRate,
      averageQueryTime,
      slowQueriesCount: slowQueries.length,
      recommendations,
      totalQueries: queryHistory.length,
      queriesPerMinute: calculateQueriesPerMinute(queryHistory)
    };
  }, [metrics, queryHistory]);

  return {
    metrics,
    queryHistory,
    isMonitoring,
    recordQuery,
    startMonitoring,
    stopMonitoring,
    clearMetrics,
    collectMetrics,
    getPerformanceAnalysis
  };
}

// Helper functions
function calculateAverageTime(queries: QueryPerformanceEntry[], operation: string): number {
  const operationQueries = queries.filter(q => q.operation.includes(operation));
  if (operationQueries.length === 0) return 0;
  
  return operationQueries.reduce((sum, q) => sum + q.duration, 0) / operationQueries.length;
}

function getMemoryUsage() {
  // In a real browser environment, this would use performance.memory
  // For now, return mock data
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
    };
  }

  return {
    used: 0,
    total: 0,
    percentage: 0
  };
}

function calculateQueriesPerMinute(queries: QueryPerformanceEntry[]): number {
  if (queries.length === 0) return 0;

  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
  
  const recentQueries = queries.filter(q => q.timestamp >= oneMinuteAgo);
  return recentQueries.length;
}

// Performance monitoring component
export function StockPerformanceMonitor() {
  const {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearMetrics,
    getPerformanceAnalysis
  } = useStockPerformance();

  const analysis = getPerformanceAnalysis();

  if (!metrics) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Monitoring des Performances</h3>
        <button
          onClick={startMonitoring}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Démarrer le monitoring
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Monitoring des Performances</h3>
        <div className="space-x-2">
          {isMonitoring ? (
            <button
              onClick={stopMonitoring}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              Arrêter
            </button>
          ) : (
            <button
              onClick={startMonitoring}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              Reprendre
            </button>
          )}
          <button
            onClick={clearMetrics}
            className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
          >
            Effacer
          </button>
        </div>
      </div>

      {/* Cache Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-3 rounded">
          <div className="text-sm text-blue-600 font-medium">Stock Levels Cache</div>
          <div className="text-lg font-bold">{metrics.cacheStats.stockLevels.size}/{metrics.cacheStats.stockLevels.maxSize}</div>
          <div className="text-xs text-gray-500">Hit Rate: {(metrics.cacheStats.stockLevels.hitRate * 100).toFixed(1)}%</div>
        </div>
        
        <div className="bg-green-50 p-3 rounded">
          <div className="text-sm text-green-600 font-medium">Movements Cache</div>
          <div className="text-lg font-bold">{metrics.cacheStats.stockMovements.size}/{metrics.cacheStats.stockMovements.maxSize}</div>
          <div className="text-xs text-gray-500">Hit Rate: {(metrics.cacheStats.stockMovements.hitRate * 100).toFixed(1)}%</div>
        </div>
        
        <div className="bg-yellow-50 p-3 rounded">
          <div className="text-sm text-yellow-600 font-medium">Summary Cache</div>
          <div className="text-lg font-bold">{metrics.cacheStats.stockSummary.size}/{metrics.cacheStats.stockSummary.maxSize}</div>
          <div className="text-xs text-gray-500">Hit Rate: {(metrics.cacheStats.stockSummary.hitRate * 100).toFixed(1)}%</div>
        </div>
        
        <div className="bg-purple-50 p-3 rounded">
          <div className="text-sm text-purple-600 font-medium">Valorisation Cache</div>
          <div className="text-lg font-bold">{metrics.cacheStats.valorisation.size}/{metrics.cacheStats.valorisation.maxSize}</div>
          <div className="text-xs text-gray-500">Hit Rate: {(metrics.cacheStats.valorisation.hitRate * 100).toFixed(1)}%</div>
        </div>
      </div>

      {/* Query Performance */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm text-gray-600 font-medium">Stock Levels</div>
          <div className="text-lg font-bold">{metrics.queryTimes.averageStockLevelsQuery.toFixed(0)}ms</div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm text-gray-600 font-medium">Movements</div>
          <div className="text-lg font-bold">{metrics.queryTimes.averageMovementsQuery.toFixed(0)}ms</div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm text-gray-600 font-medium">Valorisation</div>
          <div className="text-lg font-bold">{metrics.queryTimes.averageValorisationQuery.toFixed(0)}ms</div>
        </div>
      </div>

      {/* Recommendations */}
      {analysis && analysis.recommendations.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Recommandations</h4>
          {analysis.recommendations.map((rec, index) => (
            <div
              key={index}
              className={`p-3 rounded border-l-4 ${
                rec.severity === 'error' 
                  ? 'bg-red-50 border-red-400 text-red-700'
                  : 'bg-yellow-50 border-yellow-400 text-yellow-700'
              }`}
            >
              <div className="flex justify-between">
                <span className="text-sm">{rec.message}</span>
                <span className="text-sm font-medium">{rec.value}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-gray-500">
        Dernière mise à jour: {metrics.lastUpdated.toLocaleTimeString()}
      </div>
    </div>
  );
}