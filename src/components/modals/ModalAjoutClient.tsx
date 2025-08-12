/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';

interface ModalProps {
    closeModal: () => void;
}

const ModalAjoutClient = ({ closeModal }: ModalProps) => {
    const { addClient, showToast } = useAppContext();
    const [name, setName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [paymentTerms, setPaymentTerms] = useState<'À la livraison' | '15 jours' | '30 jours'>('30 jours');

    const handleSave = () => {
        if (!name || !companyName || !address) {
            showToast('Le nom du contact, le nom de l\'entreprise et l\'adresse sont requis.');
            return;
        }
        addClient({
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
                <h3 className="text-lg font-semibold">Ajouter un Client</h3>
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
                <button className="btn btn-primary" onClick={handleSave}>Enregistrer le client</button>
            </div>
        </>
    );
};

export default ModalAjoutClient;