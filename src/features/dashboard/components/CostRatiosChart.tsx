import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { StoreComparison } from '../types/costAnalysis';

interface CostRatiosChartProps {
  data: StoreComparison[];
  loading?: boolean;
}

export const CostRatiosChart: React.FC<CostRatiosChartProps> = ({ 
  data, 
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        Aucune donnée disponible
      </div>
    );
  }

  // Transform data for the chart
  const chartData = data.map(store => ({
    name: store.storeName,
    'Ratio Salarial': parseFloat(store.ratios.salaryCostRatio.toFixed(1)),
    'Taux de Perte': parseFloat(store.ratios.lossRate.toFixed(1)),
    'Marge Brute %': parseFloat(((store.ratios.grossMargin / store.revenue) * 100).toFixed(1))
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            stroke="#64748b"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="#64748b"
            label={{ value: '%', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="Ratio Salarial" 
            fill="#ef4444" 
            name="Ratio Salarial (%)"
            radius={[2, 2, 0, 0]}
          />
          <Bar 
            dataKey="Taux de Perte" 
            fill="#f97316" 
            name="Taux de Perte (%)"
            radius={[2, 2, 0, 0]}
          />
          <Bar 
            dataKey="Marge Brute %" 
            fill="#22c55e" 
            name="Marge Brute (%)"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};