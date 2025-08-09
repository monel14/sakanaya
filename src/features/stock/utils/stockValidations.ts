import { BonReception, LigneReception, Supplier, TransfertStock, LigneTransfert, StockLevel } from '../types';
import { calculateBonReceptionTotal, calculateLigneReceptionSousTotal, isStockSufficient } from './stockCalculations';

// Error types for stock validation
export enum StockValidationErrorType {
  INVALID_QUANTITY = 'INVALID_QUANTITY',
  INVALID_COST = 'INVALID_COST',
  MISSING_SUPPLIER = 'MISSING_SUPPLIER',
  MISSING_STORE = 'MISSING_STORE',
  MISSING_PRODUCT = 'MISSING_PRODUCT',
  EMPTY_LINES = 'EMPTY_LINES',
  TOTAL_MISMATCH = 'TOTAL_MISMATCH',
  DUPLICATE_PRODUCT = 'DUPLICATE_PRODUCT',
  NEGATIVE_QUANTITY = 'NEGATIVE_QUANTITY',
  ZERO_QUANTITY = 'ZERO_QUANTITY',
  NEGATIVE_COST = 'NEGATIVE_COST',
  ZERO_COST = 'ZERO_COST',
  MISSING_COST = 'MISSING_COST',
  CALCULATION_ERROR = 'CALCULATION_ERROR',
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  SAME_SOURCE_DESTINATION = 'SAME_SOURCE_DESTINATION',
  MISSING_LINES = 'MISSING_LINES'
}

export interface StockValidationError {
  type: StockValidationErrorType;
  message: string;
  field?: string;
  lineIndex?: number;
  details?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: StockValidationError[];
  warnings: StockValidationError[];
}

// Additional error types for advanced business validations
export enum AdvancedValidationErrorType {
  SUSPICIOUS_QUANTITY = 'SUSPICIOUS_QUANTITY',
  UNUSUAL_COST_VARIANCE = 'UNUSUAL_COST_VARIANCE',
  FREQUENT_OPERATIONS = 'FREQUENT_OPERATIONS',
  LARGE_VALUE_OPERATION = 'LARGE_VALUE_OPERATION',
  OFF_HOURS_OPERATION = 'OFF_HOURS_OPERATION',
  RAPID_SUCCESSION = 'RAPID_SUCCESSION',
  INVENTORY_INCONSISTENCY = 'INVENTORY_INCONSISTENCY',
  FLOW_ANOMALY = 'FLOW_ANOMALY',
  THRESHOLD_BREACH = 'THRESHOLD_BREACH',
  RECONCILIATION_ERROR = 'RECONCILIATION_ERROR'
}

// Risk levels for operations
export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Business rules configuration
export interface BusinessRulesConfig {
  maxQuantityPerOperation: number;
  maxValuePerOperation: number;
  maxOperationsPerHour: number;
  maxCostVariancePercentage: number;
  businessHours: { start: number; end: number };
  minTimeBetweenOperations: number; // minutes
  inventoryTolerancePercentage: number;
  criticalStockThreshold: number;
  overstockThreshold: number;
}

// Default business rules
export const DEFAULT_BUSINESS_RULES: BusinessRulesConfig = {
  maxQuantityPerOperation: 1000,
  maxValuePerOperation: 5000000, // 5M CFA
  maxOperationsPerHour: 50,
  maxCostVariancePercentage: 25,
  businessHours: { start: 6, end: 22 },
  minTimeBetweenOperations: 2,
  inventoryTolerancePercentage: 5,
  criticalStockThreshold: 5,
  overstockThreshold: 100
};

/**
 * Validation messages in French
 */
export const VALIDATION_MESSAGES = {
  [StockValidationErrorType.INVALID_QUANTITY]: 'Quantité invalide',
  [StockValidationErrorType.INVALID_COST]: 'Coût invalide',
  [StockValidationErrorType.MISSING_SUPPLIER]: 'Fournisseur requis',
  [StockValidationErrorType.MISSING_STORE]: 'Magasin requis',
  [StockValidationErrorType.MISSING_PRODUCT]: 'Produit requis',
  [StockValidationErrorType.EMPTY_LINES]: 'Au moins une ligne de produit est requise',
  [StockValidationErrorType.TOTAL_MISMATCH]: 'Le total du bon ne correspond pas à la somme des lignes',
  [StockValidationErrorType.DUPLICATE_PRODUCT]: 'Produit en double dans le bon',
  [StockValidationErrorType.NEGATIVE_QUANTITY]: 'La quantité ne peut pas être négative',
  [StockValidationErrorType.ZERO_QUANTITY]: 'La quantité ne peut pas être nulle',
  [StockValidationErrorType.NEGATIVE_COST]: 'Le coût unitaire ne peut pas être négatif',
  [StockValidationErrorType.ZERO_COST]: 'Le coût unitaire ne peut pas être nul',
  [StockValidationErrorType.MISSING_COST]: 'Le coût unitaire est obligatoire',
  [StockValidationErrorType.CALCULATION_ERROR]: 'Erreur de calcul détectée',
  [StockValidationErrorType.INSUFFICIENT_STOCK]: 'Stock insuffisant',
  [StockValidationErrorType.SAME_SOURCE_DESTINATION]: 'Le magasin source et destination ne peuvent pas être identiques',
  [StockValidationErrorType.MISSING_LINES]: 'Au moins une ligne de transfert est requise'
};

