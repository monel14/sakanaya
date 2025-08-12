/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { PurchaseOrder, Supplier } from '../types';

const AchatsHub = () => {
    const { 
        openModal, suppliers, purchaseOrders
    } = useAppContext();
    const [activeTab, setActiveTab] = useState('purchase-orders');

    const getSupplierName = (supplierId: number) => suppliers.find(s => s.id === supplierId)?.name || 'N/A';
    
    const getStatusChip = (status: PurchaseOrder['status']) => {
        switch (status) {
            case 'Envoyée': return <span className="status-chip status-blue">Envoyée</span>;
            case 'Terminé': return <span className="status-chip status-green">Terminé</span>;
            case 'Brouillon': return <span className="status-chip status-gray">Brouillon</span>;
            default: return <span>{status}</span>;
        }
    }
    
    // --- Render Components for Tabs ---
    
    const PurchaseOrdersPanel = () => (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Bons de Commande</h3>
                <button className="btn btn-primary" onClick={() => openModal('modalBonDeCommande')}>
                    <i className="fa fa-plus mr-2"></i>Nouveau Bon de Commande
                </button>
            </div>
            <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full text-sm">
                    <thead>
                        <tr>
                            <th className="text-left">#BC</th>
                            <th className="text-left">Fournisseur</th>
                            <th>Date Commande</th>
                            <th className="text-right">Total (CFA)</th>
                            <th className="text-center">Statut</th>
                            <th className="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchaseOrders.sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()).map(po => (
                            <tr key={po.id}>
                                <td className="font-mono">{po.id}</td>
                                <td className="font-semibold">{getSupplierName(po.supplierId)}</td>
                                <td>{new Date(po.orderDate).toLocaleDateString('fr-FR')}</td>
                                <td className="text-right font-medium">{po.totalValue.toLocaleString('fr-FR')}</td>
                                <td className="text-center">{getStatusChip(po.status)}</td>
                                <td className="text-center">
                                     {po.status === 'Envoyée' && (
                                        <button className="btn btn-accent btn-sm" onClick={() => openModal('modalNouvelArrivage', { purchaseOrder: po })}>
                                            <i className="fa fa-dolly-flatbed mr-2"></i>Réceptionner
                                        </button>
                                     )}
                                     {po.status === 'Terminé' && (
                                         <span className="text-xs text-text-muted">Aucune action</span>
                                     )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
    const SuppliersPanel = () => (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Gestion des Fournisseurs</h3>
                <button className="btn btn-primary" onClick={() => openModal('modalAjoutFournisseur')}>
                    <i className="fa fa-user-plus mr-2"></i>Nouveau Fournisseur
                </button>
            </div>
             <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full text-sm">
                    <thead>
                        <tr>
                            <th className="text-left">Nom</th>
                            <th className="text-left">Contact</th>
                            <th className="text-left">Email</th>
                            <th>Téléphone</th>
                            <th className="text-center">Action</th>
                        </tr>
                    </thead>
                     <tbody>
                        {suppliers.map(supplier => (
                            <tr key={supplier.id}>
                                <td className="font-semibold">{supplier.name}</td>
                                <td>{supplier.contactPerson}</td>
                                <td>{supplier.contactEmail}</td>
                                <td>{supplier.phone}</td>
                                <td className="text-center">
                                    <button className="btn btn-ghost btn-sm" onClick={() => openModal('modalModifierFournisseur', { supplier })}>
                                        <i className="fa fa-pencil-alt text-xs"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <section id="achats-hub" className="view space-y-6">
            <header>
                <h2 className="text-2xl font-bold">Pôle Achats</h2>
                <p className="text-text-secondary">Gestion des fournisseurs et des commandes d'achat.</p>
            </header>

            <div className="card">
                <div className="flex gap-2 mb-4 border-b pb-2 flex-wrap">
                     <button className={`btn btn-sm ${activeTab === 'purchase-orders' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('purchase-orders')}>Commandes d'Achat</button>
                     <button className={`btn btn-sm ${activeTab === 'suppliers' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('suppliers')}>Fournisseurs</button>
                </div>
                {activeTab === 'purchase-orders' && <PurchaseOrdersPanel />}
                {activeTab === 'suppliers' && <SuppliersPanel />}
            </div>
        </section>
    );
};

export default AchatsHub;
