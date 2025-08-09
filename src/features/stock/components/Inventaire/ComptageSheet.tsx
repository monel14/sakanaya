import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Save, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  MessageSquare,
  Calculator,
  Eye,
  EyeOff
} from 'lucide-react';
import { Inventaire, LigneInventaire } from '../../types';
import { UpdateInventaireData } from '../../services/inventaireService';

interface ComptageSheetProps {
  inventaire: Inventaire;
  onUpdate: (data: UpdateInventaireData) => Promise<void>;
  onSubmit: (inventaireId: string) => Promise<void>;
  loading?: boolean;
  autoSave?: boolean;
  autoSaveInterval?: number; // in milliseconds
}

interface LigneComptage extends LigneInventaire {
  tempQuantitePhysique?: number;
  tempCommentaire?: string;
  hasChanges?: boolean;
}

export const ComptageSheet: React.FC<ComptageSheetProps> = ({
  inventaire,
  onUpdate,
  onSubmit,
  loading = false,
  autoSave = true,
  autoSaveInterval = 30000 // 30 seconds
}) => {
  const [lignes, setLignes] = useState<LigneComptage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyWithVariance, setShowOnlyWithVariance] = useState(false);
  const [showTheoreticalQuantities, setShowTheoreticalQuantities] = useState(true);
  const [globalCommentaires, setGlobalCommentaires] = useState(inventaire.commentaires || '');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize lines from inventory
  useEffect(() => {
    const initialLignes: LigneComptage[] = inventaire.lignes.map(ligne => ({
      ...ligne,
      tempQuantitePhysique: ligne.quantitePhysique,
      tempCommentaire: ligne.commentaire || '',
      hasChanges: false
    }));
    setLignes(initialLignes);
  }, [inventaire]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !hasUnsavedChanges) return;

    const interval = setInterval(() => {
      handleSave(false); // Silent save
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [autoSave, hasUnsavedChanges, autoSaveInterval]);

  const handleQuantityChange = (ligneId: string, quantity: number) => {
    setLignes(prev => prev.map(ligne => {
      if (ligne.id === ligneId) {
        const hasChanges = quantity !== ligne.quantitePhysique;
        return {
          ...ligne,
          tempQuantitePhysique: quantity,
          hasChanges
        };
      }
      return ligne;
    }));
    setHasUnsavedChanges(true);
  };

  const handleCommentChange = (ligneId: string, comment: string) => {
    setLignes(prev => prev.map(ligne => {
      if (ligne.id === ligneId) {
        const hasChanges = comment !== (ligne.commentaire || '');
        return {
          ...ligne,
          tempCommentaire: comment,
          hasChanges: hasChanges || ligne.hasChanges
        };
      }
      return ligne;
    }));
    setHasUnsavedChanges(true);
  };

  const calculateVariance = (theorique: number, physique?: number): number => {
    if (physique === undefined) return 0;
    return physique - theorique;
  };

  const getVarianceColor = (variance: number): string => {
    if (Math.abs(variance) < 0.01) return 'text-gray-600';
    return variance > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getVarianceIcon = (variance: number) => {
    if (Math.abs(variance) < 0.01) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return variance > 0 ? 
      <AlertTriangle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  const handleSave = async (showNotification = true) => {
    const changedLignes = lignes
      .filter(ligne => ligne.hasChanges)
      .map(ligne => ({
        productId: ligne.productId,
        quantitePhysique: ligne.tempQuantitePhysique || 0,
        commentaire: ligne.tempCommentaire
      }));

    if (changedLignes.length === 0 && globalCommentaires === inventaire.commentaires) {
      return;
    }

    try {
      await onUpdate({
        inventaireId: inventaire.id,
        lignes: changedLignes,
        commentaires: globalCommentaires
      });

      // Reset change flags
      setLignes(prev => prev.map(ligne => ({
        ...ligne,
        hasChanges: false
      })));
      
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      
      if (showNotification) {
        // You could add a toast notification here
        console.log('Inventaire sauvegardé avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleSubmitForValidation = async () => {
    // Save first
    await handleSave(false);
    
    // Then submit
    await onSubmit(inventaire.id);
  };

  // Filter lines based on search and variance filter
  const filteredLignes = lignes.filter(ligne => {
    const matchesSearch = !searchTerm || 
      ligne.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ligne.product.code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const hasVariance = ligne.tempQuantitePhysique !== undefined && 
      Math.abs(calculateVariance(ligne.quantiteTheorique, ligne.tempQuantitePhysique)) > 0.01;
    
    const matchesVarianceFilter = !showOnlyWithVariance || hasVariance;
    
    return matchesSearch && matchesVarianceFilter;
  });

  const completionPercentage = lignes.length > 0 ? 
    (lignes.filter(l => l.tempQuantitePhysique !== undefined).length / lignes.length) * 100 : 0;

  const totalVariances = lignes.reduce((sum, ligne) => {
    if (ligne.tempQuantitePhysique !== undefined) {
      return sum + Math.abs(calculateVariance(ligne.quantiteTheorique, ligne.tempQuantitePhysique));
    }
    return sum;
  }, 0);

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Feuille de Comptage - {inventaire.numero}
              </h2>
              <p className="text-sm text-gray-600">
                {inventaire.store.name} • {inventaire.date.toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Completion Progress */}
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {Math.round(completionPercentage)}% complété
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
            
            {/* Auto-save indicator */}
            {lastSaved && (
              <div className="text-xs text-gray-500">
                Dernière sauvegarde: {lastSaved.toLocaleTimeString('fr-FR')}
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOnlyWithVariance(!showOnlyWithVariance)}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                showOnlyWithVariance 
                  ? 'bg-orange-100 text-orange-700 border border-orange-300' 
                  : 'bg-gray-100 text-gray-700 border border-gray-300'
              }`}
            >
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              Écarts uniquement
            </button>
            
            <button
              onClick={() => setShowTheoreticalQuantities(!showTheoreticalQuantities)}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              {showTheoreticalQuantities ? <EyeOff className="h-4 w-4 inline mr-1" /> : <Eye className="h-4 w-4 inline mr-1" />}
              Qté théorique
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{lignes.length}</div>
            <div className="text-sm text-gray-600">Produits total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {lignes.filter(l => l.tempQuantitePhysique !== undefined).length}
            </div>
            <div className="text-sm text-gray-600">Comptés</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {lignes.filter(l => l.tempQuantitePhysique !== undefined && 
                Math.abs(calculateVariance(l.quantiteTheorique, l.tempQuantitePhysique)) > 0.01).length}
            </div>
            <div className="text-sm text-gray-600">Avec écarts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {totalVariances.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Total écarts</div>
          </div>
        </div>
      </div>

      {/* Counting Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produit
              </th>
              {showTheoreticalQuantities && (
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qté Théorique
                </th>
              )}
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Qté Physique
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Écart
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Commentaire
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLignes.map((ligne) => {
              const variance = calculateVariance(ligne.quantiteTheorique, ligne.tempQuantitePhysique);
              const varianceColor = getVarianceColor(variance);
              const varianceIcon = getVarianceIcon(variance);

              return (
                <tr key={ligne.id} className={ligne.hasChanges ? 'bg-yellow-50' : ''}>
                  {/* Product */}
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {ligne.product.name}
                        </div>
                        {ligne.product.code && (
                          <div className="text-sm text-gray-500">
                            Code: {ligne.product.code}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Theoretical Quantity */}
                  {showTheoreticalQuantities && (
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-medium text-gray-900">
                        {ligne.quantiteTheorique.toFixed(1)}
                      </span>
                      <div className="text-xs text-gray-500">
                        {ligne.product.unit || 'unité'}
                      </div>
                    </td>
                  )}

                  {/* Physical Quantity Input */}
                  <td className="px-4 py-4">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={ligne.tempQuantitePhysique || ''}
                      onChange={(e) => handleQuantityChange(ligne.id, parseFloat(e.target.value) || 0)}
                      className="w-24 px-2 py-1 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      disabled={loading}
                    />
                  </td>

                  {/* Variance */}
                  <td className="px-4 py-4 text-center">
                    <div className={`flex items-center justify-center gap-1 ${varianceColor}`}>
                      {varianceIcon}
                      <span className="text-sm font-medium">
                        {ligne.tempQuantitePhysique !== undefined ? 
                          (variance > 0 ? '+' : '') + variance.toFixed(1) : 
                          '-'
                        }
                      </span>
                    </div>
                  </td>

                  {/* Comment */}
                  <td className="px-4 py-4">
                    <input
                      type="text"
                      value={ligne.tempCommentaire || ''}
                      onChange={(e) => handleCommentChange(ligne.id, e.target.value)}
                      placeholder="Commentaire..."
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4 text-center">
                    {ligne.tempQuantitePhysique !== undefined ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Compté
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        En attente
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Global Comments */}
      <div className="p-6 border-t bg-gray-50">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <MessageSquare className="h-4 w-4" />
          Commentaires généraux
        </label>
        <textarea
          value={globalCommentaires}
          onChange={(e) => {
            setGlobalCommentaires(e.target.value);
            setHasUnsavedChanges(true);
          }}
          placeholder="Ajouter des commentaires sur cet inventaire..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      {/* Actions */}
      <div className="p-6 border-t bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {hasUnsavedChanges && (
              <span className="text-sm text-orange-600 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Modifications non sauvegardées
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave(true)}
              disabled={loading || !hasUnsavedChanges}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4" />
              Sauvegarder
            </button>
            
            <button
              onClick={handleSubmitForValidation}
              disabled={loading || completionPercentage < 100}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Soumission...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Soumettre pour Validation
                </>
              )}
            </button>
          </div>
        </div>
        
        {completionPercentage < 100 && (
          <p className="mt-2 text-sm text-gray-500">
            Vous devez compter tous les produits avant de pouvoir soumettre l'inventaire pour validation.
          </p>
        )}
      </div>
    </div>
  );
};