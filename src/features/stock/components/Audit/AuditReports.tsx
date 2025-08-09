import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Shield, 
  AlertTriangle, 
  Activity, 
  Users, 
  Store,
  Download,
  Filter,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { 
  AuditLogEntry, 
  SecurityAlert, 
  AuditStatistics, 
  AuditEventType, 
  AuditSeverity,
  AuditReportFilters,
  auditService,
  auditReportGenerator
} from '../../shared/services/auditService';

interface AuditReportsProps {
  userRole: 'director' | 'manager';
  currentStoreId?: string;
}

export const AuditReports: React.FC<AuditReportsProps> = ({ 
  userRole, 
  currentStoreId 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'alerts' | 'reports'>('overview');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    end: new Date()
  });
  const [filters, setFilters] = useState<AuditReportFilters>({});
  const [statistics, setStatistics] = useState<AuditStatistics | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAuditData();
  }, [dateRange, filters]);

  const loadAuditData = async () => {
    setLoading(true);
    try {
      // Load statistics
      const stats = await auditService.getAuditStatistics(dateRange.start, dateRange.end);
      setStatistics(stats);

      // Load audit logs
      const { logs } = await auditService.getAuditLogs({
        ...filters,
        startDate: dateRange.start,
        endDate: dateRange.end,
        storeIds: userRole === 'manager' && currentStoreId ? [currentStoreId] : filters.storeIds
      }, 100);
      setAuditLogs(logs);

      // Load security alerts
      const alerts = await auditService.getSecurityAlerts(false);
      setSecurityAlerts(alerts);
    } catch (error) {
      console.error('Error loading audit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId: string, resolution: string) => {
    try {
      await auditService.resolveSecurityAlert(alertId, 'current-user', resolution);
      await loadAuditData();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const exportAuditReport = async () => {
    try {
      const report = await auditReportGenerator.generateComprehensiveReport(
        dateRange.start,
        dateRange.end,
        filters
      );
      
      // In a real implementation, this would generate and download a file
      console.log('Audit Report:', report);
      alert('Rapport d\'audit généré (voir console)');
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const getSeverityColor = (severity: AuditSeverity) => {
    switch (severity) {
      case AuditSeverity.CRITICAL:
        return 'text-red-600 bg-red-50';
      case AuditSeverity.ERROR:
        return 'text-red-500 bg-red-50';
      case AuditSeverity.WARNING:
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  const getEventTypeIcon = (eventType: AuditEventType) => {
    switch (eventType) {
      case AuditEventType.STOCK_ARRIVAL:
      case AuditEventType.STOCK_TRANSFER_CREATE:
      case AuditEventType.STOCK_TRANSFER_RECEIVE:
        return <Activity className="w-4 h-4" />;
      case AuditEventType.UNAUTHORIZED_ACCESS:
      case AuditEventType.PERMISSION_VIOLATION:
        return <Shield className="w-4 h-4" />;
      case AuditEventType.SUSPICIOUS_ACTIVITY:
      case AuditEventType.ANOMALY_DETECTED:
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredLogs = auditLogs.filter(log =>
    searchTerm === '' ||
    log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entityType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit et Sécurité</h2>
          <p className="text-gray-600">
            Surveillance et traçabilité des opérations
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportAuditReport}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-4">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Période:</label>
            <input
              type="date"
              value={dateRange.start.toISOString().split('T')[0]}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            />
            <span className="text-gray-500">à</span>
            <input
              type="date"
              value={dateRange.end.toISOString().split('T')[0]}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
            { id: 'logs', label: 'Journal d\'audit', icon: Activity },
            { id: 'alerts', label: 'Alertes sécurité', icon: Shield },
            { id: 'reports', label: 'Rapports', icon: TrendingUp }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && statistics && (
            <div className="space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <Activity className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Événements</p>
                      <p className="text-2xl font-bold text-gray-900">{statistics.totalEvents}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <Shield className="w-8 h-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Alertes Sécurité</p>
                      <p className="text-2xl font-bold text-gray-900">{statistics.securityAlerts}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <AlertTriangle className="w-8 h-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Non Résolues</p>
                      <p className="text-2xl font-bold text-gray-900">{statistics.unresolvedAlerts}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Utilisateurs Actifs</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {Object.keys(statistics.eventsByUser).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Events by Type */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Événements par Type</h3>
                <div className="space-y-3">
                  {Object.entries(statistics.eventsByType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getEventTypeIcon(type as AuditEventType)}
                        <span className="ml-2 text-sm text-gray-700">{type}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Events by Severity */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Événements par Sévérité</h3>
                <div className="space-y-3">
                  {Object.entries(statistics.eventsBySeverity).map(([severity, count]) => (
                    <div key={severity} className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(severity as AuditSeverity)}`}>
                        {severity}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Audit Logs Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Rechercher dans les logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtres
                  </button>
                </div>
              </div>

              {/* Logs List */}
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Horodatage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sévérité
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Utilisateur
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.timestamp.toLocaleString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getEventTypeIcon(log.eventType)}
                              <span className="ml-2 text-sm text-gray-700">{log.eventType}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                              {log.severity}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.userId}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                            {log.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              Détails
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Security Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              {securityAlerts.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
                  <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune alerte de sécurité</h3>
                  <p className="text-gray-600">Toutes les activités sont normales</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {securityAlerts.map((alert) => (
                    <div key={alert.id} className="bg-white p-6 rounded-lg shadow-sm border">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <AlertTriangle className={`w-5 h-5 mr-2 ${
                              alert.severity === AuditSeverity.CRITICAL ? 'text-red-600' :
                              alert.severity === AuditSeverity.ERROR ? 'text-red-500' :
                              alert.severity === AuditSeverity.WARNING ? 'text-yellow-500' :
                              'text-blue-500'
                            }`} />
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                              {alert.severity}
                            </span>
                            <span className="ml-2 text-sm text-gray-500">
                              {alert.timestamp.toLocaleString('fr-FR')}
                            </span>
                          </div>
                          <h4 className="text-lg font-medium text-gray-900 mb-2">{alert.description}</h4>
                          <p className="text-sm text-gray-600 mb-3">Utilisateur: {alert.userId}</p>
                          
                          {alert.actions.length > 0 && (
                            <div className="mb-4">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Actions recommandées:</h5>
                              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                {alert.actions.map((action, index) => (
                                  <li key={index}>{action}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {alert.resolved ? (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              <span className="text-sm">Résolu</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleResolveAlert(alert.id, 'Résolu manuellement')}
                              className="flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Résoudre
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* User Activity Report */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center mb-4">
                    <Users className="w-6 h-6 text-blue-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Activité Utilisateurs</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Rapport détaillé de l'activité par utilisateur
                  </p>
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Générer Rapport
                  </button>
                </div>

                {/* Store Activity Report */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center mb-4">
                    <Store className="w-6 h-6 text-green-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Activité Magasins</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Analyse des opérations par magasin
                  </p>
                  <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Générer Rapport
                  </button>
                </div>

                {/* Security Report */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center mb-4">
                    <Shield className="w-6 h-6 text-red-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Rapport Sécurité</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Analyse des incidents et alertes de sécurité
                  </p>
                  <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Générer Rapport
                  </button>
                </div>
              </div>

              {/* Comprehensive Report */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Rapport Complet d'Audit</h3>
                    <p className="text-gray-600">
                      Rapport détaillé incluant toutes les activités, alertes et recommandations
                    </p>
                  </div>
                  <button
                    onClick={exportAuditReport}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Générer et Télécharger
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AuditReports;