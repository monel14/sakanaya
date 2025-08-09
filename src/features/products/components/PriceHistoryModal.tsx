import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button
} from '../../../shared/components/ui';
import { Product, PriceHistory } from '../../../shared/types';
import { usePriceManagement } from '../../../shared/hooks';
import { cn } from '../../../shared/lib/utils';

interface PriceHistoryModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PriceHistoryModal: React.FC<PriceHistoryModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  const { getPriceHistory } = usePriceManagement();
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product && isOpen) {
      loadHistory();
    }
  }, [product, isOpen]);

  const loadHistory = async () => {
    if (!product) return;
    
    try {
      setLoading(true);
      const historyData = await getPriceHistory(product.id);
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading price history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriceChangeIcon = (currentPrice: number, previousPrice: number) => {
    if (currentPrice > previousPrice) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (currentPrice < previousPrice) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getPriceChangeColor = (currentPrice: number, previousPrice: number) => {
    if (currentPrice > previousPrice) {
      return 'text-green-600';
    } else if (currentPrice < previousPrice) {
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  const formatPriceChange = (currentPrice: number, previousPrice: number) => {
    const change = currentPrice - previousPrice;
    const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0;
    
    if (change === 0) return 'Aucun changement';
    
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toLocaleString('fr-FR')} CFA (${sign}${changePercent.toFixed(1)}%)`;
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Historique des prix - {product.name}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm text-gray-500">
            {product.category} • {product.unit}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Chargement de l'historique...</div>
            </div>
          ) : history.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Aucun historique disponible</div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Current Price */}
              <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-blue-900">Prix actuel</div>
                    <div className="text-sm text-blue-700">
                      {new Date().toLocaleDateString('fr-FR')} à{' '}
                      {new Date().toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-900">
                      {product.unitPrice.toLocaleString('fr-FR')} CFA
                    </div>
                    {history.length > 0 && (
                      <div className={cn(
                        "text-sm flex items-center gap-1",
                        getPriceChangeColor(product.unitPrice, history[0].price)
                      )}>
                        {getPriceChangeIcon(product.unitPrice, history[0].price)}
                        {formatPriceChange(product.unitPrice, history[0].price)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Price History */}
              {history.map((entry, index) => {
                const nextEntry = history[index + 1];
                return (
                  <div
                    key={entry.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {entry.price.toLocaleString('fr-FR')} CFA
                        </div>
                        <div className="text-sm text-gray-500">
                          {entry.date.toLocaleDateString('fr-FR')} à{' '}
                          {entry.date.toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                        {entry.reason && (
                          <div className="text-sm text-gray-600 mt-1">
                            <strong>Raison:</strong> {entry.reason}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        {nextEntry && (
                          <div className={cn(
                            "text-sm flex items-center gap-1",
                            getPriceChangeColor(entry.price, nextEntry.price)
                          )}>
                            {getPriceChangeIcon(entry.price, nextEntry.price)}
                            {formatPriceChange(entry.price, nextEntry.price)}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          Par: {entry.updatedBy}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 pt-4 border-t">
          <div className="flex justify-end">
            <Button onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};