import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button
} from '@/components/ui';
import { useProductCatalog } from '../hooks/useProductCatalog';
import { Product } from '../../sales/types';

const ProductEditSchema = z.object({
  name: z.string().min(1, 'Le nom du produit est requis'),
  category: z.string().min(1, 'La catégorie est requise'),
  unit: z.enum(['kg', 'pack', 'unit']),
  unitPrice: z.number().positive('Le prix doit être positif'),
  priceType: z.enum(['fixed', 'variable'])
});

type ProductEditFormData = z.infer<typeof ProductEditSchema>;

interface ProductEditFormProps {
  product: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ProductEditForm: React.FC<ProductEditFormProps> = ({
  product,
  onSuccess,
  onCancel
}) => {
  const { 
    updateProduct, 
    categories, 
    loading 
  } = useProductCatalog();

  const form = useForm<ProductEditFormData>({
    resolver: zodResolver(ProductEditSchema),
    defaultValues: {
      name: product.name,
      category: product.category,
      unit: product.unit as 'kg' | 'pack' | 'unit',
      unitPrice: product.unitPrice,
      priceType: product.priceType
    }
  });

  const activeCategories = categories.filter(cat => cat.isActive);

  const onSubmit = async (data: ProductEditFormData) => {
    try {
      await updateProduct(product.id, data);
      onSuccess();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
          <div className="text-sm text-slate-600">
            <strong>ID:</strong> {product.id}
          </div>
          <div className="text-sm text-slate-600">
            <strong>Créé le:</strong> {product.createdAt.toLocaleDateString()}
          </div>
          <div className="text-sm text-slate-600">
            <strong>Statut:</strong> {product.isActive ? 'Actif' : 'Inactif'}
          </div>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du produit</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Thon Rouge" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {activeCategories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unité de vente</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner l'unité" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="kg">Kilogramme (kg)</SelectItem>
                  <SelectItem value="pack">Pack</SelectItem>
                  <SelectItem value="unit">Unité</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unitPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prix unitaire (CFA)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Ex: 6500" 
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type de prix</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="variable">Variable (prix quotidien)</SelectItem>
                  <SelectItem value="fixed">Fixe</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Mise à jour...' : 'Mettre à jour'}
          </Button>
        </div>
      </form>
    </Form>
  );
};