import { useState, useEffect } from 'react';
import { Employee, SalaryAdjustment, PayrollSummary } from '../../features/hr/types';
import { employeeService } from '../services/employeeService';

export const useEmployees = (storeId?: string) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = storeId 
        ? await employeeService.getByStore(storeId)
        : await employeeService.getAll();
      
      setEmployees(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des employés';
      setError(errorMessage);
      console.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [storeId]);

  const createEmployee = async (employeeData: Omit<Employee, 'id'>) => {
    try {
      const newEmployee = await employeeService.create(employeeData);
      setEmployees(prev => [...prev, newEmployee]);
      return newEmployee;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création';
      console.error(errorMessage);
      throw err;
    }
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      const updatedEmployee = await employeeService.update(id, updates);
      setEmployees(prev => prev.map(emp => emp.id === id ? updatedEmployee : emp));
      return updatedEmployee;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      console.error(errorMessage);
      throw err;
    }
  };

  const deactivateEmployee = async (id: string) => {
    try {
      const updatedEmployee = await employeeService.deactivate(id);
      setEmployees(prev => prev.map(emp => emp.id === id ? updatedEmployee : emp));
      return updatedEmployee;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la désactivation';
      console.error(errorMessage);
      throw err;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      await employeeService.delete(id);
      setEmployees(prev => prev.filter(emp => emp.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      console.error(errorMessage);
      throw err;
    }
  };

  return {
    employees,
    loading,
    error,
    createEmployee,
    updateEmployee,
    deactivateEmployee,
    deleteEmployee,
    refetch: loadEmployees
  };
};

export const useSalaryManagement = () => {
  const [loading, setLoading] = useState(false);

  const updateSalary = async (employeeId: string, newSalary: number) => {
    try {
      setLoading(true);
      const updatedEmployee = await employeeService.updateSalary(employeeId, newSalary);
      return updatedEmployee;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du salaire';
      console.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addSalaryAdjustment = async (adjustment: Omit<SalaryAdjustment, 'id' | 'createdAt'>) => {
    try {
      setLoading(true);
      const newAdjustment = await employeeService.addSalaryAdjustment(adjustment);
      return newAdjustment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout de l\'ajustement';
      console.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyCost = async (storeId: string, month: number, year: number) => {
    try {
      setLoading(true);
      return await employeeService.calculateMonthlyCost(storeId, month, year);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du calcul des coûts';
      console.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const calculatePayroll = async (storeId: string, month: number, year: number): Promise<PayrollSummary> => {
    try {
      setLoading(true);
      return await employeeService.calculatePayroll(storeId, month, year);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du calcul de la masse salariale';
      console.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSalaryAdjustments = async (employeeId: string): Promise<SalaryAdjustment[]> => {
    try {
      return await employeeService.getSalaryAdjustments(employeeId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des ajustements';
      console.error(errorMessage);
      throw err;
    }
  };

  return {
    loading,
    updateSalary,
    addSalaryAdjustment,
    calculateMonthlyCost,
    calculatePayroll,
    getSalaryAdjustments
  };
};