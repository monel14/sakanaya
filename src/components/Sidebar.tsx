/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import type { CurrentUser } from '../App';

interface SidebarProps {
    activeView: string;
    onNavigate: (view: string) => void;
    isOpen: boolean;
    onClose: () => void;
    role: CurrentUser['role'];
}

const Sidebar = ({ activeView, onNavigate, isOpen, onClose, role }: SidebarProps) => {

    const directorNavLinks = [
        { group: 'Pilotage', items: [
            { view: 'director-dashboard', icon: 'fa-tachometer-alt', label: 'Tableau de bord' },
            { view: 'reports-hub', icon: 'fa-chart-pie', label: 'Rapports & Analyses' },
            { view: 'finance-hub', icon: 'fa-calculator', label: 'Pôle Finance' },
            { view: 'accounting-view', icon: 'fa-book', label: 'Pôle Comptabilité' },
            { view: 'cash-flow-hub', icon: 'fa-coins', label: 'Pôle Trésorerie' },
            { view: 'decision-support-hub', icon: 'fa-brain', label: 'Aide à la Décision' },
        ]},
        { group: 'Opérations', items: [
            { view: 'achats-hub', icon: 'fa-shopping-cart', label: 'Pôle Achats' },
            { view: 'stock-hub', icon: 'fa-boxes-stacked', label: 'Pôle Stock' },
            { view: 'production-hub', icon: 'fa-industry', label: 'Pôle Production' },
            { view: 'ventes-hub', icon: 'fa-file-invoice-dollar', label: 'Pôle Ventes' },
            { view: 'product-hub', icon: 'fa-tags', label: 'Catalogue & Prix' },
        ]},
        { group: 'Organisation', items: [
            { view: 'hr-view', icon: 'fa-users', label: 'Pôle RH' },
            { view: 'admin-hub', icon: 'fa-cogs', label: 'Administration' },
        ]},
    ];

    const storeNavLinks = [
         { group: 'Magasin', items: [
            { view: 'store-dashboard', icon: 'fa-store', label: 'Accueil' },
            { view: 'store-finance-hub', icon: 'fa-cash-register', label: 'Finance & Caisse' },
            { view: 'store-stock-hub', icon: 'fa-boxes', label: 'Stock & Inventaire' },
            { view: 'prices-view', icon: 'fa-dollar-sign', label: 'Prix du Jour' },
        ]},
    ];

    const navLinks = role === 'Directeur' ? directorNavLinks : storeNavLinks;

    const handleLinkClick = (e: React.MouseEvent, view: string) => {
        e.preventDefault();
        onNavigate(view);
        if (window.innerWidth < 1024) { // Heuristic for mobile
            onClose();
        }
    };

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden" onClick={onClose}></div>}
            <aside id="sidebar" className={`sidebar lg:block ${isOpen ? 'open' : ''}`}>
                <div className="flex items-center gap-3 mb-8 px-2">
                    <div className="rounded-lg p-2 bg-white shadow-sm border border-border-color"><i className="fa-solid fa-fish text-lg text-primary"></i></div>
                    <div>
                        <div className="text-lg font-semibold text-text-main">Sakanaya</div>
                        <div className="text-xs text-text-muted">Gestion & supervision</div>
                    </div>
                </div>
                <nav aria-label="Navigation principal" className="space-y-4">
                    {navLinks.map((group, index) => (
                        <div key={group.group}>
                            <div className={`px-3 text-xs uppercase text-text-muted font-semibold tracking-wider ${index > 0 ? 'mt-6' : ''}`}>{group.group}</div>
                            {group.items.map(link => (
                                <a key={link.view} href="#" onClick={(e) => handleLinkClick(e, link.view)} className={`nav-link ${activeView === link.view ? 'active' : ''}`} data-view={link.view}>
                                    <span className="icon-circle"><i className={`fa ${link.icon}`}></i></span>
                                    <span>{link.label}</span>
                                </a>
                            ))}
                        </div>
                    ))}
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;