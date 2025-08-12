/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import type { PurchaseOrderLine } from '../../types';

interface ModalProps {
    closeModal: () => void;
    prefillData?: {
        supplierId: number;
        lines: Partial<PurchaseOrderLine>[];
    };
}

const ModalBonDeCommande = ({ closeModal, prefillData }: ModalProps) => {
    const { addPurchaseOrder, products, suppliers, showToast } = useAppContext();
    const [supplierId, setSupplierId] = useState<number | ''>(prefillData?.supplierId || '');
    const [orderDate] = useState(new Date().toISOString().slice(0, 10));
    const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
    const [lines, setLines] = useState<Partial<PurchaseOrderLine>[]>(prefillData?.lines || [{ productId: undefined, quantity: 0, unitCost: 0 }]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (prefillData) {
            setSupplierId(prefillData.supplierId);
            setLines(prefillData.lines);
        }
    }, [prefillData]);


    const handleSave = () => {
        setError('');
        if (!supplierId || !expectedDeliveryDate || lines.length === 0) {
            setError('Veuillez renseigner le fournisseur, la date de livraison prévue et au moins une ligne de produit.');
            return;
        }

        const finalLines: PurchaseOrderLine[] = [];
        for (const line of lines) {
            if (!line.productId || !line.quantity || line.quantity <= 0 || !line.unitCost || line.unitCost <= 0) {
                 setError('Chaque ligne doit contenir un produit, une quantité et un coût unitaire valides.');
                 return;
            }
            finalLines.push({
                productId: line.productId,
                quantity: line.quantity,
                unitCost: line.unitCost,
                subtotal: line.quantity * line.unitCost,
            });
        }
        
        const totalValue = finalLines.reduce((acc, line) => acc + line.subtotal, 0);

        addPurchaseOrder({ 
            supplierId: Number(supplierId),
            orderDate,
            expectedDeliveryDate,
            lines: finalLines,
            totalValue
        });
        closeModal();
    };

    const addLine = () => setLines([...lines, { productId: undefined, quantity: 0, unitCost: 0 }]);
    const removeLine = (index: number) => setLines(lines.filter((_, i) => i !== index));
    const updateLine = (index: number, field: keyof PurchaseOrderLine, value: any) => {
        const newLines = [...lines];
        const numValue = (field === 'quantity' || field === 'unitCost' || field === 'productId') ? Number(value) || 0 : value;
        newLines[index] = { ...newLines[index], [field]: numValue };
        
        // Auto-fill price from product basePrice if cost is 0
        if (field === 'productId') {
            const product = products.find(p => p.id === numValue);
            if (product && newLines[index].unitCost === 0) {
                newLines[index].unitCost = product.basePrice;
            }
        }
        
        setLines(newLines);
    };
    
    const totalValue = useMemo(() => {
        return lines.reduce((acc, line) => acc + (line.quantity || 0) * (line.unitCost || 0), 0);
    }, [lines]);

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Créer un Bon de Commande</h3>
                <button onClick={closeModal} className="btn btn-ghost btn-sm">✕</button>
            </div>
            
            <div className="bg-bg-subtle p-3 rounded-lg mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm muted">Fournisseur</label>
                        <select value={supplierId} onChange={e => setSupplierId(Number(e.target.value))} className="w-full p-2 border rounded-md mt-1">
                             <option value="" disabled>Sélectionner...</option>
                             {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm muted">Date de livraison prévue</label>
                        <input type="date" value={expectedDeliveryDate} onChange={e => setExpectedDeliveryDate(e.target.value)} className="w-full p-2 border rounded-md mt-1" />
                    </div>
                </div>
            </div>

            <h4 className="font-semibold text-sm mb-2 text-text-secondary">Produits Commandés</h4>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                {lines.map((line, index) => {
                    const subtotal = (line.quantity || 0) * (line.unitCost || 0);
                    return (
                        <div key={index} className="grid grid-cols-12 gap-2 items-end p-2 rounded-md bg-white border">
                            <div className="col-span-12 md:col-span-5">
                                <label className="text-xs muted">Produit</label>
                                <select value={line.productId || ''} onChange={e => updateLine(index, 'productId', e.target.value)} className="w-full p-2 border rounded-md mt-1">
                                    <option value="">Sélectionner...</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="col-span-4 md:col-span-2">
                                <label className="text-xs muted">Qté</label>
                                <input type="number" value={line.quantity || ''} onChange={e => updateLine(index, 'quantity', e.target.value)} className="w-full p-2 border rounded-md mt-1" />
                            </div>
                             <div className="col-span-4 md:col-span-2">
                                <label className="text-xs muted">Coût</label>
                                <input type="number" value={line.unitCost || ''} onChange={e => updateLine(index, 'unitCost', e.target.value)} className="w-full p-2 border rounded-md mt-1" />
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

export default ModalBonDeCommande;