import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, Trash2, AlertCircle, Info, Save } from 'lucide-react';
import { Card, CardContent, Button, Input, Label } from '@/components/ui';
import { User, SalesEntry as SalesEntryType, Product, DailySales } from '@/types';
import { usePriceManagement, useAutoSave } from '@/shared/hooks';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';

interface SalesEntryProps {
  currentUser: User | null;
  // New props for enhanced functionality
  onAddComment?: (comment: string) => void;
  onRequestValidation?: (reason: string) => void;
  allowValidation?: boolean;
  existingComments?: string;
}

export const SalesEntry: React.FC<SalesEntryProps> = ({ 
  currentUser,
  onAddComment,
  onRequestValidation,
  allowValidation = false,
  existingComments = ''
}) => {
  const { allProducts, loading, validateQuantity } = usePriceManagement(currentUser?.id);
  const [entries, setEntries] = useState<Partial<SalesEntryType>[]>([
    { productId: '', quantity: 0 }
  ]);
  const [comments, setComments] = useState(existingComments);
  const [validationReason, setValidationReason] = useState('');
  const [hasRecoveredData, setHasRecoveredData] = useState(false);

  // Auto-save configuration
  const autoSaveKey = `sales-entry-${currentUser?.store || 'default'}-${new Date().toDateString()}`;
  const autoSaveData = {
    entries,
    comments,
    timestamp: new Date().toISOString()
  };

  const { loadSavedData, clearSavedData, hasSavedData, saveNow } = useAutoSave(
    autoSaveData,
    {
      key: autoSaveKey,
      delay: 3000, // Save after 3 seconds of inactivity
      enabled: !!currentUser,
      onSave: () => {
        // Optional: Add visual indicator that data was saved
      }
    }
  );

  // Recovery effect - check for saved data on mount
  useEffect(() => {
    if (currentUser && !hasRecoveredData && hasSavedData()) {
      const savedData = loadSavedData();
      if (savedData && savedData.entries && savedData.entries.length > 0) {
        // Check if saved data is from today
        const savedDate = new Date(savedData.timestamp).toDateString();
        const today = new Date().toDateString();
        
        if (savedDate === today) {
          setEntries(savedData.entries);
          setComments(savedData.comments || '');
          setHasRecoveredData(true);
          
          toast.success('Données de saisie récupérées automatiquement', {
            duration: 3000,
            action: {
              label: 'Effacer',
              onClick: () => {
                clearSavedData();
                setEntries([{ productId: '', quantity: 0 }]);
                setComments('');
                toast.success('Données effacées');
              }
            }
          });
        } else {
          // Clear old data
          clearSavedData();
        }
      }
    }
  }, [currentUser, hasRecoveredData, hasSavedData, loadSavedData, clearSavedData]);

  // Initialize first entry when products are loaded
  useEffect(() => {
    if (allProducts.length > 0 && entries[0]?.productId === '' && !hasRecoveredData) {
      setEntries([{ productId: allProducts[0].id, quantity: 0 }]);
    }
  }, [allProducts, hasRecoveredData]);

  const addEntry = () => {
    const firstProductId = allProducts.length > 0 ? allProducts[0].id : '';
    setEntries([...entries, { productId: firstProductId, quantity: 0 }]);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: string, value: any) => {
    const updated = [...entries];
    
    if (field === 'quantity') {
      const product = allProducts.find(p => p.id === updated[index].productId);
      if (product && !validateQuantity(product, value)) {
        toast.error(
          product.allowDecimals 
            ? 'Quantité invalide' 
            : 'Les quantités doivent être des nombres entiers pour ce produit'
        );
        return;
      }
    }
    
    updated[index] = { ...updated[index], [field]: value };
    setEntries(updated);
  };

  const calculateTotal = () => {
    return entries.reduce((total, entry) => {
      const product = allProducts.find(p => p.id === entry.productId);
      return total + (product?.unitPrice || 0) * (entry.quantity || 0);
    }, 0);
  };

  const getProductById = (productId: string): Product | undefined => {
    return allProducts.find(p => p.id === productId);
  };

  const handleSaveComments = () => {
    if (onAddComment) {
      onAddComment(comments);
      toast.success('Commentaires sauvegardés');
    }
  };

  const handleManualSave = () => {
    saveNow();
    toast.success('Données sauvegardées manuellement');
  };

  const handleCloseDay = async () => {
    if (!currentUser || !hasValidEntries) {
      toast.error('Impossible de clôturer sans ventes valides');
      return;
    }

    try {
      // Create the daily sales record
      const dailySales: Omit<DailySales, 'id'> = {
        date: new Date(),
        storeId: currentUser.store || 'unknown',
        entries: entries
          .filter(isValidEntry)
          .map((entry, index) => {
            const product = getProductById(entry.productId!);
            return {
              id: `entry-${Date.now()}-${index}`,
              productId: entry.productId!,
              product: product!,
              quantity: entry.quantity!,
              unitPrice: product?.unitPrice || 0,
              subtotal: (product?.unitPrice || 0) * (entry.quantity || 0),
              date: new Date(),
              storeId: currentUser.store || 'unknown'
            };
          }),
        total: calculateTotal(),
        status: 'closed' as const,
        comments: comments.trim() || undefined,
        isValidated: false,
        createdBy: currentUser.id,
        createdAt: new Date()
      };

      // Save the closing (in a real app, this would call an API)
      const closingId = `closing-${Date.now()}`;
      const completedSale: DailySales = {
        id: closingId,
        ...dailySales
      };

      // Add to closing history
      const { closingHistoryService } = await import('@/shared/services');
      await closingHistoryService.addClosing(completedSale);

      // Clear auto-saved data
      clearSavedData();
      
      // Reset form
      setEntries([{ productId: allProducts[0]?.id || '', quantity: 0 }]);
      setComments('');
      
      toast.success('Journée clôturée avec succès', {
        description: `Total: ${calculateTotal().toLocaleString('fr-FR')} CFA`,
        duration: 5000
      });

      // Optional: Show closing summary
      // This could trigger a modal or navigation to summary page
      
    } catch (error) {
      console.error('Error closing day:', error);
      toast.error('Erreur lors de la clôture de la journée');
    }
  };

  const handleRequestValidation = () => {
    if (onRequestValidation && validationReason.trim()) {
      onRequestValidation(validationReason);
      setValidationReason('');
      toast.success('Demande de validation envoyée');
    }
  };

  const isValidEntry = (entry: Partial<SalesEntryType>): boolean => {
    return !!(entry.productId && entry.quantity && entry.quantity > 0);
  };

  const hasValidEntries = entries.some(isValidEntry);

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-gray-500">Chargement des produits...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Saisie Journalière des Ventes
        </h1>
        <div className="text-sm text-slate-600">
          {currentUser?.store} | {new Date().toLocaleDateString('fr-FR')}
        </div>
      </div>

      {/* Price Information Banner */}
      {allProducts.some(p => p.priceType === 'variable') && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              Les prix variables sont automatiquement mis à jour quotidiennement. 
              Les prix affichés sont ceux du jour.
            </span>
          </div>
        </div>
      )}

      <Card className="border-0 shadow-lg">
        <CardContent className="p-3 sm:p-6">
          {/* Mobile: Stack layout, Desktop: Table */}
          <div className="block sm:hidden space-y-4">
            {entries.map((entry, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-3">
                <div>
                  <Label className="text-sm font-medium">Produit</Label>
                  <select 
                    className="w-full mt-1 p-3 border border-slate-300 rounded-lg text-base"
                    value={entry.productId || ''}
                    onChange={(e) => updateEntry(index, 'productId', e.target.value)}
                  >
                    <option value="">Sélectionner un produit</option>
                    {allProducts.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.unit})
                        {product.priceType === 'variable' && ' - Prix variable'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium">Prix Unitaire</Label>
                    <div className={cn(
                      "mt-1 p-3 rounded-lg text-base font-medium flex items-center gap-2",
                      getProductById(entry.productId || '')?.priceType === 'variable' 
                        ? "bg-blue-50 text-blue-900" 
                        : "bg-slate-50"
                    )}>
                      <span>
                        {getProductById(entry.productId || '')?.unitPrice.toLocaleString('fr-FR') || 0} CFA
                      </span>
                      {getProductById(entry.productId || '')?.priceType === 'variable' && (
                        <Info className="h-3 w-3 text-blue-600" />
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      Quantité
                      {getProductById(entry.productId || '')?.allowDecimals === false && (
                        <span className="text-xs text-gray-500 ml-1">(entiers uniquement)</span>
                      )}
                    </Label>
                    <Input 
                      type="number" 
                      className="mt-1 h-12 text-base text-center" 
                      placeholder="0"
                      step={getProductById(entry.productId || '')?.allowDecimals ? "0.01" : "1"}
                      value={entry.quantity || ''}
                      onChange={(e) => updateEntry(index, 'quantity', Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-slate-600">Sous-total</span>
                  <span className="font-bold text-lg">
                    {((getProductById(entry.productId || '')?.unitPrice || 0) * (entry.quantity || 0)).toLocaleString('fr-FR')} CFA
                  </span>
                </div>
                {entries.length > 1 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeEntry(index)}
                    className="w-full text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 font-semibold text-slate-700">Produit</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-700">Prix Unitaire</th>
                  <th className="text-center py-3 px-2 font-semibold text-slate-700">Quantité</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-700">Sous-total</th>
                  <th className="text-center py-3 px-2 font-semibold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => {
                  const product = allProducts.find(p => p.id === entry.productId);
                  return (
                    <tr key={index} className="border-b border-slate-100">
                      <td className="py-3 px-2">
                        <select 
                          className="w-full p-2 border border-slate-300 rounded-lg"
                          value={entry.productId || ''}
                          onChange={(e) => updateEntry(index, 'productId', e.target.value)}
                        >
                          <option value="">Sélectionner un produit</option>
                          {allProducts.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name} ({product.unit})
                              {product.priceType === 'variable' && ' - Prix variable'}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className={cn(
                          "flex items-center justify-end gap-1",
                          product?.priceType === 'variable' && "text-blue-600"
                        )}>
                          <span>{product?.unitPrice.toLocaleString('fr-FR') || 0} CFA</span>
                          {product?.priceType === 'variable' && (
                            <Info className="h-3 w-3" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Input 
                          type="number" 
                          className="w-24 text-center" 
                          placeholder="0"
                          step={product?.allowDecimals ? "0.01" : "1"}
                          value={entry.quantity || ''}
                          onChange={(e) => updateEntry(index, 'quantity', Number(e.target.value))}
                        />
                      </td>
                      <td className="py-3 px-2 text-right font-medium">
                        {((product?.unitPrice || 0) * (entry.quantity || 0)).toLocaleString('fr-FR')} CFA
                      </td>
                      <td className="py-3 px-2 text-center">
                        {entries.length > 1 && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeEntry(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-6 border-t border-slate-200 gap-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto h-12 sm:h-auto"
                onClick={addEntry}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une ligne
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="w-full sm:w-auto"
                onClick={handleManualSave}
                title="Sauvegarder manuellement"
              >
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-sm text-slate-600 mb-1">Total Journalier</p>
              <p className="text-2xl font-bold text-blue-600">
                {calculateTotal().toLocaleString('fr-FR')} CFA
              </p>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <Label htmlFor="comments" className="text-sm font-medium">
              Commentaires (optionnel)
            </Label>
            <div className="mt-2 flex gap-2">
              <Input
                id="comments"
                type="text"
                placeholder="Ajouter un commentaire sur cette journée..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="flex-1"
              />
              {onAddComment && (
                <Button
                  variant="outline"
                  onClick={handleSaveComments}
                  disabled={!comments.trim()}
                >
                  Sauvegarder
                </Button>
              )}
            </div>
          </div>

          {/* Validation Request Section */}
          {allowValidation && onRequestValidation && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">
                  Demander une validation pour modifier cette clôture
                </span>
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Raison de la modification..."
                  value={validationReason}
                  onChange={(e) => setValidationReason(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={handleRequestValidation}
                  disabled={!validationReason.trim()}
                >
                  Demander validation
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-center sm:justify-end mt-6">
            <Button 
              className="w-full sm:w-auto h-12 sm:h-auto"
              disabled={!hasValidEntries}
              onClick={handleCloseDay}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Clôturer la journée
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};