# Requirements Document - Module Gestion des Stocks

## Introduction

Le module de Gestion des Stocks constitue le moteur logistique de l'application Sakanaya. Il permet de tracer et contrôler tous les mouvements de marchandises depuis l'arrivage fournisseur jusqu'à la vente finale, en passant par les transferts inter-magasins, la gestion des pertes et les inventaires physiques. Ce module différencie Sakanaya d'un simple outil de saisie en offrant un véritable outil de pilotage logistique avec une traçabilité complète et des contrôles de cohérence.

## Requirements

### Requirement 1 - Arrivage Fournisseur

**User Story:** En tant que Directeur, je veux enregistrer l'arrivée de nouvelles marchandises depuis mes fournisseurs, afin de mettre à jour les stocks et tracer les coûts d'achat pour le pilotage financier.

#### Acceptance Criteria

1. WHEN le Directeur accède au module Stocks THEN le système SHALL afficher une option "Nouvel Arrivage Fournisseur" distincte de "Nouveau Transfert"
2. WHEN le Directeur clique sur "Nouvel Arrivage Fournisseur" THEN le système SHALL afficher un formulaire de "Bon de Réception Fournisseur" avec les sections : Informations Générales (date, fournisseur, magasin de réception) et Lignes de Produits
3. WHEN le Directeur sélectionne un fournisseur THEN le système SHALL permettre l'ajout de lignes de produits avec : produit (catalogue), quantité reçue dans l'unité principale, coût d'achat unitaire obligatoire (CFA), sous-total calculé automatiquement
4. WHEN le Directeur saisit une ligne de produit THEN le système SHALL calculer automatiquement le sous-total (quantité × coût unitaire) et l'afficher en lecture seule
5. WHEN le Directeur valide un bon de réception THEN le système SHALL créer un bon de réception numéroté automatiquement avec historisation complète
6. WHEN un bon de réception est validé THEN le système SHALL incrémenter automatiquement le stock du magasin de réception ET mettre à jour le CUMP (Coût Unitaire Moyen Pondéré) de chaque produit
7. WHEN un bon de réception est validé THEN le système SHALL enregistrer la valeur totale de l'arrivage pour les rapports financiers et la traçabilité
8. IF une quantité négative ou nulle est saisie THEN le système SHALL afficher un message d'erreur et empêcher la validation
9. IF un coût d'achat unitaire n'est pas renseigné ou est négatif THEN le système SHALL empêcher la validation du bon
10. WHEN le système calcule le CUMP THEN il SHALL utiliser la formule : (Stock_Ancien × CUMP_Ancien + Quantité_Reçue × Coût_Unitaire) / (Stock_Ancien + Quantité_Reçue)

### Requirement 2 - Transfert et Distribution Inter-Magasins

**User Story:** En tant que Directeur, je veux initier des transferts de marchandises entre magasins, afin de réapprovisionner les points de vente depuis le hub de distribution.

#### Acceptance Criteria

1. WHEN le Directeur clique sur "Nouveau Transfert" THEN le système SHALL afficher un formulaire avec : magasin source, magasin destination, liste des produits à transférer
2. WHEN le Directeur valide un transfert THEN le système SHALL créer un bon de transfert avec le statut "En Transit"
3. WHEN un transfert est validé THEN le système SHALL décrémenter immédiatement le stock du magasin source
4. WHEN un transfert est créé THEN le système SHALL envoyer une notification au Gérant du magasin de destination
5. IF la quantité à transférer dépasse le stock disponible THEN le système SHALL afficher un avertissement et permettre ou empêcher le transfert selon la configuration

**User Story:** En tant que Gérant, je veux réceptionner les transferts envoyés vers mon magasin, afin de mettre à jour mon stock et signaler les éventuels écarts.

#### Acceptance Criteria

1. WHEN un transfert est en attente de réception THEN le système SHALL afficher une notification "Arrivage à Recevoir" sur le tableau de bord du Gérant
2. WHEN le Gérant ouvre un bon de transfert en attente THEN le système SHALL afficher les quantités théoriquement envoyées
3. WHEN le Gérant saisit les quantités réellement reçues THEN le système SHALL permettre l'ajout de commentaires pour chaque ligne
4. WHEN le Gérant valide la réception THEN le système SHALL changer le statut du bon en "Terminé" ou "Terminé avec Écart"
5. WHEN la réception est validée THEN le système SHALL incrémenter le stock du magasin de destination avec les quantités réellement reçues
6. IF quantité reçue < quantité envoyée THEN le système SHALL enregistrer automatiquement la différence comme "Perte en Transit"

### Requirement 3 - Gestion des Pertes

**User Story:** En tant que Gérant, je veux déclarer les produits non vendables (invendus, casse, périmés), afin de maintenir des niveaux de stock justes et permettre l'analyse des sources de gaspillage.

#### Acceptance Criteria

