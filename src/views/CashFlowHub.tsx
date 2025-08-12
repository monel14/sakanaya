/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import ChartComponent from '../components/ChartComponent';

const formatCurrency = (value: number) => {
    if (isNaN(value)) return '0 CFA';
    return value.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 });
};

const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const CashFlowHub = () => {
    const { invoices, clients, expenses, employees, arrivals, suppliers, bankStatements } = useAppContext();

    const forecastData = useMemo(() => {
        const today = new Date('2025-08-06'); // Mock date to have data
        today.setHours(0, 0, 0, 0);
        const forecastDays = 30;
        
        const initialBalance = bankStatements[0]?.endBalance || 0;
        
        const dailyFlows: Record<string, { inflows: number; outflows: number; inflowDetails: any[], outflowDetails: any[] }> = {};

        // Inflows from invoices
        invoices.filter(inv => inv.status === 'Envoyée').forEach(inv => {
            const dueDateStr = new Date(inv.dueDate).toISOString().slice(0, 10);
            if (!dailyFlows[dueDateStr]) dailyFlows[dueDateStr] = { inflows: 0, outflows: 0, inflowDetails: [], outflowDetails: [] };
            dailyFlows[dueDateStr].inflows += inv.totalValue;
            dailyFlows[dueDateStr].inflowDetails.push({
                type: 'Facture Client',
                description: `Facture #${inv.id} - ${clients.find(c=>c.id === inv.clientId)?.companyName}`,
                amount: inv.totalValue,
                date: dueDateStr,
            });
        });

        // Outflows from salaries
        const totalMonthlySalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
        const salaryDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of current month
        salaryDate.setDate(28);
        const salaryDateStr = salaryDate.toISOString().slice(0, 10);
        if (!dailyFlows[salaryDateStr]) dailyFlows[salaryDateStr] = { inflows: 0, outflows: 0, inflowDetails: [], outflowDetails: [] };
        dailyFlows[salaryDateStr].outflows += totalMonthlySalary;
        dailyFlows[salaryDateStr].outflowDetails.push({ type: 'Salaires', description: 'Masse Salariale Mensuelle', amount: totalMonthlySalary, date: salaryDateStr });

        // Outflows from recurring expenses (rent)
        const lastRent = expenses.find(e => e.category === 'Loyer');
        if (lastRent) {
            const rentDate = new Date(today);
            rentDate.setMonth(rentDate.getMonth() + 1, 3); // 3rd of next month
            const rentDateStr = rentDate.toISOString().slice(0, 10);
            if (!dailyFlows[rentDateStr]) dailyFlows[rentDateStr] = { inflows: 0, outflows: 0, inflowDetails: [], outflowDetails: [] };
            dailyFlows[rentDateStr].outflows += lastRent.amount;
            dailyFlows[rentDateStr].outflowDetails.push({ type: 'Loyer', description: 'Loyer mensuel', amount: lastRent.amount, date: rentDateStr });
        }
        
        // Outflows from supplier payments
        arrivals.forEach(arrival => {
            const supplier = suppliers.find(s => s.name === arrival.supplierName);
            if (!supplier) return;
            const paymentTermsDays = parseInt(supplier.paymentTerms.split(' ')[0]) || 0;
            const paymentDate = addDays(new Date(arrival.date), paymentTermsDays);
            const paymentDateStr = paymentDate.toISOString().slice(0, 10);
            
            if (paymentDate > today) {
                 if (!dailyFlows[paymentDateStr]) dailyFlows[paymentDateStr] = { inflows: 0, outflows: 0, inflowDetails: [], outflowDetails: [] };
                 dailyFlows[paymentDateStr].outflows += arrival.totalValue;
                 dailyFlows[paymentDateStr].outflowDetails.push({ type: 'Paiement Fournisseur', description: `Facture ${supplier.name} (BR #${arrival.id})`, amount: arrival.totalValue, date: paymentDateStr });
            }
        });


        const forecast = [];
        let runningBalance = initialBalance;
        let totalProjectedInflows = 0;
        let totalProjectedOutflows = 0;

        for (let i = 0; i < forecastDays; i++) {
            const date = addDays(today, i);
            const dateStr = date.toISOString().slice(0, 10);
            const flows = dailyFlows[dateStr] || { inflows: 0, outflows: 0 };
            runningBalance += flows.inflows - flows.outflows;
            totalProjectedInflows += flows.inflows;
            totalProjectedOutflows += flows.outflows;
            forecast.push({ date: dateStr, balance: runningBalance });
        }
        
        const allInflowDetails = Object.values(dailyFlows).flatMap(d => d.inflowDetails).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const allOutflowDetails = Object.values(dailyFlows).flatMap(d => d.outflowDetails).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return {
            initialBalance,
            totalProjectedInflows,
            totalProjectedOutflows,
            labels: forecast.map(f => new Date(f.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })),
            data: forecast.map(f => f.balance),
            inflowDetails: allInflowDetails,
            outflowDetails: allOutflowDetails,
        };
    }, [invoices, clients, expenses, employees, arrivals, suppliers, bankStatements]);

    const chartData = {
        labels: forecastData.labels,
        datasets: [
            {
                label: 'Solde de trésorerie projeté',
                data: forecastData.data,
                fill: true,
                backgroundColor: 'hsla(195, 85%, 41%, 0.1)',
                borderColor: 'hsl(195, 85%, 41%)',
                tension: 0.2,
                pointRadius: 2,
            },
            {
                label: 'Seuil de sécurité',
                data: Array(forecastData.data.length).fill(0),
                borderColor: 'hsl(0, 85%, 60%)',
                borderDash: [5, 5],
                pointRadius: 0,
                borderWidth: 1,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { ticks: { callback: (value: number) => `${(value / 1000).toFixed(0)}k` } }
        }
    };

    return (
        <section id="cash-flow-hub" className="view space-y-6">
            <header>
                <h2 className="text-2xl font-bold">Pôle Trésorerie</h2>
                <p className="text-text-secondary">Prévision des flux de trésorerie sur les 30 prochains jours.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card text-center"><div className="kpi-label">Trésorerie Actuelle</div><div className="kpi-number">{formatCurrency(forecastData.initialBalance)}</div></div>
                <div className="card text-center"><div className="kpi-label">Entrées Prévues (30j)</div><div className="kpi-number text-success">{formatCurrency(forecastData.totalProjectedInflows)}</div></div>
                <div className="card text-center"><div className="kpi-label">Sorties Prévues (30j)</div><div className="kpi-number text-danger">{formatCurrency(forecastData.totalProjectedOutflows)}</div></div>
            </div>

            <div className="card">
                <div className="card-header"><i className="fa fa-chart-line mr-2"></i>Évolution prévisionnelle de la trésorerie</div>
                <div style={{ height: '250px' }}>
                    <ChartComponent type="line" data={chartData} options={chartOptions} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <div className="card-header"><i className="fa fa-arrow-down mr-2 text-success"></i>Entrées de Trésorerie à Venir</div>
                    <div className="overflow-y-auto max-h-80">
                        <table className="w-full text-sm">
                            <thead><tr><th>Date</th><th>Description</th><th className="text-right">Montant</th></tr></thead>
                            <tbody>
                                {forecastData.inflowDetails.length > 0 ? forecastData.inflowDetails.map((item, index) => (
                                    <tr key={index}>
                                        <td>{new Date(item.date).toLocaleDateString('fr-FR')}</td>
                                        <td className="text-xs">{item.description}</td>
                                        <td className="text-right font-medium text-success">{formatCurrency(item.amount)}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={3} className="text-center py-6 text-text-muted">Aucune entrée de fonds prévue.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                 <div className="card">
                    <div className="card-header"><i className="fa fa-arrow-up mr-2 text-danger"></i>Sorties de Trésorerie à Venir</div>
                     <div className="overflow-y-auto max-h-80">
                        <table className="w-full text-sm">
                             <thead><tr><th>Date</th><th>Description</th><th className="text-right">Montant</th></tr></thead>
                            <tbody>
                                 {forecastData.outflowDetails.length > 0 ? forecastData.outflowDetails.map((item, index) => (
                                    <tr key={index}>
                                        <td>{new Date(item.date).toLocaleDateString('fr-FR')}</td>
                                        <td className="text-xs">{item.description}</td>
                                        <td className="text-right font-medium text-danger">{formatCurrency(item.amount)}</td>
                                    </tr>
                                )) : (
                                     <tr><td colSpan={3} className="text-center py-6 text-text-muted">Aucune sortie de fonds prévue.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CashFlowHub;
