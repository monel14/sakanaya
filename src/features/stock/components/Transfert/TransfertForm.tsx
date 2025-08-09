import React, { useState, useEffect } from 'react';
import {
  Plus,
  Minus,
  ArrowRight,
  AlertTriangle,
  Package,
  Building2,
  Save,
  X
} from 'lucide-react';
import { TransfertStock, LigneTransfert, ProductStock } from '../../types';
import { useTransferts } from '../../hooks/useTransferts';
import { validateTransfertCreation } from '../../utils/stockValidations';

interface TransfertFormProps {
  onSuccess?: (transfert: TransfertStock) => void;
  onCancel?: () => void;
  currentStoreId: string;
  userRole: 'director' | 'manager';
}

interface TransfertFormData {
  storeSourceId: string;
  storeDestinationId: string;
  lignes: LigneTransfertFormData[];
  commentaires?: string;
}

interface LigneTransfertFormData {
  productId: string;
  quantiteEnvoyee: number;
  tempId: string; // For form management
}

// Mock data for stores and products
const mockStores = [
  { id: 'store-1', name: 'Hub Distribution' },
  { id: 'store-2', name: 'Boutique Centre-Ville' },
  { id: 'store-3', name: 'Marché Sandaga' }
];

const mockProducts: ProductStock[] = [
  {
    id: 'prod-1',
    name: 'Thiéboudienne Premium',
    category: 'Plats',
    price: 2500,
    stockLevels: [
      { storeId: 'store-1', productId: 'prod-1', quantity: 50, reservedQuantity: 5, availableQuantity: 45, lastUpdated: new Date() },
      { storeId: 'store-2', productId: 'prod-1', quantity: 10, reservedQuantity: 0, availableQuantity: 10, lastUpdated: new Date() },
      { storeId: 'store-3', productId: 'prod-1', quantity: 8, reservedQuantity: 2, availableQuantity: 6, lastUpdated: new Date() }
    ],
    averageCost: 1800,
    lastArrivalDate: new Date('2024-01-15'),
    stockRotation: 7
  },
  {
    id: 'prod-2',
    name: 'Yassa Poulet',
    category: 'Plats',
    price: 2000,
    stockLevels: [
      { storeId: 'store-1', productId: 'prod-2', quantity: 30, reservedQuantity: 0, availableQuantity: 30, lastUpdated: new Date() },
      { storeId: 'store-2', productId: 'prod-2', quantity: 5, reservedQuantity: 0, availableQuantity: 5, lastUpdated: new Date() },
      { storeId: 'store-3', productId: 'prod-2', quantity: 12, reservedQuantity: 3, availableQuantity: 9, lastUpdated: new Date() }
    ],
    averageCost: 1500,
    lastArrivalDate: new Date('2024-01-14'),
    stockRotation: 5
  },
  {
    id: 'prod-3',
    name: 'Mafé Traditionnel',
    category: 'Plats',
    price: 1800,
    stockLevels: [
      { storeId: 'store-1', productId: 'prod-3', quantity: 25, reservedQuantity: 0, availableQuantity: 25, lastUpdated: new Date() },
      { storeId: 'store-2', productId: 'prod-3', quantity: 0, reservedQuantity: 0, availableQuantity: 0, lastUpdated: new Date() },
      { storeId: 'store-3', productId: 'prod-3', quantity: 15, reservedQuantity: 0, availableQuantity: 15, lastUpdated: new Date() }
    ],
    averageCost: 1300,
    lastArrivalDate: new Date('2024-01-13'),
    stockRotation: 6
  }
];

