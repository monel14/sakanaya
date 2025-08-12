/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { Product, SalesUnit } from '../types';


const ProductHub = () => {
    const { products, salesUnits, showToast, openModal, updateProductPrice } = useAppContext();
    const [activeTab, setActiveTab] = useState('catalog');
    const [priceUpdates, setPriceUpdates] = useState<{ [key: number]: number }>({});

    useEffect(() => {
        const initialPrices = {};
        products.forEach(p => {
            if (p.priceType === 'Variable') {
                initialPrices[p.id] = p.basePrice;
            }
        });
        setPriceUpdates(initialPrices);
    }, [products]);

    const handlePriceChange = (productId: number, newPrice: string) => {
        setPriceUpdates(prev => ({ ...prev, [productId]: parseFloat(newPrice) || 0 }));
    };

    const handleValidation = () => {
        let updatedCount = 0;
        Object.entries(priceUpdates).forEach(([productIdStr, newPrice]) => {
            const productId = Number(productIdStr);
            const originalProduct = products.find(p => p.id === productId);
            if (originalProduct && originalProduct.basePrice !== newPrice) {
                updateProductPrice(productId, newPrice);
                updatedCount++;
            }
        });
        if (updatedCount > 0) {
            showToast(`${updatedCount} prix mis à jour avec succès.`);
        } else {
            showToast('Aucun prix à mettre à jour.');
        }
    };
    
    const productsForPricing = products.filter(p => p.priceType === 'Variable');

    return (
        <section id="product-hub" className="view">
            <div className="card mb-6">
                <div className="card-header"><i className="fa fa-tags"></i> Catalogue & Prix</div>
                <div className="flex gap-2 mb-4 border-b pb-2 flex-wrap">
                    <button className={`btn btn-sm ${activeTab === 'catalog' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('catalog')}>Catalogue Produits</button>
                     <button className={`btn btn-sm ${activeTab === 'sales-units' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('sales-units')}>Unités de Vente</button>
                    <button className={`btn btn-sm ${activeTab === 'pricing' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('pricing')}>Mise à jour des Prix</button>
                </div>
                
                {activeTab === 'catalog' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                             <h3 className="font-semibold">Catalogue produits</h3>
                             <button className="btn btn-primary btn-sm ml-auto" onClick={() => openModal('modalAjoutProduit')}><i className="fa fa-plus"></i> Ajouter produit</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr><th>Nom produit</th><th>Type</th><th>Unité</th><th>Type de prix</th><th className="text-right">Prix de base (CFA)</th><th className="text-center">Actions</th></tr></thead>
                                <tbody>
                                    {products.length > 0 ? products.map(p => (
                                        <tr key={p.id}>
                                            <td>{p.name}</td>
                                            <td><span className={`status-chip text-xs ${p.productType === 'Produit Fini' ? 'status-blue' : 'status-gray'}`}>{p.productType}</span></td>
                                            <td>{p.stockUnit}</td>
                                            <td><span className={`status-chip ${p.priceType === 'Variable' ? 'status-yellow' : 'status-gray'}`}>{p.priceType}</span></td>
                                            <td className="text-right">{p.basePrice.toLocaleString('fr-FR')}</td>
                                            <td className="text-center">
                                                <button className="btn btn-ghost btn-sm" onClick={() => openModal('modalModifierProduit', { product: p })}>
                                                    <i className="fa fa-pencil-alt text-xs"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                         <tr><td colSpan={6} className="text-center py-10"><div className="text-text-muted"><i className="fa fa-box-open text-4xl mb-2"></i><p>Aucun produit dans le catalogue.</p><button className="btn btn-primary btn-sm mt-4" onClick={() => openModal('modalAjoutProduit')}>Ajouter le premier produit</button></div></td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                
                {activeTab === 'sales-units' && (
                     <div>
                        <div className="flex justify-between items-center mb-4">
                             <h3 className="font-semibold">Gestion des unités de vente</h3>
                             <button className="btn btn-primary btn-sm ml-auto" onClick={() => openModal('modalAjoutUniteVente')}><i className="fa fa-plus"></i> Ajouter une unité</button>
                        </div>
                        <p className="muted text-sm mb-4">Définissez ici les différentes manières de vendre vos produits (ex: barquette, filet, pack).</p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr><th>Nom de l'unité</th><th>Produit de base</th><th className="text-center">Facteur</th><th className="text-right">Prix de vente (CFA)</th><th className="text-center">Actions</th></tr></thead>
                                <tbody>
                                    {salesUnits.map((unit: SalesUnit) => (
                                        <tr key={unit.id}>
                                            <td className="font-semibold">{unit.name}</td>
                                            <td>{unit.baseProduct}</td>
                                            <td className="text-center">{unit.factor}</td>
                                            <td className="text-right font-medium">{unit.price.toLocaleString('fr-FR')}</td>
                                            <td className="text-center">
                                                <button className="btn btn-ghost btn-sm" onClick={() => openModal('modalModifierUniteVente', { salesUnit: unit })}>
                                                     <i className="fa fa-pencil-alt text-xs"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'pricing' && (
                     <div>
                        <div className="flex justify-between items-center mb-4">
                             <h3 className="font-semibold">Mise à jour des prix du jour</h3>
                        </div>
                        <p className="muted text-sm mb-4">Modifiez les prix des produits variables. Les changements sont appliqués immédiatement après validation.</p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr><th>Produit</th><th className="text-right">Prix actuel (CFA)</th><th className="text-right w-1/4">Nouveau prix (CFA)</th></tr></thead>
                                <tbody>
                                    {productsForPricing.length > 0 ? productsForPricing.map(p => (
                                        <tr key={p.id}>
                                            <td>{p.name}</td>
                                            <td className="text-right">{p.basePrice.toLocaleString('fr-FR')}</td>
                                            <td className="text-right"><input type="number" value={priceUpdates[p.id] || ''} onChange={e => handlePriceChange(p.id, e.target.value)} className="p-1 border rounded-md text-right w-32" /></td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={3} className="text-center py-4 text-text-muted">Aucun produit à prix variable.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-end items-center mt-4 border-t pt-4">
                            <button className="btn btn-primary" onClick={handleValidation}>Valider les nouveaux prix</button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProductHub;