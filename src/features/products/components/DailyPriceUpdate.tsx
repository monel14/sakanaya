import React, { useState } from 'react';
import { RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { Product, User } from '@/types';
import { usePriceManagement } from '@/shared/hooks';
import { PriceUpdateRow } from './PriceUpdateRow';
import { PriceHistoryModal } from './PriceHistoryModal';
import { toast } from 'sonner';

interface DailyPriceUpdateProps {
  currentUser: User | null;
}

export const DailyPriceUpdate: React.FC<DailyPriceUpdateProps> = ({
  currentUser
}) => {
  const { 
    variableProducts, 
    loading, 
    error, 
    updateProductPrice, 
    refreshProducts 
  } = usePriceManagement(currentUser?.id);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handlePriceUpdate = async (productId: string, newPrice: number, reason?: string) => {
    try {
      await updateProductPrice(productId, newPrice, reason);
      toast.success('Prix mis à jour avec succès');
    } catch (error) {
      // Error is already handled in the hook
      throw error;
    }
  };

  const handleShowHistory = (productId: string) => {
    const product = variableProducts.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setIsHistoryModalOpen(true);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshProducts();
      toast.success('Données actualisées');
    } catch (error) {
      toast.error('Erreur lors de l\'actualisation');
    } finally {
      setRefreshing(false);
    }
  };

  const canUpdatePrices = currentUser?.role === 'director';

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-gray-500">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Chargement des produits...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">
                Mise à jour quotidienne des prix
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Gérez les prix variables de vos produits
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date().toLocaleDateString('fr-FR')}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Access Control Notice */}
          {!canUpdatePrices && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">
                Seuls les directeurs peuvent modifier les prix. Vous pouvez consulter l'historique des prix.
              </span>
            </div>
          )}

          {/* Products Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {variableProducts.length}
              </div>
              <div className="text-sm text-gray-600">
                Produits à prix variable
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {variableProducts.filter(p => p.isActive).length}
              </div>
              <div className="text-sm text-gray-600">
                Produits actifs
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {new Date().toLocaleDateString('fr-FR')}
              </div>
              <div className="text-sm text-gray-600">
                Dernière mise à jour
              </div>
            </div>
          </div>

          {/* Products List */}
          {variableProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Aucun produit à prix variable trouvé</p>
            </div>
          ) : (
            <div className="space-y-4">
              {variableProducts.map((product) => (
                <PriceUpdateRow
                  key={product.id}
                  product={product}
                  onPriceUpdate={handlePriceUpdate}
                  onShowHistory={handleShowHistory}
                  disabled={!canUpdatePrices}
                />
              ))}
            </div>
          )}

          {/* Success Message */}
          {canUpdatePrices && variableProducts.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">
                Les modifications de prix seront automatiquement notifiées à tous les magasins.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Price History Modal */}
      <PriceHistoryModal
        product={selectedProduct}
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setSelectedProduct(null);
        }}
      />
    </>
  );
};