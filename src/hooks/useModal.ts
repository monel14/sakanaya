/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useCallback } from 'react';
import type { ModalKey } from '../types';

import ModalAjoutProduit from '../components/modals/ModalAjoutProduit';
import ModalAjoutUtilisateur from '../components/modals/ModalAjoutUtilisateur';
import ModalAjoutEmploye from '../components/modals/ModalAjoutEmploye';
import ModalNouvelArrivage from '../components/modals/ModalNouvelArrivage';
import ModalAjoutMagasin from '../components/modals/ModalAjoutMagasin';
import ModalNouveauTransfert from '../components/modals/ModalNouveauTransfert';
import ModalReceptionTransfert from '../components/modals/ModalReceptionTransfert';
import ModalInventaireDetails from '../components/modals/ModalInventaireDetails';
import ModalSaleClosureDetails from '../components/modals/ModalSaleClosureDetails';
import ModalAjoutDepense from '../components/modals/ModalAjoutDepense';
import ModalModifierProduit from '../components/modals/ModalModifierProduit';
import ModalModifierUtilisateur from '../components/modals/ModalModifierUtilisateur';
import ModalModifierEmploye from '../components/modals/ModalModifierEmploye';
import ModalModifierMagasin from '../components/modals/ModalModifierMagasin';
import ModalModifierDepense from '../components/modals/ModalModifierDepense';
import ModalAjoutUniteVente from '../components/modals/ModalAjoutUniteVente';
import ModalModifierUniteVente from '../components/modals/ModalModifierUniteVente';
import ModalFicheTechnique from '../components/modals/ModalFicheTechnique';
import ModalOrdreFabrication from '../components/modals/ModalOrdreFabrication';
import ModalFinaliserOF from '../components/modals/ModalFinaliserOF';
import ModalAjoutFournisseur from '../components/modals/ModalAjoutFournisseur';
import ModalModifierFournisseur from '../components/modals/ModalModifierFournisseur';
import ModalBonDeCommande from '../components/modals/ModalBonDeCommande';
import ModalAjoutClient from '../components/modals/ModalAjoutClient';
import ModalModifierClient from '../components/modals/ModalModifierClient';
import ModalCommandeDeVente from '../components/modals/ModalCommandeDeVente';
import ModalFacture from '../components/modals/ModalFacture';
import ModalBudget from '../components/modals/ModalBudget';
import ModalSalesOrderDetails from '../components/modals/ModalSalesOrderDetails';
import ModalClientDossier from '../components/modals/ModalClientDossier';


export default function useModal(showToast: (message: string) => void) {
    const [modal, setModal] = useState<{key: ModalKey, props: any} | null>(null);

    const closeModal = useCallback(() => setModal(null), []);

    const openModal = useCallback((key: ModalKey, props: any = {}) => {
        setModal({ key, props });
    }, []);

    const getModalContent = () => {
        if (!modal) return null;

        const allProps = { ...modal.props, closeModal, showToast };
        
        switch(modal.key) {
            case 'modalAjoutProduit': return React.createElement(ModalAjoutProduit, allProps);
            case 'modalAjoutUtilisateur': return React.createElement(ModalAjoutUtilisateur, allProps);
            case 'modalAjoutEmploye': return React.createElement(ModalAjoutEmploye, allProps);
            case 'modalNouvelArrivage': return React.createElement(ModalNouvelArrivage, allProps);
            case 'modalAjoutMagasin': return React.createElement(ModalAjoutMagasin, allProps);
            case 'modalNouveauTransfert': return React.createElement(ModalNouveauTransfert, allProps);
            case 'modalReceptionTransfert': return React.createElement(ModalReceptionTransfert, allProps);
            case 'modalInventaireDetails': return React.createElement(ModalInventaireDetails, allProps);
            case 'modalSaleClosureDetails': return React.createElement(ModalSaleClosureDetails, allProps);
            case 'modalAjoutDepense': return React.createElement(ModalAjoutDepense, allProps);
            case 'modalModifierProduit': return React.createElement(ModalModifierProduit, allProps);
            case 'modalModifierUtilisateur': return React.createElement(ModalModifierUtilisateur, allProps);
            case 'modalModifierEmploye': return React.createElement(ModalModifierEmploye, allProps);
            case 'modalModifierMagasin': return React.createElement(ModalModifierMagasin, allProps);
            case 'modalModifierDepense': return React.createElement(ModalModifierDepense, allProps);
            case 'modalAjoutUniteVente': return React.createElement(ModalAjoutUniteVente, allProps);
            case 'modalModifierUniteVente': return React.createElement(ModalModifierUniteVente, allProps);
            case 'modalFicheTechnique': return React.createElement(ModalFicheTechnique, allProps);
            case 'modalOrdreFabrication': return React.createElement(ModalOrdreFabrication, allProps);
            case 'modalFinaliserOF': return React.createElement(ModalFinaliserOF, allProps);
            case 'modalAjoutFournisseur': return React.createElement(ModalAjoutFournisseur, allProps);
            case 'modalModifierFournisseur': return React.createElement(ModalModifierFournisseur, allProps);
            case 'modalBonDeCommande': return React.createElement(ModalBonDeCommande, allProps);
            case 'modalAjoutClient': return React.createElement(ModalAjoutClient, allProps);
            case 'modalModifierClient': return React.createElement(ModalModifierClient, allProps);
            case 'modalCommandeDeVente': return React.createElement(ModalCommandeDeVente, allProps);
            case 'modalFacture': return React.createElement(ModalFacture, allProps);
            case 'modalBudget': return React.createElement(ModalBudget, allProps);
            case 'modalSalesOrderDetails': return React.createElement(ModalSalesOrderDetails, allProps);
            case 'modalClientDossier': return React.createElement(ModalClientDossier, allProps);
            default: return null;
        }
    };

    return { modalKey: modal?.key, openModal, closeModal, modalContent: getModalContent() };
}