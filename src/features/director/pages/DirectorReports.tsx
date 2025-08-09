import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DirectorReportsProps {
  user: any;
}

export const DirectorReports: React.FC<DirectorReportsProps> = ({ user }) => {
  const [reportType, setReportType] = useState('sales');
  const [period, setPeriod] = useState('7days');
  const [selectedStore, setSelectedStore] = useState('all');

  // Données de démonstration
  const salesData = [
    { name: 'Almadies', ca: 850000, marge: 280000 },
    { name: 'Sandaga', ca: 720000, marge: 240000 },
    { name: 'Mermoz', ca: 650000, marge: 210000 },
  ];

  const productData = [
    { name: 'Thon Rouge', value: 40, color: '#ef4444' },
    { name: 'Crevettes', value: 25, color: '#f97316' },
    { name: 'Soles', value: 15, color: '#84cc16' },
    { name: 'Bars', value: 20, color: '#3b82f6' },
  ];

  const rawData = [
    { product: 'Thon Rouge', volume: 150.5, ca: 978250 },
    { product: 'Crevettes', volume: 88.2, ca: 705600 },
    { product: 'Soles', volume: 65.3, ca: 293850 },
    { product: 'Bars', volume: 45.8, ca: 160300 },
  ];

  const handleExport = () => {
    // TODO: Implémenter l'export CSV
    console.log('Export CSV des données');
    alert('Export CSV en cours...');
  };

  const handleGenerateReport = () => {
    console.log('Génération rapport:', { reportType, period, selectedStore });
    alert('Rapport généré avec succès !');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Rapports & Analyses
        </h1>
      </div>

      {/* Filtres */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de Rapport
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sales">Performance des Ventes</option>
              <option value="stock">Analyse des Stocks</option>
              <option value="hr">Rapport RH</option>
              <option value="financial">Analyse Financière</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Période
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7days">7 derniers jours</option>
              <option value="month">Ce mois</option>
              <option value="lastmonth">Mois dernier</option>
              <option value="quarter">Ce trimestre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Magasin
            </label>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les magasins</option>
              <option value="hub">Hub de Distribution</option>
              <option value="almadies">Pointe des Almadies</option>
              <option value="sandaga">Sandaga</option>
              <option value="mermoz">Mermoz</option>
            </select>
          </div>

          <div className="self-end">
            <button
              onClick={handleGenerateReport}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Générer
            </button>
          </div>
        </div>
      </div>

      {/* Graphiques et analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique CA par magasin */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            CA par Magasin (7 derniers jours)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value.toLocaleString()} CFA`, 'CA']}
                />
                <Bar dataKey="ca" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graphique performance produits */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Analyse du CA par produit
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {productData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Données brutes */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Données brutes
          </h3>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" />
            </svg>
            Exporter (CSV)
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Volume (Kg)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CA (CFA)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix Moyen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rawData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.product}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {item.volume}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {item.ca.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {Math.round(item.ca / item.volume).toLocaleString()} CFA/kg
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* KPIs résumés */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">CA Total</h3>
          <p className="text-2xl font-bold text-gray-900">
            {salesData.reduce((sum, item) => sum + item.ca, 0).toLocaleString()} CFA
          </p>
          <p className="text-sm text-green-600">+8.5% vs période précédente</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Marge Brute</h3>
          <p className="text-2xl font-bold text-gray-900">
            {salesData.reduce((sum, item) => sum + item.marge, 0).toLocaleString()} CFA
          </p>
          <p className="text-sm text-green-600">32.5% du CA</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Taux de Perte</h3>
          <p className="text-2xl font-bold text-gray-900">2.8%</p>
          <p className="text-sm text-red-600">+0.3% vs objectif</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Rotation Stock</h3>
          <p className="text-2xl font-bold text-gray-900">2.3 jours</p>
          <p className="text-sm text-green-600">Optimal</p>
        </div>
      </div>
    </div>
  );
};