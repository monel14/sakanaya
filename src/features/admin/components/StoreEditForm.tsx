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
} from '../../../shared/components/ui';
import { useStoreManagement } from '../hooks/useStoreManagement';
import { Store } from '../../../shared/types';

const StoreEditSchema = z.object({
  name: z.string().min(1, 'Le nom du magasin est requis'),
  address: z.string().min(1, 'L\'adresse est requise'),
  phone: z.string().min(1, 'Le téléphone est requis'),
  managerId: z.string().optional()
});

type StoreEditFormData = z.infer<typeof StoreEditSchema>;

interface StoreEditFormProps {
  store: Store;
  onSuccess: () => void;
  onCancel: () => void;
}

export const StoreEditForm: React.FC<StoreEditFormProps> = ({
  store,
  onSuccess,
  onCancel
}) => {
  const { 
    updateStore, 
    availableManagers, 
    loading 
  } = useStoreManagement();

  const form = useForm<StoreEditFormData>({
    resolver: zodResolver(StoreEditSchema),
    defaultValues: {
      name: store.name,
      address: store.address,
      phone: store.phone,
      managerId: store.managerId || ''
    }
  });

  // Include current manager in the list if they're already assigned
  const availableManagersWithCurrent = store.managerId
    ? [...availableManagers, { id: store.managerId, name: 'Manager Actuel', username: 'current' }]
    : availableManagers;

  const onSubmit = async (data: StoreEditFormData) => {
    try {
      await updateStore(store.id, {
        name: data.name,
        address: data.address,
        phone: data.phone,
        managerId: data.managerId || undefined
      });
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
            <strong>Type:</strong> {store.type === 'hub' ? 'Entrepôt' : 'Magasin'}
          </div>
          <div className="text-sm text-slate-600">
            <strong>Créé le:</strong> {store.createdAt.toLocaleDateString()}
          </div>
        </div>

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
              <FormLabel>Manager</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un manager" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Aucun manager</SelectItem>
                  {availableManagersWithCurrent.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.name} {manager.username !== 'current' && `(@${manager.username})`}
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
            {loading ? 'Mise à jour...' : 'Mettre à jour'}
          </Button>
        </div>
      </form>
    </Form>
  );
};