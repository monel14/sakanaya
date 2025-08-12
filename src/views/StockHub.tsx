/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { Transfer, Inventory, Loss, Arrival } from '../types';

const StockHub = () => {
    const { 
        openModal, arrivals, stores, transfers, products, losses, inventories, stockLevels
    } = useAppContext();
    const [activeTab, setActiveTab] = useState('levels');
    
    // --- Memoized KPIs ---
    const kpis = useMemo(() => {
        const totalStockValue = Object.values(stockLevels).flatMap(productStocks => 
            Object.values(productStocks as Record<number, { quantity: number; cump: number; }[]>).flatMap(storeBatches => 
                storeBatches.map(batch => batch.quantity * batch.cump)
            )
        ).reduce((sum, value) => sum + value, 0);

        const lowStockThreshold = 10;
        const lowStockItems = new Set();
        Object.entries(stockLevels).forEach(([productId, storeData]) => {
            Object.entries(storeData as Record<number, { quantity: number; cump: number; }[]>).forEach(([storeId, stockInfo]) => {
                 const totalQuantity = stockInfo.reduce((acc, batch) => acc + batch.quantity, 0);
                const store = stores.find(s => s.id === Number(storeId));
                if (store?.type === 'Magasin' && totalQuantity > 0 && totalQuantity < lowStockThreshold) {
                    lowStockItems.add(`${productId}-${storeId}`);
                }
            });
        });

        const transfersInTransit = transfers.filter(t => t.status === 'En Transit').length;
        const inventoriesToValidate = inventories.filter(inv => inv.status === 'En attente de validation').length;

        return {
            totalStockValue,
            lowStockItems: lowStockItems.size,
            transfersInTransit,
            inventoriesToValidate,
        };
    }, [stockLevels, transfers, inventories, stores]);


    const getStoreName = (storeId: number) => stores.find(s => s.id === storeId)?.name || 'N/A';
    
    const getStatusChip = (status: Transfer['status'] | Inventory['status']) => {
        switch (status) {
            case 'En Transit': return <span className="status-chip status-blue">En Transit</span>;
            case 'Terminé': return <span className="status-chip status-green">Terminé</span>;
            case 'Terminé avec Écart': return <span className="status-chip status-yellow">Écart</span>;
            case 'En Cours': return <span className="status-chip status-blue">En Cours</span>;
            case 'En attente de validation': return <span className="status-chip status-yellow animate-pulse">Validation</span>;
            case 'Validé': return <span className="status-chip status-green">Validé</span>;
            default: return <span>{status}</span>;
        }
    }
    
    const allActiveStores = useMemo(() => stores.filter(s => s.status === 'Actif').sort((a, b) => a.type === 'Hub' ? -1 : 1), [stores]);

    const stockLevelsTableData = useMemo(() => {
        return products.map(product => {
            let totalQuantity = 0;
            const storeQuantities = {};

            allActiveStores.forEach(store => {
                const batches = stockLevels[product.id]?.[store.id];
                const quantity = batches ? batches.reduce((sum, b) => sum + b.quantity, 0) : 0;
                (storeQuantities as any)[store.id] = quantity;
                totalQuantity += quantity;
            });

            return {
                productId: product.id,
                productName: product.name,
                stockUnit: product.stockUnit,
                storeQuantities,
                totalQuantity,
            };
        }).sort((a, b) => a.productName.localeCompare(b.productName));
    }, [products, stockLevels, allActiveStores]);
    
    // --- Render Components for Tabs ---
    const LevelsPanel = () => (
        <div>
            <h3 className="font-semibold mb-4">Niveaux de Stock par Produit et Magasin</h3>
            <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-bg-subtle z-10">
                        <tr>
                            <th className="text-left">Produit</th>
                            {allActiveStores.map(store => (
                                <th key={store.id} className="text-right">{store.name}</th>
                            ))}
                            <th className="text-right font-bold border-l-2 border-border-color">Total Général</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stockLevelsTableData.map(item => {
                            const totalIsLow = item.totalQuantity < 10 && item.totalQuantity > 0;
                            return (
                                <tr key={item.productId} className={totalIsLow ? 'bg-warn-light/50' : ''}>
                                    <td className="font-semibold">{item.productName}</td>
                                    {allActiveStores.map(store => {
                                        const quantity = (item.storeQuantities as any)[store.id];
                                        const isLow = quantity < 5 && quantity > 0;
                                        return (
                                            <td key={store.id} className={`text-right ${isLow ? 'text-warn-dark font-bold' : ''}`}>
                                                {quantity > 0 
                                                    ? `${quantity.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
                                                    : <span className="text-text-muted">-</span>
                                                }
                                            </td>
                                        )
                                    })}
                                    <td className="text-right font-bold border-l-2 border-border-color bg-bg-subtle">
                                        {item.totalQuantity.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {item.stockUnit}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
    const TransfersPanel = () => (
        <div>
            <div className="overflow-x-auto max-h-96"><table className="w-full text-sm"><thead><tr><th>#Bon</th><th>De</th><th>Vers</th><th className="text-center">Statut</th><th>Date</th><th className="text-center">Action</th></tr></thead><tbody>
            {transfers.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()).map(t => (
                <tr key={t.id}>
                    <td className="font-mono">{t.id}</td><td>{getStoreName(t.sourceStoreId)}</td><td>{getStoreName(t.destinationStoreId)}</td><td className="text-center">{getStatusChip(t.status)}</td><td>{t.creationDate}</td>
                    <td className="text-center"><button className="btn btn-ghost btn-sm" onClick={() => openModal('modalReceptionTransfert', { transfer: t })}>Détails</button></td>
                </tr>
            ))}
            </tbody></table></div>
        </div>
    );

    const InventoriesPanel = () => (
        <div>
            <div className="overflow-x-auto max-h-96"><table className="w-full text-sm"><thead><tr><th>#ID</th><th>Magasin</th><th>Date Création</th><th className="text-center">Statut</th><th className="text-center">Action</th></tr></thead><tbody>
            {inventories.sort((a,b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()).map(inv => (
                <tr key={inv.id} className={`${inv.status === 'En attente de validation' ? 'bg-warn-light' : ''}`}>
                    <td className="font-mono">{inv.id}</td><td>{getStoreName(inv.storeId)}</td><td>{inv.creationDate}</td><td className="text-center">{getStatusChip(inv.status)}</td>
                    <td className="text-center"><button className="btn btn-primary btn-sm" onClick={() => openModal('modalInventaireDetails', { inventory: inv })}>Détails & Valider</button></td>
                </tr>
            ))}
            </tbody></table></div>
        </div>
    );

    return (
        <section id="stock-hub" className="view space-y-6">
            <header>
                <h2 className="text-2xl font-bold">Pôle Stock</h2>
                <p className="text-text-secondary">Pilotage central des mouvements de stock et des inventaires.</p>
            </header>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card flex items-center gap-4"><div className="icon-circle bg-primary-light text-primary"><i className="fa fa-wallet"></i></div><div><div className="kpi-label">Valeur Totale du Stock</div><div className="kpi-number">{kpis.totalStockValue.toLocaleString('fr-FR')} CFA</div></div></div>
                <div className="card flex items-center gap-4"><div className="icon-circle bg-warn-light text-warn"><i className="fa fa-battery-quarter"></i></div><div><div className="kpi-label">Articles en Stock Bas</div><div className="kpi-number">{kpis.lowStockItems}</div></div></div>
                <div className="card flex items-center gap-4"><div className="icon-circle bg-blue-100 text-blue-600"><i className="fa fa-truck-fast"></i></div><div><div className="kpi-label">Transferts en Transit</div><div className="kpi-number">{kpis.transfersInTransit}</div></div></div>
                <div className="card flex items-center gap-4"><div className="icon-circle bg-accent-light text-accent"><i className="fa fa-clipboard-check"></i></div><div><div className="kpi-label">Inventaires à Valider</div><div className="kpi-number">{kpis.inventoriesToValidate}</div></div></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    <div className="card">
                        <div className="flex gap-2 mb-4 border-b pb-2 flex-wrap">
                             <button className={`btn btn-sm ${activeTab === 'levels' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('levels')}>Niveaux</button>
                             <button className={`btn btn-sm ${activeTab === 'transfers' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('transfers')}>Transferts</button>
                             <button className={`btn btn-sm ${activeTab === 'inventories' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('inventories')}>Inventaires</button>
                        </div>
                        {activeTab === 'levels' && <LevelsPanel />}
                        {activeTab === 'transfers' && <TransfersPanel />}
                        {activeTab === 'inventories' && <InventoriesPanel />}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card">
                         <div className="card-header"><i className="fa fa-rocket mr-2"></i>Actions Rapides</div>
                         <div className="grid grid-cols-2 gap-3">
                            <button className="p-3 text-center bg-primary-light rounded-lg shadow-sm hover:shadow-md transition-shadow text-primary-dark font-semibold" onClick={() => openModal('modalNouvelArrivage')}><i className="fa fa-truck-loading mb-1"></i><div className="text-sm">Nouvel Arrivage</div></button>
                            <button className="p-3 text-center bg-primary-light rounded-lg shadow-sm hover:shadow-md transition-shadow text-primary-dark font-semibold" onClick={() => openModal('modalNouveauTransfert')}><i className="fa fa-exchange-alt mb-1"></i><div className="text-sm">Nouveau Transfert</div></button>
                         </div>
                    </div>
                     <div className="card">
                         <div className="card-header"><i className="fa fa-history mr-2"></i>Historiques</div>
                         <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-sm mb-2 text-text-secondary">Derniers Arrivages</h4>
                                <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                    {arrivals.slice(0, 5).map((arrival: Arrival) => (
                                        <li key={arrival.id} className="text-xs p-2 rounded-md bg-bg-subtle">
                                            <span className="font-bold">{arrival.supplierName}</span> vers <span className="font-semibold">{getStoreName(arrival.storeId)}</span>
                                            <div className="flex justify-between items-center text-text-muted">
                                                <span>{new Date(arrival.date).toLocaleDateString('fr-FR')}</span>
                                                <span className="font-mono">{arrival.totalValue.toLocaleString('fr-FR')} CFA</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm mb-2 text-text-secondary">Dernières Pertes</h4>
                                 <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                    {losses.slice(0, 5).map((loss: Loss) => (
                                        <li key={loss.id} className="text-xs p-2 rounded-md bg-bg-subtle">
                                            <span className="font-bold">{products.find(p=>p.id===loss.productId)?.name}</span>
                                            <div className="flex justify-between items-center text-text-muted">
                                                <span>{loss.type} {loss.storeId ? `(${getStoreName(loss.storeId)})` : ''}</span>
                                                <span className="font-mono text-danger-dark">{Math.round(loss.value).toLocaleString('fr-FR')} CFA</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StockHub;