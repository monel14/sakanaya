# Architecture RBAC Feature-Driven - Documentation

## Vue d'ensemble

Cette architecture implémente un système Role-Based Access Control (RBAC) avec une approche Feature-Driven pour organiser le code selon les domaines métier plutôt que par types techniques.

## Structure des dossiers

```
project/
├── 📄 Points d'entrée
│   ├── index.html          # Point d'entrée HTML
│   ├── index.tsx           # Bootstrap React avec gestion d'erreurs
│   └── index.css           # Styles globaux et variables CSS
│
├── 📁 src/                 # Code source principal
│   ├── App.tsx             # Composant racine avec logique RBAC
│   ├── types.ts            # Types globaux (réexportation)
│   │
│   ├── 📁 components/      # Composants réutilisables
│   │   ├── common/         # Composants génériques (Loader, Modal, etc.)
│   │   ├── layout/         # Composants de mise en page (Header, Sidebar)
│   │   └── notifications/  # Système de notifications
│   │
│   ├── 📁 features/        # Fonctionnalités par rôle/domaine
│   │   ├── auth/           # Authentification
│   │   ├── admin/          # Fonctionnalités administrateur
│   │   ├── director/       # Fonctionnalités directeur
│   │   ├── manager/        # Fonctionnalités manager
│   │   └── common/         # Fonctionnalités communes (profil, paramètres)
│   │
│   ├── 📁 context/         # Gestion d'état globale
│   │   ├── AuthContext.tsx         # Authentification et utilisateur
│   │   ├── NavigationContext.tsx   # Navigation avec historique
│   │   ├── NotificationContext.tsx # Système de notifications
│   │   └── UIContext.tsx           # État de l'interface utilisateur
│   │
│   ├── 📁 hooks/           # Logique métier réutilisable
│   │   ├── useAdminActions.ts      # Actions spécifiques admin
│   │   ├── useManagerActions.ts    # Actions spécifiques manager
│   │   └── [autres hooks métier]
│   │
│   ├── 📁 utils/           # Utilitaires
│   │   ├── roleUtils.ts    # Gestion des rôles et permissions
│   │   └── [autres utilitaires]
│   │
│   └── 📁 types/           # Définitions TypeScript
│       └── [types métier]
```

## Patterns architecturaux

### 1. Feature-Sliced Design

- **Organisation par domaine métier** : Chaque fonctionnalité est dans son propre dossier
- **Réutilisabilité maximale** : Composants partagés dans `/components`
- **Isolation des responsabilités** : Chaque feature gère sa propre logique

### 2. Role-Based Access Control (RBAC)

- **Navigation conditionnelle** : Affichage selon les rôles utilisateur
- **Hooks d'actions spécialisés** : `useAdminActions`, `useManagerActions`
- **Composants adaptés aux permissions** : Vérification automatique des droits

### 3. Context + Custom Hooks Pattern

- **État global géré par React Context** : AuthContext, UIContext, etc.
- **Logique métier encapsulée** : Hooks personnalisés pour chaque domaine
- **Composants purement présentationnels** : Séparation logique/présentation

### 4. Layered Architecture

- **Presentation Layer** : `/features` et `/components`
- **Business Logic Layer** : `/hooks`
- **State Management Layer** : `/context`
- **Infrastructure Layer** : `/utils`, clients DB

## Gestion des rôles

### Rôles disponibles

1. **Admin** : Gestion système et utilisateurs
2. **Director** : Vue d'ensemble, rapports, analytics
3. **Manager** : Gestion magasin, ventes, stock
4. **Employee** : Opérations de base

### Système de permissions

```typescript
const rolePermissions: Record<UserRole, string[]> = {
  admin: ['manage_users', 'manage_system', 'view_all_data'],
  director: ['view_all_reports', 'view_analytics', 'manage_business_settings'],
  manager: ['manage_sales', 'manage_stock', 'view_reports'],
  employee: ['view_sales', 'create_sales', 'view_stock'],
};
```

### Navigation conditionnelle

La navigation s'adapte automatiquement selon le rôle :

```typescript
const filteredItems = filterNavigationByRole(navigationItems, userRole);
```

## Contexts principaux

### AuthContext
- Gestion de l'authentification
- Informations utilisateur courantes
- Changement de rôle
- Persistance localStorage

### NavigationContext
- Navigation entre pages
- Historique de navigation
- Fonction de retour

### NotificationContext
- Système de notifications globales
- Types : success, error, warning, info
- Auto-suppression configurable

### UIContext
- État de l'interface (sidebar, modales, thème)
- Gestion responsive
- Loading states

## Hooks personnalisés

### useAdminActions
Actions spécifiques aux administrateurs :
- `createUser`, `updateUser`, `deleteUser`
- `manageSystemSettings`
- `viewSystemLogs`

### useManagerActions
Actions spécifiques aux managers :
- `createSale`, `updateStock`
- `generateReport`
- `manageEmployee`

## Gestion d'erreurs

### Points d'entrée robustes
- Gestion d'erreurs globales dans `index.tsx`
- Fallback HTML en cas d'erreur critique
- Logging des erreurs

### Notifications d'erreurs
- Intégration avec le système de notifications
- Messages d'erreur contextuels
- Actions de récupération

## Sécurité

### Vérification des permissions
- Contrôle d'accès au niveau des composants
- Vérification des permissions avant les actions
- Messages d'erreur appropriés

### Authentification
- Système de démonstration avec utilisateurs prédéfinis
- Persistance sécurisée (localStorage pour la démo)
- Déconnexion automatique

## Performance

### Optimisations
- Lazy loading des composants (à implémenter)
- Mémorisation des calculs coûteux
- Gestion efficace des re-rendus

### Bundle splitting
- Séparation par features (à configurer)
- Chargement à la demande

## Accessibilité

### Standards respectés
- Navigation au clavier
- ARIA labels appropriés
- Contraste des couleurs
- Focus visible

### Responsive design
- Mobile-first approach
- Sidebar adaptative
- Touch-friendly sur mobile

## Extensibilité

### Ajout de nouveaux rôles
1. Ajouter le rôle dans `UserRole`
2. Définir les permissions dans `rolePermissions`
3. Créer les pages dans `/features/[role]/`
4. Ajouter les éléments de navigation

### Ajout de nouvelles fonctionnalités
1. Créer le dossier dans `/features/`
2. Implémenter les pages et composants
3. Créer les hooks métier si nécessaire
4. Ajouter la navigation appropriée

## Tests (à implémenter)

### Structure recommandée
- Tests unitaires pour les hooks
- Tests d'intégration pour les contexts
- Tests E2E pour les parcours utilisateur
- Tests de permissions et sécurité

## Déploiement

### Configuration
- Variables d'environnement pour l'API
- Configuration de build optimisée
- Gestion des assets statiques

### Monitoring
- Logging des erreurs
- Métriques de performance
- Suivi des actions utilisateur

## Migration depuis l'ancienne architecture

### Étapes réalisées
1. ✅ Création de la nouvelle structure
2. ✅ Migration des contexts
3. ✅ Implémentation du système RBAC
4. ✅ Création des composants de base
5. ✅ Mise en place des hooks métier

### Étapes suivantes
1. Migration des composants existants
2. Intégration avec le backend
3. Tests et validation
4. Optimisations de performance

## Maintenance

### Bonnes pratiques
- Respecter la structure des dossiers
- Utiliser TypeScript strictement
- Documenter les nouvelles fonctionnalités
- Tester les permissions avant déploiement

### Code review
- Vérifier la cohérence architecturale
- Valider les permissions et sécurité
- Contrôler les performances
- Assurer l'accessibilité