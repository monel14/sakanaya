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
  Textarea,
  Checkbox,
  Button
} from '../../../shared/components/ui';
import { useUserManagement } from '../hooks/useUserManagement';
import { UserWithEmployee } from '../types';

const TemporaryAccessSchema = z.object({
  expiresAt: z.string().refine((date) => {
    const selectedDate = new Date(date);
    return selectedDate > new Date();
  }, 'La date d\'expiration doit être dans le futur'),
  permissions: z.array(z.string()).min(1, 'Au moins une permission est requise'),
  reason: z.string().min(1, 'La raison est requise')
});

type TemporaryAccessFormData = z.infer<typeof TemporaryAccessSchema>;

interface TemporaryAccessFormProps {
  user: UserWithEmployee;
  onSuccess: () => void;
  onCancel: () => void;
}

const availablePermissions = [
  { id: 'sales_view', label: 'Consulter les ventes' },
  { id: 'sales_edit', label: 'Modifier les ventes' },
  { id: 'stock_view', label: 'Consulter les stocks' },
  { id: 'stock_edit', label: 'Modifier les stocks' },
  { id: 'hr_view', label: 'Consulter les RH' },
  { id: 'hr_edit', label: 'Modifier les RH' },
  { id: 'reports_view', label: 'Consulter les rapports' },
  { id: 'admin_view', label: 'Accès administration' }
];

export const TemporaryAccessForm: React.FC<TemporaryAccessFormProps> = ({
  user,
  onSuccess,
  onCancel
}) => {
  const { grantTemporaryAccess, loading } = useUserManagement();

  const form = useForm<TemporaryAccessFormData>({
    resolver: zodResolver(TemporaryAccessSchema),
    defaultValues: {
      expiresAt: '',
      permissions: [],
      reason: ''
    }
  });

  const onSubmit = async (data: TemporaryAccessFormData) => {
    try {
      await grantTemporaryAccess({
        userId: user.id,
        grantedBy: 'current-user', // In real app, this would be the current user's ID
        expiresAt: new Date(data.expiresAt),
        permissions: data.permissions,
        reason: data.reason,
        isActive: true
      });
      onSuccess();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  // Generate default expiration date (24 hours from now)
  const getDefaultExpirationDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 16); // Format for datetime-local input
  };

  React.useEffect(() => {
    form.setValue('expiresAt', getDefaultExpirationDate());
  }, [form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
          <div className="text-sm text-slate-600">
            <strong>Utilisateur:</strong> {user.name} (@{user.username})
          </div>
        </div>

        <FormField
          control={form.control}
          name="expiresAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date d'expiration</FormLabel>
              <FormControl>
                <Input 
                  type="datetime-local"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="permissions"
          render={() => (
            <FormItem>
              <FormLabel>Permissions temporaires</FormLabel>
              <div className="space-y-2">
                {availablePermissions.map((permission) => (
                  <FormField
                    key={permission.id}
                    control={form.control}
                    name="permissions"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={permission.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(permission.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, permission.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== permission.id
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            {permission.label}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Raison de l'accès temporaire</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Ex: Remplacement temporaire, formation, urgence..."
                  rows={3}
                  {...field} 
                />
              </FormControl>
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
            {loading ? 'Octroi...' : 'Octroyer l\'accès'}
          </Button>
        </div>
      </form>
    </Form>
  );
};