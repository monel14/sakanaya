import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, User, Calendar, MessageSquare, AlertTriangle } from 'lucide-react';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { DailySales, Product } from '@/types';
import { toast } from 'sonner';

interface ValidationCardProps {
  sale: DailySales;
  products: Product[];
  onValidate: (saleId: string) => Promise<void>;
  onReject: (saleId: string, reason: string) => Promise<void>;
  currentUser: { id: string; name: string } | null;
}

export const ValidationCard: React.FC<ValidationCardProps> = ({
  sale,
  products,
  onValidate,
  onReject,
  currentUser
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const getProductById = (productId: string): Product | undefined => {
    return products.find(p => p.id === productId);
  };

  const handleValidate = async () => {
    if (!currentUser) {
      toast.error('Utilisateur non authentifié');
      return;
    }

    try {
      setIsValidating(true);
      await onValidate(sale.id);
      toast.success('Vente validée avec succès');
    } catch (error) {
      toast.error('Erreur lors de la validation');
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleReject = async () => {
    if (!currentUser) {
      toast.error('Utilisateur non authentifié');
      return;
    }

    if (!rejectReason.trim()) {
      toast.error('Veuillez indiquer une raison pour le rejet');
      return;
    }

    try {
      setIsRejecting(true);
      await onReject(sale.id, rejectReason);
      toast.success('Vente rejetée');
      setShowRejectForm(false);
      setRejectReason('');
    } catch (error) {
      toast.error('Erreur lors du rejet');
      console.error('Rejection error:', error);
    } finally {
      setIsRejecting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="border-l-4 border-l-amber-400 shadow-md">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-full">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                Demande de validation - {formatDate(sale.date)}
              </h3>
              <p className="text-sm text-gray-600">
                Magasin: {sale.storeId} • Créé le {formatTime(sale.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <User className="h-4 w-4" />
            <span>Par: {sale.createdBy}</span>
          </div>
        </div>

        {/* Sale Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Détails de la vente
          </h4>
          
          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium">Produit</th>
                  <th className="text-right py-2 font-medium">Prix unitaire</th>
                  <th className="text-center py-2 font-medium">Quantité</th>
                  <th className="text-right py-2 font-medium">Sous-total</th>
                </tr>
              </thead>
              <tbody>
                {sale.entries.map((entry, index) => {
                  const product = getProductById(entry.productId);
                  return (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2">
                        <div>
                          <span className="font-medium">{product?.name || 'Produit inconnu'}</span>
                          <span className="text-gray-500 ml-2">({product?.unit})</span>
                          {product?.priceType === 'variable' && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Prix variable
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 text-right">
                        {entry.unitPrice.toLocaleString('fr-FR')} CFA
                      </td>
                      <td className="py-2 text-center">
                        {product?.allowDecimals ? entry.quantity.toFixed(2) : Math.floor(entry.quantity)}
                      </td>
                      <td className="py-2 text-right font-medium">
                        {entry.subtotal.toLocaleString('fr-FR')} CFA
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300">
                  <td colSpan={3} className="py-2 text-right font-semibold">
                    Total:
                  </td>
                  <td className="py-2 text-right font-bold text-lg">
                    {sale.total.toLocaleString('fr-FR')} CFA
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Comments */}
          {sale.comments && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Commentaires:</p>
                  <p className="text-sm text-blue-700">{sale.comments}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Validation Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {!showRejectForm ? (
            <>
              <Button
                onClick={handleValidate}
                disabled={isValidating}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isValidating ? 'Validation...' : 'Valider la vente'}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowRejectForm(true)}
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeter
              </Button>
            </>
          ) : (
            <div className="w-full space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">
                    Raison du rejet
                  </span>
                </div>
                <Input
                  type="text"
                  placeholder="Expliquez pourquoi cette vente est rejetée..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleReject}
                  disabled={isRejecting || !rejectReason.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {isRejecting ? 'Rejet...' : 'Confirmer le rejet'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectReason('');
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Audit Trail */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>
              Créé le {formatDate(sale.createdAt)} à {formatTime(sale.createdAt)}
            </span>
            {sale.validatedAt && (
              <>
                <span>•</span>
                <span>
                  Validé le {formatDate(sale.validatedAt)} à {formatTime(sale.validatedAt)}
                  {sale.validatedBy && ` par ${sale.validatedBy}`}
                </span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};