/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { CurrentUser } from '../App';
import type { SaleClosure } from '../types';
import ChartComponent from '../components/ChartComponent';

interface StoreDashboardProps {
    onNavigate: (view: string) => void;
    currentUser: CurrentUser;
}

const StoreDashboard = ({ onNavigate, currentUser }: StoreDashboardProps) => {
    const { salesClosures, transfers, stores, stockLevels, products, openModal } = useAppContext();

    const myStore = useMemo(() => {
        if (currentUser.role === 'Directeur') return null;
        const roleStoreName = currentUser.role.match(/\(([^)]+)\)/)?.[1];
        return stores.find(s => s.name.includes(roleStoreName || '')) || null;
    }, [currentUser.role, stores]);

    if (!myStore) {
        return <div className="card"><div className="card-header">Erreur</div><p>Impossible de déterminer le magasin de l'utilisateur.</p></div>;
    }

    // --- KPIs ---
    const { dailyCA, dailyGrossMargin, pendingClosuresCount, pendingReceptionsCount } = useMemo(() => {
        const todayStr = '2025-08-05'; // Mocked for demo data
        const myStoreClosures = salesClosures.filter(c => c.storeId === myStore.id);

        const dailyCA = myStoreClosures
            .filter(c => c.date === todayStr)
            .reduce((sum, c) => sum + c.total, 0);
        
        const dailyGrossMargin = myStoreClosures
            .filter(c => c.date === todayStr && c.status === 'validated')
            .reduce((sum, c) => sum + (c.grossMargin || 0), 0);

        const pendingClosuresCount = myStoreClosures.filter(c => c.status === 'closed').length;
        
        const pendingReceptionsCount = transfers.filter(t => t.destinationStoreId === myStore.id && t.status === 'En Transit').length;

        return { dailyCA, dailyGrossMargin, pendingClosuresCount, pendingReceptionsCount };

    }, [salesClosures, myStore.id, transfers]);
    

    // --- Alerts ---
    const alerts = useMemo(() => {
        const allAlerts: { id: string, type: 'warning' | 'info', icon: string, message: string, action: () => void, actionLabel: string }[] = [];
        
        // Pending receptions
        transfers.filter(t => t.destinationStoreId === myStore.id && t.status === 'En Transit').forEach(transfer => {
            const sourceStoreName = stores.find(s => s.id === transfer.sourceStoreId)?.name || 'Inconnu';
            allAlerts.push({
                id: `transfer-${transfer.id}`,
                type: 'info',
                icon: 'fa-truck',
                message: `Réception en attente depuis ${sourceStoreName}.`,
                action: () => openModal('modalReceptionTransfert', { transfer }),
                actionLabel: 'Réceptionner'
            });
        });

        // Low stock
        const LOW_STOCK_THRESHOLD = 5;
        products.forEach(product => {
            const stockInfo = stockLevels[product.id]?.[myStore.id];
            if (stockInfo && stockInfo.length > 0) {
                const totalQuantity = stockInfo.reduce((acc, batch) => acc + batch.quantity, 0);
                if (totalQuantity > 0 && totalQuantity < LOW_STOCK_THRESHOLD) {
                    allAlerts.push({
                        id: `low-${product.id}`,
                        type: 'warning',
                        icon: 'fa-exclamation-triangle',
                        message: `Stock faible: ${product.name} (${totalQuantity.toFixed(1)} ${product.stockUnit}).`,
                        action: () => onNavigate('store-stock-hub'),
                        actionLabel: 'Gérer le stock'
                    });
                }
            }
        });
        
        return allAlerts.sort((a,b) => {
            const order = { 'info': 1, 'warning': 2 }; // Receptions are more important
            return order[a.type] - order[b.type];
        });
    }, [products, stockLevels, myStore.id, transfers, stores, onNavigate, openModal]);

    const getAlertStyle = (type: 'warning' | 'info') => {
        switch (type) {
            case 'warning': return 'bg-warn-light text-warn-dark border-l-4 border-warn';
            case 'info': return 'bg-primary-light text-primary-text-on-light border-l-4 border-primary';
            default: return 'bg-bg-subtle';
        }
    };
    
    // --- Chart Data ---
    const last7DaysPerformance = useMemo(() => {
        const performanceData: { [key: string]: { ca: number; margin: number } } = {};
        const today = new Date('2025-08-05');

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().slice(0, 10);
            const dayLabel = date.toLocaleDateString('fr-FR', { weekday: 'short' });
            
            const closuresOnDate = salesClosures.filter(c => c.storeId === myStore.id && c.date === dateStr);
            const validatedClosuresOnDate = closuresOnDate.filter(c => c.status === 'validated');

            performanceData[dayLabel] = {
                ca: closuresOnDate.reduce((sum, c) => sum + c.total, 0),
                margin: validatedClosuresOnDate.reduce((sum, c) => sum + (c.grossMargin || 0), 0)
            };
        }
        
        const labels = Object.keys(performanceData);
        return {
            labels,
            datasets: [
                {
                    label: 'CA',
                    data: labels.map(label => performanceData[label].ca),
                    backgroundColor: 'hsla(195, 85%, 41%, 0.8)',
                    borderColor: 'hsl(195, 85%, 41%)',
                    type: 'bar',
                    order: 2,
                    borderRadius: 4,
                },
                {
                    label: 'Marge Brute',
                    data: labels.map(label => performanceData[label].margin),
                    backgroundColor: 'hsl(145, 55%, 45%)',
                    borderColor: 'hsl(145, 55%, 45%)',
                    type: 'line',
                    tension: 0.3,
                    order: 1,
                    pointRadius: 4,
                    pointBackgroundColor: 'hsl(145, 55%, 45%)',
                }
            ]
        };
    }, [salesClosures, myStore.id]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: true, position: 'top' as const, align: 'end' as const },
        },
        scales: {
            y: {
                ticks: {
                    callback: (value: any) => `${Number(value / 1000)}k`
                }
            },
            x: {
                 grid: { display: false }
            }
        },
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
    };

    // --- Render ---
    return (
        <section id="store-dashboard" className="view space-y-6">
            <header>
                <h2 className="text-2xl font-bold">Tableau de bord - {myStore.name}</h2>
                <p className="text-text-secondary">Bienvenue, {currentUser.name}. Voici un aperçu de votre journée.</p>
            </header>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card flex items-center gap-4"><div className="icon-circle bg-primary-light text-primary"><i className="fa fa-wallet"></i></div><div><div className="kpi-label">CA du jour (simulé)</div><div className="kpi-number">{dailyCA.toLocaleString('fr-FR')} CFA</div></div></div>
                <div className="card flex items-center gap-4"><div className="icon-circle bg-success-light text-success"><i className="fa fa-chart-line"></i></div><div><div className="kpi-label">Marge du Jour (réelle)</div><div className="kpi-number">{dailyGrossMargin.toLocaleString('fr-FR')} CFA</div></div></div>
                <div className="card flex items-center gap-4"><div className="icon-circle bg-warn-light text-warn"><i className="fa fa-file-invoice-dollar"></i></div><div><div className="kpi-label">Clôtures en attente</div><div className="kpi-number">{pendingClosuresCount}</div></div></div>
                <div className="card flex items-center gap-4"><div className="icon-circle bg-blue-100 text-blue-600"><i className="fa fa-truck-loading"></i></div><div><div className="kpi-label">Réceptions à traiter</div><div className="kpi-number">{pendingReceptionsCount}</div></div></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card">
                        <div className="card-header"><i className="fa fa-rocket mr-2"></i>Accès Rapides</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button className="p-4 flex flex-col items-center justify-center text-center rounded-lg bg-primary-light hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-border-color" onClick={() => onNavigate('store-finance-hub')}>
                                <i className="fa fa-cash-register text-3xl mb-2 text-primary"></i>
                                <span className="font-semibold">Saisir les ventes</span>
                            </button>
                            <button className="p-4 flex flex-col items-center justify-center text-center rounded-lg bg-primary-light hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-border-color" onClick={() => onNavigate('store-stock-hub')}>
                                <i className="fa fa-boxes text-3xl mb-2 text-primary"></i>
                                <span className="font-semibold">Gérer le stock</span>
                            </button>
                            <button className="p-4 flex flex-col items-center justify-center text-center rounded-lg bg-primary-light hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-border-color" onClick={() => onNavigate('prices-view')}>
                                <i className="fa fa-dollar-sign text-3xl mb-2 text-primary"></i>
                                <span className="font-semibold">Voir les Prix</span>
                            </button>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header"><i className="fa fa-chart-bar mr-2"></i>Performance sur 7 jours</div>
                        <div style={{ height: '250px' }}>
                            <ChartComponent type="bar" data={last7DaysPerformance} options={chartOptions} />
                        </div>
                    </div>
                </div>

                {/* Side Column: Alerts */}
                <div className="lg:col-span-1">
                    <div className="card">
                        <div className="card-header"><i className="fa fa-bell mr-2"></i>Tâches & Alertes</div>
                        {alerts.length > 0 ? (
                            <ul className="space-y-3">
                                {alerts.map(alert => (
                                    <li key={alert.id} className={`p-3 rounded-lg flex items-start gap-3 ${getAlertStyle(alert.type)}`}>
                                        <i className={`fa ${alert.icon} mt-1`}></i>
                                        <div>
                                            <p className="text-sm font-semibold">{alert.message}</p>
                                            <button onClick={alert.action} className="text-xs font-bold opacity-80 hover:opacity-100 mt-1">{alert.actionLabel} <i className="fa fa-arrow-right text-xs ml-1"></i></button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-8 text-text-muted">
                                <i className="fa fa-check-circle text-3xl mb-2 text-success"></i>
                                <h4 className="font-semibold">Tout est en ordre !</h4>
                                <p className="text-sm">Aucune tâche prioritaire.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StoreDashboard;