export const ADVANCED_VALIDATION_MESSAGES = {
  [AdvancedValidationErrorType.SUSPICIOUS_QUANTITY]: 'Quantité suspecte détectée',
  [AdvancedValidationErrorType.UNUSUAL_COST_VARIANCE]: 'Variance de coût inhabituelle',
  [AdvancedValidationErrorType.FREQUENT_OPERATIONS]: 'Trop d\'opérations en peu de temps',
  [AdvancedValidationErrorType.LARGE_VALUE_OPERATION]: 'Opération de grande valeur',
  [AdvancedValidationErrorType.OFF_HOURS_OPERATION]: 'Opération en dehors des heures d\'ouverture',
  [AdvancedValidationErrorType.RAPID_SUCCESSION]: 'Opérations en succession rapide',
  [AdvancedValidationErrorType.INVENTORY_INCONSISTENCY]: 'Incohérence d\'inventaire détectée',
  [AdvancedValidationErrorType.FLOW_ANOMALY]: 'Anomalie de flux détectée',
  [AdvancedValidationErrorType.THRESHOLD_BREACH]: 'Seuil critique dépassé',
  [AdvancedValidationErrorType.RECONCILIATION_ERROR]: 'Erreur de réconciliation'
};

/**
 * Validate quantity values
 */
export function validateQuantity(quantity: number, lineIndex?: number): StockValidationError[] {
  const errors: StockValidationError[] = [];

  if (isNaN(quantity)) {
    errors.push({
      type: StockValidationErrorType.INVALID_QUANTITY,
      message: 'La quantité doit être un nombre valide',
      field: 'quantiteRecue',
      lineIndex
    });
    return errors;
  }

  if (quantity < 0) {
    errors.push({
      type: StockValidationErrorType.NEGATIVE_QUANTITY,
      message: 'La quantité ne peut pas être négative',
      field: 'quantiteRecue',
      lineIndex
    });
  }

  if (quantity === 0) {
    errors.push({
      type: StockValidationErrorType.ZERO_QUANTITY,
      message: 'La quantité ne peut pas être nulle',
      field: 'quantiteRecue',
      lineIndex
    });
  }

  return errors;
}

/**
 * Validate unit cost values
 */
export function validateUnitCost(cost: number, lineIndex?: number): StockValidationError[] {
  const errors: StockValidationError[] = [];

  if (isNaN(cost)) {
    errors.push({
      type: StockValidationErrorType.INVALID_COST,
      message: 'Le coût unitaire doit être un nombre valide',
      field: 'coutUnitaire',
      lineIndex
    });
    return errors;
  }

  if (cost < 0) {
    errors.push({
      type: StockValidationErrorType.NEGATIVE_COST,
      message: 'Le coût unitaire ne peut pas être négatif',
      field: 'coutUnitaire',
      lineIndex
    });
  }

  if (cost === 0) {
    errors.push({
      type: StockValidationErrorType.ZERO_COST,
      message: 'Le coût unitaire ne peut pas être nul',
      field: 'coutUnitaire',
      lineIndex
    });
  }

  return errors;
}

/**
 * Validate a single reception line
 */
export function validateLigneReception(ligne: LigneReception, lineIndex: number): StockValidationError[] {
  const errors: StockValidationError[] = [];

  // Validate product
  if (!ligne.productId || ligne.productId.trim() === '') {
    errors.push({
      type: StockValidationErrorType.MISSING_PRODUCT,
      message: 'Le produit est requis',
      field: 'productId',
      lineIndex
    });
  }

  // Validate quantity
  errors.push(...validateQuantity(ligne.quantiteRecue, lineIndex));

  // Validate unit cost
  errors.push(...validateUnitCost(ligne.coutUnitaire, lineIndex));

  // Validate subtotal calculation
  const expectedSubtotal = calculateLigneReceptionSousTotal(ligne.quantiteRecue, ligne.coutUnitaire);
  const tolerance = 0.01; // 1 centime de tolérance pour les erreurs d'arrondi

  if (Math.abs(ligne.sousTotal - expectedSubtotal) > tolerance) {
    errors.push({
      type: StockValidationErrorType.CALCULATION_ERROR,
      message: `Sous-total incorrect. Attendu: ${expectedSubtotal.toFixed(2)}, Reçu: ${ligne.sousTotal.toFixed(2)}`,
      field: 'sousTotal',
      lineIndex,
      details: {
        expected: expectedSubtotal,
        actual: ligne.sousTotal,
        difference: Math.abs(ligne.sousTotal - expectedSubtotal)
      }
    });
  }

  return errors;
}

/**
 * Validate reception voucher general information
 */
export function validateBonReceptionGeneralInfo(bonReception: Partial<BonReception>): StockValidationError[] {
  const errors: StockValidationError[] = [];

  // Validate supplier
  if (!bonReception.supplierId || bonReception.supplierId.trim() === '') {
    errors.push({
      type: StockValidationErrorType.MISSING_SUPPLIER,
      message: 'Le fournisseur est requis',
      field: 'supplierId'
    });
  }

  // Validate store
  if (!bonReception.storeId || bonReception.storeId.trim() === '') {
    errors.push({
      type: StockValidationErrorType.MISSING_STORE,
      message: 'Le magasin de réception est requis',
      field: 'storeId'
    });
  }

  // Validate reception date
  if (!bonReception.dateReception) {
    errors.push({
      type: StockValidationErrorType.INVALID_QUANTITY,
      message: 'La date de réception est requise',
      field: 'dateReception'
    });
  } else {
    const receptionDate = new Date(bonReception.dateReception);
    const now = new Date();
    
    // Check if date is not in the future (with 1 day tolerance)
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (receptionDate > tomorrow) {
      errors.push({
        type: StockValidationErrorType.INVALID_QUANTITY,
        message: 'La date de réception ne peut pas être dans le futur',
        field: 'dateReception'
      });
    }
  }

  return errors;
}

/**
 * Validate reception voucher lines
 */
