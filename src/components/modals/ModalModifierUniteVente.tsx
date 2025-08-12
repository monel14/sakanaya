/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import type { SalesUnit } from '../../types';

interface ModalProps {
    closeModal: () => void;
    salesUnit: SalesUnit;
}

const ModalModifierUniteVente = ({ closeModal, salesUnit }: ModalProps) => {
    const { updateSalesUnit, products, showToast } = useAppContext();

    const [name, setName] = useState(salesUnit.name);
    const [baseProduct, setBaseProduct] = useState(salesUnit.baseProduct);
    const [factor, setFactor] = useState<number | ''>(salesUnit.factor);
    const [price, setPrice] = useState<number | ''>(salesUnit.price);

    const handleSave = () => {
        if (!name || !baseProduct || !factor || factor <= 0 || !price || price <= 0) {
            showToast('Veuillez remplir tous les champs avec des valeurs valides.');
            return;
        }
        updateSalesUnit({ 
            id: salesUnit.id,
            name, 
            baseProduct, 
            factor: Number(factor), 
            price: Number(price)
        });
        closeModal();
    };
    
    const selectedProductInfo = products.find(p => p.name === baseProduct);

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Modifier une unité de vente</h3>
                <button onClick={closeModal} className="btn btn-ghost btn-sm">✕</button>
            </div>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm muted">Nom de l'unité</label>
                        <input value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-md mt-1" placeholder="Ex: Barquette 250g" />
                    </div>
                     <div>
                        <label className="text-sm muted">Produit de base</label>
                        <select value={baseProduct} onChange={e => setBaseProduct(e.target.value)} className="w-full p-2 border rounded-md mt-1">
                            {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                        </select>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="text-sm muted">Facteur de conversion</label>
                        <input type="number" value={factor} onChange={e => setFactor(Number(e.target.value))} className="w-full p-2 border rounded-md mt-1" placeholder="Ex: 0.25" />
                        {selectedProductInfo && <p className="text-xs text-text-muted mt-1">Représente {factor || 0} {selectedProductInfo.stockUnit} du produit de base.</p>}
                    </div>
                    <div>
                        <label className="text-sm muted">Prix de vente (CFA)</label>
                        <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full p-2 border rounded-md mt-1" placeholder="Ex: 2200" />
                    </div>
                </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
                <button className="btn btn-ghost" onClick={closeModal}>Annuler</button>
                <button className="btn btn-primary" onClick={handleSave}>Enregistrer les modifications</button>
            </div>
        </>
    );
};

export default ModalModifierUniteVente;