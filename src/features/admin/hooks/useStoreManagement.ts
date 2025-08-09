import { useState, useEffect } from 'react';
import { storeManagementService } from '../services/storeManagementService';
import { Store } from '../../../shared/types';
import { Employee } from '../../hr/types';
import { User } from '../../auth/types';

interface StoreCreationRequest {
  name: string;
  address: string;
  phone: string;
  type: 'hub' | 'retail';
  managerId?: string;
}

interface StoreUpdateRequest {
  name?: string;
  address?: string;
  phone?: string;
  managerId?: string;
  isActive?: boolean;
}

export const useStoreManagement = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [availableManagers, setAvailableManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStores = async () => {
    try {
      setLoading(true);
      setError(null);
      const storesData = await storeManagementService.getAllStores();
      setStores(storesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des magasins');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableEmployees = async () => {
    try {
      const employees = await storeManagementService.getAvailableEmployees();
      setAvailableEmployees(employees);
    } catch (err) {
      console.error('Erreur lors du chargement des employés disponibles:', err);
    }
  };

  const loadAvailableManagers = async () => {
    try {
      const managers = await storeManagementService.getAvailableManagers();
      setAvailableManagers(managers);
    } catch (err) {
      console.error('Erreur lors du chargement des managers disponibles:', err);
    }
  };

  const createStore = async (request: StoreCreationRequest) => {
    try {
      setLoading(true);
      setError(null);
      await storeManagementService.createStore(request);
      await loadStores();
      await loadAvailableManagers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du magasin';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateStore = async (id: string, updates: StoreUpdateRequest) => {
    try {
      setLoading(true);
      setError(null);
      await storeManagementService.updateStore(id, updates);
      await loadStores();
      await loadAvailableManagers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du magasin';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deactivateStore = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await storeManagementService.deactivateStore(id);
      await loadStores();
      await loadAvailableManagers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la désactivation du magasin';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const activateStore = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await storeManagementService.activateStore(id);
      await loadStores();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'activation du magasin';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const assignEmployeeToStore = async (employeeId: string, storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      await storeManagementService.assignEmployeeToStore(employeeId, storeId);
      await loadStores();
      await loadAvailableEmployees();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'assignation de l\'employé';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const removeEmployeeFromStore = async (employeeId: string, storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      await storeManagementService.removeEmployeeFromStore(employeeId, storeId);
      await loadStores();
      await loadAvailableEmployees();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'assignation';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const assignUserToStore = async (userId: string, storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      await storeManagementService.assignUserToStore(userId, storeId);
      await loadStores();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'assignation de l\'utilisateur';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const removeUserFromStore = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      await storeManagementService.removeUserFromStore(userId);
      await loadStores();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'assignation utilisateur';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStoreEmployees = async (storeId: string): Promise<Employee[]> => {
    try {
      return await storeManagementService.getStoreEmployees(storeId);
    } catch (err) {
      console.error('Erreur lors du chargement des employés du magasin:', err);
      return [];
    }
  };

  const getStoreUsers = async (storeId: string): Promise<User[]> => {
    try {
      return await storeManagementService.getStoreUsers(storeId);
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs du magasin:', err);
      return [];
    }
  };

  const getStoreStatistics = async () => {
    try {
      return await storeManagementService.getStoreStatistics();
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      return {
        totalStores: 0,
        activeStores: 0,
        inactiveStores: 0,
        storesByType: { hub: 0, retail: 0 }
      };
    }
  };

  useEffect(() => {
    loadStores();
    loadAvailableEmployees();
    loadAvailableManagers();
  }, []);

  return {
    stores,
    availableEmployees,
    availableManagers,
    loading,
    error,
    createStore,
    updateStore,
    deactivateStore,
    activateStore,
    assignEmployeeToStore,
    removeEmployeeFromStore,
    assignUserToStore,
    removeUserFromStore,
    getStoreEmployees,
    getStoreUsers,
    getStoreStatistics,
    refreshData: () => {
      loadStores();
      loadAvailableEmployees();
      loadAvailableManagers();
    }
  };
};