export function validateBonReceptionLines(lignes: LigneReception[]): StockValidationError[] {
  const errors: StockValidationError[] = [];

  // Check if there are lines
  if (!lignes || lignes.length === 0) {
    errors.push({
      type: StockValidationErrorType.EMPTY_LINES,
      message: 'Au moins une ligne de produit est requise',
      field: 'lignes'
    });
    return errors;
  }

  // Validate each line
  lignes.forEach((ligne, index) => {
    errors.push(...validateLigneReception(ligne, index));
  });

  // Check for duplicate products
  const productIds = lignes.map(ligne => ligne.productId);
  const duplicateProducts = productIds.filter((productId, index) => 
    productIds.indexOf(productId) !== index
  );

  if (duplicateProducts.length > 0) {
    duplicateProducts.forEach(productId => {
      const duplicateIndexes = lignes
        .map((ligne, index) => ligne.productId === productId ? index : -1)
        .filter(index => index !== -1);

      duplicateIndexes.slice(1).forEach(index => {
        errors.push({
          type: StockValidationErrorType.DUPLICATE_PRODUCT,
          message: 'Ce produit est déjà présent dans le bon',
          field: 'productId',
          lineIndex: index,
          details: { productId, duplicateIndexes }
        });
      });
    });
  }

  return errors;
}

/**
 * Validate reception voucher total
 */
export function validateBonReceptionTotal(bonReception: Partial<BonReception>): StockValidationError[] {
  const errors: StockValidationError[] = [];

  if (!bonReception.lignes || bonReception.lignes.length === 0) {
    return errors; // This will be caught by line validation
  }

  const calculatedTotal = calculateBonReceptionTotal(bonReception.lignes);
  const declaredTotal = bonReception.totalValue || 0;
  const tolerance = 0.01; // 1 centime de tolérance

  if (Math.abs(calculatedTotal - declaredTotal) > tolerance) {
    errors.push({
      type: StockValidationErrorType.TOTAL_MISMATCH,
      message: `Le total du bon (${declaredTotal.toFixed(2)} CFA) ne correspond pas à la somme des lignes (${calculatedTotal.toFixed(2)} CFA)`,
      field: 'totalValue',
      details: {
        calculated: calculatedTotal,
        declared: declaredTotal,
        difference: Math.abs(calculatedTotal - declaredTotal)
      }
    });
  }

  return errors;
}

/**
 * Complete validation of a reception voucher
 */
