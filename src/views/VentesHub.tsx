/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { SalesOrder, Client, Invoice } from '../types';

const VentesHub = () => {
    const { 
        openModal, clients, salesOrders, invoices, updateSalesOrderStatus, markInvoiceAsPaid
    } = useAppContext();
    const [activeTab, setActiveTab] = useState('sales-orders');

    const getClientName = (clientId: number) => clients.find(c => c.id === clientId)?.companyName || 'N/A';
    
    const getOrderStatusChip = (status: SalesOrder['status']) => {
        switch (status) {
            case 'Confirmée': return <span className="status-chip status-gray">Confirmée</span>;
            case 'En préparation': return <span className="status-chip status-blue animate-pulse">En Préparation</span>;
            case 'Livrée': return <span className="status-chip status-yellow">Livrée</span>;
            case 'Facturée': return <span className="status-chip status-green">Facturée</span>;
            default: return <span>{status}</span>;
        }
    };

    const getInvoiceStatusChip = (status: Invoice['status']) => {
        const today = new Date('2025-08-06');
        const invoice = invoices.find(inv => inv.status === status);
        if (invoice && invoice.status === 'Envoyée' && new Date(invoice.dueDate) < today) {
            return <span className="status-chip status-danger">En Retard</span>;
        }

        switch (status) {
            case 'Envoyée': return <span className="status-chip status-blue">Envoyée</span>;
            case 'Payée': return <span className="status-chip status-green">Payée</span>;
            case 'En Retard': return <span className="status-chip status-danger">En Retard</span>;
            case 'Brouillon': return <span className="status-chip status-gray">Brouillon</span>;
            default: return <span>{status}</span>;
        }
    };
    
    // Render Components for Tabs
    const SalesOrdersPanel = () => (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Commandes de Vente</h3>
                <button className="btn btn-primary" onClick={() => openModal('modalCommandeDeVente')}>
                    <i className="fa fa-plus mr-2"></i>Nouvelle Commande
                </button>
            </div>
            <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full text-sm">
                    <thead>
                        <tr>
                            <th className="text-left">#CV</th>
                            <th className="text-left">Client</th>
                            <th>Date Commande</th>
                            <th className="text-right">Total (CFA)</th>
                            <th className="text-center">Statut</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {salesOrders.sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()).map(so => (
                            <tr key={so.id}>
                                <td className="font-mono">{so.id}</td>
                                <td className="font-semibold">{getClientName(so.clientId)}</td>
                                <td>{new Date(so.orderDate).toLocaleDateString('fr-FR')}</td>
                                <td className="text-right font-medium">{so.totalValue.toLocaleString('fr-FR')}</td>
                                <td className="text-center">{getOrderStatusChip(so.status)}</td>
                                <td className="text-center">
                                    <div className="flex gap-2 justify-center">
                                     <button className="btn btn-ghost btn-sm" onClick={() => openModal('modalSalesOrderDetails', { salesOrder: so })}>
                                        Détails
                                     </button>
                                     {so.status === 'Confirmée' && (
                                        <button className="btn btn-primary btn-sm" onClick={() => updateSalesOrderStatus(so.id, 'En préparation')}>
                                            Préparer
                                        </button>
                                     )}
                                     {so.status === 'En préparation' && (
                                        <button className="btn btn-accent btn-sm" onClick={() => updateSalesOrderStatus(so.id, 'Livrée')}>
                                            Marquer Livrée
                                        </button>
                                     )}
                                     {so.status === 'Livrée' && (
                                         <button className="btn btn-success btn-sm" onClick={() => updateSalesOrderStatus(so.id, 'Facturée')}>
                                            Facturer
                                        </button>
                                     )}
                                     {so.status === 'Facturée' && (
                                        <button className="btn btn-ghost btn-sm" onClick={() => {
                                            const relatedInvoice = invoices.find(inv => inv.salesOrderId === so.id);
                                            if (relatedInvoice) openModal('modalFacture', { invoiceId: relatedInvoice.id });
                                        }}>
                                            Voir Facture
                                        </button>
                                     )}
                                     </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const InvoicesPanel = () => (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Factures de Vente</h3>
            </div>
            <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full text-sm">
                    <thead>
                        <tr>
                            <th className="text-left">#Facture</th>
                            <th className="text-left">Client</th>
                            <th>Date Facture</th>
                            <th>Échéance</th>
                            <th className="text-right">Total (CFA)</th>
                            <th className="text-center">Statut</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.sort((a,b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()).map(inv => (
                            <tr key={inv.id}>
                                <td className="font-mono">{inv.id}</td>
                                <td className="font-semibold">{getClientName(inv.clientId)}</td>
                                <td>{new Date(inv.invoiceDate).toLocaleDateString('fr-FR')}</td>
                                <td>{new Date(inv.dueDate).toLocaleDateString('fr-FR')}</td>
                                <td className="text-right font-medium">{inv.totalValue.toLocaleString('fr-FR')}</td>
                                <td className="text-center">{getInvoiceStatusChip(inv.status)}</td>
                                <td className="text-center">
                                    <div className="flex gap-2 justify-center">
                                        <button className="btn btn-ghost btn-sm" onClick={() => {
                                            const relatedOrder = salesOrders.find(so => so.id === inv.salesOrderId);
                                            if (relatedOrder) openModal('modalSalesOrderDetails', { salesOrder: relatedOrder });
                                        }}>
                                            <i className="fa fa-file-alt mr-1"></i>Voir Commande
                                        </button>
                                        <button className="btn btn-ghost btn-sm" onClick={() => openModal('modalFacture', { invoiceId: inv.id })}>
                                            <i className="fa fa-eye mr-1"></i>Voir Facture
                                        </button>
                                        {inv.status === 'Envoyée' && (
                                            <button className="btn btn-accent btn-sm" onClick={() => markInvoiceAsPaid(inv.id)}>
                                                Marquer Payée
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
    const ClientsPanel = () => (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Gestion des Clients</h3>
                <button className="btn btn-primary" onClick={() => openModal('modalAjoutClient')}>
                    <i className="fa fa-user-plus mr-2"></i>Nouveau Client
                </button>
            </div>
             <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full text-sm">
                    <thead>
                        <tr>
                            <th className="text-left">Société</th>
                            <th className="text-left">Contact</th>
                            <th>Email & Téléphone</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                     <tbody>
                        {clients.map(client => (
                            <tr key={client.id}>
                                <td className="font-semibold">{client.companyName}</td>
                                <td>{client.name}</td>
                                <td>
                                    <div>{client.email}</div>
                                    <div className="text-xs text-text-muted">{client.phone}</div>
                                </td>
                                <td className="text-center">
                                    <div className="flex gap-2 justify-center">
                                        <button className="btn btn-primary btn-sm" onClick={() => openModal('modalClientDossier', { client })}>
                                            <i className="fa fa-folder-open text-xs"></i>
                                            <span className="ml-2">Dossier</span>
                                        </button>
                                        <button className="btn btn-ghost btn-sm" onClick={() => openModal('modalModifierClient', { client })}>
                                            <i className="fa fa-pencil-alt text-xs"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <section id="ventes-hub" className="view space-y-6">
            <header>
                <h2 className="text-2xl font-bold">Pôle Ventes</h2>
                <p className="text-text-secondary">Gestion des clients B2B et des commandes de vente.</p>
            </header>

            <div className="card">
                <div className="flex gap-2 mb-4 border-b pb-2 flex-wrap">
                     <button className={`btn btn-sm ${activeTab === 'sales-orders' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('sales-orders')}>Commandes de Vente</button>
                     <button className={`btn btn-sm ${activeTab === 'invoices' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('invoices')}>Factures</button>
                     <button className={`btn btn-sm ${activeTab === 'clients' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('clients')}>Clients</button>
                </div>
                {activeTab === 'sales-orders' && <SalesOrdersPanel />}
                {activeTab === 'invoices' && <InvoicesPanel />}
                {activeTab === 'clients' && <ClientsPanel />}
            </div>
        </section>
    );
};

export default VentesHub;