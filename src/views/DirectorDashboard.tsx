/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useMemo, useState } from 'react';
import ChartComponent from '../components/ChartComponent';
import { useAppContext } from '../contexts/AppContext';
import type { ExpenseCategory, SaleClosure, Expense } from '../types';

// Simple Markdown-to-HTML renderer
const SimpleMarkdown = ({ text }: { text: string }) => {
    const html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/## (.*)/g, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
        .replace(/\* (.*)/g, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
        .replace(/<\/ul>\s*<ul>/gs, '')
        .replace(/\n/g, '<br />');

    return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
}

const formatCurrency = (value: number) => {
    if (isNaN(value)) return '0 CFA';
    return value.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 });
};

const chartColors = {
  primary: 'hsl(195, 85%, 41%)',
  accent: 'hsl(16, 96%, 54%)',
  success: 'hsl(145, 55%, 45%)',
  warn: 'hsl(38, 95%, 52%)',
  danger: 'hsl(0, 85%, 60%)',
  neutral1: 'hsl(215, 15%, 45%)',
  neutral2: 'hsl(215, 25%, 20%)',
};


const DirectorDashboard = ({ onNavigate }) => {
    const { 
        salesClosures, stores, expenses, transfers, inventories, stockLevels, products, salesUnits, employees, losses,
        salesOrders,
        validateSaleClosure, openModal, getAiAnalysis, isGenerating, aiResponse, approveExpense
    } = useAppContext();
    
    const [activeTab, setActiveTab] = useState('synthesis');
    const [taskTab, setTaskTab] = useState('closures');
    const [prompt, setPrompt] = useState('');

    const today = new Date().toISOString().slice(0, 10);

    const kpis = useMemo(() => {
        const todayStr = '2025-08-05'; // Simulating for today's mock data
        const closuresToday = salesClosures.filter(c => c.date === todayStr);
        const dailyCA = closuresToday.reduce((acc, c) => acc + c.total, 0);
        
        const validatedClosures = salesClosures.filter(c => c.status === 'validated');
        const totalGrossMargin = validatedClosures.reduce((acc, c) => acc + (c.grossMargin || 0), 0);
        
        const totalRevenue = validatedClosures.reduce((acc, c) => acc + c.total, 0);
        const overallMarginPercentage = totalRevenue > 0 ? (totalGrossMargin / totalRevenue) * 100 : 0;

        const b2bOrdersInProgress = salesOrders.filter(o => o.status === 'En préparation' || o.status === 'Confirmée').length;

        // Most Profitable Store Calculation
        const magasinStores = stores.filter(s => s.type === 'Magasin');
        const performanceByStore = magasinStores.map(store => {
            const storeClosures = salesClosures.filter(sc => sc.storeId === store.id && sc.status === 'validated');
            const revenue = storeClosures.reduce((acc, sc) => acc + sc.total, 0);
            const cogs = storeClosures.reduce((acc, sc) => acc + (sc.totalCostOfGoodsSold || 0), 0);
            const margin = revenue - cogs;
            const salaries = employees.filter(e => e.store === store.name).reduce((acc, e) => acc + e.salary, 0);
            const otherExpenses = expenses.filter(e => e.storeId === store.id && e.status === 'Approuvé').reduce((acc, e) => acc + e.amount, 0);
            const lossValue = losses.filter(l => l.storeId === store.id).reduce((acc, l) => acc + l.value, 0);
            const netResult = margin - salaries - otherExpenses - lossValue;
            return { storeName: store.name, netResult };
        });
        
        let mostProfitableStore = { name: 'N/A', netResult: -Infinity };
        if (performanceByStore.length > 0) {
            const sorted = [...performanceByStore].sort((a,b) => b.netResult - a.netResult);
            mostProfitableStore = { name: sorted[0].storeName, netResult: sorted[0].netResult };
        }

        return {
            dailyCA,
            totalGrossMargin,
            overallMarginPercentage,
            b2bOrdersInProgress,
            mostProfitableStore,
        }
    }, [salesClosures, stores, employees, expenses, losses, salesOrders]);
    
    const pendingExpenses = useMemo(() => {
        return expenses.filter(exp => exp.status === 'En attente').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [expenses]);
    
    const commonChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                ticks: {
                    callback: (value) => `${Number(value).toLocaleString('fr-FR')} CFA`
                },
                grid: {
                    color: 'hsl(215, 20%, 90%)'
                }
            },
            x: {
                 grid: {
                    display: false,
                }
            }
        }
    };

    // --- Chart Data ---
    const salesByStoreData = useMemo(() => {
        const salesByStore = stores.filter(s => s.type === 'Magasin').map(store => {
            const total = salesClosures
                .filter(sc => sc.storeName === store.name)
                .reduce((acc, sc) => acc + sc.total, 0);
            return { name: store.name, total };
        });
        return {
            labels: salesByStore.map(s => s.name),
            datasets: [{
                label: 'CA (CFA)',
                data: salesByStore.map(s => s.total),
                backgroundColor: [chartColors.primary, chartColors.success, chartColors.accent],
                borderRadius: 6,
                borderSkipped: false,
            }]
        };
    }, [salesClosures, stores]);

    const expenseByStoreData = useMemo(() => {
        const expenseMap = new Map<string, number>();
        expenses.forEach(expense => {
            const storeName = stores.find(s => s.id === expense.storeId)?.name || 'Inconnu';
            expenseMap.set(storeName, (expenseMap.get(storeName) || 0) + expense.amount);
        });
        const labels = Array.from(expenseMap.keys());
        const data = Array.from(expenseMap.values());
        return {
            labels,
            datasets: [{
                label: 'Dépenses (CFA)',
                data: data,
                backgroundColor: [chartColors.danger, chartColors.warn, chartColors.accent],
                borderRadius: 6,
            }]
        };
    }, [expenses, stores]);
    
     const productSalesData = useMemo(() => {
        const salesByProduct: { [key: string]: number } = {};
        salesClosures.forEach(closure => {
            closure.lines.forEach(line => {
                const unit = salesUnits.find(u => u.id === line.unitId);
                if (!unit) return;
                const product = products.find(p => p.name === unit.baseProduct);
                if (!product) return;
                const revenue = unit.price * line.qty;
                if (salesByProduct[product.name]) {
                    salesByProduct[product.name] += revenue;
                } else {
                    salesByProduct[product.name] = revenue;
                }
            });
        });
        const sortedProducts = Object.entries(salesByProduct).sort(([,a],[,b]) => b - a);
        const labels = sortedProducts.map(([name]) => name);
        const data = sortedProducts.map(([,revenue]) => revenue);
        return {
            labels,
            datasets: [{
                data,
                backgroundColor: [chartColors.primary, chartColors.success, chartColors.accent, chartColors.warn, chartColors.danger, chartColors.neutral1, chartColors.neutral2]
            }]
        };
      }, [salesClosures, salesUnits, products]);

      const expenseByCategoryData = useMemo(() => {
        const expenseMap = new Map<string, number>();
        expenses.forEach(expense => {
          expenseMap.set(expense.category, (expenseMap.get(expense.category) || 0) + expense.amount);
        });
        const sortedCategories = Array.from(expenseMap.entries()).sort(([,a],[,b]) => b - a);
        const labels = sortedCategories.map(([name]) => name);
        const data = sortedCategories.map(([,revenue]) => revenue);
        return {
          labels,
          datasets: [{
            data,
            backgroundColor: [chartColors.danger, chartColors.warn, chartColors.accent, chartColors.success, chartColors.primary, chartColors.neutral1, chartColors.neutral2]
          }]
        }
      }, [expenses]);
      

    // --- Alerts & AI ---
    const pendingClosures = useMemo(() => salesClosures.filter(sc => sc.status === 'closed'), [salesClosures]);

    const alerts = useMemo(() => {
        const allAlerts = [];
        // Inventories for validation
        inventories.filter(inv => inv.status === 'En attente de validation').forEach(inv => {
            const storeName = stores.find(s => s.id === inv.storeId)?.name || 'Inconnu';
            allAlerts.push({
                id: `inv-${inv.id}`, type: 'danger', icon: 'fa-clipboard-list',
                message: `Inventaire pour ${storeName} attend la validation.`,
                action: { view: 'stock-hub', label: 'Valider' }
            });
        });
        // Low stock alerts
        const LOW_STOCK_THRESHOLD = 10;
        products.forEach(product => {
            Object.keys(stockLevels[product.id] || {}).forEach(storeIdStr => {
                const storeId = Number(storeIdStr);
                const stockInfo = stockLevels[product.id][storeId];
                if (stockInfo && stockInfo.length > 0) {
                    const totalQuantity = stockInfo.reduce((acc, batch) => acc + batch.quantity, 0);
                    if (totalQuantity > 0 && totalQuantity < LOW_STOCK_THRESHOLD) {
                        const store = stores.find(s => s.id === storeId);
                        if (store && store.type === 'Magasin') {
                            allAlerts.push({
                                id: `low-${product.id}-${storeId}`, type: 'warning', icon: 'fa-battery-quarter',
                                message: `Stock faible: ${product.name} à ${store.name} (${totalQuantity.toFixed(1)} ${product.stockUnit}).`,
                                action: { view: 'stock-hub', label: 'Gérer' }
                            });
                        }
                    }
                }
            });
        });
        // Pending transfers
        transfers.filter(t => t.status === 'En Transit').forEach(t => {
            const destStoreName = stores.find(s => s.id === t.destinationStoreId)?.name || 'Inconnu';
            allAlerts.push({
                id: `tr-${t.id}`, type: 'info', icon: 'fa-truck-fast',
                message: `Transfert ${t.id} vers ${destStoreName} est en transit.`,
                action: { view: 'stock-hub', label: 'Suivre' }
            });
        });


        return allAlerts.sort((a,b) => {
            const order = { 'danger': 1, 'warning': 2, 'info': 3 };
            return order[a.type] - order[b.type];
        });
    }, [transfers, inventories, stockLevels, products, stores]);

    const getAlertStyle = (type) => {
        switch (type) {
            case 'danger': return 'bg-danger-light text-danger-dark border-l-4 border-danger';
            case 'warning': return 'bg-warn-light text-warn-dark border-l-4 border-warn';
            case 'info': return 'bg-primary-light text-primary-text-on-light border-l-4 border-primary';
            default: return 'bg-bg-subtle';
        }
    };
    
    const getStoreName = (storeId: number) => stores.find(s => s.id === storeId)?.name || 'N/A';
    
    const quickPrompts = [
      { label: "Tendances de vente", prompt: "Quelles sont les tendances de vente pour la semaine à venir basées sur les données récentes ? Quel jour semble le plus performant ?" },
      { label: "Optimisation du stock", prompt: "Quels produits sont en sur-stock ou présentent un risque de rupture de stock imminent au magasin des Almadies ?" },
      { label: "Analyse des dépenses", prompt: "Y a-t-il des dépenses inhabituelles ou des catégories de coûts qui augmentent de manière significative ce mois-ci ?" },
    ];

    const handlePromptClick = (p: string) => {
      setPrompt(p);
      getAiAnalysis(p);
    }

    const handleCustomPrompt = () => {
      if(prompt.trim()) {
          getAiAnalysis(prompt.trim());
      }
    }


    return (
        <section id="director-dashboard" className="view active space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Tableau de bord</h2>
                    <p className="text-text-secondary">Vue d'ensemble de l'activité de Sakanaya.</p>
                </div>
                 <div className="flex gap-2">
                    <button className={`btn ${activeTab === 'synthesis' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('synthesis')}>
                        Synthèse
                    </button>
                    <button className={`btn ${activeTab === 'analysis' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('analysis')}>
                        Analyse
                    </button>
                    <button className={`btn ${activeTab === 'ai' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('ai')}>
                        Assistant IA
                    </button>
                </div>
            </header>

                {activeTab === 'synthesis' && (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            <div className="card flex items-center gap-4"><div className="icon-circle bg-primary-light text-primary"><i className="fa fa-wallet"></i></div><div><div className="kpi-label">Chiffre d'affaires (jour)</div><div className="kpi-number">{kpis.dailyCA.toLocaleString('fr-FR')} CFA</div></div></div>
                            <div className="card flex items-center gap-4"><div className="icon-circle bg-success-light text-success"><i className="fa fa-chart-line"></i></div><div><div className="kpi-label">Marge brute totale (réelle)</div><div className="kpi-number">{kpis.totalGrossMargin.toLocaleString('fr-FR')} CFA</div></div></div>
                             <div className="card flex items-center gap-4"><div className="icon-circle bg-blue-100 text-blue-600"><i className="fa fa-boxes"></i></div><div><div className="kpi-label">Commandes B2B en cours</div><div className="kpi-number">{kpis.b2bOrdersInProgress}</div></div></div>
                            <div className="card flex items-center gap-4">
                                <div className="icon-circle bg-accent-light text-accent"><i className="fa fa-trophy"></i></div>
                                <div>
                                    <div className="kpi-label">Magasin le plus rentable</div>
                                    {kpis.mostProfitableStore.name !== 'N/A' ? (
                                        <>
                                            <div className="kpi-number">{kpis.mostProfitableStore.name}</div>
                                            <div className="text-sm font-semibold text-accent-dark">Net: {formatCurrency(kpis.mostProfitableStore.netResult)}</div>
                                        </>
                                    ) : (
                                        <div className="kpi-number">N/A</div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Column */}
                            <div className="lg:col-span-2 space-y-6">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="card" style={{minHeight: '320px'}}><div className="card-header"><i className="fa fa-store mr-2 text-sm"></i> CA par magasin (total)</div><div style={{height: '260px'}}><ChartComponent type="bar" data={salesByStoreData} options={commonChartOptions} /></div></div>
                                    <div className="card" style={{minHeight: '320px'}}><div className="card-header"><i className="fa fa-money-bill-wave mr-2 text-sm"></i> Dépenses par magasin</div><div style={{height: '260px'}}><ChartComponent type="bar" data={expenseByStoreData} options={commonChartOptions} /></div></div>
                                </div>

                                <div className="card card-header-accent">
                                    <div className="card-header">
                                        <i className="fa fa-tasks mr-2"></i> Tâches en Attente
                                        <div className="ml-auto flex gap-1 bg-bg-subtle p-1 rounded-lg">
                                            <button className={`px-3 py-1 text-sm rounded-md font-semibold transition-colors ${taskTab === 'closures' ? 'bg-white shadow-sm text-primary' : 'text-text-secondary'}`} onClick={() => setTaskTab('closures')}>
                                                Clôtures {pendingClosures.length > 0 && <span className="ml-2 bg-primary text-white text-xs rounded-full px-2">{pendingClosures.length}</span>}
                                            </button>
                                            <button className={`px-3 py-1 text-sm rounded-md font-semibold transition-colors ${taskTab === 'expenses' ? 'bg-white shadow-sm text-accent' : 'text-text-secondary'}`} onClick={() => setTaskTab('expenses')}>
                                                Dépenses {pendingExpenses.length > 0 && <span className="ml-2 bg-accent text-white text-xs rounded-full px-2">{pendingExpenses.length}</span>}
                                            </button>
                                        </div>
                                    </div>

                                    {taskTab === 'closures' && (
                                        <div>
                                            {pendingClosures.length > 0 ? (
                                                <ul className="space-y-3">
                                                    {pendingClosures.map(sc => (
                                                        <li key={sc.id} className="p-3 rounded-lg flex items-center justify-between gap-4 bg-white border hover:bg-gray-50">
                                                            <div className="flex items-center gap-4"><i className="fa fa-file-invoice text-text-muted text-lg"></i><div className="text-sm"><span className="font-semibold text-text-main">Clôture pour {sc.storeName}</span><div className="text-xs text-text-muted">Date: {sc.date}</div></div></div>
                                                            <div className="font-bold text-lg text-primary">{sc.total.toLocaleString('fr-FR')} CFA</div>
                                                            <div className="flex gap-2"><button className="btn btn-ghost btn-sm" onClick={() => openModal('modalSaleClosureDetails', { closure: sc })}>Détails</button><button className="btn btn-accent btn-sm" onClick={() => validateSaleClosure(sc.id)}>Valider</button></div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div className="text-center py-8"><i className="fa fa-check-circle text-success text-4xl mb-3"></i><h4 className="font-semibold">Aucune clôture en attente</h4><p className="text-sm text-text-muted">Toutes les clôtures soumises ont été validées.</p></div>
                                            )}
                                        </div>
                                    )}

                                    {taskTab === 'expenses' && (
                                        <div>
                                            {pendingExpenses.length > 0 ? (
                                                <ul className="space-y-3">
                                                    {pendingExpenses.map(exp => (
                                                         <li key={exp.id} className="p-3 rounded-lg flex items-center justify-between gap-4 bg-white border hover:bg-bg-subtle transition-colors duration-150">
                                                            <div className="flex items-center gap-4 flex-grow">
                                                                <i className="fa fa-receipt text-text-muted text-lg"></i>
                                                                <div className="text-sm flex-grow">
                                                                    <span className="font-semibold text-text-main">{exp.description}</span>
                                                                    <span className="text-text-secondary"> - {getStoreName(exp.storeId)}</span>
                                                                    <div className="text-xs text-text-muted">{exp.category} • {new Date(exp.date).toLocaleDateString('fr-FR')}</div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right flex-shrink-0 mx-4">
                                                                <div className="font-bold text-lg text-danger-dark">{exp.amount.toLocaleString('fr-FR')} CFA</div>
                                                            </div>
                                                            <div className="flex-shrink-0">
                                                                <button onClick={() => approveExpense(exp.id)} className="btn btn-accent btn-sm">
                                                                    <i className="fa fa-check mr-2"></i>Approuver
                                                                </button>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div className="text-center py-8"><i className="fa fa-check-circle text-success text-4xl mb-3"></i><h4 className="font-semibold">Aucune dépense en attente</h4><p className="text-sm text-text-muted">Toutes les dépenses soumises ont été approuvées.</p></div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Side Column */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="card">
                                    <div className="card-header"><i className="fa fa-bell mr-2"></i> Alertes & Tâches</div>
                                    {alerts.length > 0 ? (<ul className="space-y-3">{alerts.map(alert => (<li key={alert.id} className={`p-3 rounded-lg flex items-start gap-3 ${getAlertStyle(alert.type)}`}><i className={`fa ${alert.icon} mt-1`}></i><div><p className="text-sm font-semibold">{alert.message}</p><button onClick={() => onNavigate(alert.action.view)} className="text-xs font-bold opacity-80 hover:opacity-100 mt-1">{alert.action.label} <i className="fa fa-arrow-right text-xs ml-1"></i></button></div></li>))}</ul>) : (<div className="text-center py-8"><i className="fa fa-check-circle text-success text-4xl mb-3"></i><h4 className="font-semibold">Tout est en ordre</h4><p className="text-sm text-text-muted">Aucune alerte ou tâche critique.</p></div>)}
                                </div>
                                 <div className="card bg-primary-light">
                                    <div className="card-header"><i className="fa fa-plus mr-2"></i> Actions Rapides</div>
                                     <div className="grid grid-cols-2 gap-3">
                                        <button className="p-3 text-center bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow" onClick={() => openModal('modalNouvelArrivage')}><i className="fa fa-truck-loading mb-1"></i><div className="text-sm font-semibold">Arrivage</div></button>
                                        <button className="p-3 text-center bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow" onClick={() => openModal('modalNouveauTransfert')}><i className="fa fa-exchange-alt mb-1"></i><div className="text-sm font-semibold">Transfert</div></button>
                                        <button className="p-3 text-center bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow" onClick={() => openModal('modalAjoutDepense')}><i className="fa fa-money-bill-wave mb-1"></i><div className="text-sm font-semibold">Dépense</div></button>
                                        <button className="p-3 text-center bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow" onClick={() => onNavigate('hr-view')}><i className="fa fa-user-plus mb-1"></i><div className="text-sm font-semibold">Employé</div></button>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'analysis' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="card"><div className="card-header">Analyse du CA par produit</div><div style={{height:'300px'}}><ChartComponent type='doughnut' data={productSalesData} options={{responsive:true, maintainAspectRatio:false, plugins: {legend:{position: 'right'}}}}/></div></div>
                            <div className="card"><div className="card-header">Analyse des dépenses par catégorie</div><div style={{height:'300px'}}><ChartComponent type='pie' data={expenseByCategoryData} options={{responsive:true, maintainAspectRatio:false, plugins: {legend:{position: 'right'}}}}/></div></div>
                        </div>
                        <div className="card">
                          <div className="card-header">Historique des clôtures de vente</div>
                          <div className="overflow-x-auto max-h-80"><table className="w-full text-sm"><thead><tr><th>Date</th><th>Magasin</th><th className="text-right">CA (CFA)</th><th className="text-center">Statut</th><th className="text-center">Actions</th></tr></thead><tbody>
                            {salesClosures.length > 0 ? salesClosures.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(sc => (
                              <tr key={sc.id}><td>{sc.date}</td><td>{sc.storeName}</td><td className="text-right font-medium">{sc.total.toLocaleString('fr-FR')}</td><td className="text-center">{sc.status === 'validated' ? <span className="status-chip status-green">Validé</span> : <span className="status-chip status-blue">En attente</span>}</td><td className="text-center"><button className="btn btn-ghost btn-sm" onClick={() => openModal('modalSaleClosureDetails', { closure: sc })}><i className="fa fa-eye"></i> Voir</button></td></tr>
                            )) : (<tr><td colSpan={5} className="text-center py-4 text-text-muted">Aucune clôture de vente enregistrée.</td></tr>)}
                          </tbody></table></div>
                        </div>
                        <div className="card">
                          <div className="card-header">Historique des dépenses</div>
                           <div className="overflow-x-auto max-h-80"><table className="w-full text-sm"><thead><tr><th>Date</th><th>Magasin</th><th>Catégorie</th><th>Description</th><th className="text-right">Montant (CFA)</th><th className="text-center">Statut</th></tr></thead><tbody>
                                {expenses.length > 0 ? expenses.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((exp: Expense) => (<tr key={exp.id}><td>{exp.date}</td><td>{stores.find(s => s.id === exp.storeId)?.name || 'N/A'}</td><td>{exp.category}</td><td className="text-xs">{exp.description}</td><td className="text-right font-medium">{exp.amount.toLocaleString('fr-FR')}</td><td className="text-center">{exp.status === 'Approuvé' ? <span className="status-chip status-green">Approuvé</span> : <span className="status-chip status-blue">En attente</span>}</td></tr>)) : (<tr><td colSpan={6} className="text-center py-4 text-text-muted">Aucune dépense enregistrée.</td></tr>)}
                           </tbody></table></div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'ai' && (
                    <div className="space-y-4">
                       <div><h3 className="font-semibold text-lg">Assistant d'Analyse IA</h3><p className="text-sm text-text-secondary">Posez des questions en langage naturel pour obtenir des informations sur vos données.</p></div>
                       <div className="card bg-primary-light">
                           <div className="card-header text-sm">Suggestions de démarrage</div>
                           <div className="flex flex-wrap gap-2">{quickPrompts.map(p => (<button key={p.label} className="btn btn-ghost bg-white/60 btn-sm" onClick={() => handlePromptClick(p.prompt)}>{p.label}</button>))}</div>
                           <div className="mt-4"><textarea className="w-full p-2 border rounded-md text-sm" rows={3} placeholder="Ou posez votre propre question ici... Ex: Compare les performances des ventes de Thon et de Crevettes sur la dernière semaine." value={prompt} onChange={(e) => setPrompt(e.target.value)}></textarea><div className="text-right mt-2"><button className="btn btn-primary" onClick={handleCustomPrompt} disabled={isGenerating}>{isGenerating ? 'Génération...' : "Lancer l'analyse"}</button></div></div>
                       </div>
                       <div>
                          <h3 className="font-semibold mb-2">Résultat de l'analyse</h3>
                          <div className="card min-h-[200px] bg-white">
                              {isGenerating ? (<div className="space-y-4 animate-pulse"><div className="h-4 bg-gray-200 rounded w-1/3"></div><div className="h-3 bg-gray-200 rounded w-full"></div><div className="h-3 bg-gray-200 rounded w-5/6"></div><div className="h-3 bg-gray-200 rounded w-full"></div></div>) : aiResponse ? (<SimpleMarkdown text={aiResponse} />) : (<div className="text-center text-text-muted py-10"><i className="fa-solid fa-lightbulb text-4xl mb-3"></i><p>Les résultats de votre analyse apparaîtront ici.</p></div>)}
                          </div>
                       </div>
                    </div>
                )}
        </section>
    );
};

export default DirectorDashboard;