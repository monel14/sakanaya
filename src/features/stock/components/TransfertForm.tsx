import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Save, X, Trash2, Truck, AlertTriangle } from 'lucide-react';
import { useTransferts } from '../hooks/useTransferts';
import { CreateTransfertData } from '../services/transfertService';

// Schema pour une ligne de transfert
const LigneTransfertSchema = z.object({
  productId: z.string().min(1, 'Produit requis'),
  quantiteEnvoyee: z.number().positive('La quantité doit être positive')
});

// Schema pour le transfert complet
const TransfertSchema = z.object({
  storeSourceId: z.string().min(1, 'Magasin source requis'),
  storeDestinationId: z.string().min(1, 'Magasin destination requis'),
  lignes: z.array(LigneTransfertSchema).min(1, 'Au moins une ligne de produit est requise'),
  commentaires: z.string().optional()
}).refine((data) => data.storeSourceId !== data.storeDestinationId, {
  message: "Le magasin source et destination doivent être différents",
  path: ["storeDestinationId"]
});

type TransfertFormData = z.infer<typeof TransfertSchema>;
// type LigneTransfertData = z.infer<typeof LigneTransfertSchema>;

interface TransfertFormProps {
  onTransfertCreated?: (transfert: any) => void;
  onCancel?: () => void;
  defaultSourceStoreId?: string;
}

