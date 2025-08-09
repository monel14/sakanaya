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
  Button
} from '@/components/ui';
import { useUserManagement } from '../hooks/useUserManagement';
import { UserWithEmployee } from '../types';

const PasswordResetSchema = z.object({
  newPassword: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string().min(6, 'Confirmation requise'),
  reason: z.string().optional()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

type PasswordResetFormData = z.infer<typeof PasswordResetSchema>;

interface PasswordResetFormProps {
  user: UserWithEmployee;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PasswordResetForm: React.FC<PasswordResetFormProps> = ({
  user,
  onSuccess,
  onCancel
}) => {
  const { resetPassword, loading } = useUserManagement();

  const form = useForm<PasswordResetFormData>({
    resolver: zodResolver(PasswordResetSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
      reason: ''
    }
  });

  const onSubmit = async (data: PasswordResetFormData) => {
    try {
      await resetPassword({
        userId: user.id,
        newPassword: data.newPassword,
        resetBy: 'current-user', // In real app, this would be the current user's ID
        reason: data.reason
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
            <strong>Utilisateur:</strong> {user.name} (@{user.username})
          </div>
        </div>

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nouveau mot de passe</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="Minimum 6 caractères" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmer le mot de passe</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="Retaper le mot de passe" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Raison (optionnel)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Ex: Mot de passe oublié, demande de l'utilisateur..."
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
            {loading ? 'Réinitialisation...' : 'Réinitialiser'}
          </Button>
        </div>
      </form>
    </Form>
  );
};