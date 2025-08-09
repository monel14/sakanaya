# Guide - Système de Prix Variables Basé sur Prix d'Achat

## 🎯 Concept

Tous les produits de la poissonnerie ont maintenant des **prix variables** calculés automatiquement selon la formule :

```
Prix de Vente = Prix d'Achat × (1 + Marge%)
```

## 📊 Fonctionnalités Implémentées

### 1. **Gestion des Prix d'Achat**
- Chaque produit a un prix d'achat qui varie selon le marché
- Le directeur peut modifier le prix d'achat quotidiennement
- Le prix de vente se recalcule automatiquement

### 2. **Gestion des Marges**
- Marge par défaut : 25%
- Marge modifiable par produit
- Recalcul automatique du prix de vente

### 3. **Interface Directeur - Produits & Prix**
- **Tableau de mise à jour** : Prix d'achat, Marge, Prix de vente calculé
- **Modal détaillée** : Modification avec aperçu du calcul
- **Historique** : Traçabilité de tous les changements

### 4. **Données Mockées**
```javascript
{
  name: 'Thon Rouge',
  purchasePrice: 5200,  // Prix d'achat
  margin: 25,           // Marge 25%
  unitPrice: 6500       // Prix de vente (5200 × 1.25)
}
```

## 🔧 Utilisation

### Pour le Directeur :
1. **Accéder à "Produits & Prix"**
2. **Modifier le prix d'achat** dans le tableau
3. **Ajuster la marge** si nécessaire
4. **Voir le prix de vente** se calculer automatiquement
5. **Cliquer "Mettre à jour"** pour valider

### Pour les Managers :
- Les nouveaux prix sont **automatiquement disponibles** dans la saisie des ventes
- **Notifications** en cas de changement de prix
- Prix toujours à jour dans l'interface

## 📈 Avantages

1. **Réactivité** : Prix ajustés selon le marché quotidien
2. **Transparence** : Calcul visible et traçable
3. **Simplicité** : Un seul paramètre à modifier (prix d'achat)
4. **Cohérence** : Marge uniforme ou personnalisée par produit
5. **Historique** : Traçabilité complète des changements

## 🎨 Interface

### Tableau Principal
```
Produit | Prix d'Achat | Marge (%) | Prix de Vente | Action
Thon    | 5200 CFA     | 25%       | 6500 CFA      | [Mettre à jour]
```

### Modal de Modification
- **Prix actuels** : Affichage des valeurs courantes
- **Nouveaux prix** : Saisie prix d'achat + marge
- **Calcul en temps réel** : Prix de vente calculé automatiquement
- **Raison** : Justification du changement

## 🔄 Workflow Quotidien

1. **Matin** : Le directeur consulte les prix du marché
2. **Mise à jour** : Modification des prix d'achat dans l'interface
3. **Validation** : Confirmation avec raison du changement
4. **Notification** : Les managers sont informés automatiquement
5. **Ventes** : Les nouveaux prix sont disponibles immédiatement

## 🚀 Prochaines Étapes

- [ ] Intégration avec API fournisseurs
- [ ] Alertes automatiques sur variations importantes
- [ ] Suggestions de prix basées sur l'historique
- [ ] Rapports de rentabilité par produit