# Interface de Gestion des Fournisseurs

## Vue d'ensemble

L'interface de gestion des fournisseurs permet aux **Directeurs** de gérer complètement leurs fournisseurs dans le système Sakanaya. Cette interface fait partie du module de gestion des stocks et constitue la base pour les arrivages de marchandises.

## Fonctionnalités

### 📊 Tableau de bord statistiques
- **Total des fournisseurs** : Nombre total de fournisseurs dans le système
- **Fournisseurs actifs** : Nombre de fournisseurs actuellement actifs
- **Fournisseurs inactifs** : Nombre de fournisseurs désactivés
- **Ajoutés récemment** : Nombre de fournisseurs ajoutés dans les 30 derniers jours

### 📋 Liste des fournisseurs
- **Vue tabulaire** avec toutes les informations importantes
- **Recherche en temps réel** par nom, contact, téléphone ou email
- **Filtrage** pour afficher/masquer les fournisseurs inactifs
- **Indicateurs visuels** pour le statut (actif/inactif)
- **Actions rapides** : modifier, activer/désactiver, supprimer

### ✏️ Formulaire de gestion
- **Ajout de nouveaux fournisseurs** avec validation complète
- **Modification des fournisseurs existants**
- **Validation en temps réel** des champs (email, téléphone, etc.)
- **Gestion des erreurs** avec messages explicites

## Utilisation

### 1. Intégration dans votre application

```tsx
import { SupplierManagementPage } from '@/features/stock';

// Dans vos routes (React Router)
<Route path="/stock/suppliers" element={<SupplierManagementPage />} />

// Ou directement dans un composant
<SupplierManagementPage />
```

### 2. Utilisation des composants individuels

```tsx
import { 
  SupplierManagement, 
  SupplierForm, 
  SupplierList, 
  SupplierStats 
} from '@/features/stock/components/ArrivageFournisseur';

// Utilisation du composant principal
<SupplierManagement />

// Ou utilisation des sous-composants
<SupplierStats />
<SupplierList 
  suppliers={suppliers}
  loading={false}
  onEdit={handleEdit}
  onToggleStatus={handleToggle}
  onDelete={handleDelete}
  onRefresh={handleRefresh}
/>
```

## Structure des données

### Interface Supplier
```typescript
interface Supplier {
  id: string;
  name: string;           // Nom du fournisseur (requis)
  contact?: string;       // Personne de contact
  phone?: string;         // Numéro de téléphone
  email?: string;         // Adresse email
  address?: string;       // Adresse complète
  isActive: boolean;      // Statut actif/inactif
  createdAt: Date;        // Date de création
  createdBy: string;      // ID de l'utilisateur créateur
}
```

## Actions disponibles

### Pour les Directeurs :
1. **Voir tous les fournisseurs** avec leurs statistiques
2. **Ajouter un nouveau fournisseur** avec le formulaire
3. **Modifier un fournisseur existant**
4. **Activer/désactiver un fournisseur**
5. **Rechercher et filtrer** les fournisseurs
6. **Supprimer un fournisseur** (désactivation)

## Validation des données

- **Nom du fournisseur** : Obligatoire, unique
- **Email** : Format email valide si renseigné
- **Téléphone** : Format téléphone basique si renseigné
- **Unicité** : Vérification des doublons par nom

## États et gestion d'erreurs

- **États de chargement** pour toutes les opérations
- **Messages d'erreur explicites** pour chaque type d'erreur
- **Confirmation** pour les actions destructives
- **Sauvegarde automatique** des états de formulaire

## Responsive Design

L'interface est entièrement responsive et s'adapte à :
- **Desktop** : Vue tabulaire complète
- **Tablet** : Vue adaptée avec actions groupées
- **Mobile** : Vue en cartes avec navigation optimisée

## Tests

Des tests unitaires complets sont inclus :
- Tests des composants React
- Tests des interactions utilisateur
- Tests de la validation des formulaires
- Tests de gestion d'erreurs

## Prochaines étapes

Cette interface sera utilisée dans :
- **Bons de réception fournisseur** (tâche 3.1)
- **Rapports d'achats** (tâches futures)
- **Analyse des fournisseurs** (tâches futures)

## Support

Pour toute question ou problème avec cette interface, consultez :
- Les tests unitaires dans `__tests__/`
- L'exemple d'utilisation dans `examples/`
- La documentation des services dans `services/supplierService.ts`