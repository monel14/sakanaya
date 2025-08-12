/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';

interface ModalProps {
    closeModal: () => void;
}

const ModalAjoutProduit = ({ closeModal }: ModalProps) => {
    const { addProduct } = useAppContext();
    const [name, setName] = useState('');
    const [stockUnit, setStockUnit] = useState('kg');
    const [priceType, setPriceType] = useState<'Variable' | 'Fixe'>('Variable');
    const [basePrice, setBasePrice] = useState(0);
    const [productType, setProductType] = useState<'Matière Première' | 'Produit Fini'>('Matière Première');

    const handleSave = () => {
        if (!name || basePrice <= 0) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
        }
        addProduct({ name, stockUnit, priceType, basePrice, productType });
        closeModal();
    };

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Ajouter un produit</h3>
                <button onClick={closeModal} className="btn btn-ghost btn-sm">✕</button>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="text-sm muted">Nom produit</label>
                    <input value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-md mt-1" />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="text-sm muted">Type de produit</label>
                        <select value={productType} onChange={e => setProductType(e.target.value as any)} className="w-full p-2 border rounded-md mt-1">
                            <option value="Matière Première">Matière Première</option>
                            <option value="Produit Fini">Produit Fini</option>
                        </select>
                    </div>
                     <div>
                        <label className="text-sm muted">Unité de stock</label>
                        <select value={stockUnit} onChange={e => setStockUnit(e.target.value)} className="w-full p-2 border rounded-md mt-1">
                            <option value="kg">kg</option>
                            <option value="unité">unité</option>
                            <option value="douzaine">douzaine</option>
                        </select>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm muted">Type de prix</label>
                        <select value={priceType} onChange={e => setPriceType(e.target.value as any)} className="w-full p-2 border rounded-md mt-1">
                            <option value="Variable">Variable</option>
                            <option value="Fixe">Fixe</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm muted">Prix de base / Coût standard (CFA)</label>
                        <input type="number" value={basePrice} onChange={e => setBasePrice(Number(e.target.value))} className="w-full p-2 border rounded-md mt-1" />
                    </div>
                </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
                <button className="btn btn-ghost" onClick={closeModal}>Annuler</button>
                <button className="btn btn-primary" onClick={handleSave}>Enregistrer</button>
            </div>
        </>
    );
};

export default ModalAjoutProduit;