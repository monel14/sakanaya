/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { CurrentUser } from '../App';
import type { Transfer, Inventory, LossType } from '../types';
import InventoryCountingSheet from '../components/InventoryCountingSheet';

const StoreStockHub = ({ currentUser }: { currentUser: CurrentUser }) => {
    const { 
        showToast, openModal, stores, transfers, stockLevels, products, inventories,
        declareLoss, createInventory
    } = useAppContext();
    const [tab, setTab] = useState('mystock');
    
    // Loss declaration state
    const [lossProduct, setLossProduct] = useState<number | ''>('');
    const [lossQty, setLossQty] = useState<number | ''>('');
    const [lossType, setLossType] = useState<Exclude<LossType, 'Perte en Transit' | 'Écart d\'inventaire'>>('Invendu');
    const [lossComment, setLossComment] = useState('');

    const getStoreName = (storeId: number) => stores.find(s => s.id === storeId)?.name || 'N/A';

    const myStore = useMemo(() => {
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
        if (!myStore || !lossProduct || !lossQty || lossQty <= 0) {
            showToast('Veuillez sélectionner un produit et une quantité valide.');
            return;
        }
        declareLoss({ productId: Number(lossProduct), quantity: Number(lossQty), type: lossType, storeId: myStore.id, comment: lossComment });
        showToast('Perte déclarée avec succès.');
        setLossProduct('');
        setLossQty('');
        setLossComment('');
    };
    
    const theoreticalStockForLoss = useMemo(() => {
        if (!lossProduct || !myStore) return 0;
        const batches = stockLevels[lossProduct]?.[myStore.id];
        return batches ? batches.reduce((sum, b) => sum + b.quantity, 0) : 0;
    }, [lossProduct, myStore, stockLevels]);

    const getStatusChip = (status: Transfer['status'] | Inventory['status']) => {
        switch (status) {
            case 'En Cours': return <span className="status-chip status-blue">En Cours</span>;
            case 'En attente de validation': return <span className="status-chip status-yellow animate-pulse">Validation</span>;
            case 'Validé': return <span className="status-chip status-green">Validé</span>;
            default: return <span>{status}</span>;
        }
    }
    
    const lossCategories: Exclude<LossType, 'Perte en Transit' | 'Écart d\'inventaire'>[] = ['Invendu', 'Casse', 'Périmé', 'Vol', 'Offert Client'];

    if (!myStore) return <div className="card">Erreur: Magasin non trouvé.</div>

    if (activeInventory) {
        return <InventoryCountingSheet inventory={activeInventory} />;
    }

    return (
        <section id="store-stock-hub" className="view">
             <div className="card">
                <div className="card-header"><i className="fa fa-boxes"></i> Stock & Inventaire ({myStore.name})</div>
                <div className="flex gap-2 mb-4 border-b pb-3 flex-wrap">
                    <button className={`btn btn-ghost btn-sm ${tab === 'mystock' ? 'bg-bg-subtle text-text-main' : ''}`} onClick={() => setTab('mystock')}>Mon Stock</button>
                    <button className={`btn btn-ghost btn-sm ${tab === 'receptions' ? 'bg-bg-subtle text-text-main' : ''}`} onClick={() => setTab('receptions')}>Réceptions {pendingTransfersForMyStore.length > 0 && <span className="ml-2 bg-danger text-white text-xs rounded-full px-2">{pendingTransfersForMyStore.length}</span>}</button>
                    <button className={`btn btn-ghost btn-sm ${tab === 'inventory' ? 'bg-bg-subtle text-text-main' : ''}`} onClick={() => setTab('inventory')}>Inventaires</button>
                    <button className={`btn btn-ghost btn-sm ${tab === 'losses' ? 'bg-bg-subtle text-text-main' : ''}`} onClick={() => setTab('losses')}>Déclarer Perte</button>
                </div>

                {tab === 'mystock' && (
                    <div>
                        <h3 className="font-semibold mb-2">Niveaux de stock actuels</h3>
                         <div className="overflow-x-auto max-h-96"><table className="w-full text-sm"><thead><tr><th>Produit</th><th className="text-right">Quantité en stock</th></tr></thead><tbody>
                            {myStoreStock.map(item => (<tr key={item.product.id}><td>{item.product.name}</td><td className="text-right font-medium">{item.totalQuantity.toFixed(2)} {item.product.stockUnit}</td></tr>))}
                        </tbody></table></div>
                    </div>
                )}
                {tab === 'receptions' && (
                     <div>
                        <h3 className="font-semibold mb-2">Réceptions en attente</h3>
                        {pendingTransfersForMyStore.length > 0 ? pendingTransfersForMyStore.map(t => (
                            <div key={t.id} className="bg-white p-3 rounded-md shadow-sm border mb-2 flex justify-between items-center">
                                <div>
                                    <div className="muted text-sm">Bon de transfert <span className="font-mono">{t.id}</span></div>
                                    <div className="text-sm">Depuis : <strong>{getStoreName(t.sourceStoreId)}</strong></div>
                                </div>
                                <button className="btn btn-primary" onClick={() => openModal('modalReceptionTransfert', { transfer: t })}><i className="fa fa-check mr-2"></i>Contrôler</button>
                            </div>
                        )) : (<div className="text-sm text-text-muted text-center py-6">Aucune réception en attente.</div>)}
                    </div>
                )}
                 {tab === 'inventory' && (
                    <div>
                        <div className="bg-primary-light p-4 rounded-lg text-center mb-4">
                            <h4 className="font-semibold">Prêt pour le comptage ?</h4>
                            <p className="text-sm muted mb-3">Lancer un nouvel inventaire pour mettre à jour vos niveaux de stock.</p>
                            <button className="btn btn-primary" onClick={() => createInventory(myStore.id)}><i className="fa fa-play-circle mr-2"></i>Démarrer un nouvel inventaire</button>
                        </div>
                        <h4 className="font-semibold text-sm mt-4">Historique des inventaires</h4>
                        <div className="overflow-x-auto max-h-60"><table className="w-full text-sm"><thead><tr><th>#ID</th><th>Date</th><th className="text-center">Statut</th><th>Action</th></tr></thead><tbody>
                            {myStoreInventories.length > 0 ? myStoreInventories.map(inv => (
                                <tr key={inv.id}>
                                    <td className="font-mono">{inv.id}</td><td>{inv.creationDate}</td><td className="text-center">{getStatusChip(inv.status)}</td>
                                    <td><button className="btn btn-ghost btn-sm" onClick={() => openModal('modalInventaireDetails', { inventory: inv, isManagerView: true })}>Voir</button></td>
                                </tr>
                            )) : (<tr><td colSpan={4} className="text-center py-4 text-text-muted">Aucun inventaire précédent.</td></tr>)}
                        </tbody></table></div>
                    </div>
                 )}
                 {tab === 'losses' && (
                     <div>
                        <h3 className="font-semibold mb-2">Déclaration de pertes & invendus</h3>
                        <div className="space-y-3 max-w-md mx-auto">
                            <div><label className="text-sm muted">Produit</label><select value={lossProduct} onChange={e => setLossProduct(Number(e.target.value))} className="w-full p-2 border rounded-md mt-1"><option value="" disabled>Sélectionner...</option>{myStoreStock.map(item => <option key={item.product.id} value={item.product.id}>{item.product.name}</option>)}</select>{lossProduct && <div className="text-xs text-right text-text-muted mt-1">Stock théorique: {theoreticalStockForLoss} {products.find(p=>p.id===lossProduct)?.stockUnit}</div>}</div>
                            <div><label className="text-sm muted">Quantité perdue</label><input value={lossQty} onChange={e=>setLossQty(Number(e.target.value))} className="w-full p-2 border rounded-md mt-1" type="number" placeholder="Ex: 2.3"/>{lossProduct && Number(lossQty) > theoreticalStockForLoss && <div className="text-xs text-warn-dark mt-1">Attention: La quantité dépasse le stock théorique.</div>}</div>
                            <div><label className="text-sm muted">Catégorie</label><select value={lossType} onChange={e => setLossType(e.target.value as any)} className="w-full p-2 border rounded-md mt-1">{lossCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                             <div><label className="text-sm muted">Commentaire (optionnel)</label><input value={lossComment} onChange={e=>setLossComment(e.target.value)} className="w-full p-2 border rounded-md mt-1" type="text" placeholder="Raison de la perte..."/></div>
                            <button className="btn btn-danger w-full" onClick={handleDeclareLoss}><i className="fa fa-check"></i> Déclarer la perte</button>
                        </div>
                    </div>
                 )}

             </div>
        </section>
    );
};

export default StoreStockHub;