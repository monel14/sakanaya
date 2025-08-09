import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Shield, Activity } from 'lucide-react';
import { 
  validateComprehensive,
  AdvancedValidationResult,
  RiskLevel,
  OperationContext,
  DEFAULT_BUSINESS_RULES,
  detectInventoryInconsistencies,
  generateReconciliationActions
} from '../utils/stockValidations';
import { StockLevel, BonReception, TransfertStock } from '../types';
import { useAudit } from '../hooks/useAudit';

interface ValidationIntegrationDemoProps {
  className?: string;
}

export const ValidationIntegrationDemo: React.FC<ValidationIntegrationDemoProps> = ({ 
  className = '' 
}) => {
  const [activeDemo, setActiveDemo] = useState<'arrival' | 'transfer' | 'inventory'>('arrival');
  const [validationResult, setValidationResult] = useState<AdvancedValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const audit = useAudit();

  // Mock data
  const mockStockLevels: StockLevel[] = [
    {
      storeId: 'store-1',
      productId: 'product-1',
      quantity: 50,
      reservedQuantity: 10,
      availableQuantity: 40,
      lastUpdated: new Date()
    },
    {
      storeId: 'store-1',
      productId: 'product-2',
      quantity: 25,
      reservedQuantity: 5,
      availableQuantity: 20,
      lastUpdated: new Date()
    }
  ];

  const mockOperationContext: OperationContext = {
    userId: 'user-123',
    userRole: 'manager',
    storeId: 'store-1',
    timestamp: new Date(),
    recentOperations: [
      {
        type: 'arrivage',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        value: 150000,
        quantity: 100
      },
      {
        type: 'transfert',
        timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        value: 75000,
        quantity: 50
      }
    ],
    historicalData: {
      averageCost: 1500,
      averageQuantity: 75,
      operationFrequency: 5
    }
  };

  const validateArrivalOperation = async () => {
    setLoading(true);
    try {
      const mockArrival: Partial<BonReception> = {
        id: 'bon-123',
        supplierId: 'supplier-1',
        storeId: 'store-1',
        dateReception: new Date(),
        totalValue: 2500000, // High value to trigger alerts
        lignes: [
          {
            id: 'ligne-1',
            bonReceptionId: 'bon-123',
            productId: 'product-1',
            product: { id: 'product-1', name: 'Thon Rouge' } as any,
            quantiteRecue: 1500, // High quantity to trigger alerts
            coutUnitaire: 3000, // High cost variance
            sousTotal: 4500000
          }
        ],
        status: 'draft'
      };

      const result = validateComprehensive(
        { ...mockArrival, type: 'arrivage' },
        mockOperationContext,
        mockStockLevels,
        DEFAULT_BUSINESS_RULES
      );

      setValidationResult(result);

      // Log validation attempt
      if (!result.isValid) {
        await audit.logValidationFailure(
          'bon_reception',
          mockArrival.id!,
          result.errors,
          'CREATE'
        );
      }

      // Log risk assessment
      if (result.riskLevel !== RiskLevel.LOW) {
        await audit.logAnomalyDetection(
          'HIGH_RISK_OPERATION',
          `Opération à risque ${result.riskLevel} détectée`,
          { type: 'bon_reception', id: mockArrival.id! },
          result.riskLevel === RiskLevel.CRITICAL ? 'CRITICAL' as any : 'WARNING' as any,
          {
            riskFactors: result.riskFactors,
            recommendations: result.recommendations
          }
        );
      }

    } catch (error) {
      console.error('Validation error:', error);
      await audit.logSystemError(error as Error, 'arrival_validation');
    } finally {
      setLoading(false);
    }
  };

  const validateTransferOperation = async () => {
    setLoading(true);
    try {
      const mockTransfer: Partial<TransfertStock> = {
        id: 'transfer-123',
        storeSourceId: 'store-1',
        storeDestinationId: 'store-2',
        lignes: [
          {
            id: 'ligne-1',
            transfertId: 'transfer-123',
            productId: 'product-1',
            product: { id: 'product-1', name: 'Thon Rouge' } as any,
            quantiteEnvoyee: 60 // Exceeds available stock
          }
        ],
        status: 'en_transit'
      };

      const result = validateComprehensive(
        { ...mockTransfer, type: 'transfert' },
        mockOperationContext,
        mockStockLevels,
        DEFAULT_BUSINESS_RULES
      );

      setValidationResult(result);

      if (!result.isValid) {
        await audit.logValidationFailure(
          'transfert_stock',
          mockTransfer.id!,
          result.errors,
          'CREATE'
        );
      }

    } catch (error) {
      console.error('Validation error:', error);
      await audit.logSystemError(error as Error, 'transfer_validation');
    } finally {
      setLoading(false);
    }
  };

  const validateInventoryConsistency = async () => {
    setLoading(true);
    try {
      // Mock physical counts with discrepancies
      const physicalCounts = [
        {
          productId: 'product-1',
          storeId: 'store-1',
          physicalQuantity: 35 // 15 units missing
        },
        {
          productId: 'product-2',
          storeId: 'store-1',
          physicalQuantity: 30 // 5 extra units
        }
      ];

      const inconsistencies = detectInventoryInconsistencies(
        mockStockLevels,
        physicalCounts,
        DEFAULT_BUSINESS_RULES
      );

      const reconciliationActions = generateReconciliationActions(inconsistencies);

      // Create a mock validation result for display
      const result: AdvancedValidationResult = {
        isValid: inconsistencies.length === 0,
        errors: inconsistencies.map(inc => ({
          type: 'INVENTORY_INCONSISTENCY' as any,
          message: `Écart d'inventaire: ${inc.variance} unités (${inc.variancePercentage.toFixed(1)}%)`,
          field: 'quantity',
          details: inc
        })),
        warnings: [],
        riskLevel: inconsistencies.some(inc => inc.severity === 'critical') ? RiskLevel.CRITICAL :
                   inconsistencies.some(inc => inc.severity === 'major') ? RiskLevel.HIGH :
                   inconsistencies.length > 0 ? RiskLevel.MEDIUM : RiskLevel.LOW,
        riskFactors: inconsistencies.flatMap(inc => inc.possibleCauses),
        recommendations: inconsistencies.flatMap(inc => inc.recommendedActions),
        requiresApproval: inconsistencies.some(inc => inc.severity === 'critical' || inc.severity === 'major')
      };

      setValidationResult(result);

      // Log inventory inconsistencies
      for (const inconsistency of inconsistencies) {
        await audit.logAnomalyDetection(
          'INVENTORY_INCONSISTENCY',
          `Écart d'inventaire détecté: ${inconsistency.variance} unités`,
          { type: 'inventory', id: `${inconsistency.storeId}-${inconsistency.productId}` },
          inconsistency.severity === 'critical' ? 'CRITICAL' as any : 'WARNING' as any,
          inconsistency
        );
      }

      // Log reconciliation requirement
      if (reconciliationActions.length > 0) {
        await audit.logReconciliationRequired(
          'Écarts d\'inventaire détectés',
          inconsistencies.map(inc => ({ 
            type: 'product_stock', 
            id: `${inc.storeId}-${inc.productId}` 
          })),
          inconsistencies.reduce((acc, inc) => {
            acc[`${inc.storeId}-${inc.productId}`] = {
              variance: inc.variance,
              severity: inc.severity
            };
            return acc;
          }, {} as Record<string, any>)
        );
      }

    } catch (error) {
      console.error('Validation error:', error);
      await audit.logSystemError(error as Error, 'inventory_validation');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.CRITICAL:
        return 'text-red-600 bg-red-50 border-red-200';
      case RiskLevel.HIGH:
        return 'text-red-500 bg-red-50 border-red-200';
      case RiskLevel.MEDIUM:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getRiskLevelIcon = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.CRITICAL:
      case RiskLevel.HIGH:
        return <XCircle className="w-5 h-5" />;
      case RiskLevel.MEDIUM:
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center mb-4">
          <Shield className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">
            Démonstration - Validations Avancées et Contrôles d'Intégrité
          </h2>
        </div>
        <p className="text-gray-600">
          Cette démonstration illustre le système de validation métier avancé avec évaluation des risques,
          détection d'anomalies et mécanismes de réconciliation automatique.
        </p>
      </div>

      {/* Demo Selection */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Scénarios de Test</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveDemo('arrival')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              activeDemo === 'arrival'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Activity className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900">Arrivage à Risque</h4>
            <p className="text-sm text-gray-600 mt-1">
              Valeur élevée, variance de coût
            </p>
          </button>

          <button
            onClick={() => setActiveDemo('transfer')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              activeDemo === 'transfer'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Activity className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900">Transfert Problématique</h4>
            <p className="text-sm text-gray-600 mt-1">
              Stock insuffisant
            </p>
          </button>

          <button
            onClick={() => setActiveDemo('inventory')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              activeDemo === 'inventory'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <AlertTriangle className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900">Écarts d'Inventaire</h4>
            <p className="text-sm text-gray-600 mt-1">
              Incohérences détectées
            </p>
          </button>
        </div>
      </div>

      {/* Validation Trigger */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {activeDemo === 'arrival' && 'Validation Arrivage Fournisseur'}
              {activeDemo === 'transfer' && 'Validation Transfert Inter-Magasins'}
              {activeDemo === 'inventory' && 'Validation Cohérence Inventaire'}
            </h3>
            <p className="text-gray-600 mt-1">
              {activeDemo === 'arrival' && 'Test avec montant élevé et variance de coût importante'}
              {activeDemo === 'transfer' && 'Test avec quantité dépassant le stock disponible'}
              {activeDemo === 'inventory' && 'Test avec écarts entre stock théorique et physique'}
            </p>
          </div>
          <button
            onClick={() => {
              if (activeDemo === 'arrival') validateArrivalOperation();
              else if (activeDemo === 'transfer') validateTransferOperation();
              else validateInventoryConsistency();
            }}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Shield className="w-4 h-4 mr-2" />
            )}
            Lancer Validation
          </button>
        </div>
      </div>

      {/* Validation Results */}
      {validationResult && (
        <div className="space-y-4">
          {/* Overall Status */}
          <div className={`p-6 rounded-lg border-2 ${getRiskLevelColor(validationResult.riskLevel)}`}>
            <div className="flex items-center mb-4">
              {getRiskLevelIcon(validationResult.riskLevel)}
              <div className="ml-3">
                <h3 className="text-lg font-semibold">
                  Niveau de Risque: {validationResult.riskLevel}
                </h3>
                <p className="text-sm">
                  {validationResult.isValid ? 'Validation réussie' : `${validationResult.errors.length} erreurs détectées`}
                  {validationResult.requiresApproval && ' - Approbation requise'}
                </p>
              </div>
            </div>

            {/* Risk Factors */}
            {validationResult.riskFactors.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Facteurs de Risque:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {validationResult.riskFactors.map((factor, index) => (
                    <li key={index}>{factor}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {validationResult.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Recommandations:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {validationResult.recommendations.map((recommendation, index) => (
                    <li key={index}>{recommendation}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Errors */}
          {validationResult.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
                <XCircle className="w-5 h-5 mr-2" />
                Erreurs de Validation ({validationResult.errors.length})
              </h4>
              <div className="space-y-2">
                {validationResult.errors.map((error, index) => (
                  <div key={index} className="bg-white p-3 rounded border border-red-200">
                    <p className="text-red-800 font-medium">{error.message}</p>
                    {error.field && (
                      <p className="text-red-600 text-sm mt-1">Champ: {error.field}</p>
                    )}
                    {error.details && (
                      <details className="mt-2">
                        <summary className="text-red-600 text-sm cursor-pointer">Détails</summary>
                        <pre className="text-xs text-red-600 mt-1 bg-red-50 p-2 rounded overflow-auto">
                          {JSON.stringify(error.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {validationResult.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Avertissements ({validationResult.warnings.length})
              </h4>
              <div className="space-y-2">
                {validationResult.warnings.map((warning, index) => (
                  <div key={index} className="bg-white p-3 rounded border border-yellow-200">
                    <p className="text-yellow-800">{warning.message}</p>
                    {warning.field && (
                      <p className="text-yellow-600 text-sm mt-1">Champ: {warning.field}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success State */}
          {validationResult.isValid && validationResult.riskLevel === RiskLevel.LOW && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                <div>
                  <h4 className="text-lg font-semibold text-green-800">Validation Réussie</h4>
                  <p className="text-green-700">
                    L'opération respecte toutes les règles métier et présente un risque faible.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Business Rules Info */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Règles Métier Configurées</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Seuils de Quantité</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Max par opération: {DEFAULT_BUSINESS_RULES.maxQuantityPerOperation.toLocaleString()}</li>
              <li>• Stock critique: {DEFAULT_BUSINESS_RULES.criticalStockThreshold}</li>
              <li>• Surstock: {DEFAULT_BUSINESS_RULES.overstockThreshold}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Seuils de Valeur</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Max par opération: {(DEFAULT_BUSINESS_RULES.maxValuePerOperation / 1000000).toFixed(1)}M CFA</li>
              <li>• Variance coût max: {DEFAULT_BUSINESS_RULES.maxCostVariancePercentage}%</li>
              <li>• Tolérance inventaire: {DEFAULT_BUSINESS_RULES.inventoryTolerancePercentage}%</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Fréquence</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Max opérations/heure: {DEFAULT_BUSINESS_RULES.maxOperationsPerHour}</li>
              <li>• Délai min entre opérations: {DEFAULT_BUSINESS_RULES.minTimeBetweenOperations} min</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Horaires</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Heures d'ouverture: {DEFAULT_BUSINESS_RULES.businessHours.start}h - {DEFAULT_BUSINESS_RULES.businessHours.end}h</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationIntegrationDemo;