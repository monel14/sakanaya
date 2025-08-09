import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Minus,
  Save,
  FileText,
  Calendar,
  User,
  Package,
  DollarSign,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { BonReception, Supplier, LigneReception } from '../../types';

// Schema de validation pour le formulaire
const BonReceptionFormSchema = z.object({
  dateReception: z.string().min(1, 'Date de réception requise'),
  supplierName: z.string().min(1, 'Nom du fournisseur requis'),
  storeId: z.string().min(1, 'Magasin requis'),
  commentaires: z.string().optional(),
  lignes: z.array(z.object({
    productId: z.string().min(1, 'Produit requis'),
    quantiteRecue: z.number().positive('Quantité doit être positive'),
    coutUnitaire: z.number().positive('Coût unitaire doit être positif')
  })).min(1, 'Au moins une ligne de produit est requise')
});

type BonReceptionFormData = z.infer<typeof BonReceptionFormSchema>;

interface BonReceptionFormProps {
  suppliers: Supplier[];
  onSave: (bon: Partial<BonReception>) => void;
  onCancel: () => void;
  initialData?: Partial<BonReception>;
  isEditing?: boolean;
}

// Mock products - dans une vraie app, ceci viendrait d'un service
const mockProducts = [
  { id: 'prod-1', name: 'Saumon frais', category: 'Poissons', unit: 'kg', price: 8000 },
  { id: 'prod-2', name: 'Thon rouge', category: 'Poissons', unit: 'kg', price: 7500 },
  { id: 'prod-3', name: 'Crevettes', category: 'Crustacés', unit: 'pack', price: 5000 },
  { id: 'prod-4', name: 'Sole', category: 'Poissons', unit: 'kg', price: 9000 },
  { id: 'prod-5', name: 'Dorade', category: 'Poissons', unit: 'kg', price: 6500 }
];

const mockStores = [
  { id: 'store-1', name: 'Magasin Principal' },
  { id: 'store-2', name: 'Succursale Plateau' },
  { id: 'store-3', name: 'Succursale Almadies' }
];

