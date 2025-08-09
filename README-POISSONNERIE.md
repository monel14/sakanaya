# Sakanaya - Système POS Multisite pour Poissonneries

Application web centralisée de gestion pour une chaîne de poissonneries combinant point de vente (PDV), gestion des ressources humaines et pilotage commercial.

## 🎯 Fonctionnalités Métier

### Pour le Directeur
- **Gestion des comptes utilisateurs** : Création comptes Directeur/Magasin avec association aux employés
- **Gestion des magasins** : Administration des points de vente et affectation des équipes
- **Catalogue produits** : Gestion des prix variables quotidiens avec notification automatique
- **Ressources humaines** : Gestion complète des employés et calcul des masses salariales
- **Rapports et analyses** : Tableaux de bord consolidés et indicateurs de performance
- **Validation des clôtures** : Contrôle et validation des demandes de modification

### Pour le Manager
- **Saisie des ventes quotidiennes** : Interface optimisée pour la clôture en fin de journée
- **Gestion des stocks** : Enregistrement des arrivages et déclaration des pertes
- **Demande de validation** : Possibilité de demander une validation au directeur

## 🚀 Démarrage rapide

```bash
# Installation des dépendances
npm install

# Démarrage en mode développement
npm run dev
```

## 👥 Comptes de démonstration

| Rôle | Identifiant | Mot de passe | Accès |
|------|-------------|--------------|-------|
| Directeur | `director` | `director` | Gestion complète du réseau, validation des clôtures |
| Manager | `manager` | `manager` | Saisie des ventes, gestion stock de son magasin |

## 📋 Fonctionnalités Implémentées

### ✅ Gestion des Utilisateurs (Req 1)
- Création de comptes Directeur/Magasin
- Association avec les employés
- Gestion des accès et réinitialisation des mots de passe

### ✅ Catalogue Produits (Req 2)
- Gestion des unités de vente (kg, pack, unité)
- Prix fixes et variables avec historisation
- Notification automatique des changements de prix

### ✅ Saisie des Ventes (Req 3)
- Interface optimisée pour la saisie en fin de journée
- Calcul automatique des totaux
- Gestion des commentaires et clôture avec horodatage

### ✅ Gestion des Stocks (Req 4)
- Enregistrement des arrivages
- Déclaration des pertes avec catégorisation
- Calcul des taux de perte et alertes

### ✅ Ressources Humaines (Req 5)
- Gestion complète des fiches employés
- Calcul automatique des masses salariales
- Gestion des primes et ajustements

### ✅ Gestion des Magasins (Req 6)
- Administration des points de vente
- Affectation des employés et utilisateurs
- Gestion de l'activation/désactivation

### ✅ Tableaux de Bord (Req 7)
- Vue consolidée temps réel de l'activité
- Rapports filtrables par période/magasin/produit
- Indicateurs clés et ratios de performance

### ✅ Validation et Contrôle (Req 8)
- Système de validation des clôtures par le directeur
- Traçabilité complète des modifications
- Alertes automatiques sur les écarts

### ✅ Interface Ergonomique (Req 9)
- Interface simplifiée pour les managers
- Validation en temps réel
- Sauvegarde automatique des saisies

### ✅ Sécurité et Traçabilité (Req 10)
- Enregistrement de toutes les opérations
- Historique des versions précédentes
- Logging des accès aux données sensibles

## 🏗️ Architecture Technique

### Technologies Utilisées
- **React 18** avec TypeScript
- **Vite** pour le build et développement
- **Tailwind CSS** pour le styling
- **Context API** pour la gestion d'état
- **Custom Hooks** pour la logique métier

### Patterns Architecturaux
- **Feature-Driven Design** : Organisation par domaines métier
- **Role-Based Access Control** : Navigation et fonctionnalités selon les rôles
- **Context + Hooks Pattern** : Séparation logique/présentation
- **Service Layer** : Abstraction de la logique métier

### Structure des Dossiers
```
src/
├── features/
│   ├── director/          # Fonctionnalités directeur
│   │   ├── StoreManagement      # Gestion magasins
│   │   ├── ProductCatalog       # Catalogue produits
│   │   ├── EmployeeManagement   # RH complète
│   │   └── SalesValidation      # Validation clôtures
│   └── manager/           # Fonctionnalités manager
│       ├── SalesEntry           # Saisie ventes
│       └── StockManagement      # Arrivages/pertes
├── components/            # Composants réutilisables
├── context/              # Gestion d'état globale
├── hooks/                # Hooks métier spécialisés
└── utils/                # Utilitaires (rôles, permissions)
```

## 🔐 Système de Permissions

### Directeur
- `manage_users` : Gestion des comptes utilisateurs
- `manage_stores` : Gestion des magasins
- `manage_products` : Catalogue produits avec prix variables
- `manage_employees` : Gestion RH complète
- `view_all_reports` : Accès à tous les rapports
- `validate_sales` : Validation des clôtures
- `view_all_data` : Accès à toutes les données

### Manager
- `create_sales` : Saisie des ventes quotidiennes
- `manage_stock` : Gestion stocks (arrivages/pertes)
- `view_own_store_data` : Données de son magasin uniquement
- `request_validation` : Demander validation au directeur

## 📊 Données et Types

### Types Principaux
```typescript
// Utilisateur avec rôle et magasin
interface User {
  id: string;
  role: 'director' | 'manager';
  name: string;
  store?: string;
  employeeId?: string;
  isActive: boolean;
}

// Produit avec prix variable
interface Product {
  id: string;
  name: string;
  unit: 'kg' | 'pack' | 'unit';
  priceType: 'fixed' | 'variable';
  currentPrice: number;
  allowDecimals: boolean;
}

// Vente quotidienne avec validation
interface DailySales {
  id: string;
  date: Date;
  storeId: string;
  entries: SalesEntry[];
  total: number;
  status: 'open' | 'closed';
  comments?: string;
  isValidated: boolean;
  validatedBy?: string;
}

// Employé avec salaire et affectation
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  role: 'seller' | 'manager' | 'preparer';
  salary: number;
  storeId: string;
  isActive: boolean;
}
```

## 🧪 Tests et Validation

### Scénarios de Test
1. **Connexion et navigation** selon les rôles
2. **Saisie des ventes** avec calculs automatiques
3. **Gestion des prix variables** avec notifications
4. **Validation des clôtures** par le directeur
5. **Gestion RH** avec calculs de masse salariale
6. **Gestion des stocks** avec arrivages et pertes

### Données de Test
- Produits avec prix fixes et variables
- Employés répartis sur plusieurs magasins
- Historique des ventes et mouvements de stock
- Demandes de validation en attente

## 🚀 Déploiement

```bash
# Build de production
npm run build

# Prévisualisation
npm run preview
```

## 📝 Conformité aux Requirements

Cette implémentation respecte strictement les 10 requirements définis :
1. ✅ Gestion des utilisateurs et authentification
2. ✅ Gestion du catalogue produits avec prix variables
3. ✅ Saisie des ventes quotidiennes optimisée
4. ✅ Gestion des stocks (arrivages et pertes)
5. ✅ Gestion complète des ressources humaines
6. ✅ Administration des magasins
7. ✅ Tableaux de bord et reporting consolidés
8. ✅ Système de contrôle et validation
9. ✅ Interface ergonomique adaptée au terrain
10. ✅ Sécurité et traçabilité complètes

L'application est prête pour une utilisation en production dans un environnement de poissonnerie multisite.