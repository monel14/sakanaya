/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import type { SaleClosure } from '../../types';

interface ModalProps {
    closeModal: () => void;
    closure: SaleClosure;
}

const formatCurrency = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) return '-';
    return value.toLocaleString('fr-FR') + ' CFA';
}

const ModalSaleClosureDetails = ({ closeModal, closure }: ModalProps) => {
    const { salesUnits } = useAppContext();
    const isValidated = closure.status === 'validated';

    const getUnitDetails = (unitId: number) => salesUnits.find(u => u.id === unitId);

    return (
        <>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Détails de la Clôture</h3>
                    <p className="text-sm muted">Magasin: <strong>{closure.storeName}</strong> | Date: <strong>{closure.date}</strong> | Statut: <strong className={isValidated ? 'text-success' : 'text-primary'}>{closure.status}</strong></p>
                </div>
                <button onClick={closeModal} className="btn btn-ghost btn-sm">✕</button>
            </div>

            <div className="overflow-y-auto max-h-[28rem] pr-2">
                <table className="w-full text-sm">
                    <thead>
                        <tr>
                            <th>Produit vendu</th>
                            <th className="text-right">CA</th>
                            {isValidated && <th className="text-right">Coût</th>}
                            {isValidated && <th className="text-right">Marge</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color">
                        {closure.lines.map(line => {
                             const unit = getUnitDetails(line.unitId);
                             if (!unit) return null;
                             const revenue = unit.price * line.qty;
                             const margin = line.costOfGoodsSold !== undefined ? revenue - line.costOfGoodsSold : undefined;

                             return (
                                <tr key={line.id}>
                                    <td>
                                        <div className="font-semibold">{unit.name}</div>
                                        <div className="text-xs text-text-muted">Qté: {line.qty} @ {unit.price.toLocaleString('fr-FR')}</div>
                                    </td>
                                    <td className="text-right font-medium">{formatCurrency(revenue)}</td>
                                    {isValidated && <td className="text-right text-danger-dark">{formatCurrency(line.costOfGoodsSold)}</td>}
                                    {isValidated && (
                                        <td className={`text-right font-bold ${margin === undefined || margin < 0 ? 'text-danger' : 'text-success'}`}>
                                            {formatCurrency(margin)}
                                        </td>
                                    )}
                                </tr>
                             )
                        })}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 border-t pt-4">
                {isValidated ? (
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-sm text-text-muted">Chiffre d'Affaires</div>
                            <div className="font-bold text-lg">{formatCurrency(closure.total)}</div>
                        </div>
                         <div>
                            <div className="text-sm text-text-muted">Coût Marchandises</div>
                            <div className="font-bold text-lg text-danger">{formatCurrency(closure.totalCostOfGoodsSold)}</div>
                        </div>
                         <div>
                            <div className="text-sm text-text-muted">Marge Brute</div>
                            <div className={`font-bold text-lg ${closure.grossMargin !== undefined && closure.grossMargin < 0 ? 'text-danger' : 'text-success'}`}>
                                {formatCurrency(closure.grossMargin)}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-between items-center">
                        <h4 className="text-lg font-bold">Total: {formatCurrency(closure.total)}</h4>
                    </div>
                )}
                 <div className="mt-4 flex justify-end">
                    <button className="btn btn-ghost" onClick={closeModal}>Fermer</button>
                 </div>
            </div>
        </>
    );
};

export default ModalSaleClosureDetails;