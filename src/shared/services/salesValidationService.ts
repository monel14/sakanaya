import { DailySales } from '../../features/sales/types';
import { NotificationService } from './notificationService';

interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  timestamp: Date;
  details: Record<string, any>;
}

interface ValidationRequest {
  id: string;
  saleId: string;
  requestedBy: string;
  requestedAt: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  processedBy?: string;
  processedAt?: Date;
  rejectionReason?: string;
}

/**
 * Service for managing sales validation workflow
 * Handles validation requests, approvals, rejections, and audit trails
 */
export class SalesValidationService {
  private static instance: SalesValidationService;
  private validationRequests: ValidationRequest[] = [];
  private auditLog: AuditLogEntry[] = [];
  private mockSales: DailySales[] = [];

  private constructor() {
    this.initializeMockData();
  }

  public static getInstance(): SalesValidationService {
    if (!SalesValidationService.instance) {
      SalesValidationService.instance = new SalesValidationService();
    }
    return SalesValidationService.instance;
  }

  /**
   * Initialize with mock data for development
   */
  private initializeMockData(): void {
    // Mock sales requiring validation
    this.mockSales = [
      {
        id: 'sale-1',
        date: new Date(),
        storeId: 'store-1',
        entries: [
          {
            id: 'entry-1',
            productId: '1',
            product: {
              id: '1',
              name: 'Thon Rouge',
              unit: 'kg',
              unitPrice: 6500,
              category: 'Poisson',
              priceType: 'variable',
              isActive: true,
              createdAt: new Date(),
              allowDecimals: true
            },
            quantity: 2.5,
            unitPrice: 6500,
            subtotal: 16250,
            date: new Date(),
            storeId: 'store-1'
          }
        ],
        total: 16250,
        status: 'closed',
        comments: 'Modification nécessaire pour corriger une erreur de saisie',
        isValidated: false,
        createdBy: 'manager-1',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        id: 'sale-2',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        storeId: 'store-2',
        entries: [
          {
            id: 'entry-2',
            productId: '2',
            product: {
              id: '2',
              name: 'Crevettes Roses',
              unit: 'kg',
              unitPrice: 8000,
              category: 'Crustacé',
              priceType: 'variable',
              isActive: true,
              createdAt: new Date(),
              allowDecimals: true
            },
            quantity: 1.8,
            unitPrice: 8000,
            subtotal: 14400,
            date: new Date(Date.now() - 24 * 60 * 60 * 1000),
            storeId: 'store-2'
          }
        ],
        total: 14400,
        status: 'closed',
        comments: 'Client a payé en plusieurs fois, besoin de validation',
        isValidated: false,
        createdBy: 'manager-2',
        createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000) // 20 hours ago
      }
    ];

