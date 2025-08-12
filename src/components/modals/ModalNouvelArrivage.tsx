/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import type { ArrivalLine, PurchaseOrder } from '../../types';

interface ModalProps {
    closeModal: () => void;
    purchaseOrder?: PurchaseOrder;
}

const ModalNouvelArrivage = ({ closeModal, purchaseOrder }: ModalProps) => {
    const { addArrival, products, stores, suppliers } = useAppContext();
    const [supplierName, setSupplierName] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [storeId, setStoreId] = useState<number | ''>(stores.find(s=>s.type==='Hub')?.id || '');
    const [lines, setLines] = useState<Partial<ArrivalLine>[]>([{ productId: products[0]?.id || 0, quantity: 0, unitCost: 0, batchNumber: '', expiryDate: '' }]);
    const [error, setError] = useState('');
    
    const receivingStores = stores.filter(s => s.type === 'Hub' || s.type === 'Magasin');

    useEffect(() => {
        if (purchaseOrder) {
            const supplier = suppliers.find(s => s.id === purchaseOrder.supplierId);
            if(supplier) setSupplierName(supplier.name);

            setLines(purchaseOrder.lines.map(poLine => ({
                productId: poLine.productId,
                quantity: poLine.quantity,
                unitCost: poLine.unitCost,
                batchNumber: '',
                expiryDate: ''
            })));
        }
    }, [purchaseOrder, suppliers]);

    const handleSave = () => {
        setError('');
        if (!supplierName || !storeId || lines.length === 0) {
            setError('Veuillez remplir les informations générales (fournisseur, magasin).');
            return;
        }
        
        const finalLines: ArrivalLine[] = [];
        for (const line of lines) {
            if (!line.productId || !line.quantity || !line.unitCost || !line.batchNumber || !line.expiryDate) {
                setError('Toutes les lignes de produit doivent avoir un produit, une quantité, un coût, un N° de lot et une date de péremption.');
                return;
            }
            if (line.quantity <= 0 || line.unitCost < 0) {
                setError('Les quantités doivent être supérieures à zéro.');
                return;
            }
            finalLines.push({
                productId: line.productId,
                quantity: line.quantity,
                unitCost: line.unitCost,
                batchNumber: line.batchNumber,
                expiryDate: line.expiryDate,
                subtotal: line.quantity * line.unitCost
            });
        }
        
        const totalValue = finalLines.reduce((acc, line) => acc + line.subtotal, 0);

        addArrival({ 
            supplierName: supplierName,
            purchaseOrderId: purchaseOrder?.id,
            date, 
            storeId: Number(storeId), 
            lines: finalLines,
            totalValue
        });
        closeModal();
    };

    const addLine = () => setLines([...lines, { productId: products[0]?.id || 0, quantity: 0, unitCost: 0, batchNumber: '', expiryDate: '' }]);
    
    const updateLine = (index: number, field: keyof ArrivalLine, value: any) => {
        const newLines = [...lines];
        const updatedValue = (field === 'quantity' || field === 'unitCost') ? Number(value) || 0 : value;
        newLines[index] = { ...newLines[index], [field]: updatedValue };
        setLines(newLines);
    };

    const removeLine = (index: number) => setLines(lines.filter((_, i) => i !== index));
    
    const totalValue = useMemo(() => {
        return lines.reduce((acc, line) => acc + (line.quantity || 0) * (line.unitCost || 0), 0);
    }, [lines]);

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Bon de Réception Fournisseur</h3>
                <button onClick={closeModal} className="btn btn-ghost btn-sm">✕</button>
            </div>
            {purchaseOrder && (
                <div className="p-3 mb-4 rounded-lg bg-accent-light text-accent-dark">
                    Réception pour la commande <span className="font-bold font-mono">{purchaseOrder.id}</span>
                </div>
            )}
            <div className="bg-bg-subtle p-3 rounded-lg mb-4">
                <h4 className="font-semibold text-sm mb-2 text-text-secondary">Informations Générales</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                      <label className="text-sm muted">Fournisseur</label>
                      <input value={supplierName} onChange={e=>setSupplierName(e.target.value)} className="w-full p-2 border rounded-md mt-1" disabled={!!purchaseOrder} />
                  </div>
                  <div><label className="text-sm muted">Date de réception</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full p-2 border rounded-md mt-1" /></div>
                  <div>
                      <label className="text-sm muted">Magasin de réception</label>
                      <select value={storeId} onChange={e => setStoreId(Number(e.target.value))} className="w-full p-2 border rounded-md mt-1">
                          <option value="" disabled>Sélectionner...</option>
                          {receivingStores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                  </div>
                </div>
            </div>

            <h4 className="font-semibold text-sm mb-2 text-text-secondary">Lignes de Produits</h4>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                {lines.map((line, index) => {
                    const subtotal = (line.quantity || 0) * (line.unitCost || 0);
                    const isPoLine = !!purchaseOrder;
                    return (
                        <div key={index} className="p-3 rounded-md bg-white border">
                            <div className="grid grid-cols-12 gap-2 items-end">
                                <div className="col-span-12 md:col-span-4">
                                    <label className="text-xs muted">Produit</label>
                                    <select value={line.productId} onChange={e => updateLine(index, 'productId', e.target.value)} className="w-full p-2 border rounded-md mt-1" disabled={isPoLine}>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-6 md:col-span-2">
                                    <label className="text-xs muted">Qté ({products.find(p=>p.id===line.productId)?.stockUnit})</label>
                                    <input type="number" value={line.quantity} onChange={e => updateLine(index, 'quantity', e.target.value)} className="w-full p-2 border rounded-md mt-1" placeholder="Qté" />
                                </div>
                                <div className="col-span-6 md:col-span-2">
                                    <label className="text-xs muted">Coût unitaire</label>
                                    <input type="number" value={line.unitCost} onChange={e => updateLine(index, 'unitCost', e.target.value)} className="w-full p-2 border rounded-md mt-1" placeholder="Coût" disabled={isPoLine}/>
                                </div>
                                <div className="col-span-12 md:col-span-3">
                                    <label className="text-xs muted">Sous-total</label>
                                    <div className="w-full p-2 rounded-md bg-bg-subtle text-right font-medium">{subtotal.toLocaleString('fr-FR')} CFA</div>
                                </div>
                                <div className="col-span-12 md:col-span-1 text-center">
                                    <button onClick={() => removeLine(index)} className="btn btn-danger btn-sm h-full w-full" disabled={isPoLine}><i className="fa fa-trash"></i></button>
                                </div>
                            </div>
                            <div className="grid grid-cols-12 gap-2 items-end mt-2">
                               <div className="col-span-6">
                                    <label className="text-xs muted">N° de Lot</label>
                                    <input type="text" value={line.batchNumber} onChange={e => updateLine(index, 'batchNumber', e.target.value)} className="w-full p-2 border rounded-md mt-1" placeholder="Ex: PA-THON-0805" />
                                </div>
                                <div className="col-span-6">
                                    <label className="text-xs muted">Date de péremption</label>
                                    <input type="date" value={line.expiryDate} onChange={e => updateLine(index, 'expiryDate', e.target.value)} className="w-full p-2 border rounded-md mt-1" />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
             <button onClick={addLine} className="btn btn-ghost btn-sm mt-2" disabled={!!purchaseOrder}><i className="fa fa-plus"></i> Ajouter une ligne</button>
            
            <div className="mt-4 border-t pt-4">
                {error && <div className="text-danger text-sm text-center p-2 bg-danger-light rounded-md mb-4">{error}</div>}
                <div className="flex justify-between items-center">
                    <div className="text-lg font-bold">Total: {totalValue.toLocaleString('fr-FR')} CFA</div>
                    <div className="flex gap-2">
                        <button className="btn btn-ghost" onClick={closeModal}>Annuler</button>
                        <button className="btn btn-primary" onClick={handleSave}>Enregistrer l'arrivage</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ModalNouvelArrivage;