1. WHEN le Gérant clique sur "Déclarer une Perte" THEN le système SHALL afficher un formulaire avec : date (pré-remplie), produit (liste de son stock), quantité perdue, catégorie de perte, commentaire optionnel
2. WHEN le Gérant sélectionne une catégorie de perte THEN le système SHALL proposer une liste déroulante configurable par le Directeur (Invendu, Casse, Périmé, Vol, Offert Client)
3. WHEN le Gérant valide une déclaration de perte THEN le système SHALL décrémenter automatiquement le stock du produit concerné
4. WHEN une perte est enregistrée THEN le système SHALL calculer et enregistrer la valeur de la perte (quantité × coût d'achat) pour les rapports
5. IF la quantité de perte dépasse le stock disponible THEN le système SHALL afficher un avertissement mais permettre la saisie
6. WHEN une perte est déclarée THEN le système SHALL horodater et associer la perte au Gérant qui l'a déclarée

### Requirement 4 - Inventaire Physique

**User Story:** En tant que Gérant, je veux effectuer des inventaires physiques de mon stock, afin de comparer avec le stock théorique et identifier les écarts.

#### Acceptance Criteria

1. WHEN le Gérant initie un "Nouvel Inventaire" THEN le système SHALL générer une feuille de comptage listant tous les produits du magasin avec leur quantité théorique
2. WHEN le Gérant saisit une quantité physique THEN le système SHALL calculer et afficher en temps réel l'écart (Physique - Théorique)
3. WHEN le Gérant termine le comptage THEN le système SHALL permettre la soumission avec changement de statut vers "En attente de validation"
4. WHEN un inventaire est soumis THEN le système SHALL envoyer une notification au Directeur

**User Story:** En tant que Directeur, je veux valider les inventaires physiques effectués par les Gérants, afin de corriger les niveaux de stock théoriques et analyser la démarque inconnue.

#### Acceptance Criteria

1. WHEN un inventaire est en attente de validation THEN le système SHALL afficher une notification au Directeur
2. WHEN le Directeur consulte un inventaire THEN le système SHALL afficher un rapport détaillé avec tous les écarts
3. WHEN le Directeur approuve un inventaire THEN le système SHALL créer des mouvements d'ajustement de stock pour chaque écart
4. WHEN un inventaire est approuvé THEN le système SHALL corriger automatiquement les niveaux de stock pour correspondre aux quantités physiques
5. IF des écarts importants sont détectés THEN le système SHALL les mettre en évidence dans le rapport

### Requirement 5 - Consultation des Stocks

**User Story:** En tant que Gérant, je veux consulter les niveaux de stock de mon magasin, afin de connaître les produits disponibles à la vente.

#### Acceptance Criteria

1. WHEN le Gérant accède à "Mon Stock" THEN le système SHALL afficher une liste simple : Nom du Produit | Quantité en Stock
2. WHEN le Gérant consulte son stock THEN le système SHALL masquer toutes les données financières (coûts, valeurs)
3. WHEN le stock d'un produit est faible THEN le système SHALL l'indiquer visuellement (couleur, icône)

**User Story:** En tant que Directeur, je veux avoir une vue globale et détaillée de tous les stocks, afin de piloter la logistique et analyser la performance financière.

#### Acceptance Criteria

1. WHEN le Directeur accède au tableau de bord des stocks THEN le système SHALL afficher une vue consolidée de tous les magasins
2. WHEN le Directeur consulte les stocks THEN le système SHALL afficher : Nom du Produit | Quantité | Coût Unitaire Moyen | Valeur Totale du Stock
3. WHEN le Directeur utilise les filtres THEN le système SHALL permettre le filtrage par magasin, catégorie de produit, ou vue consolidée
4. WHEN le Directeur consulte les stocks THEN le système SHALL proposer une vue spécifique "Stock en Transit"
5. WHEN le Directeur demande des rapports THEN le système SHALL générer des analyses avancées (rotation des stocks, valorisation, etc.)

### Requirement 6 - Traçabilité et Historique

**User Story:** En tant que Directeur, je veux avoir une traçabilité complète de tous les mouvements de stock, afin d'analyser les flux logistiques et identifier les problèmes.

#### Acceptance Criteria

1. WHEN un mouvement de stock se produit THEN le système SHALL enregistrer automatiquement : date/heure, type de mouvement, utilisateur, quantité, magasin source/destination
2. WHEN le Directeur consulte l'historique d'un produit THEN le système SHALL afficher chronologiquement tous les mouvements (arrivages, transferts, ventes, pertes, ajustements)
3. WHEN le Directeur recherche des mouvements THEN le système SHALL permettre le filtrage par période, magasin, produit, type de mouvement
4. WHEN des écarts sont détectés THEN le système SHALL permettre de remonter à l'origine via la traçabilité

### Requirement 7 - Intégrité et Contrôles

**User Story:** En tant que système, je veux maintenir l'intégrité des données de stock, afin d'éviter les incohérences et les erreurs de calcul.

#### Acceptance Criteria

1. WHEN un mouvement de stock est effectué THEN le système SHALL vérifier la cohérence des quantités avant validation
2. WHEN des stocks négatifs risquent d'apparaître THEN le système SHALL alerter l'utilisateur et demander confirmation
3. WHEN des calculs de valorisation sont effectués THEN le système SHALL utiliser des méthodes cohérentes (FIFO, coût moyen pondéré)
4. WHEN des données critiques sont modifiées THEN le système SHALL conserver un audit trail complet
5. IF des incohérences sont détectées THEN le système SHALL proposer des outils de correction et de réconciliation