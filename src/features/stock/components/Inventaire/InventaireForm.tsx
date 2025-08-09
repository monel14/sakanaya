import React, { useState } from 'react';
import { Calendar, Package, Store, MessageSquare, Plus } from 'lucide-react';
import { CreateInventaireData } from '../../shared/services/inventaireService';

interface Store {
  id: string;
  name: string;
}

interface InventaireFormProps {
  stores: Store[];
  currentUserStoreId?: string; // For managers, restrict to their store
  onSubmit: (data: CreateInventaireData) => Promise<void>;
  loading?: boolean;
}

export const InventaireForm: React.FC<InventaireFormProps> = ({
  stores,
  currentUserStoreId,
  onSubmit,
  loading = false
}) => {
  const [formData, setFormData] = useState<CreateInventaireData>({
    date: new Date(),
    storeId: currentUserStoreId || '',
    commentaires: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.storeId) {
      newErrors.storeId = 'Le magasin est requis';
    }

    if (!formData.date) {
      newErrors.date = 'La date est requise';
    } else if (formData.date > new Date()) {
      newErrors.date = 'La date ne peut pas être dans le futur';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Erreur lors de la création de l\'inventaire:', error);
    }
  };

  const handleInputChange = (field: keyof CreateInventaireData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Filter stores based on user role
  const availableStores = currentUserStoreId 
    ? stores.filter(store => store.id === currentUserStoreId)
    : stores;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Package className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Nouvel Inventaire Physique
          </h2>
          <p className="text-sm text-gray-600">
            Initier un nouveau comptage de stock
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Calendar className="h-4 w-4" />
            Date de l'inventaire
          </label>
          <input
            type="date"
            value={formData.date.toISOString().split('T')[0]}
            onChange={(e) => handleInputChange('date', new Date(e.target.value))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.date ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date}</p>
          )}
        </div>

        {/* Store Selection */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Store className="h-4 w-4" />
            Magasin
          </label>
          <select
            value={formData.storeId}
            onChange={(e) => handleInputChange('storeId', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.storeId ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading || !!currentUserStoreId} // Disable if user is restricted to one store
          >
            <option value="">Sélectionner un magasin</option>
            {availableStores.map(store => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
          {errors.storeId && (
            <p className="mt-1 text-sm text-red-600">{errors.storeId}</p>
          )}
          {currentUserStoreId && (
            <p className="mt-1 text-sm text-gray-500">
              Vous ne pouvez créer des inventaires que pour votre magasin
            </p>
          )}
        </div>

        {/* Comments */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <MessageSquare className="h-4 w-4" />
            Commentaires (optionnel)
          </label>
          <textarea
            value={formData.commentaires || ''}
            onChange={(e) => handleInputChange('commentaires', e.target.value)}
            placeholder="Ajouter des commentaires sur cet inventaire..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Information</p>
              <p>
                L'inventaire sera créé avec tous les produits actuellement en stock dans le magasin sélectionné. 
                Vous pourrez ensuite saisir les quantités physiques comptées.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Création...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Créer l'Inventaire
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};