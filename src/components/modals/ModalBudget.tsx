/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import type { Budget, BudgetLine, BudgeableCategory, ExpenseCategory } from '../../types';

interface ModalProps {
    closeModal: () => void;
    budget?: Budget;
}

const ModalBudget = ({ closeModal, budget }: ModalProps) => {
    const { addBudget, updateBudget, stores, showToast } = useAppContext();
    const isEditing = !!budget;

    const [period, setPeriod] = useState(budget?.period || new Date().toISOString().slice(0, 7));
    const [lines, setLines] = useState<Partial<BudgetLine>[]>(budget?.lines || []);

    const expenseCategories: ExpenseCategory[] = ['Loyer', 'Salaires', 'Électricité & Eau', 'Marketing', 'Maintenance', 'Fournitures', 'Services bancaires', 'Autre'];
    const allCategories: BudgeableCategory[] = ['Chiffre d\'Affaires', ...expenseCategories];
    const availableStores = stores.filter(s => s.type === 'Magasin');

    useEffect(() => {
        // If creating a new budget for a period that doesn't exist, start fresh
        if (!isEditing) {
            setLines([]);
        }
    }, [isEditing]);

    const handleSave = () => {
        if (!period) {
            showToast('Veuillez définir une période pour le budget.');
            return;
        }

        const finalLines = lines
            .filter(l => l.storeId && l.category && l.budgetedAmount && l.budgetedAmount > 0)
            .map((l, index) => ({
                id: l.id || `${l.storeId}-${l.category}-${index}`,
                storeId: l.storeId!,
                category: l.category!,
                budgetedAmount: l.budgetedAmount!,
            }));

        if (finalLines.length === 0) {
            showToast('Veuillez ajouter au moins une ligne budgétaire valide.');
            return;
        }

        const budgetData = { period, lines: finalLines };

        if (isEditing) {
            updateBudget({ ...budgetData, id: budget.id });
        } else {
            addBudget(budgetData);
        }
        closeModal();
    };

    const addLine = () => {
        setLines([...lines, { id: `new-${Date.now()}`, budgetedAmount: 0 }]);
    };

    const removeLine = (id: string) => {
        setLines(lines.filter(l => l.id !== id));
    };

    const updateLine = (id: string, field: keyof BudgetLine, value: any) => {
        setLines(currentLines => currentLines.map(line => 
            line.id === id ? { ...line, [field]: value } : line
        ));
    };

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{isEditing ? 'Modifier le' : 'Créer un'} Budget</h3>
                <button onClick={closeModal} className="btn btn-ghost btn-sm">✕</button>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label className="text-sm muted">Période du Budget (YYYY-MM)</label>
                    <input 
                        type="month" 
                        value={period} 
                        onChange={e => setPeriod(e.target.value)} 
                        className="w-full p-2 border rounded-md mt-1"
                        disabled={isEditing}
                    />
                </div>

                <div className="border-t pt-4">
                    <h4 className="font-semibold text-sm mb-2 text-text-secondary">Lignes Budgétaires</h4>
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                        {lines.map((line) => (
                            <div key={line.id} className="grid grid-cols-12 gap-2 items-end p-2 rounded-md bg-white border">
                                <div className="col-span-4">
                                    <label className="text-xs muted">Magasin</label>
                                    <select value={line.storeId || ''} onChange={e => updateLine(line.id!, 'storeId', Number(e.target.value))} className="w-full p-2 border rounded-md mt-1 text-sm">
                                        <option value="" disabled>Choisir...</option>
                                        {availableStores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-4">
                                    <label className="text-xs muted">Catégorie</label>
                                    <select value={line.category || ''} onChange={e => updateLine(line.id!, 'category', e.target.value)} className="w-full p-2 border rounded-md mt-1 text-sm">
                                        <option value="" disabled>Choisir...</option>
                                        {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-3">
                                    <label className="text-xs muted">Montant (CFA)</label>
                                    <input type="number" value={line.budgetedAmount || ''} onChange={e => updateLine(line.id!, 'budgetedAmount', Number(e.target.value))} className="w-full p-2 border rounded-md mt-1 text-sm" />
                                </div>
                                <div className="col-span-1">
                                    <button onClick={() => removeLine(line.id!)} className="btn btn-danger btn-sm h-full w-full"><i className="fa fa-trash"></i></button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={addLine} className="btn btn-ghost btn-sm mt-2"><i className="fa fa-plus"></i> Ajouter une ligne</button>
                </div>
            </div>

            <div className="flex gap-2 justify-end mt-6 border-t pt-4">
                <button className="btn btn-ghost" onClick={closeModal}>Annuler</button>
                <button className="btn btn-primary" onClick={handleSave}>{isEditing ? 'Enregistrer les modifications' : 'Créer le budget'}</button>
            </div>
        </>
    );
};

export default ModalBudget;