import React from 'react';
import { Calendar, Clock, User, FileText, CheckCircle, DollarSign } from 'lucide-react';
import { Card, CardContent } from '../../../shared/components/ui';
import { DailySales, Product, User as UserType } from '../../../shared/types';
import { cn } from '../../../shared/lib/utils';

interface DailyClosingSummaryProps {
  sale: DailySales;
  products: Product[];
  currentUser: UserType | null;
  onPrint?: () => void;
}

export const DailyClosingSummary: React.FC<DailyClosingSummaryProps> = ({
  sale,
  products,
  currentUser,
  onPrint
}) => {
  const getProductById = (productId: string): Product | undefined => {
    return products.find(p => p.id === productId);
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
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const calculateStats = () => {
    const totalItems = sale.entries.reduce((sum, entry) => sum + entry.quantity, 0);
    const uniqueProducts = new Set(sale.entries.map(entry => entry.productId)).size;
    const averageItemValue = sale.total / totalItems;

    return {
      totalItems: totalItems.toFixed(2),
      uniqueProducts,
      averageItemValue: averageItemValue.toFixed(0)
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-green-900">
                  Clôture Journalière Confirmée
                </h2>
                <p className="text-green-700">
                  {formatDate(sale.date)}
                </p>
              </div>
            </div>
            {onPrint && (
              <button
                onClick={onPrint}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FileText className="h-4 w-4 mr-2 inline" />
                Imprimer
              </button>
            )}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-900">
                {sale.total.toLocaleString('fr-FR')}
              </div>
              <div className="text-sm text-green-700">CFA Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-900">
                {sale.entries.length}
              </div>
              <div className="text-sm text-green-700">Lignes de vente</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-900">
                {stats.uniqueProducts}
              </div>
              <div className="text-sm text-green-700">Produits différents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-900">
                {stats.totalItems}
              </div>
              <div className="text-sm text-green-700">Quantité totale</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Détail des Ventes
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">Produit</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700">Prix Unitaire</th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-700">Quantité</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700">Sous-total</th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-700">% du Total</th>
                </tr>
              </thead>
              <tbody>
                {sale.entries.map((entry, index) => {
                  const product = getProductById(entry.productId);
                  const percentage = ((entry.subtotal / sale.total) * 100).toFixed(1);
                  
                  return (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-2">
                        <div>
                          <span className="font-medium">{product?.name || 'Produit inconnu'}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500">({product?.unit})</span>
                            {product?.priceType === 'variable' && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Prix variable
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right">
                        {entry.unitPrice.toLocaleString('fr-FR')} CFA
                      </td>
                      <td className="py-3 px-2 text-center">
                        {product?.allowDecimals ? entry.quantity.toFixed(2) : Math.floor(entry.quantity)}
                      </td>
                      <td className="py-3 px-2 text-right font-medium">
                        {entry.subtotal.toLocaleString('fr-FR')} CFA
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-medium",
                          parseFloat(percentage) > 30 ? "bg-red-100 text-red-800" :
                          parseFloat(percentage) > 15 ? "bg-yellow-100 text-yellow-800" :
                          "bg-green-100 text-green-800"
                        )}>
                          {percentage}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td colSpan={3} className="py-3 px-2 text-right font-semibold">
                    Total Général:
                  </td>
                  <td className="py-3 px-2 text-right font-bold text-lg">
                    {sale.total.toLocaleString('fr-FR')} CFA
                  </td>
                  <td className="py-3 px-2 text-center font-semibold">
                    100%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Comments and Metadata */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Comments */}
        {sale.comments && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Commentaires
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-900">{sale.comments}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Informations de Clôture
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Date de clôture</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(sale.createdAt)} à {formatTime(sale.createdAt)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Clôturé par</p>
                  <p className="text-sm text-gray-600">
                    {sale.createdBy} ({currentUser?.store})
                  </p>
                </div>
              </div>

              {sale.isValidated && sale.validatedBy && sale.validatedAt && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-green-700">Validé par</p>
                    <p className="text-sm text-green-600">
                      {sale.validatedBy} le {formatDate(sale.validatedAt)} à {formatTime(sale.validatedAt)}
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    sale.status === 'closed' ? "bg-green-500" : "bg-yellow-500"
                  )}></div>
                  <span className="text-sm font-medium">
                    Statut: {sale.status === 'closed' ? 'Clôturé' : 'En cours'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card className="bg-gray-50">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Analyse de Performance</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {stats.averageItemValue} CFA
              </div>
              <div className="text-sm text-gray-600">Valeur moyenne par article</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-lg font-bold text-purple-600">
                {(sale.entries.length / stats.uniqueProducts).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Lignes par produit (moyenne)</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-lg font-bold text-orange-600">
                {(parseFloat(stats.totalItems) / sale.entries.length).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Quantité moyenne par ligne</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};