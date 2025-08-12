/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { SaleLine, SaleClosure } from '../types';

const SalesEntry = () => {
    const { salesUnits, addSaleClosure, salesClosures } = useAppContext();
    const [lines, setLines] = useState<SaleLine[]>([ {id: 1, unitId: 1, qty: 1}, {id: 2, unitId: 3, qty: 1} ]);
    const [total, setTotal] = useState(0);

    const calculateTotal = useCallback(() => {
        let currentTotal = 0;
        lines.forEach(line => {
            const unit = salesUnits.find(u => u.id === line.unitId);
            if(unit) {
                currentTotal += unit.price * line.qty;
            }
        });
        setTotal(currentTotal);
    }, [lines, salesUnits]);
    
    useEffect(() => {
        calculateTotal();
    }, [calculateTotal]);

    const addLine = () => setLines([...lines, { id: Date.now(), unitId: 1, qty: 1 }]);
    const removeLine = (id) => setLines(lines.filter(l => l.id !== id));
    
    const updateLine = (id, field, value) => {
        setLines(lines.map(l => l.id === id ? {...l, [field]: value} : l));
    };

    const handleClosure = () => {
        const newClosure = {
            storeId: 2, // Hardcoded for Almadies
            storeName: 'Almadies',
            date: new Date().toISOString().slice(0, 10),
            lines,
            total,
            status: 'closed' as const
        };
        addSaleClosure(newClosure);
        // Reset form
        setLines([]);
    };

    const myStoreClosures = useMemo(() => {
        // Hardcoded storeId 2 for 'Almadies' manager
        return salesClosures.filter(c => c.storeId === 2).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [salesClosures]);

    const getStatusChip = (status: SaleClosure['status']) => {
        switch (status) {
            case 'validated': return <span className="status-chip status-green">Validé</span>;
            case 'closed': return <span className="status-chip status-blue">En attente</span>;
            case 'draft':
            default: return <span className="status-chip status-gray">{status}</span>;
        }
    };


    const EmptyState = () => (
        <tr>
            <td colSpan={5} className="text-center py-10">
                <div className="text-text-muted">
                    <i className="fa fa-plus-circle text-4xl mb-2"></i>
                    <p>Commencez par ajouter une ligne de vente.</p>
                </div>
            </td>
        </tr>
    );

    return (
        <section id="sales-entry" className="view space-y-6">
            <div className="card">
                <div className="card-header"><i className="fa fa-cash-register"></i> Saisie journalière des ventes (Almadies)</div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead><tr><th>Produit (Unité)</th><th className="text-right">Prix unitaire</th><th className="text-center w-1/4">Quantité</th><th className="text-right">Sous-total</th><th className="text-center">Action</th></tr></thead>
                        <tbody>
                            {lines.length === 0 ? <EmptyState /> : lines.map(line => {
                                const unit = salesUnits.find(u => u.id === line.unitId);
                                const price = unit ? unit.price : 0;
                                const subtotal = price * line.qty;
                                return (
                                    <tr key={line.id}>
                                        <td>
                                            <select value={line.unitId} onChange={e => updateLine(line.id, 'unitId', parseInt(e.target.value))} className="p-1 border rounded-md w-full">
                                                {salesUnits.map(u => <option key={u.id} value={u.id}>{u.name} ({u.baseProduct})</option>)}
                                            </select>
                                        </td>
                                        <td className="text-right">{price.toLocaleString('fr-FR')} CFA</td>
                                        <td className="text-center">
                                            <input type="number" value={line.qty} min="0" onChange={e => updateLine(line.id, 'qty', parseFloat(e.target.value) || 0)} className="p-1 border rounded-md w-24 text-center" />
                                        </td>
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
            </div>
             <div className="card">
                <div className="card-header"><i className="fa fa-history"></i> Historique des clôtures</div>
                 <div className="overflow-x-auto max-h-80">
                    <table className="w-full text-sm">
                        <thead><tr><th>Date</th><th className="text-right">Total (CFA)</th><th className="text-center">Statut</th></tr></thead>
                        <tbody>
                            {myStoreClosures.map(c => (
                                <tr key={c.id}>
                                    <td>{new Date(c.date).toLocaleDateString('fr-FR')}</td>
                                    <td className="text-right font-medium">{c.total.toLocaleString('fr-FR')}</td>
                                    <td className="text-center">{getStatusChip(c.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};

export default SalesEntry;