/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';

interface ModalProps {
    closeModal: () => void;
}

const ModalAjoutMagasin = ({ closeModal }: ModalProps) => {
    const { addStore } = useAppContext();
    const [name, setName] = useState('');
    const [type, setType] = useState<'Magasin' | 'Hub'>('Magasin');
    const [address, setAddress] = useState('');

    const handleSave = () => {
        if (!name || !address) {
            alert('Nom et adresse sont requis.');
            return;
        }
        addStore({ name, type, address, status: 'Actif' });
        closeModal();
    };

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Ajouter un magasin</h3>
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
                <div>
                    <label className="text-sm muted">Type</label>
                    <select value={type} onChange={e => setType(e.target.value as any)} className="w-full p-2 border rounded-md mt-1">
                        <option value="Magasin">Point de vente</option>
                        <option value="Hub">Hub de distribution</option>
                    </select>
                </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
                <button className="btn btn-ghost" onClick={closeModal}>Annuler</button>
                <button className="btn btn-primary" onClick={handleSave}>Enregistrer le magasin</button>
            </div>
        </>
    );
};

export default ModalAjoutMagasin;