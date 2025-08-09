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
import { useUserManagement } from '../hooks/useUserManagement';
import { UserWithEmployee } from '../types';

const UserEditSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  employeeId: z.string().optional(),
  storeId: z.string().optional()
});

type UserEditFormData = z.infer<typeof UserEditSchema>;

interface UserEditFormProps {
  user: UserWithEmployee;
  onSuccess: () => void;
  onCancel: () => void;
}

export const UserEditForm: React.FC<UserEditFormProps> = ({
  user,
  onSuccess,
  onCancel
}) => {
  const { 
    updateUser, 
    unassociatedEmployees, 
    stores, 
    loading 
  } = useUserManagement();

  const form = useForm<UserEditFormData>({
    resolver: zodResolver(UserEditSchema),
    defaultValues: {
      name: user.name,
      employeeId: user.employeeId || '',
      storeId: user.store || ''
    }
  });

  // Include current employee in the list if they're already associated
  const availableEmployees = user.employeeId && user.employee
    ? [user.employee, ...unassociatedEmployees]
    : unassociatedEmployees;

  const onSubmit = async (data: UserEditFormData) => {
    try {
      await updateUser(user.id, {
        name: data.name,
        employeeId: data.employeeId || undefined,
        store: data.storeId || undefined
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
            <strong>Utilisateur:</strong> @{user.username}
          </div>
          <div className="text-sm text-slate-600">
            <strong>Rôle:</strong> {user.role === 'director' ? 'Directeur' : 'Magasin'}
          </div>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom complet</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Jean Dupont" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="employeeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employé associé</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un employé" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Aucun employé</SelectItem>
                  {availableEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName} ({employee.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {user.role === 'manager' && (
          <FormField
            control={form.control}
            name="storeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Magasin assigné</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un magasin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Tous les magasins</SelectItem>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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