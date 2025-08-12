/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { useAppContext } from '../contexts/AppContext';

const PricesView = () => {
    const { salesUnits } = useAppContext();

    return (
        <section id="prices-view" className="view">
            <div className="card">
                <div className="card-header">
                    <i className="fa fa-dollar-sign mr-2"></i>
                    Prix de vente du jour
                </div>
                <p className="text-sm text-text-muted mb-4">
                    Voici la liste des unités de vente et leurs prix actuellement en vigueur.
                </p>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr>
                                <th>Produit de base</th>
                                <th>Unité de vente</th>
                                <th className="text-right">Prix (CFA)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salesUnits.length > 0 ? salesUnits.sort((a,b) => a.baseProduct.localeCompare(b.baseProduct) || a.price - b.price).map(unit => (
                                <tr key={unit.id}>
                                    <td className="font-medium text-text-secondary">{unit.baseProduct}</td>
                                    <td>{unit.name}</td>
                                    <td className="text-right font-semibold text-base text-primary">{unit.price.toLocaleString('fr-FR')}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={3} className="text-center py-10 text-text-muted">
                                        <i className="fa fa-info-circle text-2xl mb-2"></i>
                                        <p>Aucune unité de vente configurée.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};

export default PricesView;