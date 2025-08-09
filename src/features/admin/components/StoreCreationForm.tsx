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
import { useStoreManagement } from '../hooks/useStoreManagement';

const StoreCreationSchema = z.object({
  name: z.string().min(1, 'Le nom du magasin est requis'),
  address: z.string().min(1, 'L\'adresse est requise'),
  phone: z.string().min(1, 'Le téléphone est requis'),
  type: z.enum(['hub', 'retail']),
  managerId: z.string().optional()
});

type StoreCreationFormData = z.infer<typeof StoreCreationSchema>;

interface StoreCreationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const StoreCreationForm: React.FC<StoreCreationFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const { 
    createStore, 
    availableManagers, 
    loading 
  } = useStoreManagement();

  const form = useForm<StoreCreationFormData>({
    resolver: zodResolver(StoreCreationSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      type: 'retail',
      managerId: undefined
    }
  });

  const onSubmit = async (data: StoreCreationFormData) => {
    try {
      await createStore(data);
      onSuccess();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du magasin</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Poissonnerie Centre-Ville" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="retail">Magasin</SelectItem>
                  <SelectItem value="hub">Entrepôt</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 123 Rue de la Paix, Dakar" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Téléphone</FormLabel>
              <FormControl>
                <Input placeholder="Ex: +221 33 123 45 67" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="managerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Manager (optionnel)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un manager" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Aucun manager</SelectItem>
                  {availableManagers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.name} (@{manager.username})
                    </SelectItem>
                  ))}
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
            {loading ? 'Création...' : 'Créer le magasin'}
          </Button>
        </div>
      </form>
    </Form>
  );
};