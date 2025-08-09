import React, { useState, useEffect } from 'react';
import { UserPlus, UserMinus, Users } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge
} from '../../../shared/components/ui';
import { useStoreManagement } from '../hooks/useStoreManagement';
import { Store } from '../../../shared/types';
import { Employee } from '../../hr/types';

interface StoreEmployeeManagementProps {
  store: Store;
  onClose: () => void;
}

export const StoreEmployeeManagement: React.FC<StoreEmployeeManagementProps> = ({
  store,
  onClose
}) => {
  const {
    availableEmployees,
    assignEmployeeToStore,
    removeEmployeeFromStore,
    getStoreEmployees,
    loading
  } = useStoreManagement();

  const [storeEmployees, setStoreEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

  const loadStoreEmployees = async () => {
    try {
      const employees = await getStoreEmployees(store.id);
      setStoreEmployees(employees);
    } catch (err) {
      console.error('Erreur lors du chargement des employés:', err);
    }
  };

  useEffect(() => {
    loadStoreEmployees();
  }, [store.id]);

  const handleAssignEmployee = async () => {
    if (!selectedEmployeeId) return;
    
    try {
      await assignEmployeeToStore(selectedEmployeeId, store.id);
      await loadStoreEmployees();
      setSelectedEmployeeId('');
    } catch (err) {
      console.error('Erreur lors de l\'assignation:', err);
    }
  };

  const handleRemoveEmployee = async (employeeId: string) => {
    try {
      await removeEmployeeFromStore(employeeId, store.id);
      await loadStoreEmployees();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'manager':
        return 'bg-purple-100 text-purple-800';
      case 'seller':
        return 'bg-blue-100 text-blue-800';
      case 'preparer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'manager':
        return 'Manager';
      case 'seller':
        return 'Vendeur';
      case 'preparer':
        return 'Préparateur';
      default:
        return role;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'leave':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'leave':
        return 'Congé';
      case 'inactive':
        return 'Inactif';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Employee Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="h-5 w-5 mr-2" />
            Assigner un Employé
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Sélectionner un employé disponible" />
              </SelectTrigger>
              <SelectContent>
                {availableEmployees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName} ({getRoleLabel(employee.role)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleAssignEmployee}
              disabled={!selectedEmployeeId || loading}
            >
              Assigner
            </Button>
          </div>
          
          {availableEmployees.length === 0 && (
            <div className="text-sm text-slate-500 mt-2">
              Aucun employé disponible pour assignation
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Employees Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Employés Assignés ({storeEmployees.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {storeEmployees.length > 0 ? (
            <div className="space-y-3">
              {storeEmployees.map((employee) => (
                <div 
                  key={employee.id}
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">
                      {employee.firstName} {employee.lastName}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getRoleBadgeColor(employee.role)}>
                        {getRoleLabel(employee.role)}
                      </Badge>
                      <Badge className={getStatusBadgeColor(employee.status)}>
                        {getStatusLabel(employee.status)}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      Salaire: {employee.salary.toLocaleString()} CFA
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveEmployee(employee.id)}
                    disabled={loading}
                    title="Retirer du magasin"
                  >
                    <UserMinus className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500">
              Aucun employé assigné à ce magasin
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onClose}>
          Fermer
        </Button>
      </div>
    </div>
  );
};