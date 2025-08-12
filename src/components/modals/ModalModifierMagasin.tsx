/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import type { Store } from '../../types';

interface ModalProps {
    closeModal: () => void;
    store: Store;
}

const ModalModifierMagasin = ({ closeModal, store }: ModalProps) => {
    const { updateStore } = useAppContext();
    const [name, setName] = useState(store.name);
    const [type, setType] = useState(store.type);
    const [address, setAddress] = useState(store.address);
    const [status, setStatus] = useState(store.status);

    const handleSave = () => {
        if (!name || !address) {
            alert('Nom et adresse sont requis.');
            return;
        }
        updateStore({ id: store.id, name, type, address, status });
        closeModal();
    };

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Modifier un magasin</h3>
                <button onClick={closeModal} className="btn btn-ghost btn-sm">✕</button>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="text-sm muted">Nom du magasin</label>
                    <input value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-md mt-1" />
                </div>
                <div>
                    <label className="text-sm muted">Adresse</label>
                    <input value={address} onChange={e => setAddress(e.target.value)} className="w-full p-2 border rounded-md mt-1" />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm muted">Type</label>
                        <select value={type} onChange={e => setType(e.target.value as any)} className="w-full p-2 border rounded-md mt-1">
                            <option value="Magasin">Point de vente</option>
                            <option value="Hub">Hub de distribution</option>
                        </select>
                    </div>
                     <div>
                        <label className="text-sm muted">Statut</label>
                        <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full p-2 border rounded-md mt-1">
                            <option value="Actif">Actif</option>
                            <option value="Inactif">Inactif</option>
                        </select>
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

export default ModalModifierMagasin;