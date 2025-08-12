/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import type { Client, SalesOrder, Invoice } from '../../types';

interface ModalProps {
    closeModal: () => void;
    client: Client;
}

const formatCurrency = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) return '0 CFA';
    return value.toLocaleString('fr-FR') + ' CFA';
};

const ModalClientDossier = ({ closeModal, client }: ModalProps) => {
    const { salesOrders, invoices, openModal } = useAppContext();
    const [activeTab, setActiveTab] = useState('orders');

    const clientData = useMemo(() => {
        const clientOrders = salesOrders.filter(so => so.clientId === client.id).sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
        const clientInvoices = invoices.filter(inv => inv.clientId === client.id).sort((a,b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());

        const totalCA = clientInvoices.filter(inv => inv.status === 'Payée').reduce((sum, inv) => sum + inv.totalValue, 0);
        const unpaidInvoices = clientInvoices.filter(inv => inv.status === 'Envoyée' || inv.status === 'En Retard');
        
        const today = new Date('2025-08-06'); // Mock date for consistency
        const soldeDu = unpaidInvoices.reduce((sum, inv) => sum + inv.totalValue, 0);
        const retards = unpaidInvoices.filter(inv => new Date(inv.dueDate) < today).reduce((sum, inv) => sum + inv.totalValue, 0);
        
        const profitabilityData = clientOrders
            .filter(o => o.status === 'Livrée' || o.status === 'Facturée')
            .map(o => ({
                ...o,
                grossMarginPercentage: o.totalValue > 0 ? ((o.grossMargin || 0) / o.totalValue) * 100 : 0
            }));

        return {
            clientOrders,
            clientInvoices,
            totalCA,
            soldeDu,
            retards,
            profitabilityData
        };
    }, [client.id, salesOrders, invoices]);
    
    const getOrderStatusChip = (status: SalesOrder['status']) => {
        switch (status) {
            case 'Confirmée': return <span className="status-chip status-gray">Confirmée</span>;
            case 'En préparation': return <span className="status-chip status-blue">Préparation</span>;
            case 'Livrée': return <span className="status-chip status-yellow">Livrée</span>;
            case 'Facturée': return <span className="status-chip status-green">Facturée</span>;
            default: return <span>{status}</span>;
        }
    };
    
    const getInvoiceStatusChip = (invoice: Invoice) => {
        const today = new Date('2025-08-06');
        if (invoice.status === 'Envoyée' && new Date(invoice.dueDate) < today) {
             return <span className="status-chip status-danger">En Retard</span>;
        }
        switch (invoice.status) {
            case 'Envoyée': return <span className="status-chip status-blue">Envoyée</span>;
            case 'Payée': return <span className="status-chip status-green">Payée</span>;
            case 'En Retard': return <span className="status-chip status-danger">En Retard</span>;
            default: return <span className="status-chip status-gray">{invoice.status}</span>;
        }
    };


    return (
        <>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-xl font-bold text-text-main">{client.companyName}</h3>
                    <p className="text-sm text-text-muted">Dossier Client</p>
                </div>
                <button onClick={closeModal} className="btn btn-ghost btn-sm">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-bg-subtle rounded-lg mb-4">
                 <div className="card text-center p-3"><div className="kpi-label">Chiffre d'Affaires Total</div><div className="kpi-number text-success">{formatCurrency(clientData.totalCA)}</div></div>
                 <div className="card text-center p-3"><div className="kpi-label">Solde Dû</div><div className="kpi-number text-warn">{formatCurrency(clientData.soldeDu)}</div></div>
                 <div className="card text-center p-3"><div className="kpi-label">Retards de Paiement</div><div className="kpi-number text-danger">{formatCurrency(clientData.retards)}</div></div>
            </div>

            <div className="flex gap-2 mb-4 border-b pb-2 flex-wrap">
                <button className={`btn btn-sm ${activeTab === 'orders' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('orders')}>Commandes</button>
                <button className={`btn btn-sm ${activeTab === 'invoices' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('invoices')}>Factures</button>
                <button className={`btn btn-sm ${activeTab === 'profitability' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('profitability')}>Rentabilité</button>
            </div>

            <div className="overflow-y-auto max-h-[20rem] pr-2">
                {activeTab === 'orders' && (
                    <table className="w-full text-sm">
                        <thead><tr><th>#CV</th><th>Date</th><th>Statut</th><th className="text-right">Total</th><th>Action</th></tr></thead>
                        <tbody>
                            {clientData.clientOrders.map(so => (
                                <tr key={so.id}>
                                    <td className="font-mono">{so.id}</td>
                                    <td>{new Date(so.orderDate).toLocaleDateString('fr-FR')}</td>
                                    <td>{getOrderStatusChip(so.status)}</td>
                                    <td className="text-right font-medium">{formatCurrency(so.totalValue)}</td>
                                    <td><button className="btn btn-ghost btn-sm" onClick={() => openModal('modalSalesOrderDetails', { salesOrder: so })}>Voir</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {activeTab === 'invoices' && (
                    <table className="w-full text-sm">
                         <thead><tr><th>#Facture</th><th>Date</th><th>Échéance</th><th>Statut</th><th className="text-right">Total</th><th>Action</th></tr></thead>
                        <tbody>
                            {clientData.clientInvoices.map(inv => (
                                <tr key={inv.id}>
                                    <td className="font-mono">{inv.id}</td>
                                    <td>{new Date(inv.invoiceDate).toLocaleDateString('fr-FR')}</td>
                                    <td>{new Date(inv.dueDate).toLocaleDateString('fr-FR')}</td>
                                    <td>{getInvoiceStatusChip(inv)}</td>
                                    <td className="text-right font-medium">{formatCurrency(inv.totalValue)}</td>
                                    <td><button className="btn btn-ghost btn-sm" onClick={() => openModal('modalFacture', { invoiceId: inv.id })}>Voir</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {activeTab === 'profitability' && (
                     <table className="w-full text-sm">
                         <thead><tr><th>#CV</th><th>Date</th><th className="text-right">CA</th><th className="text-right">Coût</th><th className="text-right">Marge</th><th className="text-right">Marge %</th></tr></thead>
                        <tbody>
                            {clientData.profitabilityData.map(o => (
                                <tr key={o.id}>
                                    <td className="font-mono">{o.id}</td>
                                    <td>{new Date(o.orderDate).toLocaleDateString('fr-FR')}</td>
                                    <td className="text-right font-medium">{formatCurrency(o.totalValue)}</td>
                                    <td className="text-right text-danger">{formatCurrency(o.totalCostOfGoodsSold)}</td>
                                    <td className={`text-right font-bold ${o.grossMargin && o.grossMargin < 0 ? 'text-danger' : 'text-success'}`}>{formatCurrency(o.grossMargin)}</td>
                                    <td className={`text-right font-bold ${o.grossMarginPercentage < 15 ? 'text-danger' : 'text-success'}`}>{o.grossMarginPercentage.toFixed(1)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="flex justify-end mt-6 border-t pt-4">
                <button className="btn btn-ghost" onClick={closeModal}>Fermer</button>
            </div>
        </>
    );
};

export default ModalClientDossier;
