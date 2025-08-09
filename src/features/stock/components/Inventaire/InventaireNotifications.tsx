import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Package, 
  AlertTriangle, 
  Clock, 
  Eye,
  X,
  CheckCircle
} from 'lucide-react';
import { Inventaire } from '../../shared/types';

interface InventaireNotificationsProps {
  pendingInventaires: Inventaire[];
  onViewInventaire: (inventaireId: string) => void;
  onMarkAsRead?: (inventaireId: string) => void;
  className?: string;
}

interface NotificationItem {
  id: string;
  inventaire: Inventaire;
  type: 'pending_validation' | 'overdue' | 'high_variance';
  message: string;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: Date;
}

export const InventaireNotifications: React.FC<InventaireNotificationsProps> = ({
  pendingInventaires,
  onViewInventaire,
  onMarkAsRead,
  className = ''
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());

  // Generate notifications from pending inventories
  useEffect(() => {
    const newNotifications: NotificationItem[] = [];

    pendingInventaires.forEach(inventaire => {
      // Calculate days since submission
      const daysSinceSubmission = Math.floor(
        (new Date().getTime() - inventaire.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Calculate variance severity
      const totalVarianceValue = Math.abs(inventaire.valeurEcarts);
      const hasHighVariance = totalVarianceValue > 100000; // 100k CFA threshold

      // Pending validation notification
      newNotifications.push({
        id: `pending-${inventaire.id}`,
        inventaire,
        type: 'pending_validation',
        message: `Inventaire ${inventaire.numero} en attente de validation`,
        priority: daysSinceSubmission > 2 ? 'high' : 'medium',
        isRead: readNotifications.has(`pending-${inventaire.id}`),
        createdAt: inventaire.createdAt
      });

      // Overdue notification (more than 3 days)
      if (daysSinceSubmission > 3) {
        newNotifications.push({
          id: `overdue-${inventaire.id}`,
          inventaire,
          type: 'overdue',
          message: `Inventaire ${inventaire.numero} en retard (${daysSinceSubmission} jours)`,
          priority: 'high',
          isRead: readNotifications.has(`overdue-${inventaire.id}`),
          createdAt: inventaire.createdAt
        });
      }

      // High variance notification
      if (hasHighVariance) {
        newNotifications.push({
          id: `variance-${inventaire.id}`,
          inventaire,
          type: 'high_variance',
          message: `Écarts importants détectés (${totalVarianceValue.toLocaleString()} CFA)`,
          priority: 'high',
          isRead: readNotifications.has(`variance-${inventaire.id}`),
          createdAt: inventaire.createdAt
        });
      }
    });

    // Sort by priority and date
    newNotifications.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    setNotifications(newNotifications);
  }, [pendingInventaires, readNotifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (notificationId: string) => {
    setReadNotifications(prev => new Set([...prev, notificationId]));
    if (onMarkAsRead) {
      const notification = notifications.find(n => n.id === notificationId);
      if (notification) {
        onMarkAsRead(notification.inventaire.id);
      }
    }
  };

  const handleViewInventaire = (inventaireId: string, notificationId: string) => {
    handleMarkAsRead(notificationId);
    onViewInventaire(inventaireId);
    setShowDropdown(false);
  };

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'pending_validation':
        return <Package className="h-4 w-4 text-blue-600" />;
      case 'overdue':
        return <Clock className="h-4 w-4 text-red-600" />;
      case 'high_variance':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: NotificationItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-orange-500 bg-orange-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border z-20">
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Notifications Inventaires
                </h3>
                <button
                  onClick={() => setShowDropdown(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">Aucune notification</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Tous les inventaires sont à jour
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} ${
                        notification.isRead ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {notification.message}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.inventaire.store.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {notification.createdAt.toLocaleDateString('fr-FR')} à{' '}
                                {notification.createdAt.toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-3">
                            <button
                              onClick={() => handleViewInventaire(
                                notification.inventaire.id, 
                                notification.id
                              )}
                              className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                            >
                              <Eye className="h-3 w-3" />
                              Voir
                            </button>
                            
                            {!notification.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                              >
                                <CheckCircle className="h-3 w-3" />
                                Marquer comme lu
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-4 border-t bg-gray-50">
                <button
                  onClick={() => {
                    // Mark all as read
                    const allIds = notifications.map(n => n.id);
                    setReadNotifications(prev => new Set([...prev, ...allIds]));
                  }}
                  className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Marquer tout comme lu
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};