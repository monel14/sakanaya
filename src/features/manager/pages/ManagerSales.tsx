import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { usePriceManagement } from '../../../shared/hooks/usePriceManagement';
import { useAutoSave } from '../../../shared/hooks/useAutoSave';

interface ManagerSalesProps {
  user: any;
}

export const SalesEntry: React.FC<ManagerSalesProps> = ({ user }) => {
  const [salesEntries, setSalesEntries] = useState<any[]>([
    { id: '1', productId: '4', productName: 'Thon au Kg (Thon Rouge)', unit: 'kg', unitPrice: 6500, quantity: 0, subtotal: 0 },
    { id: '2', productId: '4', productName: 'Thon au Kg (Thon Rouge)', unit: 'kg', unitPrice: 6500, quantity: 0, subtotal: 0 }
  ]);
  const [comments, setComments] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  const { allProducts: products } = usePriceManagement(user.id);

  const addNewLine = () => {
    const defaultProduct = products.find(p => p.name === 'Thon Rouge') || products[0];
    const newEntry = {
      id: Date.now().toString(),
      productId: defaultProduct?.id || '1',
      productName: `${defaultProduct?.name} au ${defaultProduct?.unit.charAt(0).toUpperCase() + defaultProduct?.unit.slice(1)} (${defaultProduct?.name})`,
      unit: defaultProduct?.unit || 'kg',
      unitPrice: defaultProduct?.unitPrice || 0,
      quantity: 0,
      subtotal: 0
    };
    setSalesEntries([...salesEntries, newEntry]);
  };

  const updateEntry = (entryId: string, field: string, value: any) => {
    setSalesEntries(prev => 
      prev.map(entry => {
        if (entry.id === entryId) {
          const updatedEntry = { ...entry, [field]: value };
          
          // Si on change le produit, mettre à jour le prix
          if (field === 'productId') {
            const selectedProduct = products.find(p => p.id === value);
            if (selectedProduct) {
              updatedEntry.productName = `${selectedProduct.name} au ${selectedProduct.unit.charAt(0).toUpperCase() + selectedProduct.unit.slice(1)} (${selectedProduct.name})`;
              updatedEntry.unit = selectedProduct.unit;
              updatedEntry.unitPrice = selectedProduct.unitPrice;
            }
          }
          
          // Recalculer le sous-total
          if (field === 'quantity' || field === 'productId') {
            updatedEntry.subtotal = updatedEntry.quantity * updatedEntry.unitPrice;
          }
          
          return updatedEntry;
        }
        return entry;
      })
    );
  };

  const removeEntry = (entryId: string) => {
    setSalesEntries(prev => prev.filter(entry => entry.id !== entryId));
  };

  const totalAmount = salesEntries.reduce((sum, entry) => sum + entry.subtotal, 0);

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Utiliser le hook de sauvegarde automatique
  const { lastSaved, isSaving } = useAutoSave(
    { salesEntries, comments },
    {
      interval: 30000, // 30 secondes
      onSave: async (data) => {
        console.log('Sauvegarde automatique:', data);
        // TODO: Implémenter la sauvegarde réelle
      }
    }
  );

  const handleManualSave = async () => {
    // TODO: Implémenter la sauvegarde manuelle
    console.log('Sauvegarde manuelle:', {
      date: new Date().toISOString(),
      store: user.store,
      entries: salesEntries.filter(entry => entry.quantity > 0),
      comments,
      status: 'draft'
    });
  };

  const handleCloseSales = async () => {
    if (salesEntries.every(entry => entry.quantity === 0)) {
      alert('Veuillez saisir au moins une vente avant de clôturer.');
      return;
    }

    const confirmClose = window.confirm(
      `Êtes-vous sûr de vouloir clôturer la journée ?\n\nTotal: ${totalAmount.toLocaleString()} CFA\n\nCette action ne pourra pas être annulée sans validation du directeur.`
    );

    if (!confirmClose) return;

    setIsClosing(true);
    
    try {
      // TODO: Implémenter la clôture définitive
      console.log('Clôture des ventes:', {
        date: new Date().toISOString(),
        store: user.store,
        entries: salesEntries.filter(entry => entry.quantity > 0),
        total: totalAmount,
        comments,
        status: 'closed',
        createdBy: user.id
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset du formulaire après clôture
      setSalesEntries([
        { id: Date.now().toString(), productId: '4', productName: 'Thon au Kg (Thon Rouge)', unit: 'kg', unitPrice: 6500, quantity: 0, subtotal: 0 }
      ]);
      setComments('');
      setLastSaved(null);
      
      alert('✅ Clôture enregistrée avec succès !');
    } catch (error) {
      alert('❌ Erreur lors de la clôture. Veuillez réessayer.');
    } finally {
      setIsClosing(false);
    }
  };

  const requestModification = (date: string) => {
    const reason = prompt(`Pourquoi souhaitez-vous modifier la clôture du ${date} ?\n\nExemples:\n- Vente oubliée\n- Erreur de saisie\n- Retour client`);
    
    if (reason && reason.trim()) {
      // TODO: Implémenter la demande de modification
      console.log('Demande de modification:', { date, reason: reason.trim() });
      alert(`✅ Demande de modification envoyée au directeur.\n\nMotif: "${reason.trim()}"`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calculator className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Saisie Journalière des Ventes
              </h1>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                Magasin: {user.store || 'Pointe des Almadies'}
              </div>
              <div className="text-sm text-gray-500">
                Date: {getCurrentDate()}
              </div>
            </div>
          </div>
        </div>

        {/* Table des ventes */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header du tableau */}
          <div className="bg-gray-100 px-6 py-4 border-b">
            <div className="grid grid-cols-12 gap-4 items-center font-medium text-gray-700">
              <div className="col-span-4">Produit (Unité de vente)</div>
              <div className="col-span-2 text-center">Prix Unitaire</div>
              <div className="col-span-2 text-center">Quantité Vendue</div>
              <div className="col-span-2 text-center">Sous-total</div>
              <div className="col-span-2 text-center">Action</div>
            </div>
          </div>

          {/* Lignes de saisie */}
          <div className="divide-y divide-gray-200">
            {salesEntries.map((entry, index) => (
              <div key={entry.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Sélecteur de produit */}
                  <div className="col-span-4">
                    <select
                      value={entry.productId}
                      onChange={(e) => updateEntry(entry.id, 'productId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} au {product.unit.charAt(0).toUpperCase() + product.unit.slice(1)} ({product.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Prix unitaire */}
                  <div className="col-span-2 text-center">
                    <div className="px-3 py-2 bg-gray-50 rounded-md font-medium">
                      {entry.unitPrice.toLocaleString()} CFA
                    </div>
                  </div>

                  {/* Quantité */}
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={entry.quantity || ''}
                      onChange={(e) => updateEntry(entry.id, 'quantity', parseFloat(e.target.value) || 0)}
                      step={entry.unit === 'kg' ? '0.1' : '1'}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>

                  {/* Sous-total */}
                  <div className="col-span-2 text-center">
                    <div className="px-3 py-2 bg-blue-50 rounded-md font-semibold text-blue-900">
                      {entry.subtotal.toLocaleString()} CFA
                    </div>
                  </div>

                  {/* Action */}
                  <div className="col-span-2 text-center">
                    <button
                      onClick={() => removeEntry(entry.id)}
                      className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Supprimer cette ligne"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bouton Ajouter une ligne */}
          <div className="px-6 py-4 bg-gray-50 border-t">
            <button
              onClick={addNewLine}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une ligne
            </button>
          </div>
        </div>

        {/* Total et actions */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                Total du jour: {totalAmount.toLocaleString()} CFA
              </div>
              {lastSaved && (
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                  Dernière sauvegarde: {lastSaved.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
              {isSaving && (
                <div className="flex items-center mt-2 text-sm text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Sauvegarde en cours...
                </div>
              )}
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={handleManualSave}
                disabled={isSaving}
                className="flex items-center px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
              <button 
                onClick={handleCloseSales}
                disabled={totalAmount === 0 || isClosing}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isClosing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Clôture en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Clôturer la journée
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Zone de commentaires pour la clôture du jour */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Commentaires de clôture
          </h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarques sur la journée (optionnel)
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Panne de frigo 2h, grosse commande mariage, produit avarié retiré..."
            />
            <div className="mt-1 text-xs text-gray-500">
              {comments.length}/500 caractères
            </div>
          </div>
        </div>

        {/* Historique des clôtures récentes */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Historique des clôtures
          </h2>
          <div className="space-y-3">
            {/* Clôture validée - pas d'action possible */}
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
              <div className="flex-1">
                <div className="font-medium text-gray-900">07/08/2025</div>
                <div className="text-sm text-gray-500">Total: 1,250,000 CFA</div>
                <div className="text-xs text-gray-400">Clôturé à 18:30</div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Validée
                </span>
                <button className="px-3 py-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-300 rounded">
                  Voir détails
                </button>
              </div>
            </div>
            
            {/* Clôture en attente - possibilité d'annuler la demande */}
            <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex-1">
                <div className="font-medium text-gray-900">06/08/2025</div>
                <div className="text-sm text-gray-500">Total: 890,500 CFA</div>
                <div className="text-xs text-gray-400">Clôturé à 19:15 • Demande envoyée à 20:30</div>
                <div className="text-xs text-orange-600 mt-1">⏳ Demande de modification en cours</div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                  En attente validation
                </span>
                <button className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded">
                  Annuler demande
                </button>
              </div>
            </div>

            {/* Clôture validée récente - pas d'action */}
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
              <div className="flex-1">
                <div className="font-medium text-gray-900">05/08/2025</div>
                <div className="text-sm text-gray-500">Total: 2,150,000 CFA</div>
                <div className="text-xs text-gray-400">Clôturé à 18:45</div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Validée
                </span>
                <button className="px-3 py-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-300 rounded">
                  Voir détails
                </button>
              </div>
            </div>

            {/* Clôture rejetée - possibilité de redemander */}
            <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex-1">
                <div className="font-medium text-gray-900">04/08/2025</div>
                <div className="text-sm text-gray-500">Total: 1,680,750 CFA</div>
                <div className="text-xs text-gray-400">Clôturé à 19:00</div>
                <div className="text-xs text-red-600 mt-1">❌ Motif: "Écart trop important avec stock théorique"</div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                  Rejetée
                </span>
                <button 
                  onClick={() => requestModification('04/08/2025')}
                  className="px-3 py-1 text-xs text-orange-600 hover:text-orange-800 border border-orange-300 rounded"
                >
                  Redemander validation
                </button>
              </div>
            </div>

            {/* Clôture normale - possibilité de demander modification */}
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
              <div className="flex-1">
                <div className="font-medium text-gray-900">03/08/2025</div>
                <div className="text-sm text-gray-500">Total: 1,420,300 CFA</div>
                <div className="text-xs text-gray-400">Clôturé à 18:20</div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  Clôturée
                </span>
                <button 
                  onClick={() => requestModification('03/08/2025')}
                  className="px-3 py-1 text-xs text-orange-600 hover:text-orange-800 border border-orange-300 rounded"
                >
                  Demander modification
                </button>
                <button className="px-3 py-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-300 rounded">
                  Voir détails
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-blue-900 mb-1">
                  💡 Conseils pour une clôture efficace
                </div>
                <ul className="text-blue-800 space-y-1 text-xs">
                  <li>• Vérifiez vos quantités avant de clôturer</li>
                  <li>• Ajoutez des commentaires pour les événements particuliers</li>
                  <li>• La sauvegarde automatique se fait toutes les 30 secondes</li>
                  <li>• Une fois clôturée, seul le directeur peut autoriser les modifications</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              📊 Voir tout l'historique (30 derniers jours)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};