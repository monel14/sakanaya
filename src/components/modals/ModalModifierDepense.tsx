/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import type { Expense, ExpenseCategory } from '../../types';

interface ModalProps {
    closeModal: () => void;
    expense: Expense;
}

const ModalModifierDepense = ({ closeModal, expense }: ModalProps) => {
    const { updateExpense, stores, showToast } = useAppContext();
    
    const [storeId, setStoreId] = useState<number | ''>(expense.storeId);
    const [category, setCategory] = useState<ExpenseCategory>(expense.category);
    const [amount, setAmount] = useState<number | ''>(expense.amount);
    const [description, setDescription] = useState(expense.description);
    const [date, setDate] = useState(expense.date);

    const expenseCategories: ExpenseCategory[] = ['Loyer', 'Salaires', 'Électricité & Eau', 'Marketing', 'Maintenance', 'Fournitures', 'Autre'];
    const availableStores = stores.filter(s => s.type === 'Magasin');

    const handleSave = () => {
        if (!storeId || !amount || amount <= 0 || !description) {
            showToast('Veuillez remplir tous les champs obligatoires.');
            return;
        }
        updateExpense({
            ...expense,
            storeId: Number(storeId),
            date,
            category,
            amount: Number(amount),
            description
        });
        closeModal();
    };

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Modifier une dépense</h3>
                <button onClick={closeModal} className="btn btn-ghost btn-sm">✕</button>
            </div>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm muted">Magasin concerné</label>
                         <select value={storeId} onChange={e => setStoreId(Number(e.target.value))} className="w-full p-2 border rounded-md mt-1">
                            <option value="" disabled>Sélectionner un magasin...</option>
                            {availableStores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm muted">Date</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border rounded-md mt-1" />
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="text-sm muted">Catégorie</label>
                        <select value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)} className="w-full p-2 border rounded-md mt-1">
                            {expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm muted">Montant (CFA)</label>
                        <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full p-2 border rounded-md mt-1" placeholder="Ex: 50000" />
                    </div>
                </div>
                <div>
                    <label className="text-sm muted">Description</label>
                    <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded-md mt-1" placeholder="Ex: Achat fournitures de bureau" />
                </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
                <button className="btn btn-ghost" onClick={closeModal}>Annuler</button>
                <button className="btn btn-primary" onClick={handleSave}>Enregistrer les modifications</button>
            </div>
        </>
    );
};

export default ModalModifierDepense;