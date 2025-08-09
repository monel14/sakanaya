import React, { useState, useEffect } from 'react';
import { SalaryAdjustment } from '../types';
import { useSalaryManagement } from '@/shared/hooks/useEmployees';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Card,
  CardContent,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui';
import { History, TrendingUp, TrendingDown } from 'lucide-react';

interface SalaryAdjustmentHistoryProps {
  employeeId: string;
  employeeName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SalaryAdjustmentHistory: React.FC<SalaryAdjustmentHistoryProps> = ({
  employeeId,
  employeeName,
  isOpen,
  onClose
}) => {
  const [adjustments, setAdjustments] = useState<SalaryAdjustment[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterYear, setFilterYear] = useState<string>('all');

  const { getSalaryAdjustments } = useSalaryManagement();

  useEffect(() => {
    if (isOpen && employeeId) {
      loadAdjustments();
    }
  }, [isOpen, employeeId]);

  const loadAdjustments = async () => {
    setLoading(true);
    try {
      const data = await getSalaryAdjustments(employeeId);
      setAdjustments(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Error loading adjustments:', error);
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getMonthName = (month: number) => {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[month - 1];
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'bonus': return 'Prime';
      case 'advance': return 'Avance';
      case 'adjustment': return 'Ajustement';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bonus': return 'bg-green-100 text-green-800';
      case 'advance': return 'bg-orange-100 text-orange-800';
      case 'adjustment': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter adjustments by year
  const filteredAdjustments = filterYear === 'all' 
    ? adjustments 
    : adjustments.filter(adj => adj.year.toString() === filterYear);

  // Get unique years for filter
  const availableYears = [...new Set(adjustments.map(adj => adj.year))].sort((a, b) => b - a);

  // Calculate totals
  const totalAdjustments = filteredAdjustments.reduce((sum, adj) => sum + adj.amount, 0);
  const bonusTotal = filteredAdjustments
    .filter(adj => adj.type === 'bonus')
    .reduce((sum, adj) => sum + adj.amount, 0);
  const advanceTotal = filteredAdjustments
    .filter(adj => adj.type === 'advance')
    .reduce((sum, adj) => sum + adj.amount, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historique des Ajustements - {employeeName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Filter */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Filtrer par année:</label>
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Ajustements</p>
                    <p className={`text-2xl font-bold ${totalAdjustments >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(totalAdjustments)}
                    </p>
                  </div>
                  {totalAdjustments >= 0 ? (
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  ) : (
                    <TrendingDown className="h-8 w-8 text-red-600" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-600">Total Primes</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(bonusTotal)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-600">Total Avances</p>
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(Math.abs(advanceTotal))}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Adjustments Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="text-center py-8 text-slate-500">
                  Chargement de l'historique...
                </div>
              ) : filteredAdjustments.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  Aucun ajustement trouvé pour cette période
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Période</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Raison</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAdjustments.map((adjustment) => (
                      <TableRow key={adjustment.id}>
                        <TableCell className="text-sm">
                          {formatDate(adjustment.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(adjustment.type)}>
                            {getTypeLabel(adjustment.type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getMonthName(adjustment.month)} {adjustment.year}
                        </TableCell>
                        <TableCell>
                          <span className={`font-semibold ${
                            adjustment.amount >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {adjustment.amount >= 0 ? '+' : ''}{formatCurrency(adjustment.amount)}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={adjustment.reason}>
                            {adjustment.reason}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};