export const TransfertForm: React.FC<TransfertFormProps> = ({
  onSuccess,
  onCancel,
  currentStoreId,
  userRole
}) => {
  const [formData, setFormData] = useState<TransfertFormData>({
    storeSourceId: currentStoreId,
    storeDestinationId: '',
    lignes: [],
    commentaires: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>('');

  const { createTransfert, loading } = useTransferts('user-1', userRole, currentStoreId);

  // Get available stock for a product in the source store
  const getAvailableStock = (productId: string, storeId: string): number => {
    const product = mockProducts.find(p => p.id === productId);
    if (!product) return 0;
    
    const stockLevel = product.stockLevels.find(sl => sl.storeId === storeId);
    return stockLevel?.availableQuantity || 0;
  };

  // Get product by ID
  const getProduct = (productId: string): ProductStock | undefined => {
    return mockProducts.find(p => p.id === productId);
  };

  // Add a new line to the transfer
  const addLigne = () => {
    if (!selectedProduct) return;

    // Check if product is already in the list
    const existingLigne = formData.lignes.find(l => l.productId === selectedProduct);
    if (existingLigne) {
      setErrors({ ...errors, selectedProduct: 'Ce produit est déjà dans la liste' });
      return;
    }

    const newLigne: LigneTransfertFormData = {
      productId: selectedProduct,
      quantiteEnvoyee: 1,
      tempId: `temp-${Date.now()}`
    };

    setFormData(prev => ({
      ...prev,
      lignes: [...prev.lignes, newLigne]
    }));

    setSelectedProduct('');
    setErrors({ ...errors, selectedProduct: '' });
  };

  // Remove a line from the transfer
  const removeLigne = (tempId: string) => {
    setFormData(prev => ({
      ...prev,
      lignes: prev.lignes.filter(l => l.tempId !== tempId)
    }));
  };

  // Update quantity for a line
  const updateQuantite = (tempId: string, quantite: number) => {
    setFormData(prev => ({
      ...prev,
      lignes: prev.lignes.map(l => 
        l.tempId === tempId ? { ...l, quantiteEnvoyee: Math.max(0, quantite) } : l
      )
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate stores
    if (!formData.storeSourceId) {
      newErrors.storeSourceId = 'Magasin source requis';
    }
    if (!formData.storeDestinationId) {
      newErrors.storeDestinationId = 'Magasin destination requis';
    }
    if (formData.storeSourceId === formData.storeDestinationId) {
      newErrors.storeDestinationId = 'Le magasin de destination doit être différent du magasin source';
    }

    // Validate lines
    if (formData.lignes.length === 0) {
      newErrors.lignes = 'Au moins un produit est requis';
    }

    // Validate each line
    formData.lignes.forEach((ligne, index) => {
      const availableStock = getAvailableStock(ligne.productId, formData.storeSourceId);
      
      if (ligne.quantiteEnvoyee <= 0) {
        newErrors[`ligne-${ligne.tempId}-quantite`] = 'La quantité doit être positive';
      } else if (ligne.quantiteEnvoyee > availableStock) {
        newErrors[`ligne-${ligne.tempId}-quantite`] = `Stock insuffisant (disponible: ${availableStock})`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Convert form data to TransfertStock format
      const transfertData: Omit<TransfertStock, 'id' | 'numero' | 'dateCreation' | 'createdAt'> = {
        storeSourceId: formData.storeSourceId,
        storeSource: mockStores.find(s => s.id === formData.storeSourceId)!,
        storeDestinationId: formData.storeDestinationId,
        storeDestination: mockStores.find(s => s.id === formData.storeDestinationId)!,
        lignes: formData.lignes.map(l => ({
          id: `ligne-${Date.now()}-${Math.random()}`,
          transfertId: '', // Will be set by the service
          productId: l.productId,
          product: getProduct(l.productId)!,
          quantiteEnvoyee: l.quantiteEnvoyee
        })),
        status: 'en_transit',
        createdBy: 'user-1',
        commentaires: formData.commentaires
      };

      const result = await createTransfert(transfertData);
      
      if (result) {
        onSuccess?.(result);
      }
    } catch (error) {
      console.error('Erreur lors de la création du transfert:', error);
      setErrors({ submit: 'Erreur lors de la création du transfert' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get available products for the source store
  const availableProducts = mockProducts.filter(product => {
    const stockLevel = product.stockLevels.find(sl => sl.storeId === formData.storeSourceId);
    return stockLevel && stockLevel.availableQuantity > 0;
  });

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ArrowRight className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Nouveau Transfert</h2>
              <p className="text-sm text-gray-600">Créer un transfert entre magasins</p>
            </div>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Store Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="h-4 w-4 inline mr-1" />
              Magasin Source
            </label>
            <select
              value={formData.storeSourceId}
              onChange={(e) => setFormData(prev => ({ ...prev, storeSourceId: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.storeSourceId ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={userRole === 'manager'} // Managers can only transfer from their store
            >
              <option value="">Sélectionner un magasin</option>
              {mockStores.map(store => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
            {errors.storeSourceId && (
              <p className="mt-1 text-sm text-red-600">{errors.storeSourceId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="h-4 w-4 inline mr-1" />
              Magasin Destination
            </label>
            <select
              value={formData.storeDestinationId}
              onChange={(e) => setFormData(prev => ({ ...prev, storeDestinationId: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.storeDestinationId ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Sélectionner un magasin</option>
              {mockStores
                .filter(store => store.id !== formData.storeSourceId)
                .map(store => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
            </select>
            {errors.storeDestinationId && (
              <p className="mt-1 text-sm text-red-600">{errors.storeDestinationId}</p>
            )}
          </div>
        </div>

        {/* Product Selection */}
        {formData.storeSourceId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Package className="h-4 w-4 inline mr-1" />
              Ajouter un produit
            </label>
            <div className="flex gap-2">
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.selectedProduct ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionner un produit</option>
                {availableProducts.map(product => {
                  const stockLevel = product.stockLevels.find(sl => sl.storeId === formData.storeSourceId);
                  return (
                    <option key={product.id} value={product.id}>
                      {product.name} (Stock: {stockLevel?.availableQuantity || 0})
                    </option>
                  );
                })}
              </select>
              <button
                type="button"
                onClick={addLigne}
                disabled={!selectedProduct}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Ajouter
              </button>
            </div>
            {errors.selectedProduct && (
              <p className="mt-1 text-sm text-red-600">{errors.selectedProduct}</p>
            )}
          </div>
        )}

        {/* Transfer Lines */}
        {formData.lignes.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Produits à transférer</h3>
            <div className="space-y-3">
              {formData.lignes.map((ligne) => {
                const product = getProduct(ligne.productId);
                const availableStock = getAvailableStock(ligne.productId, formData.storeSourceId);
                
                return (
                  <div key={ligne.tempId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{product?.name}</h4>
                      <p className="text-sm text-gray-600">Stock disponible: {availableStock}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">Quantité:</label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateQuantite(ligne.tempId, ligne.quantiteEnvoyee - 1)}
                          className="p-1 text-gray-500 hover:text-gray-700 rounded"
                          disabled={ligne.quantiteEnvoyee <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={availableStock}
                          value={ligne.quantiteEnvoyee}
                          onChange={(e) => updateQuantite(ligne.tempId, parseInt(e.target.value) || 0)}
                          className={`w-20 px-2 py-1 text-center border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors[`ligne-${ligne.tempId}-quantite`] ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => updateQuantite(ligne.tempId, ligne.quantiteEnvoyee + 1)}
                          className="p-1 text-gray-500 hover:text-gray-700 rounded"
                          disabled={ligne.quantiteEnvoyee >= availableStock}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeLigne(ligne.tempId)}
                      className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    {errors[`ligne-${ligne.tempId}-quantite`] && (
                      <div className="absolute mt-12 text-sm text-red-600">
                        {errors[`ligne-${ligne.tempId}-quantite`]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {errors.lignes && (
              <p className="mt-2 text-sm text-red-600">{errors.lignes}</p>
            )}
          </div>
        )}

        {/* Comments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Commentaires (optionnel)
          </label>
          <textarea
            value={formData.commentaires}
            onChange={(e) => setFormData(prev => ({ ...prev, commentaires: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ajouter des commentaires sur ce transfert..."
          />
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-red-800">{errors.submit}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {isSubmitting || loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Création...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Créer le transfert
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};