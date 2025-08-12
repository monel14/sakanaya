/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import type { Transfer } from '../../types';

interface ModalProps {
    closeModal: () => void;
    transfer: Transfer;
}
interface ReceivedLine {
    productId: number;
    batchNumber: string;
    receivedQuantity: number;
    comment: string;
}

const ModalReceptionTransfert = ({ closeModal, transfer }: ModalProps) => {
    const { receiveTransfer, products, stores } = useAppContext();

    const [lines, setLines] = useState<ReceivedLine[]>(
        transfer.lines.map(line => ({
            productId: line.productId,
            batchNumber: line.batchNumber,
            receivedQuantity: line.sentQuantity, // Default to expected quantity
            comment: ''
        }))
    );
    const [error, setError] = useState('');

    const sourceStoreName = useMemo(() => stores.find(s => s.id === transfer.sourceStoreId)?.name || 'Inconnu', [stores, transfer]);

    const handleSave = () => {
        setError('');
        const receivedLines = lines.map(line => ({
            ...line,
            receivedQuantity: Number(line.receivedQuantity) || 0
        }));
        
        if (receivedLines.some(l => l.receivedQuantity < 0)) {
            setError('Les quantités reçues ne peuvent pas être négatives.');
            return;
        }

        receiveTransfer(transfer.id, receivedLines);
        closeModal();
    };
    
    const updateLine = (index: number, field: keyof ReceivedLine, value: any) => {
        const newLines = [...lines];
        newLines[index] = { ...newLines[index], [field]: value };
        setLines(newLines);
    };
    
    const getProductInfo = (productId: number) => {
        return products.find(p => p.id === productId) || { name: 'Inconnu', stockUnit: 'unité'};
    }

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Réception du Transfert <span className="font-mono text-base bg-bg-subtle px-2 py-1 rounded">{transfer.id}</span></h3>
                    <p className="text-sm muted">En provenance de: <strong>{sourceStoreName}</strong></p>
                </div>
                <button onClick={closeModal} className="btn btn-ghost btn-sm">✕</button>
            </div>

            <h4 className="font-semibold text-sm mb-2 text-text-secondary">Contrôle des lots et quantités reçues</h4>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {transfer.lines.map((sentLine, index) => {
                    const product = getProductInfo(sentLine.productId);
                    const receivedLine = lines[index];
                    const discrepancy = sentLine.sentQuantity - receivedLine.receivedQuantity;

                    return (
                        <div key={`${sentLine.productId}-${sentLine.batchNumber}`} className="grid grid-cols-12 gap-x-4 gap-y-2 items-center p-3 rounded-md bg-white border">
                            <div className="col-span-12 md:col-span-4">
                                <div className="font-semibold">{product.name}</div>
                                <div className="text-xs text-text-muted font-mono bg-bg-subtle px-2 py-1 rounded-full inline-block">Lot: {sentLine.batchNumber}</div>
                            </div>
                             <div className="col-span-4 md:col-span-2">
                                <label className="text-xs muted">Qté attendue</label>
                                <div className="w-full p-2 rounded-md bg-bg-subtle text-center font-medium">{sentLine.sentQuantity} {product.stockUnit}</div>
                            </div>
                             <div className="col-span-4 md:col-span-2">
                                <label className="text-xs muted">Qté réelle reçue</label>
                                <input type="number" value={receivedLine.receivedQuantity} onChange={e => updateLine(index, 'receivedQuantity', e.target.value)} className="w-full p-2 border rounded-md text-center" />
                            </div>
                            <div className="col-span-4 md:col-span-4">
                                <label className="text-xs muted">Écart</label>
                                <div className={`w-full p-2 rounded-md text-center font-bold ${discrepancy === 0 ? 'bg-success-light text-success-dark' : 'bg-danger-light text-danger-dark'}`}>
                                    {discrepancy === 0 ? '✓ Conforme' : `${discrepancy > 0 ? '-' : '+'}${Math.abs(discrepancy)}`}
                                </div>
                            </div>
                            {discrepancy !== 0 && (
                                <div className="col-span-12">
                                     <label className="text-xs muted">Commentaire (obligatoire si écart)</label>
                                     <input type="text" value={receivedLine.comment} onChange={e => updateLine(index, 'comment', e.target.value)} className="w-full p-2 border rounded-md text-sm" placeholder="Ex: carton endommagé, produit manquant..." />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
            
            <div className="mt-4 border-t pt-4">
                {error && <div className="text-danger text-sm text-center p-2 bg-danger-light rounded-md mb-4">{error}</div>}
                <div className="flex justify-end items-center">
                    <div className="flex gap-2">
                        <button className="btn btn-ghost" onClick={closeModal}>Annuler</button>
                        <button className="btn btn-primary" onClick={handleSave}>Valider la réception</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ModalReceptionTransfert;