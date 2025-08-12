/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';

interface ModalProps {
    closeModal: () => void;
    invoiceId: string;
}

const formatCurrency = (value: number) => value.toLocaleString('fr-FR') + ' CFA';

const ModalFacture = ({ closeModal, invoiceId }: ModalProps) => {
    const { invoices, clients } = useAppContext();
    
    const invoice = useMemo(() => invoices.find(inv => inv.id === invoiceId), [invoices, invoiceId]);
    const client = useMemo(() => invoice ? clients.find(c => c.id === invoice.clientId) : null, [invoice, clients]);

    if (!invoice || !client) {
        return (
            <div className="p-4">
                <p>Facture ou client introuvable.</p>
                <button className="btn btn-ghost mt-4" onClick={closeModal}>Fermer</button>
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .invoice-print-area, .invoice-print-area * {
                        visibility: visible;
                    }
                    .invoice-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none;
                    }
                }
            `}</style>
            <div className="invoice-print-area bg-white text-gray-800 font-sans">
                <div className="p-8">
                    {/* Header */}
                    <div className="flex justify-between items-start pb-6 border-b-2 border-gray-200">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">FACTURE</h1>
                            <p className="text-gray-500">Facture #: <span className="font-semibold text-gray-700">{invoice.id}</span></p>
                            <p className="text-gray-500">Commande #: <span className="font-semibold text-gray-700">{invoice.salesOrderId}</span></p>
                        </div>
                        <div className="text-right">
                             <div className="flex items-center justify-end gap-3">
                                <i className="fa-solid fa-fish text-2xl text-primary"></i>
                                <h2 className="text-2xl font-semibold">Sakanaya SARL</h2>
                            </div>
                            <p className="text-sm text-gray-500">Zone Industrielle, Dakar, Sénégal</p>
                            <p className="text-sm text-gray-500">contact@sakanaya.sn | +221 33 800 00 00</p>
                        </div>
                    </div>

                    {/* Client Info and Dates */}
                    <div className="flex justify-between mt-6">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase">Facturé à</p>
                            <p className="font-bold text-lg">{client.companyName}</p>
                            <p className="text-gray-600">{client.name}</p>
                            <p className="text-gray-600">{client.address}</p>
                            <p className="text-gray-600">{client.email}</p>
                        </div>
                        <div className="text-right">
                            <div className="mb-2">
                                <p className="text-sm font-semibold text-gray-500 uppercase">Date de Facturation</p>
                                <p className="font-medium text-gray-800">{new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-500 uppercase">Date d'Échéance</p>
                                <p className="font-medium text-gray-800">{new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Invoice Lines Table */}
                    <div className="mt-8">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
                                    <th className="p-3">Description</th>
                                    <th className="p-3 text-right">Quantité</th>
                                    <th className="p-3 text-right">Prix Unitaire</th>
                                    <th className="p-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.lines.map((line, index) => (
                                    <tr key={index} className="border-b border-gray-100">
                                        <td className="p-3 font-medium">{line.description}</td>
                                        <td className="p-3 text-right">{line.quantity}</td>
                                        <td className="p-3 text-right">{formatCurrency(line.unitPrice)}</td>
                                        <td className="p-3 text-right font-medium">{formatCurrency(line.subtotal)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end mt-6">
                        <div className="w-full max-w-xs">
                            <div className="flex justify-between text-lg font-semibold text-gray-800 bg-gray-100 p-4 rounded-t-lg">
                                <span>Total</span>
                                <span>{formatCurrency(invoice.totalValue)}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="mt-12 pt-6 border-t-2 border-gray-200 text-xs text-gray-500">
                        <p className="font-semibold mb-1">Conditions de paiement:</p>
                        <p>Paiement dû à {client.paymentTerms}.</p>
                        <p className="mt-4">Merci pour votre confiance.</p>
                    </div>
                </div>
            </div>

            <div className="no-print flex gap-2 justify-end mt-4 p-4 bg-bg-subtle border-t">
                <button className="btn btn-ghost" onClick={closeModal}>Fermer</button>
                <button className="btn btn-primary" onClick={handlePrint}>
                    <i className="fa fa-print mr-2"></i>Imprimer
                </button>
            </div>
        </>
    );
};

export default ModalFacture;
