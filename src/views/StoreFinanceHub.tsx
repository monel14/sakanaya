/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { CurrentUser } from '../App';
import type { SaleLine, SaleClosure, Expense } from '../types';

const formatCurrency = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) return '-';
    return value.toLocaleString('fr-FR') + ' CFA';
}

const StoreFinanceHub = ({ currentUser }: { currentUser: CurrentUser }) => {
    const { 
        salesUnits, addSaleClosure, salesClosures, openModal, showToast, expenses, stores 
    } = useAppContext();
    
    const [activeTab, setActiveTab] = useState('sales');
    
    // --- Sales Logic ---
    const [lines, setLines] = useState<SaleLine[]>([]);
    const [total, setTotal] = useState(0);

    const myStore = useMemo(() => {
        const roleStoreName = currentUser.role.match(/\(([^)]+)\)/)?.[1];
        return stores.find(s => s.name.includes(roleStoreName || '')) || null;
    }, [currentUser.role, stores]);

    const calculateTotal = useCallback(() => {
        let currentTotal = salesUnits.reduce((acc, unit) => {
            const line = lines.find(l => l.unitId === unit.id);
            return acc + (line ? unit.price * line.qty : 0);
        }, 0);
        setTotal(currentTotal);
    }, [lines, salesUnits]);
    
    useEffect(() => {
        calculateTotal();
    }, [lines, calculateTotal]);

    const addLine = () => setLines([...lines, { id: Date.now(), unitId: 1, qty: 1 }]);
    const removeLine = (id: number) => setLines(lines.filter(l => l.id !== id));
    
    const updateLine = (id: number, field: keyof SaleLine, value: any) => {
        setLines(lines.map(l => l.id === id ? {...l, [field]: value} : l));
    };

    const handleClosure = () => {
        if(lines.length === 0 || !myStore) {
            showToast("Aucune vente à enregistrer ou magasin non trouvé.");
            return;
        }
        const newClosure = {
            storeId: myStore.id,
            storeName: myStore.name,
            date: new Date().toISOString().slice(0, 10),
            lines,
            total,
            status: 'closed' as const
        };
        addSaleClosure(newClosure);
        setLines([]);
    };

    const myStoreClosures = useMemo(() => {
        if (!myStore) return [];
        return salesClosures.filter(c => c.storeId === myStore.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [salesClosures, myStore]);
    
    // --- Expenses Logic ---
    const myStoreExpenses = useMemo(() => {
        if (!myStore) return [];
        return expenses.filter(e => e.storeId === myStore.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [expenses, myStore]);

    const handleAddExpense = () => {
        if (!myStore) {
            showToast("Impossible de déterminer le magasin.");
            return;
        }
        openModal('modalAjoutDepense', { storeId: myStore.id });
    }

    const getStatusChip = (status: SaleClosure['status'] | Expense['status']) => {
        switch (status) {
            case 'validated':
            case 'Approuvé':
                return <span className="status-chip status-green">{status}</span>;
            case 'closed':
            case 'En attente':
                return <span className="status-chip status-blue">{status}</span>;
            case 'draft':
            default: return <span className="status-chip status-gray">{status}</span>;
        }
    };
    
    if (!myStore) return <div className="card">Erreur: Magasin de l'utilisateur non trouvé.</div>;

    return (
        <section id="store-finance-hub" className="view space-y-6">
            <div className="card">
                <div className="card-header"><i className="fa fa-cash-register"></i> Finance & Caisse ({myStore.name})</div>
                 <div className="flex gap-2 mb-4 border-b pb-2 flex-wrap">
                    <button className={`btn btn-sm ${activeTab === 'sales' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('sales')}>Ventes</button>
                    <button className={`btn btn-sm ${activeTab === 'expenses' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('expenses')}>Dépenses</button>
                </div>
                
                {activeTab === 'sales' && (
                    <div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead><tr><th>Produit (Unité)</th><th className="text-right">Prix unitaire</th><th className="text-center w-1/4">Quantité</th><th className="text-right">Sous-total</th><th className="text-center">Action</th></tr></thead>
                                <tbody>
                                    {lines.length === 0 ? (
                                        <tr><td colSpan={5} className="text-center py-10"><div className="text-text-muted"><i className="fa fa-plus-circle text-4xl mb-2"></i><p>Commencez par ajouter une ligne de vente.</p></div></td></tr>
                                    ) : lines.map(line => {
                                        const unit = salesUnits.find(u => u.id === line.unitId);
                                        const price = unit ? unit.price : 0;
                                        const subtotal = price * line.qty;
                                        return (
                                            <tr key={line.id}>
                                                <td><select value={line.unitId} onChange={e => updateLine(line.id, 'unitId', parseInt(e.target.value))} className="p-1 border rounded-md w-full">{salesUnits.map(u => <option key={u.id} value={u.id}>{u.name} ({u.baseProduct})</option>)}</select></td>
                                                <td className="text-right">{price.toLocaleString('fr-FR')} CFA</td>
                                                <td className="text-center"><input type="number" value={line.qty} min="0" onChange={e => updateLine(line.id, 'qty', parseFloat(e.target.value) || 0)} className="p-1 border rounded-md w-24 text-center" /></td>
                                                <td className="text-right font-medium">{subtotal.toLocaleString('fr-FR')} CFA</td>
                                                <td className="text-center"><button onClick={() => removeLine(line.id)} className="text-danger hover:text-danger-dark"><i className="fa fa-trash"></i></button></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <div><button className="btn btn-primary" onClick={addLine}><i className="fa fa-plus"></i> Ajouter une ligne</button></div>
                            <div className="text-right">
                                <div className="muted text-sm">Total journalier</div>
                                <div className="text-xl font-bold text-primary">{total.toLocaleString('fr-FR')} CFA</div>
                            </div>
                        </div>
                        <div className="flex justify-end mt-4 border-t pt-4">
                            <button className="btn btn-primary" onClick={handleClosure} disabled={lines.length === 0}><i className="fa fa-save"></i> Clôturer et soumettre</button>
                        </div>
                        <div className="mt-6">
                            <h3 className="font-semibold text-base mb-2">Historique des clôtures</h3>
                             <div className="overflow-x-auto max-h-80">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th className="text-right">Total CA</th>
                                            <th className="text-right">Coût March.</th>
                                            <th className="text-right">Marge Brute</th>
                                            <th className="text-center">Statut</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myStoreClosures.map(c => (
                                            <tr key={c.id}>
                                                <td>{new Date(c.date).toLocaleDateString('fr-FR')}</td>
                                                <td className="text-right font-medium">{formatCurrency(c.total)}</td>
                                                <td className="text-right text-danger-dark">{c.status === 'validated' ? formatCurrency(c.totalCostOfGoodsSold) : '-'}</td>
                                                <td className={`text-right font-bold ${c.grossMargin && c.grossMargin >= 0 ? 'text-success' : 'text-danger'}`}>{c.status === 'validated' ? formatCurrency(c.grossMargin) : '-'}</td>
                                                <td className="text-center">{getStatusChip(c.status)}</td>
                                                <td className="text-center">
                                                    <button className="btn btn-ghost btn-sm" onClick={() => openModal('modalSaleClosureDetails', { closure: c })}>
                                                        <i className="fa fa-eye"></i> Voir
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'expenses' && (
                    <div>
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold">Historique des Dépenses</h3>
                            <button className="btn btn-primary" onClick={handleAddExpense}>
                                <i className="fa fa-plus mr-2"></i>Nouvelle Dépense
                            </button>
                        </div>
                         <div className="overflow-x-auto max-h-96">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr><th>Date</th><th>Catégorie</th><th>Description</th><th className="text-right">Montant</th><th className="text-center">Statut</th></tr>
                                </thead>
                                <tbody>
                                    {myStoreExpenses.length > 0 ? myStoreExpenses.map(exp => (
                                        <tr key={exp.id}>
                                            <td>{new Date(exp.date).toLocaleDateString('fr-FR')}</td>
                                            <td>{exp.category}</td>
                                            <td>{exp.description}</td>
                                            <td className="text-right font-medium">{exp.amount.toLocaleString('fr-FR')} CFA</td>
                                            <td className="text-center">{getStatusChip(exp.status)}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={5} className="text-center py-10 text-text-muted"><i className="fa fa-receipt text-3xl mb-2"></i><p>Aucune dépense enregistrée pour ce magasin.</p></td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default StoreFinanceHub;
