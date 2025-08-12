/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import type { User } from '../../types';

interface ModalProps {
    closeModal: () => void;
}

const ModalAjoutUtilisateur = ({ closeModal }: ModalProps) => {
    const { addUser, stores } = useAppContext();
    const [name, setName] = useState('');
    const [login, setLogin] = useState('');
    const [role, setRole] = useState<'Directeur' | 'Magasin'>('Magasin');
    const [store, setStore] = useState('Tous');
    const [status, setStatus] = useState<'Actif' | 'Inactif'>('Actif');

    const handleSave = () => {
        if (!name || !login) {
            alert('Nom et identifiant sont requis.');
            return;
        }
        addUser({ name, login, role, store, status });
        closeModal();
    };

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Ajouter un utilisateur</h3>
                <button onClick={closeModal} className="btn btn-ghost btn-sm">✕</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-sm muted">Nom complet</label><input value={name} onChange={e=>setName(e.target.value)} className="w-full p-2 border rounded-md mt-1" /></div>
                <div><label className="text-sm muted">Identifiant</label><input value={login} onChange={e=>setLogin(e.target.value)} className="w-full p-2 border rounded-md mt-1" /></div>
                <div><label className="text-sm muted">Rôle</label><select value={role} onChange={e=>setRole(e.target.value as any)} className="w-full p-2 border rounded-md mt-1"><option value="Directeur">Directeur</option><option value="Magasin">Magasin</option></select></div>
                <div><label className="text-sm muted">Magasin associé</label><select value={store} onChange={e=>setStore(e.target.value)} className="w-full p-2 border rounded-md mt-1"><option value="Tous">Tous</option>{stores.filter(s=>s.type === 'Magasin').map(s=><option key={s.id} value={s.name}>{s.name}</option>)}</select></div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
                <button className="btn btn-ghost" onClick={closeModal}>Annuler</button>
                <button className="btn btn-primary" onClick={handleSave}>Créer l'utilisateur</button>
            </div>
        </>
    );
};

export default ModalAjoutUtilisateur;