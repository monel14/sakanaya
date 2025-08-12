/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';

interface ModalProps {
    closeModal: () => void;
}

const ModalAjoutEmploye = ({ closeModal }: ModalProps) => {
    const { addEmployee, stores } = useAppContext();
    const [name, setName] = useState('');
    const [role, setRole] = useState<'Responsable' | 'Vendeur'>('Vendeur');
    const [store, setStore] = useState('');
    const [salary, setSalary] = useState(0);

    const handleSave = () => {
        if (!name || !store || salary <= 0) {
            alert('Veuillez remplir tous les champs.');
            return;
        }
        addEmployee({ name, store, role, salary, status: 'Actif' });
        closeModal();
    };

    return (
        <>
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold">Ajouter un employé</h3><button onClick={closeModal} className="btn btn-ghost btn-sm">✕</button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-sm muted">Nom complet</label><input value={name} onChange={e=>setName(e.target.value)} className="w-full p-2 border rounded-md mt-1" /></div>
                <div><label className="text-sm muted">Rôle</label><select value={role} onChange={e=>setRole(e.target.value as any)} className="w-full p-2 border rounded-md mt-1"><option value="Vendeur">Vendeur</option><option value="Responsable">Responsable</option></select></div>
                <div><label className="text-sm muted">Magasin</label><select value={store} onChange={e=>setStore(e.target.value)} className="w-full p-2 border rounded-md mt-1"><option value="">Sélectionner...</option>{stores.filter(s=>s.type === 'Magasin').map(s=><option key={s.id} value={s.name}>{s.name}</option>)}</select></div>
                <div><label className="text-sm muted">Salaire (CFA)</label><input type="number" value={salary} onChange={e=>setSalary(Number(e.target.value))} className="w-full p-2 border rounded-md mt-1" /></div>
            </div>
            <div className="flex gap-2 justify-end mt-6"><button className="btn btn-ghost" onClick={closeModal}>Annuler</button><button className="btn btn-primary" onClick={handleSave}>Créer l'employé</button></div>
        </>
    );
};

export default ModalAjoutEmploye;