import { useState, useEffect } from 'react';
import { userManagementService } from '../services/userManagementService';
import { 
  UserWithEmployee, 
  UserCreationRequest, 
  PasswordResetRequest, 
  TemporaryAccess 
} from '../types';
import { Employee } from '../../hr/types';
import { Store } from '../../../shared/types';

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserWithEmployee[]>([]);
  const [unassociatedEmployees, setUnassociatedEmployees] = useState<Employee[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [temporaryAccesses, setTemporaryAccesses] = useState<TemporaryAccess[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersData = await userManagementService.getAllUsers();
      setUsers(usersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const loadUnassociatedEmployees = async () => {
    try {
      const employees = await userManagementService.getUnassociatedEmployees();
      setUnassociatedEmployees(employees);
    } catch (err) {
      console.error('Erreur lors du chargement des employés:', err);
    }
  };

  const loadStores = async () => {
    try {
      const storesData = await userManagementService.getStores();
      setStores(storesData);
    } catch (err) {
      console.error('Erreur lors du chargement des magasins:', err);
    }
  };

  const loadTemporaryAccesses = async () => {
    try {
      const accesses = await userManagementService.getTemporaryAccesses();
      setTemporaryAccesses(accesses);
    } catch (err) {
      console.error('Erreur lors du chargement des accès temporaires:', err);
    }
  };

  const createUser = async (request: UserCreationRequest) => {
    try {
      setLoading(true);
      setError(null);
      await userManagementService.createUser(request);
      await loadUsers();
      await loadUnassociatedEmployees();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de l\'utilisateur';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: string, updates: Partial<UserWithEmployee>) => {
    try {
      setLoading(true);
      setError(null);
      await userManagementService.updateUser(id, updates);
      await loadUsers();
      await loadUnassociatedEmployees();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'utilisateur';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deactivateUser = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await userManagementService.deactivateUser(id);
      await loadUsers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la désactivation de l\'utilisateur';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const activateUser = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await userManagementService.activateUser(id);
      await loadUsers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'activation de l\'utilisateur';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (request: PasswordResetRequest) => {
    try {
      setLoading(true);
      setError(null);
      await userManagementService.resetPassword(request);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la réinitialisation du mot de passe';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const grantTemporaryAccess = async (access: Omit<TemporaryAccess, 'id' | 'createdAt'>) => {
    try {
      setLoading(true);
      setError(null);
      await userManagementService.grantTemporaryAccess(access);
      await loadTemporaryAccesses();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'octroi de l\'accès temporaire';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const revokeTemporaryAccess = async (accessId: string) => {
    try {
      setLoading(true);
      setError(null);
      await userManagementService.revokeTemporaryAccess(accessId);
      await loadTemporaryAccesses();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la révocation de l\'accès temporaire';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadUnassociatedEmployees();
    loadStores();
    loadTemporaryAccesses();
  }, []);

  return {
    users,
    unassociatedEmployees,
    stores,
    temporaryAccesses,
    loading,
    error,
    createUser,
    updateUser,
    deactivateUser,
    activateUser,
    resetPassword,
    grantTemporaryAccess,
    revokeTemporaryAccess,
    refreshData: () => {
      loadUsers();
      loadUnassociatedEmployees();
      loadStores();
      loadTemporaryAccesses();
    }
  };
};