export const TransfertForm: React.FC<TransfertFormProps> = ({
  onTransfertCreated,
  onCancel,
  defaultSourceStoreId
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { 
    stores, 
    products, 
    getStockLevel, 
    createTransfert 
  } = useTransferts();

  const form = useForm<TransfertFormData>({
    resolver: zodResolver(TransfertSchema),
    defaultValues: {
      storeSourceId: defaultSourceStoreId || '',
      storeDestinationId: '',
      lignes: [
        {
          productId: '',
          quantiteEnvoyee: 0
        }
      ],
      commentaires: ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lignes'
  });

  const watchedStoreSourceId = form.watch('storeSourceId');
  const watchedLignes = form.watch('lignes');

  const onSubmit = async (data: TransfertFormData) => {
    setIsSubmitting(true);

    try {
      // Préparer les données pour le service
      const createData: CreateTransfertData = {
        storeSourceId: data.storeSourceId,
        storeDestinationId: data.storeDestinationId,
        lignes: data.lignes.map(ligne => ({
          productId: ligne.productId,
          quantiteEnvoyee: ligne.quantiteEnvoyee
        })),
        commentaires: data.commentaires
      };

      // Créer le transfert
      const transfert = await createTransfert(createData, 'current-user-id'); // TODO: Get from auth context

      onTransfertCreated?.(transfert);
      
      // Reset form
      form.reset({
        storeSourceId: defaultSourceStoreId || '',
        storeDestinationId: '',
        lignes: [
          {
            productId: '',
            quantiteEnvoyee: 0
          }
        ],
        commentaires: ''
      });
      
      alert(`Transfert ${transfert.numero} créé avec succès !`);
    } catch (error) {
      console.error('Erreur lors de la création du transfert:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création du transfert';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addLigne = () => {
    append({
      productId: '',
      quantiteEnvoyee: 0
    });
  };

  const removeLigne = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  // const getProductName = (productId: string) => {
  //   const product = products.find(p => p.id === productId);
  //   return product ? `${product.name} (${product.unit})` : '';
  // };

  const getAvailableStock = (productId: string): number => {
    if (!watchedStoreSourceId || !productId) return 0;
    const stockLevel = getStockLevel(watchedStoreSourceId, productId);
    return stockLevel?.availableQuantity || 0;
  };

  const isStockSufficient = (productId: string, requestedQuantity: number): boolean => {
    const availableStock = getAvailableStock(productId);
    return availableStock >= requestedQuantity;
  };

  const getTotalQuantity = (): number => {
    return watchedLignes.reduce((total, ligne) => total + (ligne.quantiteEnvoyee || 0), 0);
  };

  const getDestinationStores = () => {
    return stores.filter(store => store.id !== watchedStoreSourceId);
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-green-600 text-white px-6 py-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Truck className="h-6 w-6" />
            <div>
              <h1 className="text-xl font-bold">Nouveau Transfert Inter-Magasins</h1>
              <p className="text-green-100 text-sm">Transfert de marchandises entre magasins</p>
            </div>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-green-100 hover:text-white"
              disabled={isSubmitting}
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
        {/* Section 1: Informations Générales */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📋 Informations du Transfert</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Magasin source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Magasin source *
              </label>
              <select
                {...form.register('storeSourceId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={isSubmitting}
              >
                <option value="">Sélectionner le magasin source</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.storeSourceId && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.storeSourceId.message}</p>
              )}
            </div>

            {/* Magasin destination */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Magasin destination *
              </label>
              <select
                {...form.register('storeDestinationId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={isSubmitting || !watchedStoreSourceId}
              >
                <option value="">Sélectionner le magasin destination</option>
                {getDestinationStores().map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.storeDestinationId && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.storeDestinationId.message}</p>
              )}
              {!watchedStoreSourceId && (
                <p className="mt-1 text-sm text-gray-500">Sélectionnez d'abord le magasin source</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Lignes de Produits */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">📦 Produits à Transférer</h2>
            <button
              type="button"
              onClick={addLigne}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm flex items-center space-x-2"
              disabled={isSubmitting || !watchedStoreSourceId}
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter une ligne</span>
            </button>
          </div>

          {!watchedStoreSourceId && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                <p className="text-sm text-yellow-700">
                  Sélectionnez d'abord le magasin source pour voir les produits disponibles.
                </p>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produit *
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock disponible
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantité à transférer *
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {fields.map((field, index) => {
                  const selectedProductId = watchedLignes[index]?.productId;
                  const requestedQuantity = watchedLignes[index]?.quantiteEnvoyee || 0;
                  const availableStock = getAvailableStock(selectedProductId);
                  const stockSufficient = isStockSufficient(selectedProductId, requestedQuantity);

                  return (
                    <tr key={field.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <select
                          {...form.register(`lignes.${index}.productId`)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          disabled={isSubmitting || !watchedStoreSourceId}
                        >
                          <option value="">Sélectionner un produit</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} ({product.unit})
                            </option>
                          ))}
                        </select>
                        {form.formState.errors.lignes?.[index]?.productId && (
                          <p className="mt-1 text-sm text-red-600">
                            {form.formState.errors.lignes[index]?.productId?.message}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className={`px-3 py-2 rounded-md text-center font-medium ${
                          selectedProductId 
                            ? availableStock > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {selectedProductId ? availableStock.toLocaleString('fr-FR') : '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          {...form.register(`lignes.${index}.quantiteEnvoyee`, { valueAsNumber: true })}
                          type="number"
                          step="0.1"
                          min="0"
                          max={availableStock}
                          placeholder="0.0"
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                            selectedProductId && requestedQuantity > 0 && !stockSufficient
                              ? 'border-red-300 bg-red-50'
                              : 'border-gray-300'
                          }`}
                          disabled={isSubmitting || !selectedProductId}
                        />
                        {selectedProductId && requestedQuantity > 0 && !stockSufficient && (
                          <p className="mt-1 text-sm text-red-600">
                            Stock insuffisant (disponible: {availableStock})
                          </p>
                        )}
                        {form.formState.errors.lignes?.[index]?.quantiteEnvoyee && (
                          <p className="mt-1 text-sm text-red-600">
                            {form.formState.errors.lignes[index]?.quantiteEnvoyee?.message}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLigne(index)}
                            className="text-red-600 hover:text-red-800"
                            disabled={isSubmitting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {form.formState.errors.lignes && (
            <p className="mt-2 text-sm text-red-600">{form.formState.errors.lignes.message}</p>
          )}
        </div>

        {/* Résumé du transfert */}
        {getTotalQuantity() > 0 && (
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total des quantités :</span>
              <span className="text-2xl font-bold text-green-600">
                {getTotalQuantity().toLocaleString('fr-FR')} unités
              </span>
            </div>
          </div>
        )}

        {/* Commentaires */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Commentaires (optionnel)
          </label>
          <textarea
            {...form.register('commentaires')}
            rows={3}
            placeholder="Commentaires sur le transfert..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            disabled={isSubmitting}
          />
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              disabled={isSubmitting}
            >
              Annuler
            </button>
          )}
          
          <button
            type="submit"
            className="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Création...
              </div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2 inline" />
                Créer le transfert
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransfertForm;