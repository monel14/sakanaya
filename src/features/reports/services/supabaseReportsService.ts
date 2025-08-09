import { 
  SalesReportData, 
  PerformanceReportData, 
  PriceImpactReportData,
  ReportFilters,
  SalesBreakdownItem,
  EmployeePerformanceItem,
  PriceChangeItem,
  SalesImpactItem,
  PriceImpactSummary
} from '../types';

/**
 * Service pour générer des rapports en utilisant Supabase via MCP
 * Ce service utilise les MCP tools pour exécuter des requêtes SQL directement
 */
class SupabaseReportsService {
  
  /**
   * Génère un rapport des ventes
   */
  async generateSalesReport(filters: ReportFilters): Promise<SalesReportData> {
    const startDate = filters.startDate.toISOString().split('T')[0];
    const endDate = filters.endDate.toISOString().split('T')[0];
    
    // Requête principale pour les totaux
    let totalQuery = `
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
      WHERE ds.date >= '${startDate}' AND ds.date <= '${endDate}'
    `;
    
    if (filters.storeId) {
      totalQuery += ` AND ds.store_id = '${filters.storeId}'`;
    }
    
    // Requête pour la répartition
    let breakdownQuery = '';
    if (filters.productId) {
      // Répartition par magasin pour un produit spécifique
      breakdownQuery = `
        SELECT 
          s.id,
          s.name,
          'store' as type,
          COALESCE(SUM(se.subtotal), 0) as revenue,
          COALESCE(SUM(se.quantity), 0) as quantity,
          CASE 
            WHEN SUM(se.quantity) > 0 THEN SUM(se.subtotal) / SUM(se.quantity)
            ELSE 0 
          END as average_price,
          COUNT(DISTINCT ds.id) as sales_count
        FROM stores s
        LEFT JOIN daily_sales ds ON s.id = ds.store_id 
          AND ds.date >= '${startDate}' AND ds.date <= '${endDate}'
        LEFT JOIN sales_entries se ON ds.id = se.daily_sales_id 
          AND se.product_id = '${filters.productId}'
        WHERE s.is_active = true
        GROUP BY s.id, s.name
        HAVING SUM(se.subtotal) > 0
        ORDER BY revenue DESC
      `;
    } else {
      // Répartition par produit
      breakdownQuery = `
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
          AND ds.date >= '${startDate}' AND ds.date <= '${endDate}'
      `;
      
      if (filters.storeId) {
        breakdownQuery += ` AND ds.store_id = '${filters.storeId}'`;
      }
      
      breakdownQuery += `
        WHERE p.is_active = true
        GROUP BY p.id, p.name
        HAVING SUM(se.subtotal) > 0
        ORDER BY revenue DESC
      `;
    }
    
    try {
      // Exécuter les requêtes via MCP (simulé ici - dans une vraie implémentation, 
      // vous utiliseriez les MCP tools)
      const totalsResult = await this.executeMCPQuery(totalQuery);
      const breakdownResult = await this.executeMCPQuery(breakdownQuery);
      
      const totals = totalsResult[0] || {
        total_revenue: 0,
        total_quantity: 0,
        sales_count: 0,
        average_price: 0
      };
      
      // Calculer les pourcentages pour la répartition
      const breakdown: SalesBreakdownItem[] = breakdownResult.map((item: any) => ({
        id: item.id,
        name: item.name,
        type: item.type as 'product' | 'store',
        revenue: parseFloat(item.revenue),
        quantity: parseFloat(item.quantity),
        averagePrice: parseFloat(item.average_price),
        salesCount: parseInt(item.sales_count),
        percentage: totals.total_revenue > 0 ? 
          (parseFloat(item.revenue) / parseFloat(totals.total_revenue)) * 100 : 0
      }));
      
      return {
        period: {
          start: filters.startDate,
          end: filters.endDate
        },
        storeId: filters.storeId,
        productId: filters.productId,
        totalRevenue: parseFloat(totals.total_revenue),
        totalQuantity: parseFloat(totals.total_quantity),
        averagePrice: parseFloat(totals.average_price),
        salesCount: parseInt(totals.sales_count),
        breakdown
      };
    } catch (error) {
      console.error('Erreur lors de la génération du rapport des ventes:', error);
      throw new Error('Impossible de générer le rapport des ventes');
    }
  }
  
