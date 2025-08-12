/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import type { SalesOrderLine } from '../../types';

interface ModalProps {
    closeModal: () => void;
}

const ModalCommandeDeVente = ({ closeModal }: ModalProps) => {
    const { addSalesOrder, salesUnits, clients, showToast } = useAppContext();
    const [clientId, setClientId] = useState<number | ''>('');
    const [orderDate] = useState(new Date().toISOString().slice(0, 10));
    const [deliveryDate, setDeliveryDate] = useState('');
    const [lines, setLines] = useState<Partial<SalesOrderLine>[]>([{ salesUnitId: undefined, quantity: 1, unitPrice: 0 }]);
    const [error, setError] = useState('');

    const handleSave = () => {
        setError('');
        if (!clientId || !deliveryDate || lines.length === 0) {
            setError('Veuillez renseigner le client, la date de livraison et au moins une ligne de produit.');
            return;
        }

        const finalLines: SalesOrderLine[] = [];
        for (const line of lines) {
            if (!line.salesUnitId || !line.quantity || line.quantity <= 0 || !line.unitPrice || line.unitPrice <= 0) {
                 setError('Chaque ligne doit contenir un produit, une quantité et un prix valides.');
                 return;
            }
            finalLines.push({
                salesUnitId: line.salesUnitId,
                quantity: line.quantity,
                unitPrice: line.unitPrice,
                subtotal: line.quantity * line.unitPrice,
            });
        }
        
        const totalValue = finalLines.reduce((acc, line) => acc + line.subtotal, 0);

        addSalesOrder({ 
            clientId: Number(clientId),
            orderDate,
            deliveryDate,
            lines: finalLines,
            totalValue
        });
        closeModal();
    };

    const addLine = () => setLines([...lines, { salesUnitId: undefined, quantity: 1, unitPrice: 0 }]);
    const removeLine = (index: number) => setLines(lines.filter((_, i) => i !== index));
    
    const updateLine = (index: number, field: keyof SalesOrderLine, value: any) => {
        const newLines = [...lines];
        const numValue = (field === 'quantity' || field === 'unitPrice' || field === 'salesUnitId') ? Number(value) || 0 : value;
        newLines[index] = { ...newLines[index], [field]: numValue };
        
        if (field === 'salesUnitId') {
            const unit = salesUnits.find(u => u.id === numValue);
            if (unit) {
                newLines[index].unitPrice = unit.price;
            }
        }
        
        setLines(newLines);
    };
    
    const totalValue = useMemo(() => {
        return lines.reduce((acc, line) => acc + (line.quantity || 0) * (line.unitPrice || 0), 0);
    }, [lines]);

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Créer une Commande de Vente</h3>
                <button onClick={closeModal} className="btn btn-ghost btn-sm">✕</button>
            </div>
            
            <div className="bg-bg-subtle p-3 rounded-lg mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm muted">Client</label>
                        <select value={clientId} onChange={e => setClientId(Number(e.target.value))} className="w-full p-2 border rounded-md mt-1">
                             <option value="" disabled>Sélectionner...</option>
                             {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm muted">Date de livraison souhaitée</label>
                        <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="w-full p-2 border rounded-md mt-1" />
                    </div>
                </div>
            </div>

            <h4 className="font-semibold text-sm mb-2 text-text-secondary">Produits Commandés</h4>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                {lines.map((line, index) => {
                    const subtotal = (line.quantity || 0) * (line.unitPrice || 0);
                    return (
                        <div key={index} className="grid grid-cols-12 gap-2 items-end p-2 rounded-md bg-white border">
                            <div className="col-span-12 md:col-span-5">
                                <label className="text-xs muted">Unité de vente</label>
                                <select value={line.salesUnitId || ''} onChange={e => updateLine(index, 'salesUnitId', e.target.value)} className="w-full p-2 border rounded-md mt-1">
                                    <option value="">Sélectionner...</option>
                                    {salesUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                            <div className="col-span-4 md:col-span-2">
                                <label className="text-xs muted">Qté</label>
                                <input type="number" value={line.quantity || ''} onChange={e => updateLine(index, 'quantity', e.target.value)} className="w-full p-2 border rounded-md mt-1" />
                            </div>
                             <div className="col-span-4 md:col-span-2">
                                <label className="text-xs muted">Prix</label>
                                <input type="number" value={line.unitPrice || ''} onChange={e => updateLine(index, 'unitPrice', e.target.value)} className="w-full p-2 border rounded-md mt-1" />
                            </div>
                             <div className="col-span-3 md:col-span-2">
                                <label className="text-xs muted">Sous-total</label>
                                <div className="w-full p-2 rounded-md bg-bg-subtle text-right font-medium">{subtotal.toLocaleString('fr-FR')}</div>
                            </div>
                            <div className="col-span-1 text-center">
                                <button onClick={() => removeLine(index)} className="btn btn-danger btn-sm h-full w-full"><i className="fa fa-trash"></i></button>
                            </div>
                        </div>
                    );
                })}
            </div>
            <button onClick={addLine} className="btn btn-ghost btn-sm mt-2"><i className="fa fa-plus"></i> Ajouter une ligne</button>
            
            <div className="mt-4 border-t pt-4">
                {error && <div className="text-danger text-sm text-center p-2 bg-danger-light rounded-md mb-4">{error}</div>}
                <div className="flex justify-between items-center">
                    <div className="text-lg font-bold">Total: {totalValue.toLocaleString('fr-FR')} CFA</div>
                    <div className="flex gap-2">
                        <button className="btn btn-ghost" onClick={closeModal}>Annuler</button>
                        <button className="btn btn-primary" onClick={handleSave}>Enregistrer la commande</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ModalCommandeDeVente;