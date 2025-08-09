import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Package,
  User,
  Calendar,
  MessageSquare,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { Inventaire } from '../../types';

interface ValidationInventaireProps {
  inventaire: Inventaire;
  onValidate: (inventaireId: string) => Promise<void>;
  onReject: (inventaireId: string, reason: string) => Promise<void>;
  loading?: boolean;
}

interface VarianceAnalysis {
  totalLines: number;
  linesWithVariance: number;
  positiveVariances: number;
  negativeVariances: number;
  significantVariances: number;
  totalVarianceValue: number;
  averageVariancePercentage: number;
}

export const ValidationInventaire: React.FC<ValidationInventaireProps> = ({
  inventaire,
  onValidate,
  onReject,
  loading = false
}) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'details' | 'variances'>('overview');

  // Calculate variance analysis
  const calculateVarianceAnalysis = (): VarianceAnalysis => {
    const linesWithPhysical = inventaire.lignes.filter(ligne => 
      ligne.quantitePhysique !== undefined && ligne.ecart !== undefined
    );

    const linesWithVariance = linesWithPhysical.filter(ligne => 
      Math.abs(ligne.ecart!) > 0.01
    );

    const positiveVariances = linesWithVariance.filter(ligne => ligne.ecart! > 0).length;
    const negativeVariances = linesWithVariance.filter(ligne => ligne.ecart! < 0).length;

    const significantVariances = linesWithVariance.filter(ligne => {
      const variancePercentage = ligne.quantiteTheorique > 0 
        ? Math.abs(ligne.ecart!) / ligne.quantiteTheorique * 100 
        : 0;
      return variancePercentage > 5;
    }).length;

    const totalVarianceValue = linesWithPhysical.reduce((sum, ligne) => 
      sum + Math.abs(ligne.valeurEcart || 0), 0
    );

    const totalTheoreticalValue = linesWithPhysical.reduce((sum, ligne) => 
      sum + (ligne.quantiteTheorique * (ligne.product.averageCost || 0)), 0
    );

    const averageVariancePercentage = totalTheoreticalValue > 0 
      ? (totalVarianceValue / totalTheoreticalValue) * 100 
      : 0;

    return {
      totalLines: inventaire.lignes.length,
      linesWithVariance: linesWithVariance.length,
      positiveVariances,
      negativeVariances,
      significantVariances,
      totalVarianceValue,
      averageVariancePercentage
    };
  };

  const analysis = calculateVarianceAnalysis();

  const handleValidate = async () => {
    try {
      await onValidate(inventaire.id);
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      return;
    }

    try {
      await onReject(inventaire.id, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
    }
  };

  const getVarianceColor = (variance: number): string => {
    if (Math.abs(variance) < 0.01) return 'text-gray-600';
    return variance > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getVarianceIcon = (variance: number) => {
    if (Math.abs(variance) < 0.01) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return variance > 0 ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getSeverityBadge = (variancePercentage: number) => {
    if (variancePercentage < 1) {
      return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Faible</span>;
    } else if (variancePercentage < 5) {
      return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Modéré</span>;
    } else if (variancePercentage < 10) {
      return <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">Élevé</span>;
    } else {
      return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Critique</span>;
    }
  };

  // Get top variances for detailed view
  const topVariances = inventaire.lignes
    .filter(ligne => ligne.quantitePhysique !== undefined && ligne.ecart !== undefined)
    .map(ligne => {
      const variancePercentage = ligne.quantiteTheorique > 0 
        ? (ligne.ecart! / ligne.quantiteTheorique) * 100 
        : 0;
      
      return {
        ...ligne,
        variancePercentage
      };
    })
    .sort((a, b) => Math.abs(b.variancePercentage) - Math.abs(a.variancePercentage))
    .slice(0, 10);

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Validation d'Inventaire - {inventaire.numero}
              </h2>
              <p className="text-sm text-gray-600">
                {inventaire.store.name} • {inventaire.date.toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              En attente de validation
            </span>
          </div>
        </div>

        {/* Inventory Info */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <div>
              <div className="text-sm text-gray-600">Créé par</div>
              <div className="font-medium">{inventaire.createdBy}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <div className="text-sm text-gray-600">Date de création</div>
              <div className="font-medium">{inventaire.createdAt.toLocaleDateString('fr-FR')}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-500" />
            <div>
              <div className="text-sm text-gray-600">Produits comptés</div>
              <div className="font-medium">{analysis.totalLines}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
            { id: 'details', label: 'Détails', icon: Package },
            { id: 'variances', label: 'Écarts significatifs', icon: AlertTriangle }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Lignes</p>
                    <p className="text-2xl font-bold text-blue-900">{analysis.totalLines}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Avec Écarts</p>
                    <p className="text-2xl font-bold text-orange-900">{analysis.linesWithVariance}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Écarts Significatifs</p>
                    <p className="text-2xl font-bold text-red-900">{analysis.significantVariances}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Valeur Écarts</p>
                    <p className="text-2xl font-bold text-green-900">
                      {analysis.totalVarianceValue.toLocaleString()} CFA
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Variance Breakdown */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Répartition des Écarts</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Écarts positifs (surplus)</span>
                    <span className="font-medium text-green-600">+{analysis.positiveVariances}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Écarts négatifs (manquants)</span>
                    <span className="font-medium text-red-600">-{analysis.negativeVariances}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sans écart</span>
                    <span className="font-medium text-gray-600">
                      {analysis.totalLines - analysis.linesWithVariance}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Impact Financier</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Valeur totale des écarts</span>
                    <span className="font-medium text-gray-900">
                      {analysis.totalVarianceValue.toLocaleString()} CFA
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pourcentage moyen d'écart</span>
                    <span className="font-medium text-gray-900">
                      {analysis.averageVariancePercentage.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments */}
            {inventaire.commentaires && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Commentaires</h4>
                    <p className="text-blue-800">{inventaire.commentaires}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'details' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Produit
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Qté Théorique
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Qté Physique
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Écart
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Valeur Écart
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Commentaire
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventaire.lignes.map((ligne) => {
                  const variance = ligne.ecart || 0;
                  const varianceColor = getVarianceColor(variance);
                  const varianceIcon = getVarianceIcon(variance);

                  return (
                    <tr key={ligne.id}>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {ligne.product.name}
                        </div>
                        {ligne.product.code && (
                          <div className="text-sm text-gray-500">
                            {ligne.product.code}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm text-gray-900">
                          {ligne.quantiteTheorique.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm text-gray-900">
                          {ligne.quantitePhysique?.toFixed(1) || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className={`flex items-center justify-center gap-1 ${varianceColor}`}>
                          {varianceIcon}
                          <span className="text-sm font-medium">
                            {variance > 0 ? '+' : ''}{variance.toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`text-sm font-medium ${varianceColor}`}>
                          {ligne.valeurEcart ? 
                            `${ligne.valeurEcart > 0 ? '+' : ''}${ligne.valeurEcart.toLocaleString()} CFA` : 
                            '-'
                          }
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600">
                          {ligne.commentaire || '-'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {selectedTab === 'variances' && (
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <h4 className="font-medium text-orange-900">
                  Écarts Significatifs (Top 10)
                </h4>
              </div>
              <p className="text-sm text-orange-800 mt-1">
                Les écarts les plus importants nécessitent une attention particulière
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Produit
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Écart Quantité
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Écart %
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Valeur Écart
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Sévérité
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Commentaire
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topVariances.map((ligne) => {
                    const variance = ligne.ecart || 0;
                    const varianceColor = getVarianceColor(variance);
                    const varianceIcon = getVarianceIcon(variance);

                    return (
                      <tr key={ligne.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {ligne.product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Théorique: {ligne.quantiteTheorique.toFixed(1)} | 
                            Physique: {ligne.quantitePhysique?.toFixed(1) || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className={`flex items-center justify-center gap-1 ${varianceColor}`}>
                            {varianceIcon}
                            <span className="text-sm font-medium">
                              {variance > 0 ? '+' : ''}{variance.toFixed(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`text-sm font-medium ${varianceColor}`}>
                            {ligne.variancePercentage > 0 ? '+' : ''}{ligne.variancePercentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`text-sm font-medium ${varianceColor}`}>
                            {ligne.valeurEcart ? 
                              `${ligne.valeurEcart > 0 ? '+' : ''}${ligne.valeurEcart.toLocaleString()} CFA` : 
                              '-'
                            }
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {getSeverityBadge(Math.abs(ligne.variancePercentage))}
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-600">
                            {ligne.commentaire || '-'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 border-t bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {analysis.significantVariances > 0 && (
              <div className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-4 w-4" />
                <span>
                  {analysis.significantVariances} écart(s) significatif(s) détecté(s)
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-red-700 bg-red-100 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <XCircle className="h-4 w-4" />
              Rejeter
            </button>
            
            <button
              onClick={handleValidate}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Validation...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Valider l'Inventaire
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Rejeter l'Inventaire
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motif du rejet
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Expliquez pourquoi cet inventaire est rejeté..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Confirmer le Rejet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};