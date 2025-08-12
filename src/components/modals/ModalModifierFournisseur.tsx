/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import type { Supplier } from '../../types';

interface ModalProps {
    closeModal: () => void;
    supplier: Supplier;
}

const ModalModifierFournisseur = ({ closeModal, supplier }: ModalProps) => {
    const { updateSupplier, showToast } = useAppContext();
    const [name, setName] = useState(supplier.name);
    const [contactPerson, setContactPerson] = useState(supplier.contactPerson);
    const [contactEmail, setContactEmail] = useState(supplier.contactEmail);
    const [phone, setPhone] = useState(supplier.phone);
    const [address, setAddress] = useState(supplier.address);
    const [paymentTerms, setPaymentTerms] = useState(supplier.paymentTerms);

    const handleSave = () => {
        if (!name || !contactPerson || !address) {
            showToast('Le nom, le contact et l\'adresse sont requis.');
            return;
        }
        updateSupplier({
            id: supplier.id,
            name,
            contactPerson,
            contactEmail,
            phone,
            address,
            paymentTerms
        });
        closeModal();
    };

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Modifier un Fournisseur</h3>
                <button onClick={closeModal} className="btn btn-ghost btn-sm">✕</button>
            </div>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm muted">Nom du fournisseur</label>
                        <input value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-md mt-1" />
                    </div>
                    <div>
                        <label className="text-sm muted">Nom du contact</label>
                        <input value={contactPerson} onChange={e => setContactPerson(e.target.value)} className="w-full p-2 border rounded-md mt-1" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm muted">Email</label>
                        <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="w-full p-2 border rounded-md mt-1" />
                    </div>
                    <div>
                        <label className="text-sm muted">Téléphone</label>
                        <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 border rounded-md mt-1" />
                    </div>
                </div>
                <div>
                    <label className="text-sm muted">Adresse</label>
                    <input value={address} onChange={e => setAddress(e.target.value)} className="w-full p-2 border rounded-md mt-1" />
                </div>
                 <div>
                    <label className="text-sm muted">Conditions de paiement</label>
                    <select value={paymentTerms} onChange={e => setPaymentTerms(e.target.value as any)} className="w-full p-2 border rounded-md mt-1">
                        <option value="À réception">À réception</option>
                        <option value="30 jours">30 jours</option>
                        <option value="60 jours">60 jours</option>
                    </select>
                </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
                <button className="btn btn-ghost" onClick={closeModal}>Annuler</button>
                <button className="btn btn-primary" onClick={handleSave}>Enregistrer les modifications</button>
            </div>
        </>
    );
};

export default ModalModifierFournisseur;
