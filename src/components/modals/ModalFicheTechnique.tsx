/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import type { ProductionRecipe, RecipeLine } from '../../types';

interface ModalProps {
    closeModal: () => void;
    recipe?: ProductionRecipe;
}

const ModalFicheTechnique = ({ closeModal, recipe }: ModalProps) => {
    const { addProductionRecipe, products, showToast } = useAppContext();
    const isEditing = !!recipe;

    const [name, setName] = useState(recipe?.name || '');
    const [outputProductId, setOutputProductId] = useState<number | ''>(recipe?.outputProductId || '');
    const [lines, setLines] = useState<Partial<RecipeLine>[]>(recipe?.lines || [{ productId: undefined, quantity: 0 }]);

    const rawMaterials = products.filter(p => p.productType === 'Matière Première');
    const finishedGoods = products.filter(p => p.productType === 'Produit Fini');

    const handleSave = () => {
        if (!name || !outputProductId || lines.length === 0) {
            showToast('Veuillez renseigner le nom, le produit fini et au moins un composant.');
            return;
        }

        const finalLines = lines.map(l => ({
            productId: Number(l.productId),
            quantity: Number(l.quantity)
        }));

        if (finalLines.some(l => !l.productId || l.quantity <= 0)) {
            showToast('Chaque ligne de composant doit avoir un produit et une quantité positive.');
            return;
        }

        const newRecipe = { name, outputProductId: Number(outputProductId), lines: finalLines };
        
        if (isEditing) {
            // updateProductionRecipe({ ...recipe, ...newRecipe }); // To implement
            showToast('Modification non implémentée.');
        } else {
            addProductionRecipe(newRecipe);
        }
        closeModal();
    };

    const addLine = () => setLines([...lines, { productId: undefined, quantity: 0 }]);
    const removeLine = (index: number) => setLines(lines.filter((_, i) => i !== index));
    const updateLine = (index: number, field: keyof RecipeLine, value: string) => {
        const newLines = [...lines];
        const numValue = value === '' ? (field === 'productId' ? undefined : 0) : Number(value);
        newLines[index] = { ...newLines[index], [field]: numValue };
        setLines(newLines);
    };

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{isEditing ? 'Modifier la' : 'Nouvelle'} Fiche Technique</h3>
                <button onClick={closeModal} className="btn btn-ghost btn-sm">✕</button>
            </div>
            
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm muted">Nom de la fiche</label>
                        <input value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-md mt-1" placeholder="Ex: Fiche de production Filets de Thon"/>
                    </div>
                     <div>
                        <label className="text-sm muted">Produit Fini (Résultat)</label>
                        <select value={outputProductId} onChange={e => setOutputProductId(Number(e.target.value))} className="w-full p-2 border rounded-md mt-1">
                            <option value="" disabled>Sélectionner...</option>
                            {finishedGoods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h4 className="font-semibold text-sm mb-2 text-text-secondary">Composants (pour 1 unité de produit fini)</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {lines.map((line, index) => {
                            const componentProduct = products.find(p => p.id === line.productId);
                            return (
                                <div key={index} className="grid grid-cols-12 gap-2 items-end p-2 rounded-md bg-white border">
                                    <div className="col-span-12 md:col-span-7">
                                        <label className="text-xs muted">Matière Première</label>
                                        <select value={line.productId || ''} onChange={e => updateLine(index, 'productId', e.target.value)} className="w-full p-2 border rounded-md mt-1">
                                            <option value="">Sélectionner...</option>
                                            {rawMaterials.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-6 md:col-span-4">
                                        <label className="text-xs muted">Qté requise ({componentProduct?.stockUnit})</label>
                                        <input type="number" value={line.quantity || ''} onChange={e => updateLine(index, 'quantity', e.target.value)} className="w-full p-2 border rounded-md mt-1" />
                                    </div>
                                    <div className="col-span-6 md:col-span-1">
                                         <button onClick={() => removeLine(index)} className="btn btn-danger btn-sm h-full w-full"><i className="fa fa-trash"></i></button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <button onClick={addLine} className="btn btn-ghost btn-sm mt-2"><i className="fa fa-plus"></i> Ajouter un composant</button>
                </div>
            </div>

            <div className="flex gap-2 justify-end mt-6 border-t pt-4">
                <button className="btn btn-ghost" onClick={closeModal}>Annuler</button>
                <button className="btn btn-primary" onClick={handleSave}>{isEditing ? 'Enregistrer les modifications' : 'Créer la fiche technique'}</button>
            </div>
        </>
    );
};

export default ModalFicheTechnique;