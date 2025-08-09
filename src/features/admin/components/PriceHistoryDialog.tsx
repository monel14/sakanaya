import React, { useState, useEffect } from 'react';
import { History, TrendingUp, TrendingDown } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button,
  Badge
} from '@/components/ui';
import { useProductCatalog } from '../hooks/useProductCatalog';
import { Product, PriceHistory } from '../../sales/types';

interface PriceHistoryDialogProps {
  product: Product;
  onClose: () => void;
}

export const PriceHistoryDialog: React.FC<PriceHistoryDialogProps> = ({
  product,
  onClose
}) => {
  const { getPriceHistory } = useProductCatalog();
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPriceHistory = async () => {
    try {
      setLoading(true);
      const history = await getPriceHistory(product.id);
      setPriceHistory(history);
    } catch (err) {
      console.error('Erreur lors du chargement de l\'historique:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPriceHistory();
  }, [product.id]);

  const getPriceChangeIcon = (currentPrice: number, previousPrice?: number) => {
    if (!previousPrice) return null;
    
    if (currentPrice > previousPrice) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (currentPrice < previousPrice) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  const getPriceChangeColor = (currentPrice: number, previousPrice?: number) => {
    if (!previousPrice) return 'text-slate-600';
    
    if (currentPrice > previousPrice) {
      return 'text-green-600';
    } else if (currentPrice < previousPrice) {
      return 'text-red-600';
    }
    return 'text-slate-600';
  };

  const calculatePriceChange = (currentPrice: number, previousPrice?: number) => {
    if (!previousPrice) return null;
    
    const change = currentPrice - previousPrice;
    const changePercent = ((change / previousPrice) * 100).toFixed(1);
    
    return {
      absolute: change,
      percent: changePercent
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-slate-500">Chargement de l'historique...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="h-5 w-5 mr-2" />
            Informations Produit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Nom:</strong> {product.name}
            </div>
            <div>
              <strong>Catégorie:</strong> {product.category}
            </div>
            <div>
              <strong>Unité:</strong> {product.unit}
            </div>
            <div>
              <strong>Type de prix:</strong> 
              <Badge className={product.priceType === 'variable' ? 'bg-orange-100 text-orange-800 ml-2' : 'bg-green-100 text-green-800 ml-2'}>
                {product.priceType === 'variable' ? 'Variable' : 'Fixe'}
              </Badge>
            </div>
            <div>
              <strong>Prix actuel:</strong> 
              <span className="font-medium ml-1">{product.unitPrice.toLocaleString()} CFA</span>
            </div>
            <div>
              <strong>Statut:</strong>
              <Badge className={product.isActive ? 'bg-green-100 text-green-800 ml-2' : 'bg-red-100 text-red-800 ml-2'}>
                {product.isActive ? 'Actif' : 'Inactif'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historique des Prix ({priceHistory.length} entrées)</CardTitle>
        </CardHeader>
        <CardContent>
          {priceHistory.length > 0 ? (
            <div className="space-y-3">
              {priceHistory.map((entry, index) => {
                const previousEntry = priceHistory[index + 1];
                const priceChange = calculatePriceChange(entry.price, previousEntry?.price);
                
                return (
                  <div 
                    key={entry.id}
                    className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium ${getPriceChangeColor(entry.price, previousEntry?.price)}`}>
                          {entry.price.toLocaleString()} CFA
                        </span>
                        {getPriceChangeIcon(entry.price, previousEntry?.price)}
                        {priceChange && (
                          <span className={`text-sm ${getPriceChangeColor(entry.price, previousEntry?.price)}`}>
                            ({priceChange.absolute > 0 ? '+' : ''}{priceChange.absolute.toLocaleString()} CFA, {priceChange.percent}%)
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-500 mt-1">
                        {entry.date.toLocaleDateString()} à {entry.date.toLocaleTimeString()}
                      </div>
                      {entry.reason && (
                        <div className="text-sm text-slate-600 mt-1">
                          <strong>Raison:</strong> {entry.reason}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right text-sm text-slate-500">
                      Par: {entry.updatedBy}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500">
              Aucun historique de prix disponible
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onClose}>
          Fermer
        </Button>
      </div>
    </div>
  );
};