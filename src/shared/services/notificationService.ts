import { UserRole } from '../../features/auth/types';

export interface Notification {
  id: string;
  type: 'price_change' | 'validation_request' | 'validation_approved' | 'validation_rejected' | 'stock_alert' | 'system';
  title: string;
  message: string;
  data?: any;
  targetRoles?: UserRole[];
  targetUsers?: string[];
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

export interface CreateNotificationParams {
  type: Notification['type'];
  title: string;
  message: string;
  data?: any;
  targetRoles?: UserRole[];
  targetUsers?: string[];
  createdAt: Date;
}

/**
 * Service for managing notifications across the application
 * Handles creation, delivery, and tracking of notifications
 */
export class NotificationService {
  private static instance: NotificationService;
  private notifications: Notification[] = [];

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Create a new notification
   */
  public async createNotification(params: CreateNotificationParams): Promise<Notification> {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: params.type,
      title: params.title,
      message: params.message,
      data: params.data,
      targetRoles: params.targetRoles,
      targetUsers: params.targetUsers,
      isRead: false,
      createdAt: params.createdAt
    };

    this.notifications.push(notification);
    return notification;
  }

  /**
   * Get notifications for a specific user
   */
  public async getNotificationsForUser(userId: string, userRole: UserRole): Promise<Notification[]> {
    return this.notifications
      .filter(notification => {
        // Check if notification targets this specific user
        if (notification.targetUsers?.includes(userId)) {
          return true;
        }
        
        // Check if notification targets this user's role
        if (notification.targetRoles?.includes(userRole)) {
          return true;
        }
        
        return false;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Mark notification as read
   */
  public async markAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      notification.readAt = new Date();
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  public async markAllAsRead(userId: string, userRole: UserRole): Promise<void> {
    const userNotifications = await this.getNotificationsForUser(userId, userRole);
    userNotifications.forEach(notification => {
      notification.isRead = true;
      notification.readAt = new Date();
    });
  }

  /**
   * Get unread notification count for a user
   */
  public async getUnreadCount(userId: string, userRole: UserRole): Promise<number> {
    const userNotifications = await this.getNotificationsForUser(userId, userRole);
    return userNotifications.filter(n => !n.isRead).length;
  }

  /**
   * Send price change notification to all store managers
   */
  public async sendPriceChangeNotification(
    productId: string, 
    productName: string, 
    newPrice: number,
    oldPrice: number
  ): Promise<void> {
    await this.createNotification({
      type: 'price_change',
      title: 'Changement de prix',
      message: `Le prix de ${productName} est passé de ${oldPrice.toLocaleString('fr-FR')} à ${newPrice.toLocaleString('fr-FR')} CFA`,
      data: {
        productId,
        productName,
        newPrice,
        oldPrice
      },
      targetRoles: ['manager'],
      createdAt: new Date()
    });
  }

  /**
   * Send validation request notification to directors
   */
  public async sendValidationRequest(
    saleId: string,
    storeName: string,
    reason: string
  ): Promise<void> {
    await this.createNotification({
      type: 'validation_request',
      title: 'Demande de validation',
      message: `Demande de validation pour une modification de clôture - ${storeName}: ${reason}`,
      data: {
        saleId,
        storeName,
        reason
      },
      targetRoles: ['director'],
      createdAt: new Date()
    });
  }

  /**
   * Send stock alert notification
   */
  public async sendStockAlert(
    type: 'low_stock' | 'high_loss',
    productName: string,
    storeName: string,
    details: any
  ): Promise<void> {
    const title = type === 'low_stock' ? 'Stock faible' : 'Pertes élevées';
    const message = type === 'low_stock' 
      ? `Stock faible pour ${productName} dans ${storeName}`
      : `Taux de perte élevé pour ${productName} dans ${storeName}`;

    await this.createNotification({
      type: 'stock_alert',
      title,
      message,
      data: {
        type,
        productName,
        storeName,
        ...details
      },
      targetRoles: ['director', 'manager'],
      createdAt: new Date()
    });
  }

  /**
   * Clear old notifications (older than 30 days)
   */
  public async clearOldNotifications(): Promise<void> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    this.notifications = this.notifications.filter(
      notification => notification.createdAt > thirtyDaysAgo
    );
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();