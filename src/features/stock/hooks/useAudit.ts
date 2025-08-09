import { useCallback } from 'react';
import { 
  auditService, 
  AuditEventType, 
  AuditSeverity 
} from '../services/auditService';
import { 
  BonReception, 
  TransfertStock, 
  Inventaire, 
  Perte, 
  MouvementStock 
} from '../types';

/**
 * Hook for integrating audit logging with stock operations
 */
export const useAudit = () => {
  // Get current user context (in a real app, this would come from auth context)
  const getCurrentUser = useCallback(() => {
    // This would be replaced with actual user context
    return {
      id: 'current-user-id',
      role: 'director' as 'director' | 'manager',
      storeId: 'current-store-id'
    };
  }, []);

  /**
   * Log bon de réception operations
   */
  const logBonReceptionOperation = useCallback(async (
    bon: BonReception,
    action: 'CREATE' | 'UPDATE' | 'VALIDATE' | 'DELETE',
    oldValues?: Partial<BonReception>
  ) => {
    const user = getCurrentUser();
    try {
      await auditService.logBonReceptionEvent(bon, action, user.id, user.role, oldValues);
    } catch (error) {
      console.error('Failed to log bon reception operation:', error);
    }
  }, [getCurrentUser]);

  /**
   * Log transfer operations
   */
  const logTransfertOperation = useCallback(async (
    transfert: TransfertStock,
    action: 'CREATE' | 'UPDATE' | 'RECEIVE' | 'CANCEL',
    oldValues?: Partial<TransfertStock>
  ) => {
    const user = getCurrentUser();
    try {
      await auditService.logTransfertEvent(transfert, action, user.id, user.role, oldValues);
    } catch (error) {
      console.error('Failed to log transfert operation:', error);
    }
  }, [getCurrentUser]);

  /**
   * Log inventory operations
   */
  const logInventaireOperation = useCallback(async (
    inventaire: Inventaire,
    action: 'CREATE' | 'UPDATE' | 'VALIDATE' | 'DELETE',
    oldValues?: Partial<Inventaire>
  ) => {
    const user = getCurrentUser();
    try {
      await auditService.logInventaireEvent(inventaire, action, user.id, user.role, oldValues);
    } catch (error) {
      console.error('Failed to log inventaire operation:', error);
    }
  }, [getCurrentUser]);

  /**
   * Log loss operations
   */
  const logPerteOperation = useCallback(async (
    perte: Perte,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    oldValues?: Partial<Perte>
  ) => {
    const user = getCurrentUser();
    try {
      await auditService.logPerteEvent(perte, action, user.id, user.role, oldValues);
    } catch (error) {
      console.error('Failed to log perte operation:', error);
    }
  }, [getCurrentUser]);

  /**
   * Log stock movement
   */
  const logStockMovement = useCallback(async (
    movement: MouvementStock,
    metadata?: Record<string, any>
  ) => {
    const user = getCurrentUser();
    try {
      await auditService.logStockMovement(movement, user.id, user.role, metadata);
    } catch (error) {
      console.error('Failed to log stock movement:', error);
    }
  }, [getCurrentUser]);

  /**
   * Log security event
   */
  const logSecurityEvent = useCallback(async (
    eventType: AuditEventType,
    severity: AuditSeverity,
    description: string,
    details: Record<string, any> = {}
  ) => {
    const user = getCurrentUser();
    try {
      await auditService.logSecurityEvent(eventType, severity, user.id, description, details);
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, [getCurrentUser]);

  /**
   * Log validation failure
   */
  const logValidationFailure = useCallback(async (
    entityType: string,
    entityId: string,
    validationErrors: any[],
    attemptedAction: string
  ) => {
    const user = getCurrentUser();
    try {
      await auditService.logEvent(
        AuditEventType.VALIDATION_FAILURE,
        AuditSeverity.WARNING,
        user.id,
        user.role,
        entityType,
        entityId,
        attemptedAction,
        `Échec de validation: ${validationErrors.length} erreurs détectées`,
        {
          metadata: {
            validationErrors,
            attemptedAction,
            errorCount: validationErrors.length
          }
        }
      );
    } catch (error) {
      console.error('Failed to log validation failure:', error);
    }
  }, [getCurrentUser]);

  /**
   * Log unauthorized access attempt
   */
  const logUnauthorizedAccess = useCallback(async (
    resource: string,
    attemptedAction: string,
    reason: string
  ) => {
    const user = getCurrentUser();
    try {
      await auditService.logEvent(
        AuditEventType.UNAUTHORIZED_ACCESS,
        AuditSeverity.ERROR,
        user.id,
        user.role,
        'security',
        'unauthorized-access',
        'ACCESS_DENIED',
        `Tentative d'accès non autorisé: ${resource}`,
        {
          metadata: {
            resource,
            attemptedAction,
            reason,
            timestamp: new Date().toISOString()
          }
        }
      );
    } catch (error) {
      console.error('Failed to log unauthorized access:', error);
    }
  }, [getCurrentUser]);

  /**
   * Log system error
   */
  const logSystemError = useCallback(async (
    error: Error,
    context: string,
    additionalInfo?: Record<string, any>
  ) => {
    const user = getCurrentUser();
    try {
      await auditService.logEvent(
        AuditEventType.SYSTEM_ERROR,
        AuditSeverity.ERROR,
        user.id,
        user.role,
        'system',
        'error',
        'ERROR',
        `Erreur système: ${error.message}`,
        {
          metadata: {
            errorName: error.name,
            errorMessage: error.message,
            errorStack: error.stack,
            context,
            ...additionalInfo
          }
        }
      );
    } catch (auditError) {
      console.error('Failed to log system error:', auditError);
    }
  }, [getCurrentUser]);

  /**
   * Log anomaly detection
   */
  const logAnomalyDetection = useCallback(async (
    anomalyType: string,
    description: string,
    affectedEntity: { type: string; id: string },
    severity: AuditSeverity = AuditSeverity.WARNING,
    details: Record<string, any> = {}
  ) => {
    const user = getCurrentUser();
    try {
      await auditService.logEvent(
        AuditEventType.ANOMALY_DETECTED,
        severity,
        user.id,
        user.role,
        affectedEntity.type,
        affectedEntity.id,
        'ANOMALY_DETECTED',
        `Anomalie détectée (${anomalyType}): ${description}`,
        {
          metadata: {
            anomalyType,
            ...details
          }
        }
      );
    } catch (error) {
      console.error('Failed to log anomaly detection:', error);
    }
  }, [getCurrentUser]);

  /**
   * Log threshold breach
   */
  const logThresholdBreach = useCallback(async (
    thresholdType: string,
    currentValue: number,
    thresholdValue: number,
    entityType: string,
    entityId: string,
    description: string
  ) => {
    const user = getCurrentUser();
    try {
      await auditService.logEvent(
        AuditEventType.THRESHOLD_EXCEEDED,
        AuditSeverity.WARNING,
        user.id,
        user.role,
        entityType,
        entityId,
        'THRESHOLD_BREACH',
        `Seuil dépassé (${thresholdType}): ${description}`,
        {
          metadata: {
            thresholdType,
            currentValue,
            thresholdValue,
            exceedancePercentage: ((currentValue - thresholdValue) / thresholdValue) * 100
          }
        }
      );
    } catch (error) {
      console.error('Failed to log threshold breach:', error);
    }
  }, [getCurrentUser]);

  /**
   * Log reconciliation requirement
   */
  const logReconciliationRequired = useCallback(async (
    reason: string,
    affectedEntities: Array<{ type: string; id: string }>,
    discrepancies: Record<string, any>
  ) => {
    const user = getCurrentUser();
    try {
      await auditService.logEvent(
        AuditEventType.RECONCILIATION_REQUIRED,
        AuditSeverity.WARNING,
        user.id,
        user.role,
        'reconciliation',
        `reconciliation-${Date.now()}`,
        'RECONCILIATION_REQUIRED',
        `Réconciliation requise: ${reason}`,
        {
          metadata: {
            reason,
            affectedEntities,
            discrepancies,
            discrepancyCount: Object.keys(discrepancies).length
          }
        }
      );
    } catch (error) {
      console.error('Failed to log reconciliation requirement:', error);
    }
  }, [getCurrentUser]);

  return {
    logBonReceptionOperation,
    logTransfertOperation,
    logInventaireOperation,
    logPerteOperation,
    logStockMovement,
    logSecurityEvent,
    logValidationFailure,
    logUnauthorizedAccess,
    logSystemError,
    logAnomalyDetection,
    logThresholdBreach,
    logReconciliationRequired
  };
};

export default useAudit;