/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';

interface ModalProps {
    closeModal: () => void;
}

const ModalOrdreFabrication = ({ closeModal }: ModalProps) => {
    const { createProductionOrder, productionRecipes, products, stockLevels, showToast } = useAppContext();

    const [recipeId, setRecipeId] = useState<string>('');
    const [plannedQuantity, setPlannedQuantity] = useState<number | ''>('');

    const handleSave = () => {
        if (!recipeId || !plannedQuantity || plannedQuantity <= 0) {
            showToast('Veuillez sélectionner une fiche technique et une quantité valide.');
            return;
        }
        createProductionOrder({
            recipeId,
            plannedQuantity: Number(plannedQuantity)
        });
        closeModal();
    };

    const selectedRecipe = useMemo(() => {
        return productionRecipes.find(r => r.id === recipeId);
    }, [recipeId, productionRecipes]);
    
    // Check for Hub stock (storeId: 1)
    const componentStockInfo = useMemo(() => {
        if (!selectedRecipe || !plannedQuantity) return [];
        return selectedRecipe.lines.map(line => {
            const product = products.find(p => p.id === line.productId);
            const requiredQty = line.quantity * Number(plannedQuantity);
            const availableBatches = stockLevels[line.productId]?.[1] || [];
            const availableQty = availableBatches.reduce((sum, batch) => sum + batch.quantity, 0);
            return {
                name: product?.name || 'Inconnu',
                required: requiredQty,
                available: availableQty,
                isSufficient: availableQty >= requiredQty,
                unit: product?.stockUnit || ''
            };
        });
    }, [selectedRecipe, plannedQuantity, products, stockLevels]);

    const canProduce = componentStockInfo.every(c => c.isSufficient);

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Nouvel Ordre de Fabrication</h3>
                <button onClick={closeModal} className="btn btn-ghost btn-sm">✕</button>
            </div>
            
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm muted">Fiche Technique</label>
                        <select value={recipeId} onChange={e => setRecipeId(e.target.value)} className="w-full p-2 border rounded-md mt-1">
                            <option value="" disabled>Sélectionner...</option>
                            {productionRecipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm muted">Quantité à produire</label>
                        <input type="number" value={plannedQuantity} onChange={e => setPlannedQuantity(Number(e.target.value))} className="w-full p-2 border rounded-md mt-1" />
                    </div>
                </div>

                {componentStockInfo.length > 0 && (
                    <div className="border-t pt-4">
                        <h4 className="font-semibold text-sm mb-2 text-text-secondary">Vérification des composants requis (Stock Hub)</h4>
                        <div className="space-y-2 p-3 bg-bg-subtle rounded-lg">
                            {componentStockInfo.map(info => (
                                <div key={info.name} className="flex justify-between items-center text-sm">
                                    <span>{info.name}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-text-muted">Requis: {info.required.toFixed(2)} {info.unit}</span>
                                        <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${info.isSufficient ? 'bg-success-light text-success-dark' : 'bg-danger-light text-danger-dark'}`}>
                                            Dispo: {info.available.toFixed(2)} {info.unit}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {!canProduce && <div className="text-center p-2 mt-2 bg-warn-light text-warn-dark text-sm rounded-md">Attention: Stock de composants insuffisant pour lancer cette production.</div>}
                    </div>
                )}
            </div>

            <div className="flex gap-2 justify-end mt-6 border-t pt-4">
                <button className="btn btn-ghost" onClick={closeModal}>Annuler</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={!recipeId || !plannedQuantity}>Créer l'ordre</button>
            </div>
        </>
    );
};

export default ModalOrdreFabrication;