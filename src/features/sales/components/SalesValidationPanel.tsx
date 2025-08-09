import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { Card, CardContent, Button } from '../../../shared/components/ui';
import { DailySales, User } from '../../../shared/types';
import { ValidationCard } from './ValidationCard';
import { usePriceManagement } from '../../../shared/hooks';
import { salesValidationService } from '../../../shared/services';
import { toast } from 'sonner';

interface SalesValidationPanelProps {
  currentUser: User | null;
}

export const SalesValidationPanel: React.FC<SalesValidationPanelProps> = ({
  currentUser
}) => {
  const { allProducts } = usePriceManagement(currentUser?.id);
  const [pendingValidations, setPendingValidations] = useState<DailySales[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'week'>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Load pending validations
  const loadPendingValidations = async () => {
    try {
      setLoading(true);
      const validations = await salesValidationService.getPendingValidations(filter);
      setPendingValidations(validations);
    } catch (error) {
      toast.error('Erreur lors du chargement des validations');
      console.error('Error loading validations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPendingValidations();
    setRefreshing(false);
    toast.success('Données actualisées');
  };

  // Validate a sale
  const handleValidate = async (saleId: string) => {
    if (!currentUser) {
      throw new Error('Utilisateur non authentifié');
    }

    await salesValidationService.validateSale(saleId, currentUser.id);
    
    // Remove from pending list
    setPendingValidations(prev => prev.filter(sale => sale.id !== saleId));
    
    // Log audit trail
    await salesValidationService.logAuditTrail({
      action: 'validate_sale',
      entityType: 'sale',
      entityId: saleId,
      userId: currentUser.id,
      details: {
        validatedBy: currentUser.name,
        validatedAt: new Date().toISOString()
      }
    });
  };

  // Reject a sale
  const handleReject = async (saleId: string, reason: string) => {
    if (!currentUser) {
      throw new Error('Utilisateur non authentifié');
    }

    await salesValidationService.rejectSale(saleId, currentUser.id, reason);
    
    // Remove from pending list
    setPendingValidations(prev => prev.filter(sale => sale.id !== saleId));
    
    // Log audit trail
    await salesValidationService.logAuditTrail({
      action: 'reject_sale',
      entityType: 'sale',
      entityId: saleId,
      userId: currentUser.id,
      details: {
        rejectedBy: currentUser.name,
        rejectedAt: new Date().toISOString(),
        reason
      }
    });
  };

  // Load data on mount and filter change
  useEffect(() => {
    if (currentUser?.role === 'director') {
      loadPendingValidations();
    }
  }, [currentUser, filter]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (currentUser?.role === 'director') {
      const interval = setInterval(() => {
        loadPendingValidations();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [currentUser, filter]);

  // Only directors can access this panel
  if (!currentUser || currentUser.role !== 'director') {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">
            Accès Restreint
          </h3>
          <p className="text-red-600">
            Seuls les directeurs peuvent accéder au panneau de validation des ventes.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des validations en attente...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Validation des Ventes
          </h1>
          <p className="text-gray-600">
            {pendingValidations.length} demande{pendingValidations.length !== 1 ? 's' : ''} en attente
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Filter Buttons */}
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <Button
              variant={filter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
              className="rounded-none"
            >
              Toutes
            </Button>
            <Button
              variant={filter === 'today' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('today')}
              className="rounded-none border-l"
            >
              Aujourd'hui
            </Button>
            <Button
              variant={filter === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('week')}
              className="rounded-none border-l"
            >
              Cette semaine
            </Button>
          </div>
          
          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Validation Cards */}
      {pendingValidations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune validation en attente
            </h3>
            <p className="text-gray-600">
              Toutes les ventes ont été validées ou aucune demande n'a été soumise.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingValidations.map((sale) => (
            <ValidationCard
              key={sale.id}
              sale={sale}
              products={allProducts}
              onValidate={handleValidate}
              onReject={handleReject}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {pendingValidations.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  Résumé des validations
                </p>
                <p className="text-xs text-blue-700">
                  {pendingValidations.length} demande{pendingValidations.length !== 1 ? 's' : ''} • 
                  Total: {pendingValidations.reduce((sum, sale) => sum + sale.total, 0).toLocaleString('fr-FR')} CFA
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};