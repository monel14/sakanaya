import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Save, Trash2 } from 'lucide-react';
import { simpleBonReceptionService, CreateSimpleBonReceptionData } from '../services/simpleBonReceptionService';

// Schema pour une ligne de réception
const LigneReceptionSchema = z.object({
  productId: z.string().min(1, 'Produit requis'),
  quantiteRecue: z.number().positive('La quantité doit être positive'),
  coutUnitaire: z.number().positive('Le coût unitaire doit être positif'),
  sousTotal: z.number().min(0, 'Le sous-total ne peut pas être négatif')
});

// Schema pour le bon de réception complet
const BonReceptionSchema = z.object({
  dateReception: z.string().min(1, 'Date de réception requise'),
  nomFournisseur: z.string().min(1, 'Nom du fournisseur requis'),
  storeId: z.string().min(1, 'Magasin requis'),
  lignes: z.array(LigneReceptionSchema).min(1, 'Au moins une ligne de produit est requise'),
  commentaires: z.string().optional()
});

type BonReceptionFormData = z.infer<typeof BonReceptionSchema>;

interface BonReceptionFormInlineProps {
  storeId: string;
  onBonCreated?: (bon: any) => void;
  onCancel?: () => void;
}

// Mock products - in real app this would come from a service
const mockProducts = [
  { id: 'prod-1', name: 'Saumon frais', unit: 'kg' },
  { id: 'prod-2', name: 'Thon rouge', unit: 'kg' },
  { id: 'prod-3', name: 'Crevettes', unit: 'pack' },
  { id: 'prod-4', name: 'Sole', unit: 'kg' },
  { id: 'prod-5', name: 'Dorade', unit: 'kg' },
  { id: 'prod-6', name: 'Cabillaud', unit: 'kg' },
  { id: 'prod-7', name: 'Sardines', unit: 'kg' },
  { id: 'prod-8', name: 'Maquereau', unit: 'kg' }
];

// Mock stores
const mockStores = [
  { id: 'store-1', name: 'Magasin Central' },
  { id: 'store-2', name: 'Magasin Plateau' },
  { id: 'store-3', name: 'Magasin Parcelles' }
];

