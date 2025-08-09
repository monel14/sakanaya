# Tests du Module Stock

## Structure des Tests

### 📁 `/integration/`
Tests d'intégration pour valider les workflows complets du module stock.

- **`stock-integration.test.ts`** - Tests d'intégration simplifiés et fonctionnels
- **`stock-workflows.test.ts`** - Tests de workflows complexes (en cours de correction)

### 📁 `/components/`
Tests unitaires pour les composants React du module stock.

- **`stock-components.test.tsx`** - Tests des composants avec mocks appropriés

### 📁 `/unit/`
Tests unitaires pour les services, hooks et utilitaires.

## Configuration

### `setup.ts`
Configuration globale des tests avec mocks pour :
- `matchMedia`
- `ResizeObserver`
- `IntersectionObserver`
- `localStorage` / `sessionStorage`
- `fetch`
- `console` methods

## Commandes de Test

```bash
# Exécuter tous les tests du module stock
npm test src/features/stock

# Exécuter les tests d'intégration uniquement
npm test src/features/stock/__tests__/integration

# Exécuter les tests de composants uniquement
npm test src/features/stock/__tests__/components

# Exécuter avec coverage
npm test -- --coverage src/features/stock
```

## Types de Tests

### ✅ Tests Fonctionnels
- Validation des types TypeScript
- Logique métier de base
- Calculs de stock
- Transitions d'état

### ✅ Tests de Composants
- Rendu des composants
- Gestion des props
- États de chargement et d'erreur
- Accessibilité

### ✅ Tests d'Intégration
- Workflows complets
- Cohérence des données
- Gestion des erreurs
- Performance

## Mocks Disponibles

### Services
- `stockService`
- `supplierService`
- `transfertService`
- `inventaireService`

### Composants
- Composants UI avec `data-testid`
- Hooks avec états mockés
- Navigation avec routes mockées

## Bonnes Pratiques

### ✅ Tests Simples et Fiables
- Éviter les dépendances complexes
- Utiliser des mocks appropriés
- Tester la logique métier plutôt que l'implémentation

### ✅ Couverture de Code
- Tests unitaires pour chaque fonction
- Tests d'intégration pour les workflows
- Tests de régression pour les bugs corrigés

### ✅ Maintenance
- Mise à jour des tests avec les changements de code
- Documentation des cas de test complexes
- Nettoyage des tests obsolètes

## Résolution des Problèmes

### Erreurs TypeScript
- Vérifier les imports et exports
- Utiliser des types partiels pour les mocks
- Éviter les types complexes dans les tests

### Erreurs de Rendu
- Utiliser des mocks pour les composants externes
- Fournir des props minimales requises
- Wrapper les composants avec les providers nécessaires

### Erreurs d'Async
- Utiliser `waitFor` pour les opérations asynchrones
- Mocker les appels API
- Gérer les états de chargement

## État Actuel

### ✅ Fonctionnel
- `stock-integration.test.ts` - Tests de base fonctionnels
- `stock-components.test.tsx` - Tests de composants avec mocks
- `setup.ts` - Configuration complète

### 🔧 En Cours
- `stock-workflows.test.ts` - Correction des erreurs TypeScript complexes

### 📋 À Faire
- Tests unitaires pour les hooks
- Tests E2E pour les workflows complets
- Tests de performance pour les gros volumes