import React, { useState } from 'react';
import { UserPlus, Users, DollarSign, FileText, Calculator } from 'lucide-react';
import { Button, Card, CardContent } from '../../../shared/components/ui';
import { EmployeeForm } from './EmployeeForm';
import { EmployeeList } from './EmployeeList';
import { SalaryManagement } from './SalaryManagement';
import { PayrollReport } from './PayrollSummary';
import { MonthlyCostCalculator } from './MonthlyCostCalculator';
import { useEmployees } from '../../../shared/hooks/useEmployees';
import { Employee } from '../types';
import { useAuth } from '../../auth/hooks/useAuth';

// Mock stores data - in a real app, this would come from a store service
const mockStores = [
  { id: 'store-1', name: 'Poissonnerie Centre-Ville' },
  { id: 'store-2', name: 'Poissonnerie Marché' },
  { id: 'store-3', name: 'Poissonnerie Plateau' }
];

type HRTab = 'employees' | 'salaries' | 'reports' | 'calculator';

export const HRManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<HRTab>('employees');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  // Load employees based on user role
  const storeId = currentUser?.role === 'manager' ? currentUser.store : undefined;
  const { 
    employees, 
    loading, 
    createEmployee, 
    updateEmployee, 
    deactivateEmployee, 
    deleteEmployee 
  } = useEmployees(storeId);

  const handleCreateEmployee = async (employeeData: Omit<Employee, 'id'>) => {
    await createEmployee(employeeData);
    setIsFormOpen(false);
  };

  const handleUpdateEmployee = async (employeeData: Omit<Employee, 'id'>) => {
    if (editingEmployee) {
      await updateEmployee(editingEmployee.id, employeeData);
      setEditingEmployee(null);
      setIsFormOpen(false);
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const handleDeactivateEmployee = async (id: string) => {
    await deactivateEmployee(id);
  };

  const handleDeleteEmployee = async (id: string) => {
    await deleteEmployee(id);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingEmployee(null);
  };

  const tabs = [
    { id: 'employees' as HRTab, label: 'Employés', icon: Users },
    { id: 'salaries' as HRTab, label: 'Salaires', icon: DollarSign },
    { id: 'reports' as HRTab, label: 'Rapports', icon: FileText },
    { id: 'calculator' as HRTab, label: 'Calculateur', icon: Calculator }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'employees':
        return (
          <EmployeeList
            employees={employees}
            onEdit={handleEditEmployee}
            onDeactivate={handleDeactivateEmployee}
            onDelete={handleDeleteEmployee}
            loading={loading}
          />
        );
      
      case 'salaries':
        return (
          <SalaryManagement
            storeId={storeId || 'all'}
            employees={employees}
            currentUserId={currentUser?.id || ''}
          />
        );
      
      case 'reports':
        return <PayrollReport stores={mockStores} />;
      
      case 'calculator':
        return <MonthlyCostCalculator stores={mockStores} />;
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Ressources Humaines</h1>
        {activeTab === 'employees' && (
          <Button onClick={() => setIsFormOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Nouvel Employé
          </Button>
        )}
      </div>

      {/* Tab Navigation */}
      <Card>
        <CardContent className="p-0">
          <div className="flex border-b">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Employee Form Modal */}
      <EmployeeForm
        employee={editingEmployee || undefined}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingEmployee ? handleUpdateEmployee : handleCreateEmployee}
        stores={mockStores}
      />
    </div>
  );
};