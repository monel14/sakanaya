/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import ChartComponent from '../components/ChartComponent';
import type { Store } from '../types';

const formatCurrency = (value: number) => {
    if (value === undefined || isNaN(value)) return '0 CFA';
    return value.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 });
};

const exportToCsv = (filename: string, headers: string[], rows: (string|number)[][]) => {
    if (!rows || !rows.length) return;
    const separator = ';';
    const csvContent =
        headers.join(separator) +
        '\n' +
        rows.map(row => row.join(separator).replace(/(\r\n|\n|\r)/gm, " ")).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

const PnlPanel = () => {
    const { stores, salesClosures, expenses, employees, losses, budgets } = useAppContext();

    const availablePeriods = useMemo(() => {
        const periods = new Set(budgets.map(b => b.period));
        [...salesClosures, ...expenses].forEach(item => periods.add(item.date.slice(0, 7)));
        return Array.from(periods).sort().reverse();
    }, [budgets, salesClosures, expenses]);

    const [selectedPeriod, setSelectedPeriod] = useState(availablePeriods[0] || new Date().toISOString().slice(0, 7));

    const reportData = useMemo(() => {
        if (!selectedPeriod) return null;

        const magasinStores = stores.filter(s => s.type === 'Magasin');
        const pnlData: Record<number, Record<string, number>> = {};
        const pnlRows: string[] = ['Chiffre d\'Affaires', 'Coût des Marchandises Vendues', 'Marge Brute', 'Salaires', 'Loyer', 'Électricité & Eau', 'Marketing', 'Maintenance', 'Fournitures', 'Services bancaires', 'Autre', 'Pertes & Casses', 'Total Charges', 'Résultat d\'Exploitation'];

        magasinStores.forEach(store => {
            pnlData[store.id] = {};
            pnlRows.forEach(row => pnlData[store.id][row] = 0);
        });

        salesClosures.filter(sc => sc.status === 'validated' && sc.date.startsWith(selectedPeriod)).forEach(sc => {
            if (pnlData[sc.storeId]) {
                pnlData[sc.storeId]['Chiffre d\'Affaires'] += sc.total;
                pnlData[sc.storeId]['Coût des Marchandises Vendues'] += sc.totalCostOfGoodsSold || 0;
            }
        });

        expenses.filter(e => e.status === 'Approuvé' && e.date.startsWith(selectedPeriod)).forEach(e => {
            if (pnlData[e.storeId] && pnlData[e.storeId][e.category] !== undefined) {
                pnlData[e.storeId][e.category] += e.amount;
            }
        });

        employees.forEach(emp => {
            const store = stores.find(s => s.name === emp.store);
            if (store && pnlData[store.id]) {
                pnlData[store.id]['Salaires'] += emp.salary;
            }
        });
        
        losses.filter(l => l.storeId && l.date.startsWith(selectedPeriod)).forEach(l => {
            if (pnlData[l.storeId!]) {
                pnlData[l.storeId!]['Pertes & Casses'] += l.value;
            }
        });
        
        magasinStores.forEach(store => {
            const storePnl = pnlData[store.id];
            if (storePnl) {
                storePnl['Marge Brute'] = storePnl['Chiffre d\'Affaires'] - storePnl['Coût des Marchandises Vendues'];
                storePnl['Total Charges'] = Object.keys(storePnl)
                    .filter(key => !['Chiffre d\'Affaires', 'Coût des Marchandises Vendues', 'Marge Brute', 'Total Charges', 'Résultat d\'Exploitation'].includes(key))
                    .reduce((sum, key) => sum + storePnl[key], 0);
                storePnl['Résultat d\'Exploitation'] = storePnl['Marge Brute'] - storePnl['Total Charges'];
            }
        });

        const totalPnl: Record<string, number> = {};
        pnlRows.forEach(row => totalPnl[row] = 0);

        magasinStores.forEach(store => {
            const storePnl = pnlData[store.id];
            if(storePnl) {
                Object.keys(storePnl).forEach(key => {
                    totalPnl[key] += storePnl[key];
                });
            }
        });

        return { stores: magasinStores, pnlData, totalPnl, pnlRows, };
    }, [selectedPeriod, stores, salesClosures, expenses, employees, losses]);

    const handleExport = () => {
        if (!reportData) return;
        const headers = ["Ligne", ...reportData.stores.map(s => s.name), "Total"];
        const rows = reportData.pnlRows.map(row => [ row, ...reportData.stores.map(s => reportData.pnlData[s.id][row] || 0), reportData.totalPnl[row] ]);
        exportToCsv(`compte_de_resultat_${selectedPeriod}.csv`, headers, rows);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Analyse par Période</h3>
                <div className="flex items-center gap-4">
                    <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)} className="p-2 border rounded-md bg-bg-subtle">
                        {availablePeriods.map(p => <option key={p} value={p}>{new Date(p + '-02').toLocaleString('fr-FR', {month: 'long', year: 'numeric'})}</option>)}
                    </select>
                    <button className="btn btn-ghost" onClick={handleExport} disabled={!reportData}>
                        <i className="fa fa-download mr-2"></i>Exporter CSV
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-bg-subtle">
                            <th className="p-3 text-left font-semibold">Ligne du Compte de Résultat</th>
                            {reportData?.stores.map(store => (<th key={store.id} className="p-3 text-right font-semibold">{store.name}</th>))}
                            <th className="p-3 text-right font-bold border-l-2 border-border-color">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData?.pnlRows.map(row => {
                            const isBold = ['Marge Brute', 'Total Charges', 'Résultat d\'Exploitation'].includes(row);
                            const isFinalResult = row === 'Résultat d\'Exploitation';
                            const isSeparator = ['Marge Brute', 'Résultat d\'Exploitation'].includes(row);
                            return (
                                <tr key={row} className={`${isBold ? 'font-semibold' : ''} ${isSeparator ? 'border-t' : ''} ${isFinalResult ? 'bg-primary-light/50 border-t-2 border-primary-light' : ''}`}>
                                    <td className="p-3">{row}</td>
                                    {reportData.stores.map(store => (<td key={store.id} className="p-3 text-right font-mono">{formatCurrency(reportData.pnlData[store.id]?.[row] || 0)}</td>))}
                                    <td className="p-3 text-right font-bold border-l-2 border-border-color bg-bg-subtle">{formatCurrency(reportData.totalPnl[row])}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const PerformancePanel = () => {
    const { stores, salesClosures, expenses, employees, losses } = useAppContext();
    const [selectedKpi, setSelectedKpi] = useState('Résultat d\'Exploitation');
    
    const kpiList = ['Chiffre d\'Affaires', 'Marge Brute', 'Résultat d\'Exploitation'];
    const chartColors = ['hsl(195, 85%, 41%)', 'hsl(145, 55%, 45%)', 'hsl(16, 96%, 54%)', 'hsl(215, 25%, 20%)'];


    const performanceData = useMemo(() => {
        const periods = Array.from(new Set([...salesClosures, ...expenses].map(item => item.date.slice(0, 7)))).sort();
        const magasinStores = stores.filter(s => s.type === 'Magasin');
        const dataByPeriod: Record<string, Record<string, Record<string, number>>> = {};

        periods.forEach(period => {
            dataByPeriod[period] = {};
            magasinStores.forEach(store => dataByPeriod[period][store.id] = {});

            const periodSales = salesClosures.filter(sc => sc.status === 'validated' && sc.date.startsWith(period));
            const periodExpenses = expenses.filter(e => e.status === 'Approuvé' && e.date.startsWith(period));
            const periodLosses = losses.filter(l => l.storeId && l.date.startsWith(period));

            magasinStores.forEach(store => {
                const storeSales = periodSales.filter(sc => sc.storeId === store.id);
                const ca = storeSales.reduce((sum, s) => sum + s.total, 0);
                const cogs = storeSales.reduce((sum, s) => sum + (s.totalCostOfGoodsSold || 0), 0);
                const margin = ca - cogs;
                
                const storeExpenses = periodExpenses.filter(e => e.storeId === store.id).reduce((sum, e) => sum + e.amount, 0);
                const storeSalaries = employees.filter(e => e.store === store.name).reduce((sum, e) => sum + e.salary, 0);
                const storeLosses = periodLosses.filter(l => l.storeId === store.id).reduce((sum, l) => sum + l.value, 0);
                
                const totalCharges = storeExpenses + storeSalaries + storeLosses;
                const result = margin - totalCharges;

                dataByPeriod[period][store.id] = {
                    'Chiffre d\'Affaires': ca,
                    'Marge Brute': margin,
                    'Résultat d\'Exploitation': result,
                };
            });
        });

        return { periods, stores: magasinStores, data: dataByPeriod };
    }, [stores, salesClosures, expenses, employees, losses]);

    const chartData = useMemo(() => {
        const { periods, stores, data } = performanceData;
        const datasets = stores.map((store, index) => ({
            label: store.name,
            data: periods.map(p => data[p]?.[store.id]?.[selectedKpi] || 0),
            borderColor: chartColors[index % chartColors.length],
            backgroundColor: chartColors[index % chartColors.length] + '33', // with alpha
            tension: 0.2,
            fill: false,
            borderWidth: 2,
            borderDash: [],
        }));
        
        // Add Total dataset
        datasets.push({
            label: 'Total',
            data: periods.map(p => stores.reduce((sum, s) => sum + (data[p]?.[s.id]?.[selectedKpi] || 0), 0)),
            borderColor: chartColors[3],
            backgroundColor: chartColors[3] + '33',
            tension: 0.1,
            fill: false,
            borderWidth: 3,
            borderDash: [5, 5],
        });

        return {
            labels: periods.map(p => new Date(p + '-02').toLocaleString('fr-FR', {month: 'short', year: '2-digit'})),
            datasets,
        };
    }, [performanceData, selectedKpi]);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                 <h3 className="font-semibold text-lg">Suivi Mensuel des Performances</h3>
                 <div className="flex items-center gap-2">
                     <label htmlFor="kpi-select" className="text-sm font-medium">KPI:</label>
                     <select id="kpi-select" value={selectedKpi} onChange={e => setSelectedKpi(e.target.value)} className="p-2 border rounded-md bg-bg-subtle text-sm">
                         {kpiList.map(kpi => <option key={kpi} value={kpi}>{kpi}</option>)}
                     </select>
                 </div>
            </div>
            
            <div className="card mb-6 p-4">
                <div style={{height: '250px'}}>
                    <ChartComponent type="line" data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-bg-subtle">
                            <th className="p-2 text-left sticky left-0 bg-bg-subtle">KPI / Magasin</th>
                            {performanceData.periods.map(p => <th key={p} className="p-2 text-right">{new Date(p + '-02').toLocaleString('fr-FR', {month: 'long', year: 'numeric'})}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {kpiList.map(kpi => (
                            <React.Fragment key={kpi}>
                                <tr className="bg-bg-subtle/50 font-bold text-text-main"><td className="p-2 sticky left-0 bg-bg-subtle/50" colSpan={performanceData.periods.length + 1}>{kpi}</td></tr>
                                {performanceData.stores.map(store => (
                                    <tr key={`${kpi}-${store.id}`}>
                                        <td className="p-2 pl-6 text-left sticky left-0 bg-surface">{store.name}</td>
                                        {performanceData.periods.map(p => <td key={p} className="p-2 text-right font-mono">{formatCurrency(performanceData.data[p]?.[store.id]?.[kpi] || 0)}</td>)}
                                    </tr>
                                ))}
                                <tr className="font-semibold bg-bg-subtle">
                                    <td className="p-2 text-left sticky left-0 bg-bg-subtle">Total {kpi}</td>
                                    {performanceData.periods.map(p => <td key={p} className="p-2 text-right font-mono">{formatCurrency(performanceData.stores.reduce((sum, s) => sum + (performanceData.data[p]?.[s.id]?.[kpi] || 0), 0))}</td>)}
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}


const ReportsHub = () => {
    const [activeTab, setActiveTab] = useState('pnl');

    return (
        <section id="reports-hub" className="view space-y-6">
            <header>
                <h2 className="text-2xl font-bold">Rapports & Analyses</h2>
                <p className="text-text-secondary">Explorez les performances détaillées de votre entreprise.</p>
            </header>

            <div className="card">
                <div className="card-header items-center">
                    <i className="fa fa-chart-pie mr-2"></i>
                    Analyses Financières
                    <div className="ml-auto flex gap-2 p-1 bg-bg-subtle rounded-lg">
                        <button className={`px-4 py-1.5 text-sm rounded-md font-semibold transition-colors ${activeTab === 'pnl' ? 'bg-white shadow-sm text-primary' : 'text-text-secondary'}`} onClick={() => setActiveTab('pnl')}>
                            Compte de Résultat
                        </button>
                        <button className={`px-4 py-1.5 text-sm rounded-md font-semibold transition-colors ${activeTab === 'performance' ? 'bg-white shadow-sm text-primary' : 'text-text-secondary'}`} onClick={() => setActiveTab('performance')}>
                            Suivi des Performances
                        </button>
                    </div>
                </div>

                <div className="mt-4">
                    {activeTab === 'pnl' && <PnlPanel />}
                    {activeTab === 'performance' && <PerformancePanel />}
                </div>
            </div>
        </section>
    );
};

export default ReportsHub;
