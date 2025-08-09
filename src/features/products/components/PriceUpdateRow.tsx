import React, { useState } from 'react';
import { History, Check, X, AlertCircle } from 'lucide-react';
import { Button, Input, Label } from '../../../shared/components/ui';
import { Product } from '../../../shared/types';
import { cn } from '../../../shared/lib/utils';

interface PriceUpdateRowProps {
  product: Product;
  onPriceUpdate: (productId: string, newPrice: number, reason?: string) => Promise<void>;
  onShowHistory?: (productId: string) => void;
  disabled?: boolean;
}

export const PriceUpdateRow: React.FC<PriceUpdateRowProps> = ({
  product,
  onPriceUpdate,
  onShowHistory,
  disabled = false
}) => {
  const [newPrice, setNewPrice] = useState<string>(product.unitPrice.toString());
  const [reason, setReason] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPrice = product.unitPrice;
  const hasChanged = parseFloat(newPrice) !== currentPrice && newPrice !== '';
  const isValidPrice = !isNaN(parseFloat(newPrice)) && parseFloat(newPrice) > 0;

  const handleStartEdit = () => {
    setIsEditing(true);
    setError(null);
    setNewPrice(currentPrice.toString());
    setReason('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewPrice(currentPrice.toString());
    setReason('');
    setError(null);
  };

  const handleConfirm = async () => {
    if (!isValidPrice) {
      setError('Le prix doit être un nombre positif');
      return;
    }

    if (!hasChanged) {
      setError('Le prix n\'a pas changé');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      await onPriceUpdate(product.id, parseFloat(newPrice), reason || undefined);
      
      setIsEditing(false);
      setReason('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const priceChange = hasChanged && isValidPrice 
    ? parseFloat(newPrice) - currentPrice 
    : 0;

  const priceChangePercent = currentPrice > 0 
    ? (priceChange / currentPrice) * 100 
    : 0;

  return (
    <div className={cn(
      "border rounded-lg p-4 space-y-3 transition-colors",
      isEditing ? "border-blue-200 bg-blue-50" : "border-gray-200",
      disabled && "opacity-50 pointer-events-none"
    )}>
      {/* Product Info */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-900">{product.name}</h3>
          <p className="text-sm text-gray-500">
            {product.category} • {product.unit}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Prix actuel</p>
          <p className="text-lg font-semibold text-gray-900">
            {currentPrice.toLocaleString('fr-FR')} CFA
          </p>
        </div>
      </div>

      {/* Price Update Section */}
      {isEditing ? (
        <div className="space-y-3">
          {/* New Price Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor={`price-${product.id}`} className="text-sm font-medium">
                Nouveau prix (CFA)
              </Label>
              <Input
                id={`price-${product.id}`}
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="0"
                className={cn(
                  "mt-1",
                  !isValidPrice && newPrice !== '' && "border-red-300 focus:border-red-500"
                )}
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor={`reason-${product.id}`} className="text-sm font-medium">
                Raison (optionnel)
              </Label>
              <Input
                id={`reason-${product.id}`}
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Ajustement marché"
                className="mt-1"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Price Change Indicator */}
          {hasChanged && isValidPrice && (
            <div className={cn(
              "flex items-center gap-2 p-2 rounded text-sm",
              priceChange > 0 
                ? "bg-green-50 text-green-700" 
                : "bg-red-50 text-red-700"
            )}>
              <AlertCircle className="h-4 w-4" />
              <span>
                {priceChange > 0 ? 'Augmentation' : 'Diminution'} de{' '}
                <strong>{Math.abs(priceChange).toLocaleString('fr-FR')} CFA</strong>
                {' '}({priceChangePercent > 0 ? '+' : ''}{priceChangePercent.toFixed(1)}%)
              </span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-2 bg-red-50 text-red-700 rounded text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-1" />
              Annuler
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={!hasChanged || !isValidPrice || isLoading}
            >
              <Check className="h-4 w-4 mr-1" />
              {isLoading ? 'Mise à jour...' : 'Confirmer'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
          </div>
          <div className="flex gap-2">
            {onShowHistory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onShowHistory(product.id)}
              >
                <History className="h-4 w-4 mr-1" />
                Historique
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartEdit}
            >
              Modifier le prix
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};