/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import type { SalesOrder } from '../../types';

interface ModalProps {
    closeModal: () => void;
    salesOrder: SalesOrder;
}

const formatCurrency = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) return '-';
    return value.toLocaleString('fr-FR') + ' CFA';
}

const ModalSalesOrderDetails = ({ closeModal, salesOrder }: ModalProps) => {
    const { clients, salesUnits, products } = useAppContext();
    const isDelivered = salesOrder.status === 'Livrée' || salesOrder.status === 'Facturée';
    
    const client = clients.find(c => c.id === salesOrder.clientId);

    const getUnitDetails = (unitId: number) => {
        const unit = salesUnits.find(u => u.id === unitId);
        if (!unit) return { name: 'Inconnu', baseProduct: 'Inconnu' };
        return unit;
    }
    
    const getOrderStatusChip = (status: SalesOrder['status']) => {
        switch (status) {
            case 'Confirmée': return <span className="status-chip status-gray">Confirmée</span>;
            case 'En préparation': return <span className="status-chip status-blue animate-pulse">En Préparation</span>;
            case 'Livrée': return <span className="status-chip status-yellow">Livrée</span>;
            case 'Facturée': return <span className="status-chip status-green">Facturée</span>;
            default: return <span>{status}</span>;
        }
    };

    return (
        <>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Détails de la Commande</h3>
                    <p className="text-sm muted">ID: <span className="font-mono">{salesOrder.id}</span> | Client: <strong>{client?.companyName}</strong></p>
                </div>
                <button onClick={closeModal} className="btn btn-ghost btn-sm">✕</button>
            </div>
            
             <div className="p-3 bg-bg-subtle rounded-lg mb-4 grid grid-cols-3 gap-4 text-sm">
                <div><strong className="text-text-secondary block">Date Commande</strong> {new Date(salesOrder.orderDate).toLocaleDateString('fr-FR')}</div>
                <div><strong className="text-text-secondary block">Date Livraison</strong> {new Date(salesOrder.deliveryDate).toLocaleDateString('fr-FR')}</div>
                <div><strong className="text-text-secondary block">Statut</strong> {getOrderStatusChip(salesOrder.status)}</div>
            </div>

            <div className="overflow-y-auto max-h-[28rem] pr-2">
                <table className="w-full text-sm">
                    <thead>
                        <tr>
                            <th>Produit vendu</th>
                            <th className="text-right">Prix Unitaire</th>
                            <th className="text-center">Qté</th>
                            <th className="text-right">Sous-total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color">
                        {salesOrder.lines.map(line => {
                             const unit = getUnitDetails(line.salesUnitId);
                             return (
                                <tr key={line.salesUnitId}>
                                    <td>
                                        <div className="font-semibold">{unit.name}</div>
                                        <div className="text-xs text-text-muted">{unit.baseProduct}</div>
                                    </td>
                                    <td className="text-right">{formatCurrency(line.unitPrice)}</td>
                                    <td className="text-center">{line.quantity}</td>
                                    <td className="text-right font-medium">{formatCurrency(line.subtotal)}</td>
                                </tr>
                             )
                        })}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 border-t pt-4">
                {isDelivered ? (
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-sm text-text-muted">Chiffre d'Affaires</div>
                            <div className="font-bold text-lg">{formatCurrency(salesOrder.totalValue)}</div>
                        </div>
                         <div>
                            <div className="text-sm text-text-muted">Coût Marchandises</div>
                            <div className="font-bold text-lg text-danger">{formatCurrency(salesOrder.totalCostOfGoodsSold)}</div>
                        </div>
                         <div>
                            <div className="text-sm text-text-muted">Marge Brute</div>
                            <div className={`font-bold text-lg ${salesOrder.grossMargin !== undefined && salesOrder.grossMargin < 0 ? 'text-danger' : 'text-success'}`}>
                                {formatCurrency(salesOrder.grossMargin)}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-between items-center">
                        <h4 className="text-lg font-bold">Total Commande: {formatCurrency(salesOrder.totalValue)}</h4>
                        <span className="text-sm text-text-muted">La rentabilité sera calculée après la livraison.</span>
                    </div>
                )}
                 <div className="mt-4 flex justify-end">
                    <button className="btn btn-ghost" onClick={closeModal}>Fermer</button>
                 </div>
            </div>
        </>
    );
};

export default ModalSalesOrderDetails;