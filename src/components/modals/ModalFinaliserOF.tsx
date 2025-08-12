/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import type { ProductionOrder } from '../../types';

interface ModalProps {
    closeModal: () => void;
    order: ProductionOrder;
}

const ModalFinaliserOF = ({ closeModal, order }: ModalProps) => {
    const { completeProductionOrder, productionRecipes, products, showToast } = useAppContext();

    const [actualQuantity, setActualQuantity] = useState<number | ''>(order.plannedQuantity);

    const recipe = useMemo(() => {
        return productionRecipes.find(r => r.id === order.recipeId);
    }, [order, productionRecipes]);

    const outputProduct = useMemo(() => {
        if (!recipe) return null;
        return products.find(p => p.id === recipe.outputProductId);
    }, [recipe, products]);
    
    const handleSave = () => {
        const qty = Number(actualQuantity);
        if (!qty || qty <= 0) {
            showToast('Veuillez saisir une quantité produite valide.');
            return;
        }

        const success = completeProductionOrder(order.id, qty);
        if (success) {
            closeModal();
        }
    };

    if (!recipe || !outputProduct) {
        return (
            <div>
                <p>Erreur: Recette ou produit de sortie introuvable.</p>
                <button onClick={closeModal} className="btn btn-ghost mt-4">Fermer</button>
            </div>
        );
    }
    
    const productionVariance = Number(actualQuantity) - order.plannedQuantity;

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Finaliser l'Ordre de Fabrication</h3>
                <button onClick={closeModal} className="btn btn-ghost btn-sm">✕</button>
            </div>
            
            <div className="p-4 bg-bg-subtle rounded-lg space-y-3">
                <div className="flex justify-between">
                    <span className="text-sm muted">OF #:</span>
                    <span className="font-mono">{order.id}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm muted">Produit Fini:</span>
                    <span className="font-semibold">{outputProduct.name}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm muted">Quantité Planifiée:</span>
                    <span className="font-semibold">{order.plannedQuantity} {outputProduct.stockUnit}</span>
                </div>
            </div>

            <div className="mt-4">
                <label className="text-sm font-semibold text-text-secondary">Quantité réellement produite</label>
                <input 
                    type="number"
                    value={actualQuantity}
                    onChange={e => setActualQuantity(Number(e.target.value))}
                    className="w-full text-lg p-2 border rounded-md mt-1 text-center font-bold"
                />
                 {productionVariance !== 0 && (
                     <div className={`text-center p-2 mt-2 text-sm rounded-md ${productionVariance > 0 ? 'bg-success-light text-success-dark' : 'bg-warn-light text-warn-dark'}`}>
                         Écart de production: {productionVariance > 0 ? '+' : ''}{productionVariance} {outputProduct.stockUnit}
                     </div>
                 )}
            </div>
            
             <div className="mt-4 border-t pt-4">
                <p className="text-xs text-text-muted text-center mb-4">La finalisation de cet ordre va consommer les matières premières du stock du Hub et créer un nouveau lot de produit fini.</p>
                <div className="flex gap-2 justify-end mt-6">
                    <button className="btn btn-ghost" onClick={closeModal}>Annuler</button>
                    <button className="btn btn-accent" onClick={handleSave}>Confirmer et finaliser</button>
                </div>
            </div>
        </>
    );
};

export default ModalFinaliserOF;