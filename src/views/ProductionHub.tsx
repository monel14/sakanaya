/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { ProductionOrder, ProductionRecipe } from '../types';

const ProductionHub = () => {
    const { 
        productionOrders, productionRecipes, products, openModal, startProductionOrder
    } = useAppContext();
    const [activeTab, setActiveTab] = useState('orders');

    const getProduct = (productId: number) => products.find(p => p.id === productId);

    const getStatusChip = (status: ProductionOrder['status']) => {
        switch (status) {
            case 'Planifié': return <span className="status-chip status-gray">Planifié</span>;
            case 'En Cours': return <span className="status-chip status-blue animate-pulse">En Cours</span>;
            case 'Terminé': return <span className="status-chip status-green">Terminé</span>;
            default: return <span>{status}</span>;
        }
    };
    
    const kpis = useMemo(() => {
        return {
            planned: productionOrders.filter(o => o.status === 'Planifié').length,
            inProgress: productionOrders.filter(o => o.status === 'En Cours').length,
            completedToday: productionOrders.filter(o => o.completionDate === new Date().toISOString().slice(0,10)).length,
            recipesCount: productionRecipes.length
        }
    }, [productionOrders, productionRecipes]);

    return (
        <section id="production-hub" className="view space-y-6">
            <header>
                <h2 className="text-2xl font-bold">Pôle Production</h2>
                <p className="text-text-secondary">Gestion des fiches techniques et des ordres de fabrication.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card flex items-center gap-4"><div className="icon-circle bg-gray-100 text-gray-600"><i className="fa fa-clipboard-list"></i></div><div><div className="kpi-label">OF Planifiés</div><div className="kpi-number">{kpis.planned}</div></div></div>
                <div className="card flex items-center gap-4"><div className="icon-circle bg-primary-light text-primary"><i className="fa fa-cogs"></i></div><div><div className="kpi-label">OF en Cours</div><div className="kpi-number">{kpis.inProgress}</div></div></div>
                <div className="card flex items-center gap-4"><div className="icon-circle bg-success-light text-success"><i className="fa fa-check-circle"></i></div><div><div className="kpi-label">OF Terminés (jour)</div><div className="kpi-number">{kpis.completedToday}</div></div></div>
                <div className="card flex items-center gap-4"><div className="icon-circle bg-accent-light text-accent"><i className="fa fa-book"></i></div><div><div className="kpi-label">Fiches Techniques</div><div className="kpi-number">{kpis.recipesCount}</div></div></div>
            </div>

            <div className="card">
                <div className="flex gap-2 mb-4 border-b pb-2 flex-wrap">
                    <button className={`btn btn-sm ${activeTab === 'orders' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('orders')}>Ordres de Fabrication</button>
                    <button className={`btn btn-sm ${activeTab === 'recipes' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('recipes')}>Fiches Techniques</button>
                </div>

                {activeTab === 'orders' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold">Suivi des Ordres de Fabrication</h3>
                            <button className="btn btn-primary" onClick={() => openModal('modalOrdreFabrication')}><i className="fa fa-plus mr-2"></i>Nouvel OF</button>
                        </div>
                        <div className="overflow-x-auto max-h-96">
                            <table className="w-full text-sm">
                                <thead><tr><th>#OF</th><th>Produit Fini</th><th className="text-right">Qté Planifiée</th><th className="text-center">Statut</th><th>Date</th><th className="text-center">Actions</th></tr></thead>
                                <tbody>
                                    {productionOrders.sort((a,b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()).map(order => {
                                        const recipe = productionRecipes.find(r => r.id === order.recipeId);
                                        const product = recipe ? getProduct(recipe.outputProductId) : null;
                                        return (
                                            <tr key={order.id}>
                                                <td className="font-mono">{order.id}</td>
                                                <td className="font-semibold">{product?.name || 'Inconnu'}</td>
                                                <td className="text-right">{order.plannedQuantity} {product?.stockUnit}</td>
                                                <td className="text-center">{getStatusChip(order.status)}</td>
                                                <td>{order.creationDate}</td>
                                                <td className="text-center">
                                                    {order.status === 'Planifié' && <button className="btn btn-primary btn-sm" onClick={() => startProductionOrder(order.id)}>Lancer</button>}
                                                    {order.status === 'En Cours' && <button className="btn btn-accent btn-sm" onClick={() => openModal('modalFinaliserOF', { order })}>Finaliser</button>}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'recipes' && (
                    <div>
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold">Liste des Fiches Techniques</h3>
                            <button className="btn btn-primary" onClick={() => openModal('modalFicheTechnique')}><i className="fa fa-plus mr-2"></i>Nouvelle Fiche</button>
                        </div>
                        <div className="overflow-x-auto max-h-96">
                             <table className="w-full text-sm">
                                <thead><tr><th>Nom de la Fiche</th><th>Produit Fini</th><th className="text-center">Nb Composants</th><th>Action</th></tr></thead>
                                <tbody>
                                    {productionRecipes.map(recipe => {
                                        const product = getProduct(recipe.outputProductId);
                                        return (
                                            <tr key={recipe.id}>
                                                <td className="font-semibold">{recipe.name}</td>
                                                <td>{product?.name || 'Inconnu'}</td>
                                                <td className="text-center">{recipe.lines.length}</td>
                                                <td>
                                                    <button className="btn btn-ghost btn-sm" onClick={() => openModal('modalFicheTechnique', { recipe })}>
                                                        <i className="fa fa-edit"></i> Voir/Modifier
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProductionHub;