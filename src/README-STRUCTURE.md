# Structure du Projet Sakanaya

## 📁 Organisation Générale

```
src/
├── config/                 # Configuration de l'application
├── features/               # Fonctionnalités par domaine métier
├── shared/                 # Ressources partagées entre features
├── test/                   # Tests et utilitaires de test
├── App.tsx                 # Composant racine
├── index.ts                # Point d'entrée des exports
└── README-STRUCTURE.md     # Documentation de structure
```

## 🎯 Principes d'Organisation

### 1. **Feature-First Architecture**
Chaque fonctionnalité métier est organisée dans son propre dossier sous `features/` :
- `auth/` - Authentification et autorisation
- `stock/` - Gestion des stocks
- `admin/` - Administration système
- `manager/` - Interfaces gérant
- `director/` - Interfaces directeur
- etc.

### 2. **Shared Resources**
Les ressources communes sont centralisées dans `shared/` :
- `components/` - Composants UI réutilisables
- `context/` - Contextes React globaux
- `hooks/` - Hooks React globaux
- `services/` - Services API partagés
- `types/` - Types TypeScript globaux
- `utils/` - Utilitaires partagés
- `lib/` - Bibliothèques et utilitaires de base

### 3. **Séparation des Responsabilités**
- **Global** : Dans `shared/` pour les éléments utilisés par plusieurs features
- **Spécifique** : Dans `features/*/` pour les éléments propres à une feature

## 📂 Structure d'une Feature

```
features/[feature-name]/
├── components/             # Composants spécifiques à la feature
│   ├── [ComponentName]/   # Dossier par composant complexe
│   └── index.ts           # Exports centralisés
├── hooks/                 # Hooks spécifiques à la feature
├── pages/                 # Pages/vues de la feature
├── services/              # Services API spécifiques
├── utils/                 # Utilitaires spécifiques
├── __tests__/             # Tests de la feature
├── types.ts               # Types spécifiques à la feature
├── index.ts               # Point d'entrée de la feature
└── README.md              # Documentation de la feature
```

## 🔧 Conventions de Nommage

### Fichiers et Dossiers
- **Composants** : PascalCase (`UserProfile.tsx`)
- **Hooks** : camelCase avec préfixe `use` (`useUserData.ts`)
- **Services** : camelCase avec suffixe `Service` (`userService.ts`)
- **Types** : camelCase (`userTypes.ts`)
- **Utils** : camelCase (`formatUtils.ts`)
- **Dossiers** : camelCase (`userManagement/`)

### Exports
- **Composants** : Export nommé + export default
- **Hooks/Services/Utils** : Export nommé uniquement
- **Types** : Export nommé uniquement

## 🚀 Points d'Entrée

### 1. Application
```typescript
// src/index.tsx - Point d'entrée principal
import App from './App';
```

### 2. Features
```typescript
// src/features/[feature]/index.ts
export * from './components';
export * from './hooks';
export * from './services';
export * from './types';
```

### 3. Shared
```typescript
// src/shared/index.ts
export * from './components';
export * from './hooks';
export * from './services';
export * from './types';
export * from './utils';
```

## 📋 Règles d'Import

### 1. Ordre des Imports
```typescript
// 1. Bibliothèques externes
import React from 'react';
import { Button } from 'lucide-react';

// 2. Imports internes absolus
import { userService } from '@/shared/services';
import { UserType } from '@/shared/types';

// 3. Imports relatifs
import './Component.css';
```

### 2. Chemins d'Import
- **Shared** : `@/shared/[category]` ou `../shared/[category]`
- **Features** : `@/features/[feature]` ou `../features/[feature]`
- **Même feature** : Chemins relatifs (`./`, `../`)

## 🧪 Organisation des Tests

```
test/
├── setup/                 # Configuration des tests
│   ├── jest.setup.ts     # Configuration Jest
│   └── index.ts          # Utilitaires de setup
├── features/              # Helpers spécifiques aux features
│   ├── stock.helpers.ts  # Helpers pour les tests stock
│   └── index.ts          # Export des helpers
├── shared/                # Utilitaires de test partagés
└── index.ts               # Point d'entrée des tests
```

