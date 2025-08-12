/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { Product } from '../types';

const ProductManagement = () => {
    const { products, showToast, openModal, updateProductPrice } = useAppContext();
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
        <section id="product-management" className="view">
            <div className="card mb-6">
                <div className="card-header"><i className="fa fa-dollar-sign"></i> Mise à jour des prix du jour</div>
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
                <div className="flex justify-end items-center mt-4">
                    <button className="btn btn-primary" onClick={handleValidation}>Valider les nouveaux prix</button>
                </div>
            </div>
            <div className="card">
                <div className="card-header"><i className="fa fa-box"></i> Catalogue produits <button className="btn btn-primary btn-sm ml-auto" onClick={() => openModal('modalAjoutProduit')}><i className="fa fa-plus"></i> Ajouter produit</button></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr><th>Nom produit</th><th>Unité</th><th>Type de prix</th><th className="text-right">Prix de base (CFA)</th><th className="text-center">Actions</th></tr></thead>
                        <tbody>
                            {products.length > 0 ? products.map(p => (
                                <tr key={p.id}>
                                    <td>{p.name}</td>
                                    <td>{p.stockUnit}</td>
                                    <td><span className={`status-chip ${p.priceType === 'Variable' ? 'status-yellow' : 'status-gray'}`}>{p.priceType}</span></td>
                                    <td className="text-right">{p.basePrice.toLocaleString('fr-FR')}</td>
                                    <td className="text-center"><button className="text-primary text-xs" onClick={() => showToast('Action non implémentée')}>Détails</button></td>
                                </tr>
                            )) : (
                                 <tr><td colSpan={5} className="text-center py-10"><div className="text-text-muted"><i className="fa fa-box-open text-4xl mb-2"></i><p>Aucun produit dans le catalogue.</p><button className="btn btn-primary btn-sm mt-4" onClick={() => openModal('modalAjoutProduit')}>Ajouter le premier produit</button></div></td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};

export default ProductManagement;