export const BonReceptionFormInline: React.FC<BonReceptionFormInlineProps> = ({
  storeId,
  onBonCreated,
  onCancel
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  const form = useForm<BonReceptionFormData>({
    resolver: zodResolver(BonReceptionSchema),
    defaultValues: {
      dateReception: new Date().toISOString().split('T')[0],
      nomFournisseur: '',
      storeId: storeId,
      lignes: [
        {
          productId: '',
          quantiteRecue: 0,
          coutUnitaire: 0,
          sousTotal: 0
        }
      ],
      commentaires: ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lignes'
  });

  const watchedLignes = form.watch('lignes');

  // Calcul automatique du sous-total pour chaque ligne
  React.useEffect(() => {
    watchedLignes.forEach((ligne, index) => {
      const sousTotal = ligne.quantiteRecue * ligne.coutUnitaire;
      if (ligne.sousTotal !== sousTotal) {
        form.setValue(`lignes.${index}.sousTotal`, sousTotal);
      }
    });
  }, [watchedLignes, form]);

  // Calcul du total général
  const totalGeneral = watchedLignes.reduce((total, ligne) => total + ligne.sousTotal, 0);

  const onSubmit = async (data: BonReceptionFormData, saveAsDraft = false) => {
    setIsSubmitting(true);
    setIsDraft(saveAsDraft);

    try {
      // Préparer les données pour le service
      const createData: CreateSimpleBonReceptionData = {
        dateReception: new Date(data.dateReception),
        nomFournisseur: data.nomFournisseur,
        storeId: data.storeId,
        lignes: data.lignes.map(ligne => ({
          productId: ligne.productId,
          quantiteRecue: ligne.quantiteRecue,
          coutUnitaire: ligne.coutUnitaire
        })),
        commentaires: data.commentaires
      };

      // Créer le bon de réception
      const bonReception = await simpleBonReceptionService.createBonReception(
        createData,
        'current-user-id', // TODO: Get from auth context
        mockProducts,
        mockStores
      );

      // Si pas en brouillon, valider immédiatement
      if (!saveAsDraft) {
        await simpleBonReceptionService.validateBonReception(
          bonReception.id,
          'current-user-id' // TODO: Get from auth context
        );
      }

      onBonCreated?.(bonReception);
      
      // Reset form
      form.reset({
        dateReception: new Date().toISOString().split('T')[0],
        nomFournisseur: '',
        storeId: storeId,
        lignes: [
          {
            productId: '',
            quantiteRecue: 0,
            coutUnitaire: 0,
            sousTotal: 0
          }
        ],
        commentaires: ''
      });
      
      alert(`Bon de réception ${bonReception.numero} ${saveAsDraft ? 'sauvegardé en brouillon' : 'validé'} avec succès !`);
    } catch (error) {
      console.error('Erreur lors de la création du bon:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création du bon de réception';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
      setIsDraft(false);
    }
  };

  const addLigne = () => {
    append({
      productId: '',
      quantiteRecue: 0,
      coutUnitaire: 0,
      sousTotal: 0
    });
  };

  const removeLigne = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <form onSubmit={form.handleSubmit((data) => onSubmit(data, false))} className="space-y-6">
      {/* Section 1: Informations Générales */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4">Informations Générales</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date de réception */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de réception *
            </label>
            <input
              {...form.register('dateReception')}
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            />
            {form.formState.errors.dateReception && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.dateReception.message}</p>
            )}
          </div>

          {/* Nom du fournisseur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du fournisseur *
            </label>
            <input
              {...form.register('nomFournisseur')}
              type="text"
              placeholder="Ex: Pêcherie Atlantique"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            />
            {form.formState.errors.nomFournisseur && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.nomFournisseur.message}</p>
            )}
          </div>

          {/* Magasin de réception */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Magasin de réception *
            </label>
            <select
              {...form.register('storeId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            >
              <option value="">Sélectionner un magasin</option>
              {mockStores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
            {form.formState.errors.storeId && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.storeId.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Lignes de Produits */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-gray-900">Lignes de Produits</h4>
          <button
            type="button"
            onClick={addLigne}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm flex items-center space-x-2"
            disabled={isSubmitting}
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter une ligne</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit *
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité reçue *
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coût unitaire (CFA) *
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sous-total (CFA)
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {fields.map((field, index) => (
                <tr key={field.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <select
                      {...form.register(`lignes.${index}.productId`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isSubmitting}
                    >
                      <option value="">Sélectionner un produit</option>
                      {mockProducts.map((product) => (
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
                    <input
                      {...form.register(`lignes.${index}.quantiteRecue`, { valueAsNumber: true })}
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="0.0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isSubmitting}
                    />
                    {form.formState.errors.lignes?.[index]?.quantiteRecue && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.lignes[index]?.quantiteRecue?.message}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      {...form.register(`lignes.${index}.coutUnitaire`, { valueAsNumber: true })}
                      type="number"
                      step="1"
                      min="0"
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isSubmitting}
                    />
                    {form.formState.errors.lignes?.[index]?.coutUnitaire && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.lignes[index]?.coutUnitaire?.message}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="px-3 py-2 bg-gray-100 rounded-md text-right font-medium">
                      {watchedLignes[index]?.sousTotal?.toLocaleString('fr-FR') || '0'} CFA
                    </div>
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
              ))}
            </tbody>
          </table>
        </div>

        {form.formState.errors.lignes && (
          <p className="mt-2 text-sm text-red-600">{form.formState.errors.lignes.message}</p>
        )}
      </div>

      {/* Total général */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Total général du bon :</span>
          <span className="text-2xl font-bold text-blue-600">
            {totalGeneral.toLocaleString('fr-FR')} CFA
          </span>
        </div>
      </div>

      {/* Commentaires */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Commentaires (optionnel)
        </label>
        <textarea
          {...form.register('commentaires')}
          rows={3}
          placeholder="Commentaires sur la réception..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isSubmitting}
        />
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            Annuler
          </button>
        )}
        
        <button
          type="button"
          onClick={form.handleSubmit((data) => onSubmit(data, true))}
          className="px-6 py-2 text-sm font-medium text-gray-700 bg-yellow-100 border border-yellow-300 rounded-md shadow-sm hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          disabled={isSubmitting}
        >
          {isDraft ? 'Sauvegarde...' : 'Sauvegarder en brouillon'}
        </button>
        
        <button
          type="submit"
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting && !isDraft ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Validation...
            </div>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2 inline" />
              Valider le bon de réception
            </>
          )}
        </button>
      </div>
    </form>
  );
};