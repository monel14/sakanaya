/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import type { Inventory, InventoryLine } from '../../types';

interface ModalProps {
    closeModal: () => void;
    inventory: Inventory;
    isManagerView?: boolean;
}

const ModalInventaireDetails = ({ closeModal, inventory, isManagerView = false }: ModalProps) => {
    const { correctAndValidateInventory, products, stores, stockLevels } = useAppContext();
    
    // State to manage edited lines
    const [lines, setLines] = useState<InventoryLine[]>(inventory.lines);

    const storeName = stores.find(s => s.id === inventory.storeId)?.name || 'Inconnu';
    const isDirectorEditing = !isManagerView && inventory.status === 'En attente de validation';

    const handleQuantityChange = (productId: number, value: string) => {
        const physicalQty = Number(value);
        setLines(currentLines => currentLines.map(line => 
            line.productId === productId 
            ? { ...line, physicalQty, gap: physicalQty - line.theoreticalQty } 
            : line
        ));
    };

    const handleValidation = () => {
        const correctedLines = lines.map(({ productId, physicalQty }) => ({ productId, physicalQty }));
        correctAndValidateInventory(inventory.id, correctedLines);
        closeModal();
    }
    
    const getProductInfo = (productId: number) => products.find(p => p.id === productId);

    const getCump = (productId: number, storeId: number) => {
        const batches = stockLevels[productId]?.[storeId];
        if (!batches || batches.length === 0) return 0;
        
        const totalQuantity = batches.reduce((sum, b) => sum + b.quantity, 0);
        if (totalQuantity === 0) {
            // Fallback to product base price if no stock
            return products.find(p => p.id === productId)?.basePrice || 0;
        }
        
        const totalValue = batches.reduce((sum, b) => sum + b.quantity * b.cump, 0);
        return totalValue / totalQuantity;
    };

    const significantGapThreshold = 5000; // CFA

    return (
        <>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Détails de l'Inventaire <span className="font-mono text-base bg-bg-subtle px-2 py-1 rounded">{inventory.id}</span></h3>
                    <p className="text-sm muted">Magasin: <strong>{storeName}</strong> | Statut: <strong>{inventory.status}</strong></p>
                </div>
                <button onClick={closeModal} className="btn btn-ghost btn-sm">✕</button>
            </div>

            <div className="overflow-y-auto max-h-96 pr-2">
                <table className="w-full text-sm">
                    <thead>
                        <tr>
                            <th>Produit</th>
                            <th className="text-right">Théorique</th>
                            <th className="text-right">Physique</th>
                            <th className="text-right">Écart (Qté)</th>
                            <th className="text-right">Écart (Valeur)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lines.map(line => {
                             const product = getProductInfo(line.productId);
                             const cump = getCump(line.productId, inventory.storeId);
                             const gapValue = line.gap * cump;
                             const isSignificant = Math.abs(gapValue) >= significantGapThreshold;

                             return (
                                <tr key={line.productId} className={isSignificant ? 'bg-danger-light/70' : ''}>
                                    <td className="font-semibold">{product?.name}</td>
                                    <td className="text-right">{line.theoreticalQty.toLocaleString('fr-FR')}</td>
                                    <td className="text-right">
                                        {isDirectorEditing ? (
                                            <input 
                                                type="number"
                                                value={line.physicalQty}
                                                onChange={e => handleQuantityChange(line.productId, e.target.value)}
                                                className="w-24 p-1 border rounded-md text-right bg-white"
                                            />
                                        ) : (
                                            line.physicalQty.toLocaleString('fr-FR')
                                        )}
                                    </td>
                                    <td className={`text-right font-bold ${line.gap === 0 ? '' : line.gap > 0 ? 'text-success' : 'text-danger'}`}>
                                        {line.gap > 0 ? '+' : ''}{line.gap.toLocaleString('fr-FR')}
                                    </td>
                                    <td className={`text-right font-bold ${line.gap === 0 ? '' : line.gap > 0 ? 'text-success' : 'text-danger'}`}>
                                        {gapValue.toLocaleString('fr-FR', { style:'currency', currency:'XOF', minimumFractionDigits: 0 })}
                                    </td>
                                </tr>
                             )
                        })}
                    </tbody>
                </table>
            </div>
            
            <div className="mt-4 border-t pt-4 flex justify-end gap-2">
                 <button className="btn btn-ghost" onClick={closeModal}>Fermer</button>
                {isDirectorEditing && (
                    <button className="btn btn-primary" onClick={handleValidation}>
                        <i className="fa fa-check-circle mr-2"></i>Corriger et Valider
                    </button>
                )}
            </div>
        </>
    );
};

export default ModalInventaireDetails;