  /**
   * Génère un rapport de performance des employés
   */
  async generatePerformanceReport(filters: ReportFilters): Promise<PerformanceReportData> {
    const startDate = filters.startDate.toISOString().split('T')[0];
    const endDate = filters.endDate.toISOString().split('T')[0];
    
    let performanceQuery = `
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
        AND ds.date >= '${startDate}' AND ds.date <= '${endDate}'
      WHERE e.is_active = true
    `;
    
    if (filters.storeId) {
      performanceQuery += ` AND e.store_id = '${filters.storeId}'`;
    }
    
    performanceQuery += `
      GROUP BY e.id, e.first_name, e.last_name, e.role, e.work_days
      ORDER BY total_revenue DESC
    `;
    
    // Requête pour les totaux
    let totalsQuery = `
      SELECT 
        COUNT(DISTINCT e.id) as total_employees,
        COALESCE(SUM(ds.total), 0) as total_revenue
      FROM employees e
      LEFT JOIN daily_sales ds ON e.id = ds.created_by 
        AND ds.date >= '${startDate}' AND ds.date <= '${endDate}'
      WHERE e.is_active = true
    `;
    
    if (filters.storeId) {
      totalsQuery += ` AND e.store_id = '${filters.storeId}'`;
    }
    
    try {
      const performanceResult = await this.executeMCPQuery(performanceQuery);
      const totalsResult = await this.executeMCPQuery(totalsQuery);
      
      const totals = totalsResult[0] || {
        total_employees: 0,
        total_revenue: 0
      };
      
      const totalEmployees = parseInt(totals.total_employees);
      const totalRevenue = parseFloat(totals.total_revenue);
      const averageRevenuePerEmployee = totalEmployees > 0 ? totalRevenue / totalEmployees : 0;
      
      // Calculer les jours travaillés dans la période
      const periodDays = Math.ceil((filters.endDate.getTime() - filters.startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const employeePerformance: EmployeePerformanceItem[] = performanceResult.map((emp: any, index: number) => {
        const workDaysCount = Array.isArray(emp.work_days) ? emp.work_days.length : 5;
        const workingDays = Math.min(periodDays, workDaysCount * Math.ceil(periodDays / 7));
        const revenuePerDay = workingDays > 0 ? parseFloat(emp.total_revenue) / workingDays : 0;
        
        return {
          employeeId: emp.employee_id,
          firstName: emp.first_name,
          lastName: emp.last_name,
          role: emp.role,
          totalSales: parseInt(emp.total_sales),
          totalRevenue: parseFloat(emp.total_revenue),
          averageSaleValue: parseFloat(emp.average_sale_value),
          workingDays,
          revenuePerDay,
          ranking: index + 1
        };
      });
      
      return {
        period: {
          start: filters.startDate,
          end: filters.endDate
        },
        storeId: filters.storeId,
        totalEmployees,
        totalRevenue,
        averageRevenuePerEmployee,
        employeePerformance
      };
    } catch (error) {
      console.error('Erreur lors de la génération du rapport de performance:', error);
      throw new Error('Impossible de générer le rapport de performance');
    }
  }
  
  /**
   * Génère un rapport d'impact des prix
   */
  async generatePriceImpactReport(filters: ReportFilters): Promise<PriceImpactReportData> {
    const startDate = filters.startDate.toISOString().split('T')[0];
    const endDate = filters.endDate.toISOString().split('T')[0];
    
    // Requête pour l'historique des prix avec les changements
    let priceHistoryQuery = `
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
        WHERE ph.created_at >= '${startDate}' AND ph.created_at <= '${endDate}'
    `;
    
    if (filters.productId) {
      priceHistoryQuery += ` AND ph.product_id = '${filters.productId}'`;
    }
    
    priceHistoryQuery += `
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
      ORDER BY change_date DESC
    `;
    
    try {
      const priceChangesResult = await this.executeMCPQuery(priceHistoryQuery);
      
      const priceChangeItems: PriceChangeItem[] = priceChangesResult.map((change: any) => ({
        id: change.id,
        productId: change.product_id,
        productName: change.product_name,
        oldPrice: parseFloat(change.old_price),
        newPrice: parseFloat(change.new_price),
        changePercent: parseFloat(change.change_percent),
        changeDate: new Date(change.change_date),
        updatedBy: change.updated_by,
        reason: change.reason
      }));
      
      // Pour l'analyse d'impact, nous aurions besoin de requêtes plus complexes
      // pour calculer les ventes avant/après chaque changement de prix
      // Ici, nous simulons avec des données basiques
      const salesImpact: SalesImpactItem[] = [];
      
      // Calculer le résumé
      const totalPriceChanges = priceChangeItems.length;
      const averagePriceIncrease = totalPriceChanges > 0 ? 
        priceChangeItems.reduce((sum, item) => sum + item.changePercent, 0) / totalPriceChanges : 0;
      
      const summary: PriceImpactSummary = {
        totalPriceChanges,
        averagePriceIncrease,
        totalRevenueImpact: 0, // Calculé avec des données réelles
        totalQuantityImpact: 0, // Calculé avec des données réelles
        mostImpactedProduct: {
          productId: '',
          productName: '',
          revenueImpact: 0
        }
      };
      
      return {
        period: {
          start: filters.startDate,
          end: filters.endDate
        },
        productId: filters.productId,
        priceChanges: priceChangeItems,
        salesImpact,
        summary
      };
    } catch (error) {
      console.error('Erreur lors de la génération du rapport d\'impact des prix:', error);
      throw new Error('Impossible de générer le rapport d\'impact des prix');
    }
  }
  
  /**
   * Méthode helper pour exécuter des requêtes via MCP
   * Dans une vraie implémentation, ceci utiliserait les MCP tools
   */
  private async executeMCPQuery(query: string): Promise<any[]> {
    // Simulation - dans une vraie implémentation, vous utiliseriez :
    // return await mcp_supabase_execute_sql({ query });
    
    // Pour l'instant, retournons des données mock basées sur la structure de la requête
    if (query.includes('total_revenue')) {
      return [{
        total_revenue: '1500000',
        total_quantity: '250.5',
        sales_count: '15',
        average_price: '5990'
      }];
    }
    
    if (query.includes('employee_id')) {
      return [
        {
          employee_id: '660e8400-e29b-41d4-a716-446655440001',
          first_name: 'Amadou',
          last_name: 'Diop',
          role: 'manager',
          work_days: [1,2,3,4,5,6],
          total_sales: '10',
          total_revenue: '800000',
          average_sale_value: '80000'
        },
        {
          employee_id: '660e8400-e29b-41d4-a716-446655440002',
          first_name: 'Fatou',
          last_name: 'Sall',
          role: 'seller',
          work_days: [1,2,3,4,5],
          total_sales: '8',
          total_revenue: '450000',
          average_sale_value: '56250'
        }
      ];
    }
    
    if (query.includes('price_changes')) {
      return [
        {
          id: 'ph1',
          product_id: '770e8400-e29b-41d4-a716-446655440001',
          product_name: 'Thon Rouge',
          old_price: '6000',
          new_price: '6500',
          change_percent: '8.33',
          change_date: '2025-08-01',
          updated_by: '660e8400-e29b-41d4-a716-446655440001',
          reason: 'Ajustement marché'
        }
      ];
    }
    
    // Données par défaut pour la répartition
    return [
      {
        id: '770e8400-e29b-41d4-a716-446655440001',
        name: 'Thon Rouge',
        type: 'product',
        revenue: '650000',
        quantity: '100.5',
        average_price: '6467',
        sales_count: '8'
      },
      {
        id: '770e8400-e29b-41d4-a716-446655440002',
        name: 'Crevettes',
        type: 'product',
        revenue: '480000',
        quantity: '60.0',
        average_price: '8000',
        sales_count: '6'
      }
    ];
  }
}

export const supabaseReportsService = new SupabaseReportsService();