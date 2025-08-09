# Système de Poissonnerie Multisite avec Supabase et MCP

Ce projet implémente un système de gestion pour une poissonnerie multisite utilisant React, Supabase comme backend, et le protocole MCP (Model Context Protocol) pour l'intégration.

## 🏗️ Architecture

```
React Frontend ←→ MCP Tools ←→ Supabase Database
```

## 🚀 Fonctionnalités Implémentées

### ✅ Backend Supabase
- **Base de données complète** avec 7 tables principales
- **Données de test** générées automatiquement (30 jours de ventes)
- **Vues optimisées** pour les rapports
- **Fonctions et triggers** pour l'intégrité des données
- **RLS (Row Level Security)** activé sur toutes les tables

### ✅ Rapports Détaillés
- **Rapport des Ventes** : CA par période/magasin/produit avec répartition
- **Rapport de Performance** : Analyse des employés avec classement
- **Rapport d'Impact des Prix** : Évolution des prix et élasticité

### ✅ Intégration MCP
- **Configuration MCP** pour Supabase
- **Services de rapports** utilisant les MCP tools
- **Requêtes SQL optimisées** pour les performances

## 📊 Données Disponibles

### Magasins (3)
- Hub de Distribution (hub)
- Pointe des Almadies (retail)
- Marché Sandaga (retail)

### Employés (5)
- Amadou Diop (Manager, Hub)
- Fatou Sall (Vendeur, Hub)
- Moussa Ba (Vendeur, Almadies)
- Aïcha Ndiaye (Préparateur, Almadies)
- Omar Fall (Manager, Sandaga)

### Produits (6)
- Thon Rouge (variable) - 6,500 CFA/kg
- Crevettes (variable) - 8,000 CFA/kg
- Saumon (fixe) - 7,200 CFA/kg
- Dorade (variable) - 4,500 CFA/kg
- Langoustes (variable) - 12,000 CFA/kg
- Sole (fixe) - 5,800 CFA/kg

### Données de Ventes
- **30 jours** de données historiques
- **90 ventes journalières** (3 magasins × 30 jours)
- **409 entrées de vente** avec détails produits
- **407M CFA** de chiffre d'affaires total
- **12,017 kg** de produits vendus

## 🛠️ Utilisation

### 1. Configuration MCP

Le fichier `.kiro/settings/mcp.json` est déjà configuré :

```json
{
  "mcpServers": {
    "supabase": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=kvofgnervxbjjutubkeg"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_90fe1686c269969cb07947218cdb69a92c93357f"
      },
      "disabled": false,
      "autoApprove": [
        "mcp_supabase_get_schemas",
        "mcp_supabase_get_tables",
        "mcp_supabase_get_table_schema"
      ]
    }
  }
}
```

### 2. Génération de Rapports

```typescript
import { reportsService, ReportFilters } from '@/features/reports';

// Rapport des ventes des 7 derniers jours
const salesReport = await reportsService.generateSalesReport({
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  endDate: new Date(),
  storeId: '550e8400-e29b-41d4-a716-446655440002' // Optionnel
});

console.log(`CA Total: ${salesReport.totalRevenue.toLocaleString()} CFA`);
console.log(`Quantité: ${salesReport.totalQuantity} kg`);
console.log(`Prix moyen: ${salesReport.averagePrice.toLocaleString()} CFA/kg`);

// Répartition par produit
salesReport.breakdown.forEach(item => {
  console.log(`${item.name}: ${item.revenue.toLocaleString()} CFA (${item.percentage.toFixed(1)}%)`);
});
```

### 3. Utilisation des Composants

Les composants de rapports sont déjà intégrés dans `ReportsView` :

```typescript
import { ReportsView } from '@/features/reports';

// Dans votre application
<ReportsView />
```

## 📈 Exemples de Données Réelles

### Ventes des 7 Derniers Jours
- **CA Total** : 109,741,256 CFA
- **Quantité** : 3,167 kg
- **Prix Moyen** : 34,656 CFA/kg
- **Nombre de Ventes** : 24

### Top 3 Produits (7 derniers jours)
1. **Langoustes** : 19,858,169 CFA (18.1%)
2. **Crevettes** : 17,186,616 CFA (15.7%)
3. **Thon Rouge** : 14,824,268 CFA (13.5%)

### Performance Employés (30 derniers jours)
1. **Moussa Ba** (Vendeur) : 30,450,507 CFA
2. **Omar Fall** (Manager) : 28,390,983 CFA
3. **Amadou Diop** (Manager) : 27,291,439 CFA

## 🔧 Services Disponibles

### `reportsService` (Principal)
Service principal qui utilise MCP pour générer les rapports.

### `realMCPReportsService`
Service qui exécute directement les requêtes SQL via MCP tools.

### `mcpReportsService`
Service avec simulation MCP pour développement.

### `supabaseReportsService`
Service avec logique métier pour Supabase.

## 📝 Requêtes SQL Utilisées

### Rapport des Ventes
```sql
-- Totaux
SELECT 
  COALESCE(SUM(ds.total), 0) as total_revenue,
  COALESCE(SUM(se.quantity), 0) as total_quantity,
  COUNT(DISTINCT ds.id) as sales_count
FROM daily_sales ds
LEFT JOIN sales_entries se ON ds.id = se.daily_sales_id
WHERE ds.date >= '2025-08-01' AND ds.date <= '2025-08-07';

-- Répartition par produit
SELECT 
  p.name,
  COALESCE(SUM(se.subtotal), 0) as revenue,
  COALESCE(SUM(se.quantity), 0) as quantity
FROM products p
LEFT JOIN sales_entries se ON p.id = se.product_id
LEFT JOIN daily_sales ds ON se.daily_sales_id = ds.id
WHERE ds.date >= '2025-08-01' AND ds.date <= '2025-08-07'
GROUP BY p.id, p.name
ORDER BY revenue DESC;
```

### Rapport de Performance
```sql
SELECT 
  e.first_name,
  e.last_name,
  e.role,
  COUNT(ds.id) as total_sales,
  COALESCE(SUM(ds.total), 0) as total_revenue
FROM employees e
LEFT JOIN daily_sales ds ON e.id = ds.created_by
WHERE ds.date >= '2025-08-01' AND ds.date <= '2025-08-07'
GROUP BY e.id, e.first_name, e.last_name, e.role
ORDER BY total_revenue DESC;
```

## 🎯 Prochaines Étapes

1. **Interface Utilisateur** : Améliorer les composants de rapports
2. **Authentification** : Intégrer Supabase Auth
3. **Temps Réel** : Ajouter les mises à jour en temps réel
4. **Export** : Implémenter l'export PDF/Excel
5. **Filtres Avancés** : Ajouter plus d'options de filtrage
6. **Graphiques** : Intégrer des bibliothèques de visualisation
7. **Tests** : Créer des tests unitaires et d'intégration

## 🔍 Débogage

### Vérifier la Connexion MCP
```bash
# Dans Kiro, ouvrir la vue MCP Server pour vérifier le statut
```

### Tester les Requêtes SQL
```typescript
// Utiliser directement les MCP tools pour tester
const result = await mcp_supabase_execute_sql({
  query: "SELECT COUNT(*) FROM daily_sales"
});
```

### Logs de Débogage
```typescript
// Activer les logs dans les services
console.log('Exécution de la requête:', query);
```

## 📚 Documentation

- [Intégration Supabase MCP](./docs/supabase-mcp-integration.md)
- [Structure de la Base de Données](./docs/database-schema.md)
- [API des Services](./docs/services-api.md)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.