export function validateBonReception(bonReception: Partial<BonReception>): ValidationResult {
  const errors: StockValidationError[] = [];
  const warnings: StockValidationError[] = [];

  // Validate general information
  errors.push(...validateBonReceptionGeneralInfo(bonReception));

  // Validate lines
  errors.push(...validateBonReceptionLines(bonReception.lignes || []));

  // Validate total (only if lines are valid)
  const lineErrors = errors.filter(error => error.field === 'lignes' || error.lineIndex !== undefined);
  if (lineErrors.length === 0) {
    errors.push(...validateBonReceptionTotal(bonReception));
  }

  // Add warnings for potential issues
  if (bonReception.lignes && bonReception.lignes.length > 20) {
    warnings.push({
      type: StockValidationErrorType.INVALID_QUANTITY,
      message: 'Bon de réception avec un grand nombre de lignes (> 20). Vérifiez que c\'est correct.',
      field: 'lignes'
    });
  }

  if (bonReception.totalValue && bonReception.totalValue > 1000000) {
    warnings.push({
      type: StockValidationErrorType.INVALID_COST,
      message: 'Montant très élevé (> 1,000,000 CFA). Vérifiez les coûts unitaires.',
      field: 'totalValue'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate before saving as draft
 */
export function validateBonReceptionDraft(bonReception: Partial<BonReception>): ValidationResult {
  const errors: StockValidationError[] = [];
  const warnings: StockValidationError[] = [];

  // For draft, we only require basic information
  if (!bonReception.supplierId || bonReception.supplierId.trim() === '') {
    errors.push({
      type: StockValidationErrorType.MISSING_SUPPLIER,
      message: 'Le fournisseur est requis pour sauvegarder en brouillon',
      field: 'supplierId'
    });
  }

  if (!bonReception.storeId || bonReception.storeId.trim() === '') {
    errors.push({
      type: StockValidationErrorType.MISSING_STORE,
      message: 'Le magasin est requis pour sauvegarder en brouillon',
      field: 'storeId'
    });
  }

  // Validate existing lines (but don't require them)
  if (bonReception.lignes && bonReception.lignes.length > 0) {
    bonReception.lignes.forEach((ligne, index) => {
      // Only validate non-empty lines
      if (ligne.productId || ligne.quantiteRecue > 0 || ligne.coutUnitaire > 0) {
        errors.push(...validateLigneReception(ligne, index));
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Auto-save validation (minimal validation for auto-save)
 */
export function validateForAutoSave(_bonReception: Partial<BonReception>): ValidationResult {
  const errors: StockValidationError[] = [];
  const warnings: StockValidationError[] = [];

  // For auto-save, we only check for critical errors that would prevent saving
  // No validation errors for auto-save - we want to save whatever the user has entered

  return {
    isValid: true,
    errors,
    warnings
  };
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: StockValidationError): string {
  let message = error.message;

  if (error.lineIndex !== undefined) {
    message = `Ligne ${error.lineIndex + 1}: ${message}`;
  }

  return message;
}

/**
 * Group errors by type for better display
 */
export function groupErrorsByType(errors: StockValidationError[]): Record<StockValidationErrorType, StockValidationError[]> {
  return errors.reduce((groups, error) => {
    if (!groups[error.type]) {
      groups[error.type] = [];
    }
    groups[error.type].push(error);
    return groups;
  }, {} as Record<StockValidationErrorType, StockValidationError[]>);
}

/**
 * Get validation summary for display
 */
export function getValidationSummary(result: ValidationResult): string {
  if (result.isValid) {
    return 'Validation réussie';
  }

  const errorCount = result.errors.length;
  const warningCount = result.warnings.length;

  let summary = `${errorCount} erreur${errorCount > 1 ? 's' : ''}`;
  
  if (warningCount > 0) {
    summary += ` et ${warningCount} avertissement${warningCount > 1 ? 's' : ''}`;
  }

  return summary;
}

/**
 * Check if a field has errors
 */
export function hasFieldError(errors: StockValidationError[], field: string, lineIndex?: number): boolean {
  return errors.some(error => 
    error.field === field && 
    (lineIndex === undefined || error.lineIndex === lineIndex)
  );
}

/**
 * Get errors for a specific field
 */
export function getFieldErrors(errors: StockValidationError[], field: string, lineIndex?: number): StockValidationError[] {
  return errors.filter(error => 
    error.field === field && 
    (lineIndex === undefined || error.lineIndex === lineIndex)
  );
}

/**
 * Validate supplier data
 */
export function validateSupplier(supplier: Partial<Supplier>): ValidationResult {
  const errors: StockValidationError[] = [];

  if (!supplier.name || supplier.name.trim() === '') {
    errors.push({
      type: StockValidationErrorType.MISSING_SUPPLIER,
      message: 'Le nom du fournisseur est requis',
      field: 'name'
    });
  }

  if (supplier.email && supplier.email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(supplier.email)) {
      errors.push({
        type: StockValidationErrorType.INVALID_COST,
        message: 'Format d\'email invalide',
        field: 'email'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: []
  };
}

/**
 * Validate transfer data
 */
export function validateTransfert(transfert: Partial<TransfertStock>, stockLevels: StockLevel[]): ValidationResult {
  const errors: StockValidationError[] = [];
  const warnings: StockValidationError[] = [];

  // Validate source and destination stores
  if (!transfert.storeSourceId || transfert.storeSourceId.trim() === '') {
    errors.push({
      type: StockValidationErrorType.MISSING_STORE,
      message: 'Le magasin source est requis',
      field: 'storeSourceId'
    });
  }

  if (!transfert.storeDestinationId || transfert.storeDestinationId.trim() === '') {
    errors.push({
      type: StockValidationErrorType.MISSING_STORE,
      message: 'Le magasin destination est requis',
      field: 'storeDestinationId'
    });
  }

  // Check if source and destination are different
  if (transfert.storeSourceId && transfert.storeDestinationId && 
      transfert.storeSourceId === transfert.storeDestinationId) {
    errors.push({
      type: StockValidationErrorType.SAME_SOURCE_DESTINATION,
      message: 'Le magasin source et destination doivent être différents',
      field: 'storeDestinationId'
    });
  }

  // Validate lines
  if (!transfert.lignes || transfert.lignes.length === 0) {
    errors.push({
      type: StockValidationErrorType.MISSING_LINES,
      message: 'Au moins une ligne de transfert est requise',
      field: 'lignes'
    });
    return { isValid: false, errors, warnings };
  }

  // Validate each line
  transfert.lignes.forEach((ligne, index) => {
    errors.push(...validateLigneTransfert(ligne, index, stockLevels, transfert.storeSourceId!));
  });

  // Check for duplicate products
  const productIds = transfert.lignes.map(ligne => ligne.productId);
  const duplicateProducts = productIds.filter((productId, index) => 
    productIds.indexOf(productId) !== index
  );

  if (duplicateProducts.length > 0) {
    duplicateProducts.forEach(productId => {
      const duplicateIndexes = transfert.lignes!
        .map((ligne, index) => ligne.productId === productId ? index : -1)
        .filter(index => index !== -1);

      duplicateIndexes.slice(1).forEach(index => {
        errors.push({
          type: StockValidationErrorType.DUPLICATE_PRODUCT,
          message: 'Ce produit est déjà présent dans le transfert',
          field: 'productId',
          lineIndex: index,
          details: { productId, duplicateIndexes }
        });
      });
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate a single transfer line
 */
export function validateLigneTransfert(
  ligne: LigneTransfert, 
  lineIndex: number, 
  stockLevels: StockLevel[], 
  storeSourceId: string
): StockValidationError[] {
  const errors: StockValidationError[] = [];

  // Validate product
  if (!ligne.productId || ligne.productId.trim() === '') {
    errors.push({
      type: StockValidationErrorType.MISSING_PRODUCT,
      message: 'Le produit est requis',
      field: 'productId',
      lineIndex
    });
  }

  // Validate quantity
  errors.push(...validateQuantity(ligne.quantiteEnvoyee, lineIndex));

  // Check stock availability
  if (ligne.productId && ligne.quantiteEnvoyee > 0) {
    const stockLevel = stockLevels.find(sl => 
      sl.storeId === storeSourceId && sl.productId === ligne.productId
    );

    if (stockLevel) {
      if (!isStockSufficient(stockLevel.availableQuantity, ligne.quantiteEnvoyee)) {
        errors.push({
          type: StockValidationErrorType.INSUFFICIENT_STOCK,
          message: `Stock insuffisant. Disponible: ${stockLevel.availableQuantity}, Demandé: ${ligne.quantiteEnvoyee}`,
          field: 'quantiteEnvoyee',
          lineIndex,
          details: {
            available: stockLevel.availableQuantity,
            requested: ligne.quantiteEnvoyee,
            shortage: ligne.quantiteEnvoyee - stockLevel.availableQuantity
          }
        });
      }
    } else {
      errors.push({
        type: StockValidationErrorType.INSUFFICIENT_STOCK,
        message: 'Aucun stock disponible pour ce produit dans le magasin source',
        field: 'productId',
        lineIndex
      });
    }
  }

  return errors;
}

/**
 * Validate transfer reception data
 */
export function validateTransfertReception(
  transfert: TransfertStock, 
  lignesReception: Array<{ productId: string; quantiteRecue: number; commentaire?: string }>
): ValidationResult {
  const errors: StockValidationError[] = [];
  const warnings: StockValidationError[] = [];

  // Check if transfer is in correct status
  if (transfert.status !== 'en_transit') {
    errors.push({
      type: StockValidationErrorType.INVALID_QUANTITY,
      message: 'Seuls les transferts en transit peuvent être réceptionnés',
      field: 'status'
    });
  }

  // Validate reception lines
  lignesReception.forEach((ligneReception, index) => {
    // Find corresponding transfer line
    const transfertLigne = transfert.lignes.find(l => l.productId === ligneReception.productId);
    
    if (!transfertLigne) {
      errors.push({
        type: StockValidationErrorType.MISSING_PRODUCT,
        message: 'Produit non trouvé dans le transfert original',
        field: 'productId',
        lineIndex: index
      });
      return;
    }

    // Validate received quantity
    if (ligneReception.quantiteRecue < 0) {
      errors.push({
        type: StockValidationErrorType.NEGATIVE_QUANTITY,
        message: 'La quantité reçue ne peut pas être négative',
        field: 'quantiteRecue',
        lineIndex: index
      });
    }

    // Warning if received quantity is significantly different from sent quantity
    const variance = Math.abs(ligneReception.quantiteRecue - transfertLigne.quantiteEnvoyee);
    const variancePercentage = transfertLigne.quantiteEnvoyee > 0 
      ? (variance / transfertLigne.quantiteEnvoyee) * 100 
      : 0;

    if (variancePercentage > 10) { // More than 10% variance
      warnings.push({
        type: StockValidationErrorType.CALCULATION_ERROR,
        message: `Écart important détecté: ${variance.toFixed(2)} unités (${variancePercentage.toFixed(1)}%)`,
        field: 'quantiteRecue',
        lineIndex: index,
        details: {
          sent: transfertLigne.quantiteEnvoyee,
          received: ligneReception.quantiteRecue,
          variance,
          variancePercentage
        }
      });
    }
  });

  // Check that all transfer lines have reception data
  transfert.lignes.forEach((ligne, index) => {
    const receptionLigne = lignesReception.find(r => r.productId === ligne.productId);
    if (!receptionLigne) {
      errors.push({
        type: StockValidationErrorType.MISSING_PRODUCT,
        message: 'Quantité reçue manquante pour ce produit',
        field: 'quantiteRecue',
        lineIndex: index,
        details: { productId: ligne.productId }
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ============================================================================
// ADVANCED BUSINESS VALIDATIONS AND RISK ASSESSMENT
// ============================================================================

/**
 * Advanced validation result with risk assessment
 */
export interface AdvancedValidationResult extends ValidationResult {
  riskLevel: RiskLevel;
  riskFactors: string[];
  recommendations: string[];
  requiresApproval: boolean;
}

/**
 * Operation context for advanced validation
 */
export interface OperationContext {
  userId: string;
  userRole: 'director' | 'manager';
  storeId: string;
  timestamp: Date;
  recentOperations: Array<{
    type: string;
    timestamp: Date;
    value: number;
    quantity: number;
  }>;
  historicalData?: {
    averageCost: number;
    averageQuantity: number;
    operationFrequency: number;
  };
}

/**
 * Validate operation against business rules with risk assessment
 */
export function validateOperationWithRiskAssessment(
  operation: any,
  context: OperationContext,
  rules: BusinessRulesConfig = DEFAULT_BUSINESS_RULES
): AdvancedValidationResult {
  const baseValidation = validateBasicOperation(operation);
  const errors = [...baseValidation.errors];
  const warnings = [...baseValidation.warnings];
  const riskFactors: string[] = [];
  const recommendations: string[] = [];
  let riskLevel = RiskLevel.LOW;
  let requiresApproval = false;

  // Check quantity thresholds
  const quantityRisk = assessQuantityRisk(operation, rules, context);
  if (quantityRisk.level !== RiskLevel.LOW) {
    riskFactors.push(...quantityRisk.factors);
    recommendations.push(...quantityRisk.recommendations);
    riskLevel = Math.max(riskLevel as any, quantityRisk.level as any) as RiskLevel;
  }

  // Check value thresholds
  const valueRisk = assessValueRisk(operation, rules, context);
  if (valueRisk.level !== RiskLevel.LOW) {
    riskFactors.push(...valueRisk.factors);
    recommendations.push(...valueRisk.recommendations);
    riskLevel = Math.max(riskLevel as any, valueRisk.level as any) as RiskLevel;
  }

  // Check operation frequency
  const frequencyRisk = assessFrequencyRisk(context, rules);
  if (frequencyRisk.level !== RiskLevel.LOW) {
    riskFactors.push(...frequencyRisk.factors);
    recommendations.push(...frequencyRisk.recommendations);
    riskLevel = Math.max(riskLevel as any, frequencyRisk.level as any) as RiskLevel;
  }

  // Check timing (business hours)
  const timingRisk = assessTimingRisk(context.timestamp, rules);
  if (timingRisk.level !== RiskLevel.LOW) {
    riskFactors.push(...timingRisk.factors);
    recommendations.push(...timingRisk.recommendations);
    riskLevel = Math.max(riskLevel as any, timingRisk.level as any) as RiskLevel;
  }

  // Check cost variance for arrivals
  if (operation.type === 'arrivage' && context.historicalData) {
    const costVarianceRisk = assessCostVarianceRisk(operation, context.historicalData, rules);
    if (costVarianceRisk.level !== RiskLevel.LOW) {
      riskFactors.push(...costVarianceRisk.factors);
      recommendations.push(...costVarianceRisk.recommendations);
      riskLevel = Math.max(riskLevel as any, costVarianceRisk.level as any) as RiskLevel;
    }
  }

  // Determine if approval is required
  requiresApproval = riskLevel === RiskLevel.HIGH || riskLevel === RiskLevel.CRITICAL ||
    (context.userRole === 'manager' && riskLevel === RiskLevel.MEDIUM);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    riskLevel,
    riskFactors,
    recommendations,
    requiresApproval
  };
}

/**
 * Basic operation validation (placeholder - implement based on operation type)
 */
function validateBasicOperation(operation: any): ValidationResult {
  // This would call the appropriate validation function based on operation type
  return { isValid: true, errors: [], warnings: [] };
}

/**
 * Assess quantity-related risks
 */
function assessQuantityRisk(
  operation: any, 
  rules: BusinessRulesConfig, 
  context: OperationContext
): { level: RiskLevel; factors: string[]; recommendations: string[] } {
  const factors: string[] = [];
  const recommendations: string[] = [];
  let level = RiskLevel.LOW;

  const totalQuantity = operation.lignes?.reduce((sum: number, ligne: any) => sum + ligne.quantiteRecue || ligne.quantiteEnvoyee || 0, 0) || operation.quantite || 0;

  if (totalQuantity > rules.maxQuantityPerOperation) {
    level = RiskLevel.HIGH;
    factors.push(`Quantité exceptionnellement élevée: ${totalQuantity} unités`);
    recommendations.push('Vérifier la justification de cette quantité importante');
    recommendations.push('Considérer diviser l\'opération en plusieurs lots');
  } else if (totalQuantity > rules.maxQuantityPerOperation * 0.7) {
    level = RiskLevel.MEDIUM;
    factors.push(`Quantité élevée: ${totalQuantity} unités`);
    recommendations.push('Double vérification recommandée');
  }

  // Check against historical averages
  if (context.historicalData && totalQuantity > context.historicalData.averageQuantity * 3) {
    level = Math.max(level as any, RiskLevel.MEDIUM as any) as RiskLevel;
    factors.push('Quantité 3x supérieure à la moyenne historique');
    recommendations.push('Analyser les raisons de cette variation');
  }

  return { level, factors, recommendations };
}

/**
 * Assess value-related risks
 */
function assessValueRisk(
  operation: any, 
  rules: BusinessRulesConfig, 
  context: OperationContext
): { level: RiskLevel; factors: string[]; recommendations: string[] } {
  const factors: string[] = [];
  const recommendations: string[] = [];
  let level = RiskLevel.LOW;

  const totalValue = operation.totalValue || 
    operation.lignes?.reduce((sum: number, ligne: any) => sum + (ligne.sousTotal || ligne.quantiteEnvoyee * (ligne.coutUnitaire || 0)), 0) || 0;

  if (totalValue > rules.maxValuePerOperation) {
    level = RiskLevel.CRITICAL;
    factors.push(`Valeur critique: ${totalValue.toLocaleString()} CFA`);
    recommendations.push('Approbation directeur obligatoire');
    recommendations.push('Documentation détaillée requise');
  } else if (totalValue > rules.maxValuePerOperation * 0.5) {
    level = RiskLevel.HIGH;
    factors.push(`Valeur élevée: ${totalValue.toLocaleString()} CFA`);
    recommendations.push('Validation supplémentaire recommandée');
  }

  return { level, factors, recommendations };
}

/**
 * Assess operation frequency risks
 */
function assessFrequencyRisk(
  context: OperationContext, 
  rules: BusinessRulesConfig
): { level: RiskLevel; factors: string[]; recommendations: string[] } {
  const factors: string[] = [];
  const recommendations: string[] = [];
  let level = RiskLevel.LOW;

  const now = context.timestamp;
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  const recentOperationsCount = context.recentOperations.filter(
    op => op.timestamp >= oneHourAgo
  ).length;

  if (recentOperationsCount > rules.maxOperationsPerHour) {
    level = RiskLevel.HIGH;
    factors.push(`Fréquence élevée: ${recentOperationsCount} opérations dans la dernière heure`);
    recommendations.push('Vérifier la nécessité de toutes ces opérations');
    recommendations.push('Considérer regrouper les opérations similaires');
  }

  // Check for rapid succession (operations within minimum time)
  const lastOperation = context.recentOperations
    .filter(op => op.timestamp < now)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

  if (lastOperation) {
    const timeDiff = (now.getTime() - lastOperation.timestamp.getTime()) / (1000 * 60); // minutes
    if (timeDiff < rules.minTimeBetweenOperations) {
      level = Math.max(level as any, RiskLevel.MEDIUM as any) as RiskLevel;
      factors.push(`Opération en succession rapide: ${timeDiff.toFixed(1)} minutes depuis la dernière`);
      recommendations.push('Vérifier que cette opération n\'est pas un doublon');
    }
  }

  return { level, factors, recommendations };
}

/**
 * Assess timing-related risks (business hours)
 */
function assessTimingRisk(
  timestamp: Date, 
  rules: BusinessRulesConfig
): { level: RiskLevel; factors: string[]; recommendations: string[] } {
  const factors: string[] = [];
  const recommendations: string[] = [];
  let level = RiskLevel.LOW;

  const hour = timestamp.getHours();
  const isWeekend = timestamp.getDay() === 0 || timestamp.getDay() === 6;

  if (hour < rules.businessHours.start || hour > rules.businessHours.end) {
    level = RiskLevel.MEDIUM;
    factors.push(`Opération en dehors des heures d'ouverture: ${hour}h`);
    recommendations.push('Justifier la nécessité de cette opération hors horaires');
  }

  if (isWeekend) {
    level = Math.max(level as any, RiskLevel.MEDIUM as any) as RiskLevel;
    factors.push('Opération effectuée le weekend');
    recommendations.push('Documenter la raison de cette opération weekend');
  }

  return { level, factors, recommendations };
}

/**
 * Assess cost variance risks for arrivals
 */
function assessCostVarianceRisk(
  operation: any, 
  historicalData: { averageCost: number }, 
  rules: BusinessRulesConfig
): { level: RiskLevel; factors: string[]; recommendations: string[] } {
  const factors: string[] = [];
  const recommendations: string[] = [];
  let level = RiskLevel.LOW;

  if (!operation.lignes || !historicalData.averageCost) {
    return { level, factors, recommendations };
  }

  operation.lignes.forEach((ligne: any, index: number) => {
    if (ligne.coutUnitaire && historicalData.averageCost > 0) {
      const variance = Math.abs(ligne.coutUnitaire - historicalData.averageCost) / historicalData.averageCost * 100;
      
      if (variance > rules.maxCostVariancePercentage) {
        level = Math.max(level as any, RiskLevel.HIGH as any) as RiskLevel;
        factors.push(`Variance de coût importante ligne ${index + 1}: ${variance.toFixed(1)}%`);
        recommendations.push(`Vérifier le coût unitaire de ${ligne.product?.name || 'ce produit'}`);
      } else if (variance > rules.maxCostVariancePercentage * 0.6) {
        level = Math.max(level as any, RiskLevel.MEDIUM as any) as RiskLevel;
        factors.push(`Variance de coût notable ligne ${index + 1}: ${variance.toFixed(1)}%`);
        recommendations.push('Double vérification du coût recommandée');
      }
    }
  });

  return { level, factors, recommendations };
}

// ============================================================================
// INVENTORY CONSISTENCY AND RECONCILIATION
// ============================================================================

/**
 * Inventory inconsistency detection
 */
export interface InventoryInconsistency {
  productId: string;
  storeId: string;
  theoreticalStock: number;
  physicalStock: number;
  variance: number;
  variancePercentage: number;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  possibleCauses: string[];
  recommendedActions: string[];
}

/**
 * Reconciliation action
 */
export interface ReconciliationAction {
  type: 'adjustment' | 'investigation' | 'recount' | 'audit';
  productId: string;
  storeId: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedDuration: number; // minutes
  requiredRole: 'manager' | 'director';
}

/**
 * Detect inventory inconsistencies
 */
export function detectInventoryInconsistencies(
  stockLevels: StockLevel[],
  physicalCounts: Array<{ productId: string; storeId: string; physicalQuantity: number }>,
  rules: BusinessRulesConfig = DEFAULT_BUSINESS_RULES
): InventoryInconsistency[] {
  const inconsistencies: InventoryInconsistency[] = [];

  physicalCounts.forEach(count => {
    const stockLevel = stockLevels.find(sl => 
      sl.productId === count.productId && sl.storeId === count.storeId
    );

    if (!stockLevel) {
      inconsistencies.push({
        productId: count.productId,
        storeId: count.storeId,
        theoreticalStock: 0,
        physicalStock: count.physicalQuantity,
        variance: count.physicalQuantity,
        variancePercentage: 100,
        severity: 'major',
        possibleCauses: ['Produit non référencé dans le système', 'Erreur de saisie'],
        recommendedActions: ['Vérifier l\'existence du produit', 'Contrôler la saisie']
      });
      return;
    }

    const variance = count.physicalQuantity - stockLevel.quantity;
    const variancePercentage = stockLevel.quantity > 0 
      ? Math.abs(variance) / stockLevel.quantity * 100 
      : (count.physicalQuantity > 0 ? 100 : 0);

    if (Math.abs(variancePercentage) > rules.inventoryTolerancePercentage) {
      const severity = getSeverityLevel(variancePercentage);
      const possibleCauses = getPossibleCauses(variance, variancePercentage);
      const recommendedActions = getRecommendedActions(variance, severity);

      inconsistencies.push({
        productId: count.productId,
        storeId: count.storeId,
        theoreticalStock: stockLevel.quantity,
        physicalStock: count.physicalQuantity,
        variance,
        variancePercentage,
        severity,
        possibleCauses,
        recommendedActions
      });
    }
  });

  return inconsistencies;
}

/**
 * Get severity level based on variance percentage
 */
function getSeverityLevel(variancePercentage: number): 'minor' | 'moderate' | 'major' | 'critical' {
  if (variancePercentage > 50) return 'critical';
  if (variancePercentage > 25) return 'major';
  if (variancePercentage > 10) return 'moderate';
  return 'minor';
}

/**
 * Get possible causes for inventory variance
 */
function getPossibleCauses(variance: number, variancePercentage: number): string[] {
  const causes: string[] = [];

  if (variance > 0) {
    // More physical than theoretical
    causes.push('Réception non enregistrée');
    causes.push('Retour client non comptabilisé');
    causes.push('Erreur de saisie des sorties');
    if (variancePercentage > 25) {
      causes.push('Transfert entrant non enregistré');
    }
  } else {
    // Less physical than theoretical
    causes.push('Vente non enregistrée');
    causes.push('Perte non déclarée');
    causes.push('Vol ou démarque inconnue');
    causes.push('Erreur de comptage');
    if (variancePercentage > 25) {
      causes.push('Transfert sortant non enregistré');
    }
  }

  if (variancePercentage > 50) {
    causes.push('Erreur système majeure');
    causes.push('Problème de synchronisation des données');
  }

  return causes;
}

/**
 * Get recommended actions based on variance and severity
 */
function getRecommendedActions(variance: number, severity: 'minor' | 'moderate' | 'major' | 'critical'): string[] {
  const actions: string[] = [];

  switch (severity) {
    case 'critical':
      actions.push('Arrêt immédiat des opérations sur ce produit');
      actions.push('Audit complet des mouvements');
      actions.push('Recomptage par une équipe indépendante');
      actions.push('Investigation approfondie');
      break;
    case 'major':
      actions.push('Recomptage immédiat');
      actions.push('Vérification des derniers mouvements');
      actions.push('Contrôle des documents de transfert');
      break;
    case 'moderate':
      actions.push('Recomptage de vérification');
      actions.push('Contrôle des saisies récentes');
      break;
    case 'minor':
      actions.push('Ajustement de stock');
      actions.push('Note dans le journal des écarts');
      break;
  }

  if (variance < 0) {
    actions.push('Rechercher les pertes non déclarées');
    actions.push('Vérifier les ventes non enregistrées');
  } else {
    actions.push('Rechercher les réceptions non enregistrées');
    actions.push('Vérifier les retours clients');
  }

  return actions;
}

/**
 * Generate automatic reconciliation actions
 */
export function generateReconciliationActions(
  inconsistencies: InventoryInconsistency[]
): ReconciliationAction[] {
  const actions: ReconciliationAction[] = [];

  inconsistencies.forEach(inconsistency => {
    const baseAction: Omit<ReconciliationAction, 'type' | 'description' | 'priority' | 'estimatedDuration' | 'requiredRole'> = {
      productId: inconsistency.productId,
      storeId: inconsistency.storeId
    };

    switch (inconsistency.severity) {
      case 'critical':
        actions.push({
          ...baseAction,
          type: 'audit',
          description: `Audit complet requis - Écart critique de ${inconsistency.variancePercentage.toFixed(1)}%`,
          priority: 'urgent',
          estimatedDuration: 120,
          requiredRole: 'director'
        });
        break;

      case 'major':
        actions.push({
          ...baseAction,
          type: 'investigation',
          description: `Investigation requise - Écart majeur de ${inconsistency.variance} unités`,
          priority: 'high',
          estimatedDuration: 60,
          requiredRole: 'director'
        });
        actions.push({
          ...baseAction,
          type: 'recount',
          description: 'Recomptage de vérification',
          priority: 'high',
          estimatedDuration: 30,
          requiredRole: 'manager'
        });
        break;

      case 'moderate':
        actions.push({
          ...baseAction,
          type: 'recount',
          description: `Recomptage recommandé - Écart de ${inconsistency.variancePercentage.toFixed(1)}%`,
          priority: 'medium',
          estimatedDuration: 20,
          requiredRole: 'manager'
        });
        break;

      case 'minor':
        actions.push({
          ...baseAction,
          type: 'adjustment',
          description: `Ajustement automatique - Écart mineur de ${inconsistency.variance} unités`,
          priority: 'low',
          estimatedDuration: 5,
          requiredRole: 'manager'
        });
        break;
    }
  });

  return actions;
}

/**
 * Validate stock consistency across all operations
 */
export function validateStockConsistency(
  stockLevels: StockLevel[],
  recentMovements: MouvementStock[],
  rules: BusinessRulesConfig = DEFAULT_BUSINESS_RULES
): ValidationResult {
  const errors: StockValidationError[] = [];
  const warnings: StockValidationError[] = [];

  // Group movements by product and store
  const movementsByProduct = recentMovements.reduce((acc, movement) => {
    const key = `${movement.productId}-${movement.storeId}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(movement);
    return acc;
  }, {} as Record<string, MouvementStock[]>);

  // Check each stock level against recent movements
  stockLevels.forEach(stockLevel => {
    const key = `${stockLevel.productId}-${stockLevel.storeId}`;
    const movements = movementsByProduct[key] || [];

    // Calculate expected stock based on movements
    const totalMovements = movements.reduce((sum, movement) => sum + movement.quantite, 0);
    
    // Check for negative stock
    if (stockLevel.quantity < 0) {
      errors.push({
        type: StockValidationErrorType.NEGATIVE_QUANTITY,
        message: `Stock négatif détecté: ${stockLevel.quantity}`,
        field: 'quantity',
        details: {
          productId: stockLevel.productId,
          storeId: stockLevel.storeId,
          quantity: stockLevel.quantity
        }
      });
    }

    // Check for critical stock levels
    if (stockLevel.quantity <= rules.criticalStockThreshold && stockLevel.quantity > 0) {
      warnings.push({
        type: StockValidationErrorType.INVALID_QUANTITY,
        message: `Stock critique: ${stockLevel.quantity} unités`,
        field: 'quantity',
        details: {
          productId: stockLevel.productId,
          storeId: stockLevel.storeId,
          quantity: stockLevel.quantity,
          threshold: rules.criticalStockThreshold
        }
      });
    }

    // Check for overstock
    if (stockLevel.quantity > rules.overstockThreshold) {
      warnings.push({
        type: StockValidationErrorType.INVALID_QUANTITY,
        message: `Surstock détecté: ${stockLevel.quantity} unités`,
        field: 'quantity',
        details: {
          productId: stockLevel.productId,
          storeId: stockLevel.storeId,
          quantity: stockLevel.quantity,
          threshold: rules.overstockThreshold
        }
      });
    }

    // Check reserved vs available quantity consistency
    if (stockLevel.availableQuantity !== stockLevel.quantity - stockLevel.reservedQuantity) {
      errors.push({
        type: StockValidationErrorType.CALCULATION_ERROR,
        message: 'Incohérence dans le calcul des quantités disponibles',
        field: 'availableQuantity',
        details: {
          productId: stockLevel.productId,
          storeId: stockLevel.storeId,
          quantity: stockLevel.quantity,
          reserved: stockLevel.reservedQuantity,
          available: stockLevel.availableQuantity,
          expected: stockLevel.quantity - stockLevel.reservedQuantity
        }
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Comprehensive validation with all business rules
 */
export function validateComprehensive(
  operation: any,
  context: OperationContext,
  stockLevels: StockLevel[],
  rules: BusinessRulesConfig = DEFAULT_BUSINESS_RULES
): AdvancedValidationResult {
  // Start with risk assessment
  const riskValidation = validateOperationWithRiskAssessment(operation, context, rules);
  
  // Add stock consistency checks
  const consistencyValidation = validateStockConsistency(stockLevels, context.recentOperations as any, rules);
  
  // Combine results
  const allErrors = [...riskValidation.errors, ...consistencyValidation.errors];
  const allWarnings = [...riskValidation.warnings, ...consistencyValidation.warnings];
  
  // Escalate risk level if consistency errors found
  let finalRiskLevel = riskValidation.riskLevel;
  if (consistencyValidation.errors.length > 0) {
    finalRiskLevel = RiskLevel.HIGH;
    riskValidation.riskFactors.push('Incohérences de stock détectées');
    riskValidation.recommendations.push('Résoudre les incohérences avant de continuer');
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    riskLevel: finalRiskLevel,
    riskFactors: riskValidation.riskFactors,
    recommendations: riskValidation.recommendations,
    requiresApproval: riskValidation.requiresApproval || consistencyValidation.errors.length > 0
  };
}