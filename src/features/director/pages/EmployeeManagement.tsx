import React, { useState } from 'react';
import { useEmployees, useSalaryManagement } from '../../../shared/hooks/useEmployees';
import { useNotifications } from '../../../context/NotificationContext';

interface EmployeeManagementProps {
  user: any;
}

export const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ user }) => {
  const { addNotification } = useNotifications();
  const [selectedStore, setSelectedStore] = useState('all');
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [newSalary, setNewSalary] = useState('');

  const {
    employees,
    loading,
    error,
    updateEmployee,
    createEmployee,
    deactivateEmployee
  } = useEmployees();

  const {
    updateSalary,
    addSalaryAdjustment,
    calculateMonthlyCost,
    loading: salaryLoading
  } = useSalaryManagement();

  const stores = [
    { id: 'all', name: 'Tous les magasins' },
    { id: 'store-1', name: 'Magasin Principal' },
    { id: 'store-2', name: 'Magasin Secondaire' },
  ];

  const filteredEmployees = selectedStore === 'all' 
    ? employees 
    : employees.filter(e => e.storeId === selectedStore);

  const handleUpdateSalary = async (employee: any) => {
    setSelectedEmployee(employee);
    setNewSalary(employee.salary.toString());
    setShowSalaryModal(true);
  };

  const handleSalarySubmit = async () => {
    if (!selectedEmployee || !newSalary) {
      addNotification({
        type: 'error',
        title: 'Champ requis',
        message: 'Veuillez saisir le nouveau salaire'
      });
      return;
    }

    try {
      await updateSalary(selectedEmployee.id, parseFloat(newSalary));
      setShowSalaryModal(false);
      addNotification({
        type: 'success',
        title: 'Salaire mis à jour',
        message: `Salaire de ${selectedEmployee.firstName} ${selectedEmployee.lastName} mis à jour`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de mettre à jour le salaire'
      });
    }
  };

  const handleDeactivateEmployee = async (employee: any) => {
    const confirm = window.confirm(`Êtes-vous sûr de vouloir désactiver ${employee.firstName} ${employee.lastName} ?`);
    if (!confirm) return;

    try {
      await deactivateEmployee(employee.id);
      addNotification({
        type: 'success',
        title: 'Employé désactivé',
        message: `${employee.firstName} ${employee.lastName} a été désactivé`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de désactiver l\'employé'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement des employés...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Erreur: {error}</p>
      </div>
    );
  }

  const getRoleLabel = (role: string) => {
    const labels = {
      manager: 'Manager',
      seller: 'Vendeur',
      preparer: 'Préparateur'
    };
    return labels[role as keyof typeof labels] || role;
  };

  const calculateMonthlySalaryCost = (storeId: string) => {
    const storeEmployees = employees.filter(e => e.storeId === storeId && e.isActive);
    return storeEmployees.reduce((total, emp) => total + emp.salary, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Gestion des Employés
        </h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Nouvel Employé
        </button>
      </div>

      {/* Statistiques RH */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Employés Actifs
          </h3>
          <p className="text-3xl font-bold text-blue-600">{employees.filter(e => e.isActive).length}</p>
          <p className="text-sm text-gray-500">Total réseau</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Masse Salariale
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {employees.filter(e => e.isActive).reduce((total, emp) => total + emp.salary, 0).toLocaleString()} CFA
          </p>
          <p className="text-sm text-gray-500">Mensuelle totale</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Coût Moyen
          </h3>
          <p className="text-3xl font-bold text-purple-600">
            {Math.round(employees.filter(e => e.isActive).reduce((total, emp) => total + emp.salary, 0) / employees.filter(e => e.isActive).length).toLocaleString()} CFA
          </p>
          <p className="text-sm text-gray-500">Par employé</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Magasin:</label>
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {stores.map(store => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Masse salariale par magasin */}
      {selectedStore === 'all' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Masse Salariale par Magasin
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900">Magasin Principal</h3>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {calculateMonthlySalaryCost('store-1').toLocaleString()} CFA
              </p>
              <p className="text-sm text-gray-500">
                {employees.filter(e => e.storeId === 'store-1' && e.isActive).length} employés
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900">Magasin Secondaire</h3>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {calculateMonthlySalaryCost('store-2').toLocaleString()} CFA
              </p>
              <p className="text-sm text-gray-500">
                {employees.filter(e => e.storeId === 'store-2' && e.isActive).length} employés
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Liste des employés */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Magasin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {employee.firstName} {employee.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getRoleLabel(employee.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.storeName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {employee.salary.toLocaleString()} CFA
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      employee.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        Modifier
                      </button>
                      <button 
                        onClick={() => handleUpdateSalary(employee)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Salaire
                      </button>
                      <button 
                        onClick={() => handleDeactivateEmployee(employee)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Désactiver
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de mise à jour du salaire */}
      {showSalaryModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Mettre à jour le salaire - {selectedEmployee.firstName} {selectedEmployee.lastName}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salaire actuel: {selectedEmployee.salary.toLocaleString()} CFA
                </label>
                <input
                  type="number"
                  value={newSalary}
                  onChange={(e) => setNewSalary(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nouveau salaire"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSalaryModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSalarySubmit}
                disabled={salaryLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {salaryLoading ? 'Mise à jour...' : 'Mettre à jour'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};