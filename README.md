# Sakanaya - Système POS Multisite pour Poissonneries

Application web centralisée de gestion pour une chaîne de poissonneries combinant point de vente (PDV), gestion des ressources humaines et pilotage commercial.

## 🏗️ Architecture

Cette application utilise une architecture RBAC Feature-Driven spécialement conçue pour les poissonneries :

- **Gestion multisite** : Centralisation de plusieurs points de vente
- **Saisie des ventes en fin de journée** : Optimisé pour les contraintes terrain
- **Paiements espèces uniquement** : Adapté au métier de la poissonnerie
- **Prix variables quotidiens** : Gestion des fluctuations de prix des produits frais
- **Validation directeur** : Contrôle et traçabilité des opérations importantes

## 🚀 Technologies Utilisées

- **React 18** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Vite** - Build tool et dev server
- **Tailwind CSS** - Framework CSS utilitaire
- **Radix UI** - Composants UI accessibles
- **Lucide React** - Icônes
- **React Hook Form** - Gestion des formulaires
- **Zod** - Validation des schémas

## 📁 Structure du Projet

```
src/
├── components/          # Composants React
│   ├── ui/             # Composants UI de base
│   ├── Content/        # Composants de contenu par vue
│   ├── Header.tsx      # En-tête de l'application
│   ├── Sidebar.tsx     # Barre latérale de navigation
│   └── LoginPage.tsx   # Page de connexion
├── hooks/              # Hooks personnalisés
│   ├── useAuth.ts      # Gestion de l'authentification
│   ├── useNavigation.ts # Gestion de la navigation
│   └── useMobile.ts    # Détection mobile
├── types/              # Définitions TypeScript
│   └── index.ts        # Types principaux
├── lib/                # Utilitaires
│   └── utils.ts        # Fonctions utilitaires
├── App.tsx             # Composant principal
└── main.tsx           # Point d'entrée
```

## 🎯 Fonctionnalités

### Pour les Directeurs
- **Tableau de bord global** - Vue d'ensemble des KPIs
- **Rapports & analyses** - Génération de rapports détaillés
- **Gestion des stocks** - Pilotage global des inventaires
- **Gestion des produits** - Configuration des prix et produits
- **Ressources humaines** - Gestion des équipes
- **Administration** - Paramètres système

### Pour les Managers
- **Tableau de bord magasin** - Vue spécifique au magasin
- **Saisie des ventes** - Enregistrement des ventes quotidiennes
- **Gestion du stock local** - Inventaire du magasin
- **Pointage des présences** - Gestion des équipes locales

## 🔧 Installation et Développement

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation
```bash
# Cloner le projet
git clone <repository-url>
cd sakanaya

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

### Scripts Disponibles
```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run preview      # Prévisualisation du build
npm run lint         # Linting TypeScript/ESLint
npm run type-check   # Vérification des types TypeScript
```

## 🔐 Authentification (Démo)

Comptes de démonstration :
- **Directeur** : `directeur` / `password`
- **Manager** : `almadies` / `password`

## 🎨 Composants UI

Le projet utilise un système de composants UI personnalisés basés sur Radix UI :
- `Button` - Boutons avec variantes
- `Card` - Cartes de contenu
- `Input` - Champs de saisie
- `Label` - Étiquettes de formulaire
- `Badge` - Badges d'état

## 📱 Responsive Design

L'application est entièrement responsive avec :
- Design mobile-first
- Sidebar adaptative
- Grilles flexibles
- Navigation tactile optimisée

## 🔄 Gestion d'État

- **Hooks personnalisés** pour la logique métier
- **État local React** pour l'UI
- **TypeScript** pour la sécurité des types
- **Validation Zod** pour les formulaires

## 🚀 Déploiement

```bash
# Build de production
npm run build

# Les fichiers sont générés dans le dossier 'dist'
```

## 📝 Types TypeScript

Le projet inclut des types complets pour :
- Utilisateurs et authentification
- Produits et ventes
- Stocks et transferts
- Navigation et UI
- Rapports et analytics

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.