/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useMemo } from 'react';
import ChartComponent from '../components/ChartComponent';
import { useAppContext } from '../contexts/AppContext';
import type { CurrentUser } from '../App';
import type { Transfer, Inventory, LossType, Product } from '../types';
import InventoryCountingSheet from '../components/InventoryCountingSheet';


const StockManagement = ({ currentUser }: { currentUser: CurrentUser }) => {
    const { 
        showToast, openModal, arrivals, stores, transfers, stockLevels, products, losses, inventories,
        declareLoss, createInventory
    } = useAppContext();
    const [tab, setTab] = useState('stock-overview');
    
    // Loss declaration state for manager
    const [lossProduct, setLossProduct] = useState<number | ''>('');
    const [lossQty, setLossQty] = useState<number | ''>('');
    const [lossType, setLossType] = useState<Exclude<LossType, 'Perte en Transit' | 'Écart d\'inventaire'>>('Invendu');
    const [lossComment, setLossComment] = useState('');


    const getStoreName = (storeId: number) => stores.find(s => s.id === storeId)?.name || 'N/A';

    const myStore = useMemo(() => {
        if (currentUser.role === 'Directeur') return null;
        const roleStoreName = currentUser.role.match(/\(([^)]+)\)/)?.[1];
        return stores.find(s => s.name.includes(roleStoreName || '')) || null;
    }, [currentUser.role, stores]);

    const pendingTransfersForMyStore = useMemo(() => {
        if (!myStore) return [];
        return transfers.filter(t => t.destinationStoreId === myStore.id && t.status === 'En Transit');
    }, [transfers, myStore]);

    const myStoreStock = useMemo(() => {
        if (!myStore) return [];
        return products.map(product => {
            const batches = stockLevels[product.id]?.[myStore.id];
            const totalQuantity = batches ? batches.reduce((sum, b) => sum + b.quantity, 0) : 0;
            return { product, totalQuantity };
        }).filter(item => item.totalQuantity > 0);
    }, [stockLevels, products, myStore]);

    const myStoreInventories = useMemo(() => {
        if (!myStore) return [];
        return inventories.filter(inv => inv.storeId === myStore.id).sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
    }, [inventories, myStore]);
    
    const activeInventory = useMemo(() => myStoreInventories.find(inv => inv.status === 'En Cours'), [myStoreInventories]);

    const handleDeclareLoss = () => {
        if (!lossProduct || !lossQty || lossQty <= 0) {
            showToast('Veuillez sélectionner un produit et une quantité valide.');
            return;
        }
        declareLoss({
            productId: Number(lossProduct),
            quantity: Number(lossQty),
            type: lossType,
            storeId: myStore!.id,
            comment: lossComment
        });
        showToast('Perte déclarée avec succès.');
        setLossProduct('');
        setLossQty('');
        setLossComment('');
    };

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
    
    const lossCategories: Exclude<LossType, 'Perte en Transit' | 'Écart d\'inventaire'>[] = ['Invendu', 'Casse', 'Périmé', 'Vol', 'Offert Client'];
    
    const theoreticalStockForLoss = useMemo(() => {
        if (!lossProduct || !myStore) return 0;
        const batches = stockLevels[lossProduct]?.[myStore.id];
        return batches ? batches.reduce((sum, b) => sum + b.quantity, 0) : 0;
    }, [lossProduct, myStore, stockLevels]);
    
    // Director View
    if (currentUser.role === 'Directeur') {
        const directorTabs = [
            { key: 'stock-overview', label: "Vue d'ensemble" },
            { key: 'stock-arrivals', label: 'Arrivages' },
            { key: 'stock-transfers', label: 'Transferts' },
            { key: 'stock-losses', label: 'Pertes' },
            { key: 'stock-inventories', label: 'Inventaires' },
        ];
        return (
            <section id="stock-management" className="view">
                <div className="card mb-6">
                    <div className="card-header"><i className="fa fa-warehouse"></i> Pilotage global des stocks</div>
                     <div className="flex gap-2 mb-4 border-b pb-3 flex-wrap">
                        {directorTabs.map(t => (
                            <button key={t.key} className={`btn btn-ghost btn-sm ${tab === t.key ? 'bg-bg-subtle text-text-main' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>
                        ))}
                    </div>
                    {tab === 'stock-overview' && <div style={{height:'240px'}}><ChartComponent type='pie' data={{ labels:['Hub','Almadies','Sandaga','En transit'], datasets:[{ data:[1200,450,380,75], backgroundColor:['hsl(215, 25%, 20%)','hsl(195, 85%, 41%)','hsl(145, 55%, 45%)','hsl(16, 96%, 54%)'] }]}} options={{responsive:true, maintainAspectRatio:false}} /></div>}
                    {tab === 'stock-transfers' && <div>
                        <div className="flex justify-between items-center mb-4"><h3 className="font-semibold">Suivi des transferts</h3><button className="btn btn-primary" onClick={() => openModal('modalNouveauTransfert')}><i className="fa fa-plus"></i> Nouveau transfert</button></div>
                        <div className="overflow-x-auto max-h-96"><table className="w-full text-sm"><thead><tr><th>#Bon</th><th>De</th><th>Vers</th><th className="text-center">Statut</th><th>Date</th><th className="text-center">Action</th></tr></thead><tbody>
                        {transfers.length > 0 ? transfers.map(t => (
                            <tr key={t.id}>
                                <td className="font-mono">{t.id}</td>
                                <td>{getStoreName(t.sourceStoreId)}</td>
                                <td>{getStoreName(t.destinationStoreId)}</td>
                                <td className="text-center">{getStatusChip(t.status)}</td>
                                <td>{t.creationDate}</td>
                                <td className="text-center"><button className="text-primary text-xs" onClick={() => showToast(`Voir ${t.id}`)}>Détails</button></td>
                            </tr>
                        )) : (
                            <tr><td colSpan={6} className="text-center py-10 text-text-muted"><i className="fa fa-exchange-alt mr-2"></i>Aucun transfert pour le moment.</td></tr>
                        )}
                        </tbody></table></div>
                    </div>}
                    {tab === 'stock-arrivals' && <div>
                        <div className="flex justify-between items-center mb-4"><h3 className="font-semibold">Arrivages fournisseurs</h3><button className="btn btn-primary" onClick={() => openModal('modalNouvelArrivage')}><i className="fa fa-plus"></i> Nouvel arrivage</button></div>
                        <div className="overflow-x-auto max-h-96"><table className="w-full text-sm"><thead><tr><th>#Bon</th><th>Date</th><th>Fournisseur</th><th>Magasin Dest.</th><th className="text-right">Valeur (CFA)</th><th className="text-center">Action</th></tr></thead><tbody>
                        {arrivals.length > 0 ? arrivals.map(arrival => (<tr key={arrival.id}><td className="font-mono">{arrival.id}</td><td>{arrival.date}</td><td>{arrival.supplierName}</td><td>{getStoreName(arrival.storeId)}</td><td className="text-right font-medium">{arrival.totalValue.toLocaleString('fr-FR')}</td><td className="text-center"><button className="text-primary text-xs" onClick={() => showToast(`Détails pour ${arrival.id}`)}>Détails</button></td></tr>)) : (<tr><td colSpan={6} className="text-center py-10 text-text-muted"><i className="fa fa-truck-loading mr-2"></i>Aucun arrivage enregistré.</td></tr>)}
                        </tbody></table></div>
                    </div>}
                    {tab === 'stock-losses' && <div>
                        <h3 className="font-semibold mb-4">Historique des pertes</h3>
                        <div className="overflow-x-auto max-h-96"><table className="w-full text-sm"><thead><tr><th>Date</th><th>Produit</th><th className="text-right">Qté</th><th>Type</th><th className="text-right">Valeur (CFA)</th><th>Magasin</th><th>Détails</th></tr></thead><tbody>
                        {losses.length > 0 ? losses.map(l => (<tr key={l.id}><td>{l.date}</td><td>{products.find(p=>p.id===l.productId)?.name}</td><td className="text-right">{l.quantity.toLocaleString('fr-FR')}</td><td>{l.type}</td><td className="text-right font-medium">{Math.round(l.value).toLocaleString('fr-FR')}</td><td>{l.storeId ? getStoreName(l.storeId) : 'N/A'}</td><td className="text-xs text-text-muted">{l.details}</td></tr>)) : (<tr><td colSpan={7} className="text-center py-10 text-text-muted"><i className="fa fa-trash-alt mr-2"></i>Aucune perte enregistrée.</td></tr>)}
                        </tbody></table></div>
                    </div>}
                     {tab === 'stock-inventories' && <div>
                        <h3 className="font-semibold mb-4">Suivi des inventaires</h3>
                        <div className="overflow-x-auto max-h-96"><table className="w-full text-sm"><thead><tr><th>#ID</th><th>Magasin</th><th>Date Création</th><th className="text-center">Statut</th><th className="text-center">Action</th></tr></thead><tbody>
                        {inventories.length > 0 ? inventories.map(inv => (
                            <tr key={inv.id} className={`${inv.status === 'En attente de validation' ? 'bg-warn-light' : ''}`}>
                                <td className="font-mono">{inv.id}</td>
                                <td>{getStoreName(inv.storeId)}</td>
                                <td>{inv.creationDate}</td>
                                <td className="text-center">{getStatusChip(inv.status)}</td>
                                <td className="text-center"><button className="btn btn-primary btn-sm" onClick={() => openModal('modalInventaireDetails', { inventory: inv })}>Détails</button></td>
                            </tr>
                        )) : (
                            <tr><td colSpan={5} className="text-center py-10 text-text-muted"><i className="fa fa-clipboard-list mr-2"></i>Aucun inventaire.</td></tr>
                        )}
                        </tbody></table></div>
                    </div>}
                </div>
            </section>
        );
    }

    // Gérant View
    if (activeInventory) {
        return <InventoryCountingSheet inventory={activeInventory} />;
    }

    return (
        <section id="stock-management" className="view">
             <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                    <div className="card h-full">
                        <div className="card-header"><i className="fa fa-clipboard-list"></i> Inventaires</div>
                         <div className="bg-primary-light p-4 rounded-lg text-center mb-4">
                            <h4 className="font-semibold">Prêt pour le comptage ?</h4>
                            <p className="text-sm muted mb-3">Lancer un nouvel inventaire pour mettre à jour vos niveaux de stock.</p>
                            <button className="btn btn-primary" onClick={() => createInventory(myStore!.id)}><i className="fa fa-play-circle mr-2"></i>Démarrer un nouvel inventaire</button>
                        </div>
                        <h4 className="font-semibold text-sm mt-4">Historique des inventaires</h4>
                        <div className="overflow-x-auto max-h-60"><table className="w-full text-sm"><thead><tr><th>#ID</th><th>Date</th><th className="text-center">Statut</th><th>Action</th></tr></thead><tbody>
                            {myStoreInventories.length > 0 ? myStoreInventories.map(inv => (
                                <tr key={inv.id}>
                                    <td className="font-mono">{inv.id}</td>
                                    <td>{inv.creationDate}</td>
                                    <td className="text-center">{getStatusChip(inv.status)}</td>
                                    <td><button className="btn btn-ghost btn-sm" onClick={() => openModal('modalInventaireDetails', { inventory: inv, isManagerView: true })}>Voir</button></td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="text-center py-4 text-text-muted">Aucun inventaire précédent.</td></tr>
                            )}
                        </tbody></table></div>
                    </div>
                </div>
                <div className="space-y-6">
                     <div className="card">
                        <div className="card-header"><i className="fa fa-truck"></i> Réceptions en attente</div>
                        {pendingTransfersForMyStore.length > 0 ? pendingTransfersForMyStore.map(t => (
                            <div key={t.id} className="bg-white p-3 rounded-md shadow-sm border mb-2">
                                <div className="muted text-sm">Bon de transfert <span className="font-mono">{t.id}</span></div>
                                <div className="text-sm">Depuis : <strong>{getStoreName(t.sourceStoreId)}</strong></div>
                                <div className="mt-3">
                                    <button className="btn btn-primary btn-sm w-full" onClick={() => openModal('modalReceptionTransfert', { transfer: t })}><i className="fa fa-check"></i> Contrôler & valider</button>
                                </div>
                            </div>
                        )) : (<div className="text-sm text-text-muted text-center py-4">Aucune réception en attente.</div>)}
                    </div>
                     <div className="card">
                        <div className="card-header"><i className="fa fa-exclamation-triangle"></i> Déclaration pertes & invendus</div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm muted">Produit</label>
                                <select value={lossProduct} onChange={e => setLossProduct(Number(e.target.value))} className="w-full p-2 border rounded-md mt-1">
                                    <option value="" disabled>Sélectionner...</option>
                                    {myStoreStock.map(item => <option key={item.product.id} value={item.product.id}>{item.product.name}</option>)}
                                </select>
                                {lossProduct && <div className="text-xs text-right text-text-muted mt-1">Stock théorique: {theoreticalStockForLoss} {products.find(p=>p.id===lossProduct)?.stockUnit}</div>}
                            </div>
                            <div>
                                <label className="text-sm muted">Quantité perdue</label>
                                <input value={lossQty} onChange={e=>setLossQty(Number(e.target.value))} className="w-full p-2 border rounded-md mt-1" type="number" placeholder="Ex: 2.3"/>
                                {lossProduct && Number(lossQty) > theoreticalStockForLoss && <div className="text-xs text-warn-dark mt-1">Attention: La quantité dépasse le stock théorique.</div>}
                            </div>
                            <div>
                                <label className="text-sm muted">Catégorie</label>
                                <select value={lossType} onChange={e => setLossType(e.target.value as any)} className="w-full p-2 border rounded-md mt-1">
                                    {lossCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="text-sm muted">Commentaire (optionnel)</label>
                                <input value={lossComment} onChange={e=>setLossComment(e.target.value)} className="w-full p-2 border rounded-md mt-1" type="text" placeholder="Raison de la perte..."/>
                            </div>
                            <button className="btn btn-danger w-full" onClick={handleDeclareLoss}><i className="fa fa-check"></i> Déclarer la perte</button>
                        </div>
                    </div>
                </div>
             </div>
        </section>
    );
};

export default StockManagement;