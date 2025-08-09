# Intégration Supabase avec MCP

Ce document explique comment le système de poissonnerie multisite utilise Supabase comme backend via le protocole MCP (Model Context Protocol).

## Architecture

```
Frontend React ←→ MCP Tools ←→ Supabase Database
```

## Configuration MCP

La configuration MCP se trouve dans `.kiro/settings/mcp.json` :

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

## Structure de la Base de Données

### Tables Principales

1. **stores** - Magasins (hub et retail)
2. **employees** - Employés avec leurs rôles et horaires
3. **products** - Produits avec prix variables/fixes
4. **daily_sales** - Ventes journalières par magasin
5. **sales_entries** - Détails des ventes (produit, quantité, prix)
6. **price_history** - Historique des changements de prix
7. **salary_adjustments** - Ajustements salariaux (bonus, avances)

### Vues Utiles

1. **sales_with_products** - Ventes avec détails produits
2. **employee_performance** - Performance des employés

## Services de Rapports

### 1. Service Principal (`reportsService`)

Le service principal qui utilise MCP pour générer les rapports :

```typescript
import { reportsService } from '@/features/reports';

// Rapport des ventes
const salesReport = await reportsService.generateSalesReport({
  startDate: new Date('2025-07-01'),
  endDate: new Date('2025-08-07'),
  storeId: 'store-1' // optionnel
});

// Rapport de performance
const performanceReport = await reportsService.generatePerformanceReport({
  startDate: new Date('2025-07-01'),
  endDate: new Date('2025-08-07'),
  storeId: 'store-2' // optionnel
});

// Rapport d'impact des prix
const priceImpactReport = await reportsService.generatePriceImpactReport({
  startDate: new Date('2025-07-01'),
  endDate: new Date('2025-08-07'),
  productId: 'product-1' // optionnel
});
```

### 2. Service MCP Réel (`realMCPReportsService`)

Service qui utilise directement les MCP tools pour exécuter des requêtes SQL :

```typescript
import { realMCPReportsService } from '@/features/reports';

// Utilisation directe (même interface que le service principal)
const report = await realMCPReportsService.generateSalesReport(filters);
```

## Requêtes SQL Utilisées

### Rapport des Ventes

```sql
-- Totaux des ventes
SELECT 
  COALESCE(SUM(ds.total), 0) as total_revenue,
  COALESCE(SUM(se.quantity), 0) as total_quantity,
  COUNT(DISTINCT ds.id) as sales_count,
  CASE 
    WHEN SUM(se.quantity) > 0 THEN SUM(ds.total) / SUM(se.quantity)
    ELSE 0 
  END as average_price
FROM daily_sales ds
LEFT JOIN sales_entries se ON ds.id = se.daily_sales_id
WHERE ds.date >= '2025-07-01' AND ds.date <= '2025-08-07';

-- Répartition par produit
SELECT 
  p.id,
  p.name,
  'product' as type,
  COALESCE(SUM(se.subtotal), 0) as revenue,
  COALESCE(SUM(se.quantity), 0) as quantity,
  CASE 
    WHEN SUM(se.quantity) > 0 THEN SUM(se.subtotal) / SUM(se.quantity)
    ELSE 0 
  END as average_price,
  COUNT(DISTINCT ds.id) as sales_count
FROM products p
LEFT JOIN sales_entries se ON p.id = se.product_id
LEFT JOIN daily_sales ds ON se.daily_sales_id = ds.id 
  AND ds.date >= '2025-07-01' AND ds.date <= '2025-08-07'
WHERE p.is_active = true
GROUP BY p.id, p.name
HAVING SUM(se.subtotal) > 0
ORDER BY revenue DESC;
```

### Rapport de Performance

```sql
-- Performance des employés
SELECT 
  e.id as employee_id,
  e.first_name,
  e.last_name,
  e.role,
  e.work_days,
  COUNT(ds.id) as total_sales,
  COALESCE(SUM(ds.total), 0) as total_revenue,
  CASE 
    WHEN COUNT(ds.id) > 0 THEN SUM(ds.total) / COUNT(ds.id)
    ELSE 0 
  END as average_sale_value
FROM employees e
LEFT JOIN daily_sales ds ON e.id = ds.created_by 
  AND ds.date >= '2025-07-01' AND ds.date <= '2025-08-07'
WHERE e.is_active = true
GROUP BY e.id, e.first_name, e.last_name, e.role, e.work_days
ORDER BY total_revenue DESC;
```

### Rapport d'Impact des Prix

```sql
-- Changements de prix avec calcul des pourcentages
WITH price_changes AS (
  SELECT 
    ph.id,
    ph.product_id,
    p.name as product_name,
    ph.price as new_price,
    LAG(ph.price) OVER (PARTITION BY ph.product_id ORDER BY ph.created_at) as old_price,
    ph.created_at as change_date,
    ph.updated_by,
    ph.reason
  FROM price_history ph
  JOIN products p ON ph.product_id = p.id
  WHERE ph.created_at >= '2025-07-01' AND ph.created_at <= '2025-08-07'
  ORDER BY ph.product_id, ph.created_at
)
SELECT 
  id,
  product_id,
  product_name,
  old_price,
  new_price,
  CASE 
    WHEN old_price > 0 THEN ((new_price - old_price) / old_price) * 100
    ELSE 0 
  END as change_percent,
  change_date,
  updated_by,
  reason
FROM price_changes
WHERE old_price IS NOT NULL
ORDER BY change_date DESC;
```

## Données de Test

La base de données contient des données de test générées automatiquement :

- **3 magasins** : Hub de Distribution, Pointe des Almadies, Marché Sandaga
- **5 employés** avec différents rôles (manager, seller, preparer)
- **6 produits** : Thon Rouge, Crevettes, Saumon, Dorade, Langoustes, Sole
- **30 jours de ventes** avec données réalistes
- **Historique des prix** pour les produits à prix variable

## Utilisation dans les Composants React

```typescript
import React, { useState, useEffect } from 'react';
import { reportsService, ReportFilters } from '@/features/reports';

const MyReportComponent: React.FC = () => {
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const filters: ReportFilters = {
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-08-07')
      };
      
      const data = await reportsService.generateSalesReport(filters);
      setSalesData(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={generateReport} disabled={loading}>
        {loading ? 'Génération...' : 'Générer Rapport'}
      </button>
      
      {salesData && (
        <div>
          <h3>Chiffre d'Affaires: {salesData.totalRevenue.toLocaleString()} CFA</h3>
          <h3>Quantité Totale: {salesData.totalQuantity} kg</h3>
          {/* Afficher les autres données */}
        </div>
      )}
    </div>
  );
};
```

## Avantages de cette Architecture

1. **Séparation des préoccupations** : Le frontend ne gère que l'UI, la logique métier est dans les services
2. **Flexibilité** : Possibilité de changer de backend sans modifier les composants
3. **Type Safety** : Types TypeScript générés automatiquement depuis Supabase
4. **Performance** : Requêtes SQL optimisées directement sur la base
5. **Sécurité** : RLS (Row Level Security) activé sur toutes les tables
6. **Évolutivité** : Facile d'ajouter de nouveaux rapports ou fonctionnalités

## Prochaines Étapes

1. **Authentification** : Intégrer Supabase Auth pour la gestion des utilisateurs
2. **Temps Réel** : Utiliser Supabase Realtime pour les mises à jour en temps réel
3. **Optimisation** : Ajouter des index et optimiser les requêtes
4. **Tests** : Créer des tests unitaires et d'intégration
5. **Déploiement** : Configurer les environnements de développement et production