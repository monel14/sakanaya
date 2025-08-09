import React, { useState, useEffect } from 'react';
import { PayrollSummary as PayrollSummaryType } from '../types';
import { useSalaryManagement } from '@/shared/hooks/useEmployees';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
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
  Button
} from '@/components/ui';
import { FileText, Download, TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';

interface PayrollSummaryProps {
  stores: Array<{ id: string; name: string }>;
}

interface StorePayrollData extends PayrollSummaryType {
  storeName: string;
  previousMonthCost?: number;
  costChange?: number;
  costChangePercent?: number;
}

export const PayrollReport: React.FC<PayrollSummaryProps> = ({ stores }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [payrollData, setPayrollData] = useState<StorePayrollData[]>([]);
  const [loading, setLoading] = useState(false);

  const { calculatePayroll } = useSalaryManagement();

  useEffect(() => {
    loadPayrollData();
  }, [selectedMonth, selectedYear]);

  const loadPayrollData = async () => {
    setLoading(true);
    try {
      const data: StorePayrollData[] = [];
      
      for (const store of stores) {
        // Calculate current month payroll
        const currentPayroll = await calculatePayroll(store.id, selectedMonth, selectedYear);
        
        // Calculate previous month for comparison
        let previousMonth = selectedMonth - 1;
        let previousYear = selectedYear;
        if (previousMonth === 0) {
          previousMonth = 12;
          previousYear = selectedYear - 1;
        }
        
        const previousPayroll = await calculatePayroll(store.id, previousMonth, previousYear);
        
        const costChange = currentPayroll.totalCost - previousPayroll.totalCost;
        const costChangePercent = previousPayroll.totalCost > 0 
          ? (costChange / previousPayroll.totalCost) * 100 
          : 0;
        
        data.push({
          ...currentPayroll,
          storeName: store.name,
          previousMonthCost: previousPayroll.totalCost,
          costChange,
          costChangePercent
        });
      }
      
      setPayrollData(data);
    } catch (error) {
      console.error('Error loading payroll data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`;
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

  // Calculate totals
  const totalEmployees = payrollData.reduce((sum, store) => sum + store.employeeCount, 0);
  const totalBaseSalary = payrollData.reduce((sum, store) => sum + store.totalBaseSalary, 0);
  const totalAdjustments = payrollData.reduce((sum, store) => sum + store.totalAdjustments, 0);
  const totalCost = payrollData.reduce((sum, store) => sum + store.totalCost, 0);
  const totalPreviousCost = payrollData.reduce((sum, store) => sum + (store.previousMonthCost || 0), 0);
  const totalChange = totalCost - totalPreviousCost;
  const totalChangePercent = totalPreviousCost > 0 ? (totalChange / totalPreviousCost) * 100 : 0;

  const handleExportReport = () => {
    // In a real application, this would generate and download a PDF or Excel report
    const reportData = {
      period: `${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`,
      stores: payrollData,
      totals: {
        totalEmployees,
        totalBaseSalary,
        totalAdjustments,
        totalCost,
        totalChange,
        totalChangePercent
      }
    };
    
    console.log('Exporting payroll report:', reportData);
    // Here you would typically call an API to generate the report
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Rapport de Masse Salariale
          </CardTitle>
          
          {/* Period Selection and Export */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
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
            
            <Button onClick={handleExportReport} disabled={loading}>
              <Download className="h-4 w-4 mr-2" />
              Exporter le Rapport
            </Button>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8 text-slate-500">
              Chargement des données de masse salariale...
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Employés</p>
                    <p className="text-2xl font-bold">{totalEmployees}</p>
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
                    <p className="text-2xl font-bold">{formatCurrency(totalBaseSalary)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Coût Total</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalCost)}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Évolution</p>
                    <p className={`text-2xl font-bold ${totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(totalChangePercent)}
                    </p>
                  </div>
                  {totalChange >= 0 ? (
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  ) : (
                    <TrendingDown className="h-8 w-8 text-red-600" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Table */}
          <Card>
            <CardHeader>
              <CardTitle>Détail par Magasin</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Magasin</TableHead>
                    <TableHead>Employés</TableHead>
                    <TableHead>Salaires de Base</TableHead>
                    <TableHead>Ajustements</TableHead>
                    <TableHead>Coût Total</TableHead>
                    <TableHead>Mois Précédent</TableHead>
                    <TableHead>Évolution</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollData.map((store) => (
                    <TableRow key={store.storeId}>
                      <TableCell className="font-medium">
                        {store.storeName}
                      </TableCell>
                      <TableCell>
                        {store.employeeCount}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(store.totalBaseSalary)}
                      </TableCell>
                      <TableCell>
                        <span className={store.totalAdjustments >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {store.totalAdjustments >= 0 ? '+' : ''}{formatCurrency(store.totalAdjustments)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-blue-600">
                          {formatCurrency(store.totalCost)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(store.previousMonthCost || 0)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {(store.costChange || 0) >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <span className={(store.costChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatPercent(store.costChangePercent || 0)}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};