    // Mock validation requests
    this.validationRequests = [
      {
        id: 'req-1',
        saleId: 'sale-1',
        requestedBy: 'manager-1',
        requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        reason: 'Correction erreur de quantité',
        status: 'pending'
      },
      {
        id: 'req-2',
        saleId: 'sale-2',
        requestedBy: 'manager-2',
        requestedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
        reason: 'Paiement échelonné client régulier',
        status: 'pending'
      }
    ];
  }

  /**
   * Get pending validation requests with optional filtering
   */
  public async getPendingValidations(filter: 'all' | 'today' | 'week' = 'all'): Promise<DailySales[]> {
    let filteredSales = this.mockSales.filter(sale => !sale.isValidated);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    switch (filter) {
      case 'today':
        filteredSales = filteredSales.filter(sale => {
          const saleDate = new Date(sale.createdAt);
          return saleDate >= today;
        });
        break;
      case 'week':
        filteredSales = filteredSales.filter(sale => {
          const saleDate = new Date(sale.createdAt);
          return saleDate >= weekAgo;
        });
        break;
      default:
        // Return all
        break;
    }

    return filteredSales.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Request validation for a sale modification
   */
  public async requestValidation(saleId: string, requestedBy: string, reason: string): Promise<void> {
    const existingRequest = this.validationRequests.find(
      req => req.saleId === saleId && req.status === 'pending'
    );

    if (existingRequest) {
      throw new Error('Une demande de validation est déjà en cours pour cette vente');
    }

    const validationRequest: ValidationRequest = {
      id: `req-${Date.now()}`,
      saleId,
      requestedBy,
      requestedAt: new Date(),
      reason,
      status: 'pending'
    };

    this.validationRequests.push(validationRequest);

    // Log audit trail
    await this.logAuditTrail({
      action: 'request_validation',
      entityType: 'sale',
      entityId: saleId,
      userId: requestedBy,
      details: {
        reason,
        requestedAt: new Date().toISOString()
      }
    });

    // Notify directors
    const notificationService = NotificationService.getInstance();
    await notificationService.createNotification({
      type: 'validation_request',
      title: 'Demande de validation',
      message: `Nouvelle demande de validation pour une vente: ${reason}`,
      data: {
        saleId,
        requestedBy,
        reason
      },
      targetRoles: ['director'],
      createdAt: new Date()
    });
  }

  /**
   * Validate a sale
   */
  public async validateSale(saleId: string, validatedBy: string): Promise<void> {
    const sale = this.mockSales.find(s => s.id === saleId);
    if (!sale) {
      throw new Error('Vente non trouvée');
    }

    if (sale.isValidated) {
      throw new Error('Cette vente a déjà été validée');
    }

    // Update sale
    sale.isValidated = true;
    sale.validatedBy = validatedBy;
    sale.validatedAt = new Date();

    // Update validation request
    const request = this.validationRequests.find(
      req => req.saleId === saleId && req.status === 'pending'
    );
    if (request) {
      request.status = 'approved';
      request.processedBy = validatedBy;
      request.processedAt = new Date();
    }

    // Log audit trail
    await this.logAuditTrail({
      action: 'validate_sale',
      entityType: 'sale',
      entityId: saleId,
      userId: validatedBy,
      details: {
        validatedAt: new Date().toISOString(),
        previousStatus: 'pending_validation'
      }
    });

    // Notify requester
    const notificationService = NotificationService.getInstance();
    if (request) {
      await notificationService.createNotification({
        type: 'validation_approved',
        title: 'Validation approuvée',
        message: 'Votre demande de validation a été approuvée',
        data: {
          saleId,
          validatedBy,
          validatedAt: new Date().toISOString()
        },
        targetUsers: [request.requestedBy],
        createdAt: new Date()
      });
    }
  }

  /**
   * Reject a sale validation
   */
  public async rejectSale(saleId: string, rejectedBy: string, rejectionReason: string): Promise<void> {
    const sale = this.mockSales.find(s => s.id === saleId);
    if (!sale) {
      throw new Error('Vente non trouvée');
    }

    // Update validation request
    const request = this.validationRequests.find(
      req => req.saleId === saleId && req.status === 'pending'
    );
    if (request) {
      request.status = 'rejected';
      request.processedBy = rejectedBy;
      request.processedAt = new Date();
      request.rejectionReason = rejectionReason;
    }

    // Log audit trail
    await this.logAuditTrail({
      action: 'reject_sale',
      entityType: 'sale',
      entityId: saleId,
      userId: rejectedBy,
      details: {
        rejectedAt: new Date().toISOString(),
        rejectionReason,
        previousStatus: 'pending_validation'
      }
    });

    // Notify requester
    const notificationService = NotificationService.getInstance();
    if (request) {
      await notificationService.createNotification({
        type: 'validation_rejected',
        title: 'Validation rejetée',
        message: `Votre demande de validation a été rejetée: ${rejectionReason}`,
        data: {
          saleId,
          rejectedBy,
          rejectedAt: new Date().toISOString(),
          rejectionReason
        },
        targetUsers: [request.requestedBy],
        createdAt: new Date()
      });
    }
  }

  /**
   * Log audit trail entry
   */
  public async logAuditTrail(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    const auditEntry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date(),
      ...entry
    };

    this.auditLog.push(auditEntry);

    // In a real application, this would be persisted to a database
    console.log('Audit log entry:', auditEntry);
  }

  /**
   * Get audit trail for a specific entity
   */
  public async getAuditTrail(entityType: string, entityId: string): Promise<AuditLogEntry[]> {
    return this.auditLog
      .filter(entry => entry.entityType === entityType && entry.entityId === entityId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get validation history for a sale
   */
  public async getValidationHistory(saleId: string): Promise<ValidationRequest[]> {
    return this.validationRequests
      .filter(req => req.saleId === saleId)
      .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
  }

  /**
   * Get validation statistics
   */
  public async getValidationStats(period: 'day' | 'week' | 'month' = 'week'): Promise<{
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  }> {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const periodRequests = this.validationRequests.filter(
      req => req.requestedAt >= startDate
    );

    return {
      pending: periodRequests.filter(req => req.status === 'pending').length,
      approved: periodRequests.filter(req => req.status === 'approved').length,
      rejected: periodRequests.filter(req => req.status === 'rejected').length,
      total: periodRequests.length
    };
  }
}

// Export singleton instance
export const salesValidationService = SalesValidationService.getInstance();