### Convention des Tests par Feature
Chaque feature peut avoir son propre dossier `__tests__/` :
```
features/[feature]/
├── __tests__/
│   ├── unit/             # Tests unitaires
│   ├── integration/      # Tests d'intégration
│   └── e2e/              # Tests end-to-end
```

## 🎨 Composants UI

### Hiérarchie
1. **Shared Components** (`shared/components/`) - Composants de base réutilisables
2. **Feature Components** (`features/*/components/`) - Composants métier spécifiques

### Types de Composants
- **UI Components** : Composants d'interface pure (Button, Modal, etc.)
- **Layout Components** : Composants de mise en page (Header, Sidebar, etc.)
- **Business Components** : Composants métier (UserProfile, StockList, etc.)

## 🔄 Gestion d'État

### Contextes React
- **AuthContext** : État d'authentification global
- **NavigationContext** : État de navigation
- **NotificationContext** : Système de notifications
- **UIContext** : État de l'interface utilisateur

### État Local
- Hooks personnalisés pour la logique métier
- useState/useReducer pour l'état des composants

## 📚 Documentation

### Niveaux de Documentation
1. **README principal** : Vue d'ensemble du projet
2. **README par feature** : Documentation spécifique
3. **Commentaires JSDoc** : Documentation du code
4. **Types TypeScript** : Documentation des interfaces

### Standards
- Commentaires en français
- Documentation des props des composants
- Exemples d'utilisation dans les README

## 🛠️ Outils et Configuration

### Développement
- **TypeScript** : Typage statique
- **React** : Framework UI
- **Tailwind CSS** : Styles utilitaires
- **Lucide React** : Icônes

### Tests
- **Jest** : Framework de test
- **React Testing Library** : Tests de composants
- **MSW** : Mock Service Worker pour les API

### Build
- **Vite** : Bundler et serveur de développement
- **ESLint** : Linting du code
- **Prettier** : Formatage du code

## 📍 Guide de Placement des Fichiers

### Où placer quoi ?

#### Types
- **Globaux/Partagés** → `shared/types/`
- **Spécifiques à une feature** → `features/[feature]/types.ts`
- **Schémas de validation** → Avec les types correspondants

#### Utilitaires
- **Fonctions génériques** → `shared/utils/`
- **Logique métier spécifique** → `features/[feature]/utils/`
- **Calculs/validations** → Dans la feature concernée

#### Hooks
- **Hooks réutilisables** → `shared/hooks/`
- **Logique spécifique** → `features/[feature]/hooks/`
- **Hooks de contexte** → `shared/context/`

#### Composants
- **UI génériques** → `shared/components/ui/`
- **Layout global** → `shared/components/layout/`
- **Composants métier** → `features/[feature]/components/`

#### Services
- **APIs partagées** → `shared/services/`
- **Logique métier** → `features/[feature]/services/`
- **Configuration** → `config/`

#### Tests
- **Setup global** → `test/setup/`
- **Helpers partagés** → `test/shared/`
- **Helpers de feature** → `test/features/`
- **Tests unitaires** → `features/[feature]/__tests__/`

## 🚨 Bonnes Pratiques

### Code
- Utiliser TypeScript strict
- Préférer les composants fonctionnels
- Utiliser les hooks personnalisés pour la logique
- Éviter les props drilling (utiliser les contextes)

### Performance
- Lazy loading des features
- Memoization des composants coûteux
- Optimisation des re-renders

### Sécurité
- Validation des données côté client et serveur
- Gestion des permissions par rôle
- Sanitisation des inputs utilisateur

### Organisation
- **Un fichier = une responsabilité**
- **Nommage cohérent** dans tout le projet
- **Index.ts** pour centraliser les exports
- **README.md** pour documenter les features complexes

## 📈 Évolution

### Ajout d'une Nouvelle Feature
1. Créer le dossier dans `features/`
2. Suivre la structure standard
3. Ajouter les exports dans `index.ts`
4. Documenter dans un README
5. Ajouter les tests

### Refactoring
- Identifier les éléments réutilisables
- Déplacer vers `shared/` si nécessaire
- Mettre à jour les imports
- Maintenir la documentation

Cette structure garantit une codebase maintenable, scalable et facile à comprendre pour tous les développeurs de l'équipe.