import React, { useState, useEffect } from 'react';
import { Employee, PayrollSummary, SalaryAdjustment } from '../types';
import { useSalaryManagement } from '../../../shared/hooks/useEmployees';
import { SalaryAdjustmentForm } from './SalaryAdjustmentForm';
import { SalaryAdjustmentHistory } from './SalaryAdjustmentHistory';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge
} from '../../../shared/components/ui';
import { DollarSign, TrendingUp, Users, Calculator, Plus, History } from 'lucide-react';

interface SalaryManagementProps {
  storeId: string;
  employees: Employee[];
  currentUserId: string;
}

export const SalaryManagement: React.FC<SalaryManagementProps> = ({ storeId, employees, currentUserId }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [payrollSummary, setPayrollSummary] = useState<PayrollSummary | null>(null);
  const [editingSalary, setEditingSalary] = useState<{ employeeId: string; newSalary: string } | null>(null);
  const [adjustmentFormOpen, setAdjustmentFormOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<{ id: string; name: string } | null>(null);

  const { 
    loading, 
    updateSalary, 
    calculatePayroll,
    addSalaryAdjustment
  } = useSalaryManagement();

  // Load payroll summary when month/year changes
  useEffect(() => {
    const loadPayrollSummary = async () => {
      try {
        const summary = await calculatePayroll(storeId, selectedMonth, selectedYear);
        setPayrollSummary(summary);
      } catch (error) {
        console.error('Error loading payroll summary:', error);
      }
    };

    loadPayrollSummary();
  }, [storeId, selectedMonth, selectedYear, calculatePayroll]);

  const handleSalaryUpdate = async (employeeId: string, newSalary: number) => {
    try {
      await updateSalary(employeeId, newSalary);
      setEditingSalary(null);
      
      // Refresh payroll summary
      const summary = await calculatePayroll(storeId, selectedMonth, selectedYear);
      setPayrollSummary(summary);
    } catch (error) {
      console.error('Error updating salary:', error);
    }
  };

  const handleAddAdjustment = (employee: Employee) => {
    setSelectedEmployee({ id: employee.id, name: `${employee.firstName} ${employee.lastName}` });
    setAdjustmentFormOpen(true);
  };

  const handleShowHistory = (employee: Employee) => {
    setSelectedEmployee({ id: employee.id, name: `${employee.firstName} ${employee.lastName}` });
    setHistoryDialogOpen(true);
  };

  const handleAdjustmentSubmit = async (adjustmentData: Omit<SalaryAdjustment, 'id' | 'createdAt'>) => {
    try {
      await addSalaryAdjustment(adjustmentData);
      setAdjustmentFormOpen(false);
      setSelectedEmployee(null);
      
      // Refresh payroll summary
      const summary = await calculatePayroll(storeId, selectedMonth, selectedYear);
      setPayrollSummary(summary);
    } catch (error) {
      console.error('Error adding adjustment:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const months = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  const activeEmployees = employees.filter(emp => emp.isActive && emp.status === 'active');

  return (
    <div className="space-y-6">
      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Gestion des Salaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Période:</label>
              <Select 
                value={selectedMonth.toString()} 
                onValueChange={(value) => setSelectedMonth(parseInt(value))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={selectedYear.toString()} 
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Summary */}
      {payrollSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Employés Actifs</p>
                  <p className="text-2xl font-bold">{payrollSummary.employeeCount}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Salaires de Base</p>
                  <p className="text-2xl font-bold">{formatCurrency(payrollSummary.totalBaseSalary)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Ajustements</p>
                  <p className="text-2xl font-bold">{formatCurrency(payrollSummary.totalAdjustments)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Coût Total</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(payrollSummary.totalCost)}</p>
                </div>
                <Calculator className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Employee Salary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Salaires des Employés</CardTitle>
        </CardHeader>
        <CardContent>
          {activeEmployees.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Aucun employé actif trouvé
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employé</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Salaire Mensuel</TableHead>
                  <TableHead>Jours de Travail</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      {employee.firstName} {employee.lastName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {employee.role === 'seller' ? 'Vendeur' : 
                         employee.role === 'manager' ? 'Responsable' : 'Préparateur'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {editingSalary?.employeeId === employee.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={editingSalary.newSalary}
                            onChange={(e) => setEditingSalary({
                              employeeId: employee.id,
                              newSalary: e.target.value
                            })}
                            className="w-32"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSalaryUpdate(employee.id, parseInt(editingSalary.newSalary))}
                            disabled={loading}
                          >
                            ✓
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingSalary(null)}
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span>{formatCurrency(employee.salary)}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingSalary({
                              employeeId: employee.id,
                              newSalary: employee.salary.toString()
                            })}
                          >
                            Modifier
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {employee.workDays.length} jours/semaine
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        employee.status === 'active' ? 'bg-green-100 text-green-800' :
                        employee.status === 'leave' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {employee.status === 'active' ? 'Actif' :
                         employee.status === 'leave' ? 'En congé' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAddAdjustment(employee)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Ajustement
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleShowHistory(employee)}
                        >
                          <History className="h-4 w-4 mr-1" />
                          Historique
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Salary Adjustment Form */}
      {selectedEmployee && (
        <SalaryAdjustmentForm
          employeeId={selectedEmployee.id}
          employeeName={selectedEmployee.name}
          isOpen={adjustmentFormOpen}
          onClose={() => {
            setAdjustmentFormOpen(false);
            setSelectedEmployee(null);
          }}
          onSubmit={handleAdjustmentSubmit}
          currentUserId={currentUserId}
        />
      )}

      {/* Salary Adjustment History */}
      {selectedEmployee && (
        <SalaryAdjustmentHistory
          employeeId={selectedEmployee.id}
          employeeName={selectedEmployee.name}
          isOpen={historyDialogOpen}
          onClose={() => {
            setHistoryDialogOpen(false);
            setSelectedEmployee(null);
          }}
        />
      )}
    </div>
  );
};