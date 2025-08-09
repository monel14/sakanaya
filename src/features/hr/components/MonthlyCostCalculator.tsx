import React, { useState, useEffect } from 'react';
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
  TableRow
} from '@/components/ui';
import { Calculator, TrendingUp, TrendingDown } from 'lucide-react';

interface MonthlyCostCalculatorProps {
  stores: Array<{ id: string; name: string }>;
}

interface StoreCost {
  storeId: string;
  storeName: string;
  currentCost: number;
  previousCost: number;
  change: number;
  changePercent: number;
}

export const MonthlyCostCalculator: React.FC<MonthlyCostCalculatorProps> = ({ stores }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [storeCosts, setStoreCosts] = useState<StoreCost[]>([]);
  const [loading, setLoading] = useState(false);

  const { calculateMonthlyCost } = useSalaryManagement();

  useEffect(() => {
    const calculateAllStoreCosts = async () => {
      setLoading(true);
      try {
        const costs: StoreCost[] = [];
        
        for (const store of stores) {
          // Calculate current month cost
          const currentCost = await calculateMonthlyCost(store.id, selectedMonth, selectedYear);
          
          // Calculate previous month cost for comparison
          let previousMonth = selectedMonth - 1;
          let previousYear = selectedYear;
          if (previousMonth === 0) {
            previousMonth = 12;
            previousYear = selectedYear - 1;
          }
          
          const previousCost = await calculateMonthlyCost(store.id, previousMonth, previousYear);
          
          const change = currentCost - previousCost;
          const changePercent = previousCost > 0 ? (change / previousCost) * 100 : 0;
          
          costs.push({
            storeId: store.id,
            storeName: store.name,
            currentCost,
            previousCost,
            change,
            changePercent
          });
        }
        
        setStoreCosts(costs);
      } catch (error) {
        console.error('Error calculating store costs:', error);
      } finally {
        setLoading(false);
      }
    };

    calculateAllStoreCosts();
  }, [stores, selectedMonth, selectedYear, calculateMonthlyCost]);

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

  const totalCurrentCost = storeCosts.reduce((sum, store) => sum + store.currentCost, 0);
  const totalPreviousCost = storeCosts.reduce((sum, store) => sum + store.previousCost, 0);
  const totalChange = totalCurrentCost - totalPreviousCost;
  const totalChangePercent = totalPreviousCost > 0 ? (totalChange / totalPreviousCost) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Calculateur de Masse Salariale
        </CardTitle>
        
        {/* Period Selection */}
        <div className="flex gap-4 items-center mt-4">
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
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-slate-500">
            Calcul en cours...
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-600">Coût Total</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalCurrentCost)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-600">Mois Précédent</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalPreviousCost)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-600">Évolution</p>
                    <div className="flex items-center justify-center gap-2">
                      {totalChange >= 0 ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                      <p className={`text-2xl font-bold ${totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercent(totalChangePercent)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Store Details Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Magasin</TableHead>
                  <TableHead>Coût Actuel</TableHead>
                  <TableHead>Mois Précédent</TableHead>
                  <TableHead>Variation</TableHead>
                  <TableHead>Évolution</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {storeCosts.map((store) => (
                  <TableRow key={store.storeId}>
                    <TableCell className="font-medium">
                      {store.storeName}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(store.currentCost)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(store.previousCost)}
                    </TableCell>
                    <TableCell>
                      <span className={store.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {store.change >= 0 ? '+' : ''}{formatCurrency(store.change)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {store.change >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className={store.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatPercent(store.changePercent)}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );
};