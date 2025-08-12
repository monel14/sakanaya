/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';

interface ModalProps {
    closeModal: () => void;
}
interface Line {
    productId: number | '';
    quantity: number;
}

const ModalNouveauTransfert = ({ closeModal }: ModalProps) => {
    const { createTransfer, products, stores, stockLevels } = useAppContext();

    const [sourceStoreId, setSourceStoreId] = useState<number | ''>('');
    const [destinationStoreId, setDestinationStoreId] = useState<number | ''>('');
    const [lines, setLines] = useState<Line[]>([{ productId: '', quantity: 0 }]);
    const [error, setError] = useState('');

    const availableStores = stores.filter(s => s.status === 'Actif');

    const handleSave = () => {
        setError('');
        if (!sourceStoreId || !destinationStoreId) {
            setError('Veuillez sélectionner les magasins source et destination.');
            return;
        }
        if (sourceStoreId === destinationStoreId) {
            setError('Les magasins source et destination doivent être différents.');
            return;
        }
        const finalLines = lines
            .filter(line => line.productId && line.quantity > 0)
            .map(line => ({ productId: Number(line.productId), sentQuantity: line.quantity }));
        
        if (finalLines.length === 0) {
            setError('Veuillez ajouter au moins un produit avec une quantité supérieure à zéro.');
            return;
        }

        const success = createTransfer({
            sourceStoreId: Number(sourceStoreId),
            destinationStoreId: Number(destinationStoreId),
            lines: finalLines,
        });

        if (success) {
            closeModal();
        } else {
            setError("Échec de la création du transfert. Vérifiez les stocks disponibles.");
        }
    };

    const addLine = () => setLines([...lines, { productId: '', quantity: 0 }]);
    
    const updateLine = (index: number, field: keyof Line, value: any) => {
        const newLines = [...lines];
        const numValue = field === 'quantity' ? Number(value) : value;
        newLines[index] = { ...newLines[index], [field]: numValue };
        setLines(newLines);
    };

    const removeLine = (index: number) => setLines(lines.filter((_, i) => i !== index));

    const getAvailableStock = (productId: number | '') => {
        if (!productId || !sourceStoreId) return 0;
        const batches = stockLevels[productId]?.[sourceStoreId];
        return batches ? batches.reduce((sum, b) => sum + b.quantity, 0) : 0;
    };

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Nouveau Transfert de Stock</h3>
                <button onClick={closeModal} className="btn btn-ghost btn-sm">✕</button>
            </div>
            
            <div className="bg-bg-subtle p-3 rounded-lg mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm muted">De (Magasin Source)</label>
                        <select value={sourceStoreId} onChange={e => setSourceStoreId(Number(e.target.value))} className="w-full p-2 border rounded-md mt-1">
                            <option value="" disabled>Sélectionner...</option>
                            {availableStores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm muted">Vers (Magasin Destination)</label>
                        <select value={destinationStoreId} onChange={e => setDestinationStoreId(Number(e.target.value))} className="w-full p-2 border rounded-md mt-1">
                             <option value="" disabled>Sélectionner...</option>
                            {availableStores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <h4 className="font-semibold text-sm mb-2 text-text-secondary">Produits à Transférer</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {lines.map((line, index) => {
                    const availableStock = getAvailableStock(line.productId);
                    const stockUnit = products.find(p => p.id === line.productId)?.stockUnit || '';
                    return (
                        <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 rounded-md bg-white border">
                            <div className="col-span-12 md:col-span-6">
                                <label className="text-xs muted">Produit</label>
                                <select value={line.productId} onChange={e => updateLine(index, 'productId', Number(e.target.value))} className="w-full p-2 border rounded-md">
                                    <option value="" disabled>Sélectionner un produit</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="col-span-6 md:col-span-3">
                                <label className="text-xs muted">Qté à transférer ({stockUnit})</label>
                                <input type="number" value={line.quantity} onChange={e => updateLine(index, 'quantity', e.target.value)} className="w-full p-2 border rounded-md" placeholder="Qté" />
                            </div>
                            <div className="col-span-4 md:col-span-2">
                                <label className="text-xs muted">Stock Dispo.</label>
                                <div className={`w-full p-2 rounded-md bg-bg-subtle text-center font-medium ${line.quantity > availableStock ? 'text-danger' : ''}`}>{availableStock}</div>
                            </div>
                            <div className="col-span-2 md:col-span-1 text-center self-end">
                                <button onClick={() => removeLine(index)} className="btn btn-danger btn-sm h-full"><i className="fa fa-trash"></i></button>
                            </div>
                        </div>
                    )
                })}
            </div>
            <button onClick={addLine} className="btn btn-ghost btn-sm mt-2"><i className="fa fa-plus"></i> Ajouter une ligne</button>
            
            <div className="mt-4 border-t pt-4">
                {error && <div className="text-danger text-sm text-center p-2 bg-danger-light rounded-md mb-4">{error}</div>}
                <div className="flex justify-end items-center">
                    <div className="flex gap-2">
                        <button className="btn btn-ghost" onClick={closeModal}>Annuler</button>
                        <button className="btn btn-primary" onClick={handleSave} disabled={!sourceStoreId || !destinationStoreId}>Créer le bon de transfert</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ModalNouveauTransfert;