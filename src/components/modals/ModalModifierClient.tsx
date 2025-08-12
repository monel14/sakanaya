/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import type { Client } from '../../types';

interface ModalProps {
    closeModal: () => void;
    client: Client;
}

const ModalModifierClient = ({ closeModal, client }: ModalProps) => {
    const { updateClient, showToast } = useAppContext();
    const [name, setName] = useState(client.name);
    const [companyName, setCompanyName] = useState(client.companyName);
    const [email, setEmail] = useState(client.email);
    const [phone, setPhone] = useState(client.phone);
    const [address, setAddress] = useState(client.address);
    const [paymentTerms, setPaymentTerms] = useState(client.paymentTerms);

    const handleSave = () => {
        if (!name || !companyName || !address) {
            showToast('Le nom du contact, le nom de l\'entreprise et l\'adresse sont requis.');
            return;
        }
        updateClient({
            id: client.id,
            name,
            companyName,
            email,
            phone,
            address,
            paymentTerms
        });
        closeModal();
    };

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Modifier un Client</h3>
                <button onClick={closeModal} className="btn btn-ghost btn-sm">✕</button>
            </div>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm muted">Nom de l'entreprise</label>
                        <input value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full p-2 border rounded-md mt-1" />
                    </div>
                    <div>
                        <label className="text-sm muted">Nom du contact</label>
                        <input value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-md mt-1" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm muted">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded-md mt-1" />
                    </div>
                    <div>
                        <label className="text-sm muted">Téléphone</label>
                        <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 border rounded-md mt-1" />
                    </div>
                </div>
                <div>
                    <label className="text-sm muted">Adresse de livraison</label>
                    <input value={address} onChange={e => setAddress(e.target.value)} className="w-full p-2 border rounded-md mt-1" />
                </div>
                 <div>
                    <label className="text-sm muted">Conditions de paiement</label>
                    <select value={paymentTerms} onChange={e => setPaymentTerms(e.target.value as any)} className="w-full p-2 border rounded-md mt-1">
                        <option value="À la livraison">À la livraison</option>
                        <option value="15 jours">15 jours</option>
                        <option value="30 jours">30 jours</option>
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

export default ModalModifierClient;