export const BonReceptionForm: React.FC<BonReceptionFormProps> = ({
  suppliers,
  onSave,
  onCancel,
  initialData,
  isEditing = false
}) => {
  const [isDraft, setIsDraft] = useState(false);
  const [totalValue, setTotalValue] = useState(0);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<BonReceptionFormData>({
    resolver: zodResolver(BonReceptionFormSchema),
    defaultValues: {
      dateReception: new Date().toISOString().split('T')[0],
      supplierName: '',
      storeId: '',
      commentaires: '',
      lignes: [{ productId: '', quantiteRecue: 0, coutUnitaire: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lignes'
  });

  const watchedLignes = watch('lignes');

  // Calcul automatique du total
  useEffect(() => {
    const total = watchedLignes.reduce((sum, ligne) => {
      const sousTotal = (ligne.quantiteRecue || 0) * (ligne.coutUnitaire || 0);
      return sum + sousTotal;
    }, 0);
    setTotalValue(total);
  }, [watchedLignes]);

  const generateBonNumber = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 9999) + 1;
    return `BR-${year}-${randomNum.toString().padStart(4, '0')}`;
  };

  const getProductById = (productId: string) => {
    return mockProducts.find(p => p.id === productId);
  };

  const getStoreById = (storeId: string) => {
    return mockStores.find(s => s.id === storeId);
  };

  const onSubmit = async (data: BonReceptionFormData, saveAsDraft = false) => {
    setIsDraft(saveAsDraft);

    // Créer les lignes avec les données complètes
    const lignes: LigneReception[] = data.lignes.map((ligne, index) => {
      const product = getProductById(ligne.productId);
      const sousTotal = ligne.quantiteRecue * ligne.coutUnitaire;
      
      return {
        id: `ligne-${index + 1}`,
        bonReceptionId: '', // Sera rempli après création du bon
        productId: ligne.productId,
        product: product!,
        quantiteRecue: ligne.quantiteRecue,
        coutUnitaire: ligne.coutUnitaire,
        sousTotal
      };
    });

    // Créer le bon de réception
    const bon: Partial<BonReception> = {
      numero: generateBonNumber(),
      dateReception: new Date(data.dateReception),
      supplierId: 'temp-supplier-id', // Dans une vraie app, on créerait le fournisseur s'il n'existe pas
      supplier: {
        id: 'temp-supplier-id',
        name: data.supplierName,
        isActive: true,
        createdAt: new Date(),
        createdBy: 'current-user'
      },
      storeId: data.storeId,
      store: getStoreById(data.storeId)!,
      lignes,
      totalValue,
      status: saveAsDraft ? 'draft' : 'validated',
      createdBy: 'current-user',
      createdAt: new Date(),
      commentaires: data.commentaires
    };

    if (!saveAsDraft) {
      bon.validatedBy = 'current-user';
      bon.validatedAt = new Date();
    }

    onSave(bon);
  };

  const handleSaveAsDraft = () => {
    handleSubmit((data) => onSubmit(data, true))();
  };

  const handleValidate = () => {
    handleSubmit((data) => onSubmit(data, false))();
  };

  const addLigne = () => {
    append({ productId: '', quantiteRecue: 0, coutUnitaire: 0 });
  };

  const removeLigne = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Modifier le Bon de Réception' : 'Nouveau Bon de Réception'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Enregistrement d'un arrivage fournisseur avec coûts d'achat
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Numéro (auto-généré)</p>
            <p className="text-lg font-semibold text-gray-900">{generateBonNumber()}</p>
          </div>
        </div>
      </div>

      <form className="space-y-6">
        {/* Section 1: Informations Générales */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-gray-400" />
            Informations Générales
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de Réception *
              </label>
              <input
                type="date"
                {...register('dateReception')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.dateReception && (
                <p className="text-red-600 text-sm mt-1">{errors.dateReception.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du Fournisseur *
              </label>
              <input
                type="text"
                placeholder="Ex: Pêcherie Atlantique"
                {...register('supplierName')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.supplierName && (
                <p className="text-red-600 text-sm mt-1">{errors.supplierName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Magasin de Réception *
              </label>
              <select
                {...register('storeId')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner un magasin</option>
                {mockStores.map(store => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
              {errors.storeId && (
                <p className="text-red-600 text-sm mt-1">{errors.storeId.message}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Commentaires (optionnel)
            </label>
            <textarea
              rows={3}
              placeholder="Commentaires sur la livraison..."
              {...register('commentaires')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Section 2: Lignes de Produits */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Package className="w-5 h-5 mr-2 text-gray-400" />
              Lignes de Produits
            </h3>
            <button
              type="button"
              onClick={addLigne}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une ligne
            </button>
          </div>

          {errors.lignes && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                <p className="text-red-600 text-sm">{errors.lignes.message}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {fields.map((field, index) => {
              const ligne = watchedLignes[index];
              const sousTotal = (ligne?.quantiteRecue || 0) * (ligne?.coutUnitaire || 0);
              const product = ligne?.productId ? getProductById(ligne.productId) : null;

              return (
                <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900">
                      Ligne {index + 1}
                    </h4>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLigne(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Produit *
                      </label>
                      <select
                        {...register(`lignes.${index}.productId`)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Sélectionner</option>
                        {mockProducts.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({product.unit})
                          </option>
                        ))}
                      </select>
                      {errors.lignes?.[index]?.productId && (
                        <p className="text-red-600 text-xs mt-1">
                          {errors.lignes[index]?.productId?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantité Reçue *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="0.0"
                        {...register(`lignes.${index}.quantiteRecue`, {
                          valueAsNumber: true
                        })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {product && (
                        <p className="text-xs text-gray-500 mt-1">Unité: {product.unit}</p>
                      )}
                      {errors.lignes?.[index]?.quantiteRecue && (
                        <p className="text-red-600 text-xs mt-1">
                          {errors.lignes[index]?.quantiteRecue?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Coût Unitaire (CFA) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...register(`lignes.${index}.coutUnitaire`, {
                          valueAsNumber: true
                        })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors.lignes?.[index]?.coutUnitaire && (
                        <p className="text-red-600 text-xs mt-1">
                          {errors.lignes[index]?.coutUnitaire?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sous-Total
                      </label>
                      <div className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="font-medium text-gray-900">
                            {formatCurrency(sousTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total Général */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-end">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <DollarSign className="w-6 h-6 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Général</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatCurrency(totalValue)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Annuler
            </button>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleSaveAsDraft}
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting && isDraft ? 'Sauvegarde...' : 'Sauvegarder en brouillon'}
              </button>

              <button
                type="button"
                onClick={handleValidate}
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <FileText className="w-4 h-4 mr-2" />
                {isSubmitting && !isDraft ? 'Validation...' : 'Valider le bon'}
              </button>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            <p>
              <strong>Brouillon :</strong> Sauvegarde temporaire, peut être modifié ultérieurement
            </p>
            <p>
              <strong>Validation :</strong> Finalise le bon et met à jour automatiquement les stocks
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BonReceptionForm;