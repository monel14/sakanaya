import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../../../shared/components/ui';
import { Download, Users, TrendingUp, Award, Target } from 'lucide-react';
import { reportsService } from '../services/reportsService';
import { PerformanceReportData, ReportFilters } from '../types';
import { formatCurrency, formatNumber } from '../../../shared/utils/formatters';

interface PerformanceReportProps {
  filters: ReportFilters;
  onExport?: (data: PerformanceReportData) => void;
}

export const PerformanceReport: React.FC<PerformanceReportProps> = ({ filters, onExport }) => {
  const [reportData, setReportData] = useState<PerformanceReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateReport();
  }, [filters]);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await reportsService.generatePerformanceReport(filters);
      setReportData(data);
    } catch (err) {
      setError('Erreur lors de la génération du rapport');
      console.error('Performance report error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (reportData && onExport) {
      onExport(reportData);
    }
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      'manager': 'Responsable',
      'seller': 'Vendeur',
      'preparer': 'Préparateur'
    };
    return roleLabels[role] || role;
  };

  const getRankingBadge = (ranking: number) => {
    if (ranking === 1) return 'bg-yellow-500 text-white';
    if (ranking === 2) return 'bg-slate-400 text-white';
    if (ranking === 3) return 'bg-orange-500 text-white';
    return 'bg-slate-200 text-slate-700';
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-500">Génération du rapport en cours...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500">{error}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reportData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header with summary metrics */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg">Rapport de Performance</CardTitle>
            <Button variant="outline" size="sm" onClick={handleExport} className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
          <div className="text-sm text-slate-600">
            Du {filters.startDate.toLocaleDateString('fr-FR')} au {filters.endDate.toLocaleDateString('fr-FR')}
            {filters.storeId && ' • Magasin spécifique'}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Employés Actifs</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {reportData.totalEmployees}
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">CA Total</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {formatCurrency(reportData.totalRevenue)}
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">CA/Employé</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {formatCurrency(reportData.averageRevenuePerEmployee)}
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Top Performer</span>
              </div>
              <div className="text-lg font-bold text-orange-900">
                {reportData.employeePerformance.length > 0 ? 
                  `${reportData.employeePerformance[0].firstName} ${reportData.employeePerformance[0].lastName}` : 
                  'N/A'
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance ranking table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Classement des Performances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 font-medium">Rang</th>
                  <th className="text-left py-3 font-medium">Employé</th>
                  <th className="text-left py-3 font-medium">Rôle</th>
                  <th className="text-right py-3 font-medium">Nb Ventes</th>
                  <th className="text-right py-3 font-medium">CA Total</th>
                  <th className="text-right py-3 font-medium">Vente Moyenne</th>
                  <th className="text-right py-3 font-medium">CA/Jour</th>
                  <th className="text-right py-3 font-medium">Jours Travaillés</th>
                </tr>
              </thead>
              <tbody>
                {reportData.employeePerformance.map((employee) => (
                  <tr key={employee.employeeId} className="border-b border-slate-100">
                    <td className="py-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getRankingBadge(employee.ranking)}`}>
                        {employee.ranking}
                      </div>
                    </td>
                    <td className="py-3 font-medium">
                      {employee.firstName} {employee.lastName}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-1 bg-slate-100 rounded-full text-xs">
                        {getRoleLabel(employee.role)}
                      </span>
                    </td>
                    <td className="text-right py-3">{employee.totalSales}</td>
                    <td className="text-right py-3 font-medium">{formatCurrency(employee.totalRevenue)}</td>
                    <td className="text-right py-3">{formatCurrency(employee.averageSaleValue)}</td>
                    <td className="text-right py-3">{formatCurrency(employee.revenuePerDay)}</td>
                    <td className="text-right py-3">{employee.workingDays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {reportData.employeePerformance.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              Aucune donnée de performance disponible pour la période sélectionnée
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top 3 performers cards */}
      {reportData.employeePerformance.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Top 3 Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reportData.employeePerformance.slice(0, 3).map((employee) => (
                <div key={employee.employeeId} className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${getRankingBadge(employee.ranking)}`}>
                      {employee.ranking}
                    </div>
                    <div>
                      <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                      <div className="text-xs text-slate-600">{getRoleLabel(employee.role)}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">CA Total:</span>
                      <span className="font-medium">{formatCurrency(employee.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Nb Ventes:</span>
                      <span className="font-medium">{employee.totalSales}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">CA/Jour:</span>
                      <span className="font-medium">{formatCurrency(employee.revenuePerDay)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Vente Moy:</span>
                      <span className="font-medium">{formatCurrency(employee.averageSaleValue)}</span>
                    </div>
                  </div>
                  
                  {/* Performance indicator */}
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Performance vs Moyenne</span>
                      <span className={`font-medium ${
                        employee.totalRevenue > reportData.averageRevenuePerEmployee ? 
                        'text-green-600' : 'text-red-600'
                      }`}>
                        {employee.totalRevenue > reportData.averageRevenuePerEmployee ? '+' : ''}
                        {(((employee.totalRevenue - reportData.averageRevenuePerEmployee) / reportData.averageRevenuePerEmployee) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance insights */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Insights de Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Répartition par Rôle</h4>
              <div className="space-y-2">
                {['manager', 'seller', 'preparer'].map(role => {
                  const roleEmployees = reportData.employeePerformance.filter(emp => emp.role === role);
                  const roleRevenue = roleEmployees.reduce((sum, emp) => sum + emp.totalRevenue, 0);
                  const percentage = reportData.totalRevenue > 0 ? (roleRevenue / reportData.totalRevenue) * 100 : 0;
                  
                  return (
                    <div key={role} className="flex items-center justify-between">
                      <span className="text-sm">{getRoleLabel(role)} ({roleEmployees.length})</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium w-12 text-right">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Statistiques Générales</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Vente moyenne par employé:</span>
                  <span className="font-medium">
                    {reportData.totalEmployees > 0 ? 
                      formatNumber(reportData.employeePerformance.reduce((sum, emp) => sum + emp.totalSales, 0) / reportData.totalEmployees) : 
                      '0'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Écart-type CA:</span>
                  <span className="font-medium">
                    {reportData.employeePerformance.length > 0 ? 
                      formatCurrency(
                        Math.sqrt(
                          reportData.employeePerformance.reduce((sum, emp) => 
                            sum + Math.pow(emp.totalRevenue - reportData.averageRevenuePerEmployee, 2), 0
                          ) / reportData.employeePerformance.length
                        )
                      ) : 
                      '0 CFA'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Meilleur jour moyen:</span>
                  <span className="font-medium">
                    {reportData.employeePerformance.length > 0 ? 
                      formatCurrency(Math.max(...reportData.employeePerformance.map(emp => emp.revenuePerDay))) : 
                      '0 CFA'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};