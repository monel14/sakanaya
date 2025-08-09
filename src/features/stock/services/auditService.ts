import { MouvementStock, BonReception, TransfertStock, Inventaire, Perte } from '../types';

// ============================================================================
// AUDIT TRAIL AND LOGGING SYSTEM
// ============================================================================

/**
 * Audit event types
 */
export enum AuditEventType {
  // Stock Operations
  STOCK_ARRIVAL = 'STOCK_ARRIVAL',
  STOCK_TRANSFER_CREATE = 'STOCK_TRANSFER_CREATE',
  STOCK_TRANSFER_RECEIVE = 'STOCK_TRANSFER_RECEIVE',
  STOCK_LOSS = 'STOCK_LOSS',
  STOCK_ADJUSTMENT = 'STOCK_ADJUSTMENT',
  INVENTORY_CREATE = 'INVENTORY_CREATE',
  INVENTORY_VALIDATE = 'INVENTORY_VALIDATE',
  
  // Data Modifications
  DATA_CREATE = 'DATA_CREATE',
  DATA_UPDATE = 'DATA_UPDATE',
  DATA_DELETE = 'DATA_DELETE',
  
  // Security Events
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  PERMISSION_VIOLATION = 'PERMISSION_VIOLATION',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  
  // System Events
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  VALIDATION_FAILURE = 'VALIDATION_FAILURE',
  RECONCILIATION_REQUIRED = 'RECONCILIATION_REQUIRED',
  
  // Business Rule Violations
  THRESHOLD_EXCEEDED = 'THRESHOLD_EXCEEDED',
  ANOMALY_DETECTED = 'ANOMALY_DETECTED',
  RISK_ALERT = 'RISK_ALERT'
}

/**
 * Audit severity levels
 */
export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  eventType: AuditEventType;
  severity: AuditSeverity;
  userId: string;
  userRole: string;
  storeId?: string;
  entityType: string; // 'bon_reception', 'transfert', 'inventaire', etc.
  entityId: string;
  action: string;
  description: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

/**
 * Security alert
 */
export interface SecurityAlert {
  id: string;
  timestamp: Date;
  type: 'UNAUTHORIZED_ACCESS' | 'SUSPICIOUS_PATTERN' | 'ANOMALY' | 'THRESHOLD_BREACH';
  severity: AuditSeverity;
  userId: string;
  description: string;
  details: Record<string, any>;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  actions: string[];
}

/**
 * Audit report filters
 */
export interface AuditReportFilters {
  startDate?: Date;
  endDate?: Date;
  eventTypes?: AuditEventType[];
  severities?: AuditSeverity[];
  userIds?: string[];
  storeIds?: string[];
  entityTypes?: string[];
  entityIds?: string[];
}

/**
 * Audit statistics
 */
export interface AuditStatistics {
  totalEvents: number;
  eventsByType: Record<AuditEventType, number>;
  eventsBySeverity: Record<AuditSeverity, number>;
  eventsByUser: Record<string, number>;
  eventsByStore: Record<string, number>;
  securityAlerts: number;
  unresolvedAlerts: number;
  period: { start: Date; end: Date };
}

/**
 * Audit service class
 */
export class AuditService {
  private static instance: AuditService;
  private auditLogs: AuditLogEntry[] = [];
  private securityAlerts: SecurityAlert[] = [];

  private constructor() {}

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  /**
   * Log an audit event
   */
  public async logEvent(
    eventType: AuditEventType,
    severity: AuditSeverity,
    userId: string,
    userRole: string,
    entityType: string,
    entityId: string,
    action: string,
    description: string,
    options: {
      storeId?: string;
      oldValues?: Record<string, any>;
      newValues?: Record<string, any>;
      metadata?: Record<string, any>;
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
    } = {}
  ): Promise<void> {
    const auditEntry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      eventType,
      severity,
      userId,
      userRole,
      storeId: options.storeId,
      entityType,
      entityId,
      action,
      description,
      oldValues: options.oldValues,
      newValues: options.newValues,
      metadata: options.metadata,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      sessionId: options.sessionId
    };

    this.auditLogs.push(auditEntry);

    // Check for security alerts
    await this.checkForSecurityAlerts(auditEntry);

