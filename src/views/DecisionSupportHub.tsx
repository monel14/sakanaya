/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';

const DecisionSupportHub = () => {
    const { 
        products, salesClosures, salesUnits, stockLevels, suppliers, arrivals, openModal 
    } = useAppContext();

    const purchasingSuggestions = useMemo(() => {
        const SAFETY_STOCK_DAYS = 3;
        const REORDER_PERIOD_DAYS = 7;
        const ANALYSIS_PERIOD_DAYS = 14;
        const HUB_ID = 1;

        const rawMaterials = products.filter(p => p.productType === 'Matière Première');
        const today = new Date();
        const analysisStartDate = new Date(today.setDate(today.getDate() - ANALYSIS_PERIOD_DAYS));
        
        const recentSales = salesClosures.filter(sc => sc.status === 'validated' && new Date(sc.date) >= analysisStartDate);

        // 1. Calculate total consumption for each raw material
        const consumptionMap = new Map<number, number>();
        recentSales.forEach(closure => {
            closure.lines.forEach(line => {
                const salesUnit = salesUnits.find(su => su.id === line.unitId);
                const product = products.find(p => p.name === salesUnit?.baseProduct);
                if (product && product.productType === 'Matière Première') {
                    const consumedQty = line.qty * (salesUnit?.factor || 1);
                    consumptionMap.set(product.id, (consumptionMap.get(product.id) || 0) + consumedQty);
                }
            });
        });

        // 2. Generate suggestions
        const suggestions = rawMaterials.map(product => {
            const totalConsumption = consumptionMap.get(product.id) || 0;
            const dailyConsumption = totalConsumption / ANALYSIS_PERIOD_DAYS;
            
            const hubStockBatches = stockLevels[product.id]?.[HUB_ID] || [];
            const currentStock = hubStockBatches.reduce((sum, batch) => sum + batch.quantity, 0);

            const daysOfStockRemaining = dailyConsumption > 0 ? currentStock / dailyConsumption : Infinity;

            if (daysOfStockRemaining < SAFETY_STOCK_DAYS) {
                const suggestedOrderQty = Math.ceil(dailyConsumption * REORDER_PERIOD_DAYS);
                
                const lastArrival = arrivals
                    .slice() // Create a shallow copy to avoid mutating original data
                    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .find(a => a.lines.some(l => l.productId === product.id));
                
                const suggestedSupplier = suppliers.find(s => s.name === lastArrival?.supplierName);

                return {
                    productId: product.id,
                    productName: product.name,
                    stockUnit: product.stockUnit,
                    currentStock,
                    daysOfStockRemaining,
                    suggestedSupplier,
                    suggestedOrderQty,
                };
            }
            return null;
        }).filter(Boolean);

        return suggestions;

    }, [products, salesClosures, salesUnits, stockLevels, suppliers, arrivals]);

    const handleCreatePo = (suggestion: any) => {
        const product = products.find(p => p.id === suggestion.productId);
        if (!product || !suggestion.suggestedSupplier) return;
        
        openModal('modalBonDeCommande', {
            prefillData: {
                supplierId: suggestion.suggestedSupplier.id,
                lines: [{
                    productId: suggestion.productId,
                    quantity: suggestion.suggestedOrderQty,
                    unitCost: product.basePrice, // Prefill with base price as a default
                }]
            }
        });
    }

    return (
        <section id="decision-support-hub" className="view space-y-6">
            <header>
                <h2 className="text-2xl font-bold">Pôle d'Aide à la Décision</h2>
                <p className="text-text-secondary">Suggestions proactives basées sur l'analyse de vos données.</p>
            </header>
            
            <div className="card">
                <div className="card-header">
                    <i className="fa fa-lightbulb mr-2 text-accent"></i>
                    Suggestions de Réapprovisionnement
                </div>
                <p className="text-sm text-text-muted mb-4">
                    Basé sur les ventes des {14} derniers jours, le système a identifié les matières premières nécessitant un réapprovisionnement pour éviter les ruptures de stock.
                </p>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr>
                                <th className="text-left">Produit</th>
                                <th className="text-center">Stock Actuel (Hub)</th>
                                <th className="text-center">Jours Restants</th>
                                <th className="text-left">Fournisseur Suggéré</th>
                                <th className="text-center">Qté Suggérée</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchasingSuggestions.length > 0 ? purchasingSuggestions.map(s => (
                                <tr key={s!.productId} className="hover:bg-primary-light/50">
                                    <td className="font-semibold">{s!.productName}</td>
                                    <td className="text-center">{s!.currentStock.toFixed(1)} {s!.stockUnit}</td>
                                    <td className={`text-center font-bold ${s!.daysOfStockRemaining < 2 ? 'text-danger' : 'text-warn'}`}>{s!.daysOfStockRemaining.toFixed(1)} j</td>
                                    <td>{s!.suggestedSupplier?.name || <span className="text-text-muted">N/A</span>}</td>
                                    <td className="text-center font-bold">{s!.suggestedOrderQty} {s!.stockUnit}</td>
                                    <td className="text-center">
                                        <button 
                                            className="btn btn-primary btn-sm"
                                            disabled={!s!.suggestedSupplier}
                                            onClick={() => handleCreatePo(s)}
                                        >
                                            <i className="fa fa-shopping-cart mr-2"></i>Créer BC
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-10">
                                        <div className="text-text-muted">
                                            <i className="fa fa-check-circle text-4xl mb-3 text-success"></i>
                                            <p className="font-semibold">Aucun besoin de réapprovisionnement immédiat.</p>
                                            <p>Les niveaux de stock sont corrects.</p>
                                        </div>
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

export default DecisionSupportHub;