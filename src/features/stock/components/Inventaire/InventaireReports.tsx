import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Download,
  Calendar,
  Filter,
  Eye
} from 'lucide-react';
import { Inventaire } from '../../types';

interface InventaireReportsProps {
  inventaires: Inventaire[];
  onExportData: (inventaireId: string) => void;
  onViewDetails: (inventaire: Inventaire) => void;
}

interface InventaireStats {
  totalInventaires: number;
  inventairesEnCours: number;
  inventairesEnAttente: number;
  inventairesValides: number;
  totalEcarts: number;
  valeurTotaleEcarts: number;
  tauxEcartMoyen: number;
}

interface EcartAnalysis {
  productId: string;
  productName: string;
  totalEcarts: number;
  valeurEcarts: number;
  frequenceEcarts: number;
  dernierInventaire: Date;
}

export const InventaireReports: React.FC<InventaireReportsProps> = ({
  inventaires,
  onExportData,
  onViewDetails
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [stats, setStats] = useState<InventaireStats | null>(null);
  const [ecartsAnalysis, setEcartsAnalysis] = useState<EcartAnalysis[]>([]);

  useEffect(() => {
    calculateStats();
    analyzeEcarts();
  }, [inventaires, selectedPeriod, selectedStore]);

  const calculateStats = () => {
    const filteredInventaires = filterInventaires();

    const stats: InventaireStats = {
      totalInventaires: filteredInventaires.length,
      inventairesEnCours: filteredInventaires.filter(inv => inv.status === 'en_cours').length,
      inventairesEnAttente: filteredInventaires.filter(inv => inv.status === 'en_attente_validation').length,
      inventairesValides: filteredInventaires.filter(inv => inv.status === 'valide').length,
      totalEcarts: filteredInventaires.reduce((sum, inv) => sum + inv.totalEcarts, 0),
      valeurTotaleEcarts: filteredInventaires.reduce((sum, inv) => sum + inv.valeurEcarts, 0),
      tauxEcartMoyen: 0
    };

    // Calculate average variance rate
    const totalLignes = filteredInventaires.reduce((sum, inv) => sum + inv.lignes.length, 0);
    stats.tauxEcartMoyen = totalLignes > 0 ? (Math.abs(stats.totalEcarts) / totalLignes) * 100 : 0;

    setStats(stats);
  };

  const analyzeEcarts = () => {
    const filteredInventaires = filterInventaires();
    const productEcarts = new Map<string, EcartAnalysis>();

    filteredInventaires.forEach(inventaire => {
      inventaire.lignes.forEach(ligne => {
        if (ligne.ecart && ligne.ecart !== 0) {
          const existing = productEcarts.get(ligne.productId);
          if (existing) {
            existing.totalEcarts += Math.abs(ligne.ecart);
            existing.valeurEcarts += Math.abs(ligne.valeurEcart || 0);
            existing.frequenceEcarts += 1;
            if (inventaire.date > existing.dernierInventaire) {
              existing.dernierInventaire = inventaire.date;
            }
          } else {
            productEcarts.set(ligne.productId, {
              productId: ligne.productId,
              productName: ligne.product.name,
              totalEcarts: Math.abs(ligne.ecart),
              valeurEcarts: Math.abs(ligne.valeurEcart || 0),
              frequenceEcarts: 1,
              dernierInventaire: inventaire.date
            });
          }
        }
      });
    });

    const sortedEcarts = Array.from(productEcarts.values())
      .sort((a, b) => b.valeurEcarts - a.valeurEcarts)
      .slice(0, 10); // Top 10 products with highest variance value

    setEcartsAnalysis(sortedEcarts);
  };

  const filterInventaires = () => {
    const now = new Date();
    let startDate: Date;

    switch (selectedPeriod) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return inventaires.filter(inventaire => {
      const dateMatch = inventaire.date >= startDate;
      const storeMatch = selectedStore === 'all' || inventaire.storeId === selectedStore;
      return dateMatch && storeMatch;
    });
  };

  const getStatusColor = (status: Inventaire['status']) => {
    switch (status) {
      case 'en_cours':
        return 'text-blue-600 bg-blue-100';
      case 'en_attente_validation':
        return 'text-orange-600 bg-orange-100';
      case 'valide':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: Inventaire['status']) => {
    switch (status) {
      case 'en_cours':
        return 'En cours';
      case 'en_attente_validation':
        return 'En attente';
      case 'valide':
        return 'Validé';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'quarter')}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
              <option value="quarter">90 derniers jours</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="all">Tous les magasins</option>
              <option value="store1">Magasin Principal</option>
              <option value="store2">Magasin Secondaire</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Inventaires</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalInventaires}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Attente</p>
              <p className="text-2xl font-bold text-orange-600">{stats.inventairesEnAttente}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valeur Écarts</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.valeurTotaleEcarts)}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux Écart Moyen</p>
              <p className="text-2xl font-bold text-gray-900">{stats.tauxEcartMoyen.toFixed(1)}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Inventory List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Historique des Inventaires</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Numéro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Magasin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Écarts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valeur Écarts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filterInventaires().map((inventaire) => (
                <tr key={inventaire.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {inventaire.numero}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(inventaire.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {inventaire.store.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inventaire.status)}`}>
                      {getStatusLabel(inventaire.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {inventaire.totalEcarts}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(inventaire.valeurEcarts)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => onViewDetails(inventaire)}
                      className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      Voir
                    </button>
                    <button
                      onClick={() => onExportData(inventaire.id)}
                      className="text-green-600 hover:text-green-900 inline-flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Variance Analysis */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Analyse des Écarts par Produit</h3>
          <p className="text-sm text-gray-500 mt-1">Top 10 des produits avec les plus gros écarts en valeur</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Écarts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valeur Écarts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fréquence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernier Inventaire
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ecartsAnalysis.map((ecart) => (
                <tr key={ecart.productId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {ecart.productName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ecart.totalEcarts}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                    {formatCurrency(ecart.valeurEcarts)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ecart.frequenceEcarts} fois
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(ecart.dernierInventaire)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert for abnormal variances */}
      {stats.valeurTotaleEcarts > 1000 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Écarts Anormaux Détectés</h4>
              <p className="text-sm text-red-700 mt-1">
                La valeur totale des écarts ({formatCurrency(stats.valeurTotaleEcarts)}) dépasse le seuil d'alerte.
                Une vérification approfondie est recommandée.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};