    // In a real implementation, this would save to database
    console.log('Audit Event Logged:', auditEntry);
  }

  /**
   * Log stock movement
   */
  public async logStockMovement(
    movement: MouvementStock,
    userId: string,
    userRole: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const eventType = this.getStockMovementEventType(movement.type);
    const description = this.getStockMovementDescription(movement);

    await this.logEvent(
      eventType,
      AuditSeverity.INFO,
      userId,
      userRole,
      'mouvement_stock',
      movement.id,
      'CREATE',
      description,
      {
        storeId: movement.storeId,
        metadata: {
          ...metadata,
          productId: movement.productId,
          quantity: movement.quantite,
          value: movement.valeur,
          referenceType: movement.referenceType,
          referenceId: movement.referenceId
        }
      }
    );
  }

  /**
   * Log bon de réception events
   */
  public async logBonReceptionEvent(
    bon: BonReception,
    action: 'CREATE' | 'UPDATE' | 'VALIDATE' | 'DELETE',
    userId: string,
    userRole: string,
    oldValues?: Partial<BonReception>
  ): Promise<void> {
    const eventType = action === 'VALIDATE' ? AuditEventType.STOCK_ARRIVAL : AuditEventType.DATA_UPDATE;
    const severity = action === 'VALIDATE' ? AuditSeverity.INFO : AuditSeverity.INFO;
    
    let description = '';
    switch (action) {
      case 'CREATE':
        description = `Création du bon de réception ${bon.numero} pour ${bon.supplier.name}`;
        break;
      case 'UPDATE':
        description = `Modification du bon de réception ${bon.numero}`;
        break;
      case 'VALIDATE':
        description = `Validation du bon de réception ${bon.numero} - Valeur: ${bon.totalValue.toLocaleString()} CFA`;
        break;
      case 'DELETE':
        description = `Suppression du bon de réception ${bon.numero}`;
        break;
    }

    await this.logEvent(
      eventType,
      severity,
      userId,
      userRole,
      'bon_reception',
      bon.id,
      action,
      description,
      {
        storeId: bon.storeId,
        oldValues: oldValues ? this.sanitizeValues(oldValues) : undefined,
        newValues: this.sanitizeValues(bon),
        metadata: {
          supplierId: bon.supplierId,
          totalValue: bon.totalValue,
          lignesCount: bon.lignes.length,
          status: bon.status
        }
      }
    );

    // Log high-value operations
    if (bon.totalValue > 1000000) { // 1M CFA
      await this.createSecurityAlert(
        'THRESHOLD_BREACH',
        AuditSeverity.WARNING,
        userId,
        `Opération de grande valeur: ${bon.totalValue.toLocaleString()} CFA`,
        {
          bonReceptionId: bon.id,
          value: bon.totalValue,
          threshold: 1000000
        }
      );
    }
  }

  /**
   * Log transfer events
   */
  public async logTransfertEvent(
    transfert: TransfertStock,
    action: 'CREATE' | 'UPDATE' | 'RECEIVE' | 'CANCEL',
    userId: string,
    userRole: string,
    oldValues?: Partial<TransfertStock>
  ): Promise<void> {
    const eventType = action === 'CREATE' ? AuditEventType.STOCK_TRANSFER_CREATE : 
                     action === 'RECEIVE' ? AuditEventType.STOCK_TRANSFER_RECEIVE : 
                     AuditEventType.DATA_UPDATE;
    
    let description = '';
    switch (action) {
      case 'CREATE':
        description = `Création du transfert ${transfert.numero} de ${transfert.storeSource.name} vers ${transfert.storeDestination.name}`;
        break;
      case 'UPDATE':
        description = `Modification du transfert ${transfert.numero}`;
        break;
      case 'RECEIVE':
        description = `Réception du transfert ${transfert.numero} par ${transfert.storeDestination.name}`;
        break;
      case 'CANCEL':
        description = `Annulation du transfert ${transfert.numero}`;
        break;
    }

    await this.logEvent(
      eventType,
      AuditSeverity.INFO,
      userId,
      userRole,
      'transfert_stock',
      transfert.id,
      action,
      description,
      {
        storeId: action === 'RECEIVE' ? transfert.storeDestinationId : transfert.storeSourceId,
        oldValues: oldValues ? this.sanitizeValues(oldValues) : undefined,
        newValues: this.sanitizeValues(transfert),
        metadata: {
          storeSourceId: transfert.storeSourceId,
          storeDestinationId: transfert.storeDestinationId,
          lignesCount: transfert.lignes.length,
          status: transfert.status
        }
      }
    );
  }

  /**
   * Log inventory events
   */
  public async logInventaireEvent(
    inventaire: Inventaire,
    action: 'CREATE' | 'UPDATE' | 'VALIDATE' | 'DELETE',
    userId: string,
    userRole: string,
    oldValues?: Partial<Inventaire>
  ): Promise<void> {
    const eventType = action === 'VALIDATE' ? AuditEventType.INVENTORY_VALIDATE : 
                     action === 'CREATE' ? AuditEventType.INVENTORY_CREATE : 
                     AuditEventType.DATA_UPDATE;
    
    let description = '';
    switch (action) {
      case 'CREATE':
        description = `Création de l'inventaire ${inventaire.numero} pour ${inventaire.store.name}`;
        break;
      case 'UPDATE':
        description = `Modification de l'inventaire ${inventaire.numero}`;
        break;
      case 'VALIDATE':
        description = `Validation de l'inventaire ${inventaire.numero} - Écarts: ${inventaire.valeurEcarts.toLocaleString()} CFA`;
        break;
      case 'DELETE':
        description = `Suppression de l'inventaire ${inventaire.numero}`;
        break;
    }

    const severity = action === 'VALIDATE' && Math.abs(inventaire.valeurEcarts) > 100000 ? 
                    AuditSeverity.WARNING : AuditSeverity.INFO;

    await this.logEvent(
      eventType,
      severity,
      userId,
      userRole,
      'inventaire',
      inventaire.id,
      action,
      description,
      {
        storeId: inventaire.storeId,
        oldValues: oldValues ? this.sanitizeValues(oldValues) : undefined,
        newValues: this.sanitizeValues(inventaire),
        metadata: {
          totalEcarts: inventaire.totalEcarts,
          valeurEcarts: inventaire.valeurEcarts,
          lignesCount: inventaire.lignes.length,
          status: inventaire.status
        }
      }
    );

    // Alert for significant inventory discrepancies
    if (action === 'VALIDATE' && Math.abs(inventaire.valeurEcarts) > 500000) { // 500K CFA
      await this.createSecurityAlert(
        'ANOMALY',
        AuditSeverity.ERROR,
        userId,
        `Écarts d'inventaire importants: ${inventaire.valeurEcarts.toLocaleString()} CFA`,
        {
          inventaireId: inventaire.id,
          storeId: inventaire.storeId,
          valeurEcarts: inventaire.valeurEcarts,
          threshold: 500000
        }
      );
    }
  }

  /**
   * Log loss events
   */
  public async logPerteEvent(
    perte: Perte,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    userId: string,
    userRole: string,
    oldValues?: Partial<Perte>
  ): Promise<void> {
    await this.logEvent(
      AuditEventType.STOCK_LOSS,
      AuditSeverity.INFO,
      userId,
      userRole,
      'perte',
      perte.id,
      action,
      `${action === 'CREATE' ? 'Déclaration' : action === 'UPDATE' ? 'Modification' : 'Suppression'} de perte: ${perte.quantite} unités - ${perte.valeurPerte.toLocaleString()} CFA`,
      {
        storeId: perte.storeId,
        oldValues: oldValues ? this.sanitizeValues(oldValues) : undefined,
        newValues: this.sanitizeValues(perte),
        metadata: {
          productId: perte.productId,
          quantite: perte.quantite,
          valeurPerte: perte.valeurPerte,
          categorieId: perte.categorieId
        }
      }
    );
  }

  /**
   * Log security events
   */
  public async logSecurityEvent(
    eventType: AuditEventType,
    severity: AuditSeverity,
    userId: string,
    description: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    await this.logEvent(
      eventType,
      severity,
      userId,
      'unknown',
      'security',
      this.generateId(),
      'SECURITY_EVENT',
      description,
      {
        metadata: details
      }
    );

    // Create security alert for critical events
    if (severity === AuditSeverity.CRITICAL || severity === AuditSeverity.ERROR) {
      await this.createSecurityAlert(
        'SUSPICIOUS_PATTERN',
        severity,
        userId,
        description,
        details
      );
    }
  }

  /**
   * Create security alert
   */
  private async createSecurityAlert(
    type: SecurityAlert['type'],
    severity: AuditSeverity,
    userId: string,
    description: string,
    details: Record<string, any>
  ): Promise<void> {
    const alert: SecurityAlert = {
      id: this.generateId(),
      timestamp: new Date(),
      type,
      severity,
      userId,
      description,
      details,
      resolved: false,
      actions: this.getRecommendedActions(type, severity)
    };

    this.securityAlerts.push(alert);

    // In a real implementation, this would trigger notifications
    console.log('Security Alert Created:', alert);
  }

  /**
   * Get audit logs with filters
   */
  public async getAuditLogs(
    filters: AuditReportFilters = {},
    limit: number = 100,
    offset: number = 0
  ): Promise<{ logs: AuditLogEntry[]; total: number }> {
    let filteredLogs = [...this.auditLogs];

    // Apply filters
    if (filters.startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!);
    }
    if (filters.endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!);
    }
    if (filters.eventTypes?.length) {
      filteredLogs = filteredLogs.filter(log => filters.eventTypes!.includes(log.eventType));
    }
    if (filters.severities?.length) {
      filteredLogs = filteredLogs.filter(log => filters.severities!.includes(log.severity));
    }
    if (filters.userIds?.length) {
      filteredLogs = filteredLogs.filter(log => filters.userIds!.includes(log.userId));
    }
    if (filters.storeIds?.length) {
      filteredLogs = filteredLogs.filter(log => log.storeId && filters.storeIds!.includes(log.storeId));
    }
    if (filters.entityTypes?.length) {
      filteredLogs = filteredLogs.filter(log => filters.entityTypes!.includes(log.entityType));
    }
    if (filters.entityIds?.length) {
      filteredLogs = filteredLogs.filter(log => filters.entityIds!.includes(log.entityId));
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const total = filteredLogs.length;
    const logs = filteredLogs.slice(offset, offset + limit);

    return { logs, total };
  }

  /**
   * Get security alerts
   */
  public async getSecurityAlerts(
    resolved?: boolean,
    severity?: AuditSeverity
  ): Promise<SecurityAlert[]> {
    let alerts = [...this.securityAlerts];

    if (resolved !== undefined) {
      alerts = alerts.filter(alert => alert.resolved === resolved);
    }
    if (severity) {
      alerts = alerts.filter(alert => alert.severity === severity);
    }

    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Resolve security alert
   */
  public async resolveSecurityAlert(
    alertId: string,
    resolvedBy: string,
    resolution: string
  ): Promise<void> {
    const alert = this.securityAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedBy = resolvedBy;
      alert.resolvedAt = new Date();
      alert.details.resolution = resolution;

      await this.logEvent(
        AuditEventType.DATA_UPDATE,
        AuditSeverity.INFO,
        resolvedBy,
        'unknown',
        'security_alert',
        alertId,
        'RESOLVE',
        `Résolution de l'alerte de sécurité: ${resolution}`,
        {
          metadata: { originalAlert: alert }
        }
      );
    }
  }

  /**
   * Get audit statistics
   */
  public async getAuditStatistics(
    startDate: Date,
    endDate: Date
  ): Promise<AuditStatistics> {
    const logs = this.auditLogs.filter(
      log => log.timestamp >= startDate && log.timestamp <= endDate
    );

    const eventsByType = logs.reduce((acc, log) => {
      acc[log.eventType] = (acc[log.eventType] || 0) + 1;
      return acc;
    }, {} as Record<AuditEventType, number>);

    const eventsBySeverity = logs.reduce((acc, log) => {
      acc[log.severity] = (acc[log.severity] || 0) + 1;
      return acc;
    }, {} as Record<AuditSeverity, number>);

    const eventsByUser = logs.reduce((acc, log) => {
      acc[log.userId] = (acc[log.userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const eventsByStore = logs.reduce((acc, log) => {
      if (log.storeId) {
        acc[log.storeId] = (acc[log.storeId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const alerts = this.securityAlerts.filter(
      alert => alert.timestamp >= startDate && alert.timestamp <= endDate
    );

    return {
      totalEvents: logs.length,
      eventsByType,
      eventsBySeverity,
      eventsByUser,
      eventsByStore,
      securityAlerts: alerts.length,
      unresolvedAlerts: alerts.filter(a => !a.resolved).length,
      period: { start: startDate, end: endDate }
    };
  }

  /**
   * Check for security alerts based on audit entry
   */
  private async checkForSecurityAlerts(entry: AuditLogEntry): Promise<void> {
    // Check for suspicious patterns
    const recentLogs = this.auditLogs.filter(
      log => log.userId === entry.userId && 
             log.timestamp >= new Date(entry.timestamp.getTime() - 60 * 60 * 1000) // Last hour
    );

    // Too many operations in short time
    if (recentLogs.length > 50) {
      await this.createSecurityAlert(
        'SUSPICIOUS_PATTERN',
        AuditSeverity.WARNING,
        entry.userId,
        `Activité suspecte: ${recentLogs.length} opérations dans la dernière heure`,
        {
          operationCount: recentLogs.length,
          timeWindow: '1 hour',
          operations: recentLogs.map(log => ({
            eventType: log.eventType,
            timestamp: log.timestamp
          }))
        }
      );
    }

    // Multiple failed validations
    const failedValidations = recentLogs.filter(
      log => log.eventType === AuditEventType.VALIDATION_FAILURE
    );
    if (failedValidations.length > 5) {
      await this.createSecurityAlert(
        'SUSPICIOUS_PATTERN',
        AuditSeverity.ERROR,
        entry.userId,
        `Multiples échecs de validation: ${failedValidations.length}`,
        {
          failureCount: failedValidations.length,
          failures: failedValidations
        }
      );
    }
  }

  /**
   * Get recommended actions for security alerts
   */
  private getRecommendedActions(type: SecurityAlert['type'], severity: AuditSeverity): string[] {
    const actions: string[] = [];

    switch (type) {
      case 'UNAUTHORIZED_ACCESS':
        actions.push('Vérifier les permissions utilisateur');
        actions.push('Changer le mot de passe si nécessaire');
        if (severity === AuditSeverity.CRITICAL) {
          actions.push('Suspendre le compte utilisateur');
        }
        break;
      case 'SUSPICIOUS_PATTERN':
        actions.push('Examiner l\'activité utilisateur');
        actions.push('Contacter l\'utilisateur pour vérification');
        actions.push('Surveiller les prochaines activités');
        break;
      case 'ANOMALY':
        actions.push('Vérifier les données concernées');
        actions.push('Effectuer un recomptage si nécessaire');
        actions.push('Investiguer les causes possibles');
        break;
      case 'THRESHOLD_BREACH':
        actions.push('Valider l\'opération avec un superviseur');
        actions.push('Documenter la justification');
        actions.push('Ajuster les seuils si nécessaire');
        break;
    }

    return actions;
  }

  /**
   * Helper methods
   */
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getStockMovementEventType(type: string): AuditEventType {
    switch (type) {
      case 'arrivage':
        return AuditEventType.STOCK_ARRIVAL;
      case 'transfert_sortie':
      case 'transfert_entree':
        return AuditEventType.STOCK_TRANSFER_CREATE;
      case 'perte':
        return AuditEventType.STOCK_LOSS;
      case 'ajustement':
        return AuditEventType.STOCK_ADJUSTMENT;
      default:
        return AuditEventType.DATA_UPDATE;
    }
  }

  private getStockMovementDescription(movement: MouvementStock): string {
    const action = movement.quantite > 0 ? 'Entrée' : 'Sortie';
    const quantity = Math.abs(movement.quantite);
    return `${action} de stock: ${quantity} unités (${movement.type})`;
  }

  private sanitizeValues(obj: any): Record<string, any> {
    // Remove sensitive information and circular references
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'password' || key === 'token' || key === 'secret') {
        continue; // Skip sensitive fields
      }
      
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        // For objects, only keep basic properties to avoid circular references
        sanitized[key] = { id: value.id, name: value.name };
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
}

// Export singleton instance
export const auditService = AuditService.getInstance();

// ============================================================================
// AUDIT REPORTING COMPONENTS
// ============================================================================

/**
 * Audit report generator
 */
export class AuditReportGenerator {
  private auditService: AuditService;

  constructor() {
    this.auditService = AuditService.getInstance();
  }

  /**
   * Generate comprehensive audit report
   */
  public async generateComprehensiveReport(
    startDate: Date,
    endDate: Date,
    filters: AuditReportFilters = {}
  ): Promise<{
    summary: AuditStatistics;
    criticalEvents: AuditLogEntry[];
    securityAlerts: SecurityAlert[];
    recommendations: string[];
  }> {
    const summary = await this.auditService.getAuditStatistics(startDate, endDate);
    
    const { logs } = await this.auditService.getAuditLogs({
      ...filters,
      startDate,
      endDate,
      severities: [AuditSeverity.ERROR, AuditSeverity.CRITICAL]
    });

    const securityAlerts = await this.auditService.getSecurityAlerts(false);
    
    const recommendations = this.generateRecommendations(summary, logs, securityAlerts);

    return {
      summary,
      criticalEvents: logs,
      securityAlerts,
      recommendations
    };
  }

  /**
   * Generate user activity report
   */
  public async generateUserActivityReport(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalActivities: number;
    activitiesByType: Record<AuditEventType, number>;
    riskEvents: AuditLogEntry[];
    timeline: Array<{ date: string; count: number }>;
  }> {
    const { logs } = await this.auditService.getAuditLogs({
      userIds: [userId],
      startDate,
      endDate
    });

    const activitiesByType = logs.reduce((acc, log) => {
      acc[log.eventType] = (acc[log.eventType] || 0) + 1;
      return acc;
    }, {} as Record<AuditEventType, number>);

    const riskEvents = logs.filter(
      log => log.severity === AuditSeverity.WARNING || 
             log.severity === AuditSeverity.ERROR ||
             log.severity === AuditSeverity.CRITICAL
    );

    // Generate timeline (daily activity)
    const timeline = this.generateTimeline(logs, startDate, endDate);

    return {
      totalActivities: logs.length,
      activitiesByType,
      riskEvents,
      timeline
    };
  }

  /**
   * Generate store activity report
   */
  public async generateStoreActivityReport(
    storeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalActivities: number;
    stockMovements: number;
    valueMovements: number;
    anomalies: AuditLogEntry[];
    topUsers: Array<{ userId: string; count: number }>;
  }> {
    const { logs } = await this.auditService.getAuditLogs({
      storeIds: [storeId],
      startDate,
      endDate
    });

    const stockMovements = logs.filter(log => 
      [AuditEventType.STOCK_ARRIVAL, AuditEventType.STOCK_TRANSFER_CREATE, 
       AuditEventType.STOCK_TRANSFER_RECEIVE, AuditEventType.STOCK_LOSS].includes(log.eventType)
    ).length;

    const valueMovements = logs.reduce((sum, log) => {
      const value = log.metadata?.totalValue || log.metadata?.valeurPerte || 0;
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);

    const anomalies = logs.filter(log => 
      log.eventType === AuditEventType.ANOMALY_DETECTED ||
      log.severity === AuditSeverity.ERROR ||
      log.severity === AuditSeverity.CRITICAL
    );

    const userCounts = logs.reduce((acc, log) => {
      acc[log.userId] = (acc[log.userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topUsers = Object.entries(userCounts)
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalActivities: logs.length,
      stockMovements,
      valueMovements,
      anomalies,
      topUsers
    };
  }

  /**
   * Generate recommendations based on audit data
   */
  private generateRecommendations(
    summary: AuditStatistics,
    criticalEvents: AuditLogEntry[],
    securityAlerts: SecurityAlert[]
  ): string[] {
    const recommendations: string[] = [];

    // Security recommendations
    if (securityAlerts.length > 0) {
      recommendations.push(`${securityAlerts.length} alertes de sécurité nécessitent une attention`);
      
      const unresolvedCritical = securityAlerts.filter(
        a => !a.resolved && a.severity === AuditSeverity.CRITICAL
      );
      if (unresolvedCritical.length > 0) {
        recommendations.push(`${unresolvedCritical.length} alertes critiques non résolues - Action immédiate requise`);
      }
    }

    // Activity pattern recommendations
    const errorCount = summary.eventsBySeverity[AuditSeverity.ERROR] || 0;
    if (errorCount > 10) {
      recommendations.push(`Nombre élevé d'erreurs (${errorCount}) - Réviser les processus`);
    }

    // User activity recommendations
    const userActivities = Object.entries(summary.eventsByUser);
    const highActivityUsers = userActivities.filter(([, count]) => count > 100);
    if (highActivityUsers.length > 0) {
      recommendations.push(`${highActivityUsers.length} utilisateurs avec activité très élevée - Vérifier les permissions`);
    }

    // Critical events recommendations
    if (criticalEvents.length > 0) {
      recommendations.push(`${criticalEvents.length} événements critiques détectés - Investigation requise`);
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('Activité normale - Continuer la surveillance');
    }

    return recommendations;
  }

  /**
   * Generate activity timeline
   */
  private generateTimeline(
    logs: AuditLogEntry[],
    startDate: Date,
    endDate: Date
  ): Array<{ date: string; count: number }> {
    const timeline: Array<{ date: string; count: number }> = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const dayLogs = logs.filter(log => 
        log.timestamp.toISOString().split('T')[0] === dateStr
      );
      
      timeline.push({
        date: dateStr,
        count: dayLogs.length
      });

      current.setDate(current.getDate() + 1);
    }

    return timeline;
  }
}

// Export report generator instance
export const auditReportGenerator = new AuditReportGenerator();