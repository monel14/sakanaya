/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { Inventory } from '../types';

interface Props {
    inventory: Inventory;
}

const InventoryCountingSheet = ({ inventory }: Props) => {
    const { submitInventory, products, stores } = useAppContext();
    const [lines, setLines] = useState(inventory.lines.map(line => ({
        productId: line.productId,
        physicalQty: line.physicalQty > 0 ? line.physicalQty : ''
    })));

    const storeName = useMemo(() => stores.find(s => s.id === inventory.storeId)?.name || 'Inconnu', [stores, inventory.storeId]);

    const handleQuantityChange = (productId: number, value: string) => {
        const newLines = lines.map(line => 
            line.productId === productId ? { ...line, physicalQty: value } : line
        );
        setLines(newLines);
    };

    const handleSubmit = () => {
        const finalLines = lines.map(l => ({
            ...l,
            physicalQty: Number(l.physicalQty) || 0
        }));
        submitInventory(inventory.id, finalLines);
    }
    
    const getProductInfo = (productId: number) => products.find(p => p.id === productId);

    return (
        <section id="inventory-counting-sheet" className="view">
            <div className="card">
                <div className="card-header">
                    <div className="flex-grow">
                        <h2 className="text-xl font-bold">Inventaire en cours - {storeName}</h2>
                        <p className="text-sm muted">ID: {inventory.id} - Démarré le {inventory.creationDate}</p>
                    </div>
                </div>
                <div className="mt-4">
                    <p className="text-sm p-3 bg-primary-light text-primary-text-on-light rounded-lg">Veuillez compter physiquement chaque produit listé ci-dessous et saisir la quantité réelle dans le champ approprié. L'écart sera calculé automatiquement.</p>
                </div>
                
                <div className="mt-4 overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th>Produit</th>
                                <th className="text-center">Stock Théorique</th>
                                <th className="text-center w-48">Stock Physique (Réel)</th>
                                <th className="text-center">Écart</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.lines.map(line => {
                                const product = getProductInfo(line.productId);
                                const currentLineState = lines.find(l => l.productId === line.productId);
                                const physicalQty = Number(currentLineState?.physicalQty) || 0;
                                const gap = physicalQty - line.theoreticalQty;

                                return (
                                    <tr key={line.productId}>
                                        <td className="font-semibold">{product?.name}</td>
                                        <td className="text-center">{line.theoreticalQty.toLocaleString('fr-FR')} {product?.stockUnit}</td>
                                        <td>
                                            <input 
                                                type="number" 
                                                value={currentLineState?.physicalQty}
                                                onChange={e => handleQuantityChange(line.productId, e.target.value)}
                                                className="w-full p-2 border rounded-md text-center"
                                                placeholder="Saisir qté..."
                                            />
                                        </td>
                                        <td className={`text-center font-bold ${gap === 0 ? 'text-text-muted' : gap > 0 ? 'text-success' : 'text-danger'}`}>
                                            {gap !== 0 ? (gap > 0 ? '+' : '') + gap.toLocaleString('fr-FR') : '—'}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 border-t pt-4 flex justify-end">
                    <button className="btn btn-primary" onClick={handleSubmit}>
                        <i className="fa fa-paper-plane mr-2"></i>Soumettre l'inventaire pour validation
                    </button>
                </div>
            </div>
        </section>
    );
};

export default InventoryCountingSheet;