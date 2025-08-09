import { MouvementStock } from '../types';
import { Product } from '../../sales/types';
import { stockService } from '../../../shared/services';
import { productService } from '../../../shared/services';

export interface TraceabilityFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  storeIds?: string[];
  productIds?: string[];
  movementTypes?: string[];
  userIds?: string[];
  referenceType?: string;
  search?: string;
}

export interface TraceabilityAnomaly {
  id: string;
  type: 'quantity_mismatch' | 'timing_anomaly' | 'duplicate_movement' | 'missing_reference';
  severity: 'low' | 'medium' | 'high';
  description: string;
  movementId: string;
  detectedAt: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface TraceabilityReport {
  totalMovements: number;
  movementsByType: Record<string, number>;
  movementsByStore: Record<string, number>;
  movementsByProduct: Record<string, number>;
  movementsByUser: Record<string, number>;
  timelineData: Array<{
    date: string;
    movements: number;
    inflow: number;
    outflow: number;
  }>;
  anomalies: TraceabilityAnomaly[];
  generatedAt: Date;
}

export interface LogisticsFlowReport {
  storeId: string;
  storeName: string;
  period: {
    start: Date;
    end: Date;
  };
  inboundFlows: {
    arrivals: number;
    transfers: number;
    adjustments: number;
  };
  outboundFlows: {
    sales: number;
    losses: number;
    transfers: number;
  };
  netFlow: number;
  flowEfficiency: number;
  averageProcessingTime: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    totalMovements: number;
    netQuantity: number;
  }>;
  generatedAt: Date;
}

class TraceabilityService {
  private mockMovements: MouvementStock[] = [];
  private mockProducts: Product[] = [];

  async getMovements(filters: TraceabilityFilters = {}): Promise<MouvementStock[]> {
    // Initialize mock data if empty
    if (this.mockMovements.length === 0) {
      await this.initializeMockData();
    }

    let movements = [...this.mockMovements];

    // Apply filters
    if (filters.dateRange) {
      movements = movements.filter(m => 
        m.date >= filters.dateRange!.start && m.date <= filters.dateRange!.end
      );
    }

    if (filters.storeIds && filters.storeIds.length > 0) {
      movements = movements.filter(m => filters.storeIds!.includes(m.storeId));
    }

    if (filters.productIds && filters.productIds.length > 0) {
      movements = movements.filter(m => filters.productIds!.includes(m.productId));
    }

    if (filters.movementTypes && filters.movementTypes.length > 0) {
      movements = movements.filter(m => filters.movementTypes!.includes(m.type));
    }

    if (filters.userIds && filters.userIds.length > 0) {
      movements = movements.filter(m => filters.userIds!.includes(m.createdBy));
    }

    if (filters.referenceType) {
      movements = movements.filter(m => m.referenceType === filters.referenceType);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      movements = movements.filter(m =>
        m.product.name.toLowerCase().includes(searchLower) ||
        m.store.name.toLowerCase().includes(searchLower) ||
        m.referenceId.toLowerCase().includes(searchLower) ||
        (m.commentaire && m.commentaire.toLowerCase().includes(searchLower))
      );
    }

    return movements.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async generateTraceabilityReport(filters: TraceabilityFilters = {}): Promise<TraceabilityReport> {
    const movements = await this.getMovements(filters);
    
    const totalMovements = movements.length;
    
    // Group by type
    const movementsByType: Record<string, number> = {};
    movements.forEach(m => {
      movementsByType[m.type] = (movementsByType[m.type] || 0) + 1;
    });

    // Group by store
    const movementsByStore: Record<string, number> = {};
    movements.forEach(m => {
      movementsByStore[m.store.name] = (movementsByStore[m.store.name] || 0) + 1;
    });

    // Group by product
    const movementsByProduct: Record<string, number> = {};
    movements.forEach(m => {
      movementsByProduct[m.product.name] = (movementsByProduct[m.product.name] || 0) + 1;
    });

    // Group by user
    const movementsByUser: Record<string, number> = {};
    movements.forEach(m => {
      movementsByUser[m.createdBy] = (movementsByUser[m.createdBy] || 0) + 1;
    });

    // Generate timeline data (last 7 days)
    const timelineData: Array<{
      date: string;
      movements: number;
      inflow: number;
      outflow: number;
    }> = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayMovements = movements.filter(m => 
        m.date.toISOString().split('T')[0] === dateStr
      );
      
      const inflow = dayMovements
        .filter(m => ['arrivage', 'transfert_entree', 'ajustement'].includes(m.type) && m.quantite > 0)
        .reduce((sum, m) => sum + m.quantite, 0);
      
      const outflow = dayMovements
        .filter(m => ['vente', 'perte', 'transfert_sortie'].includes(m.type) || m.quantite < 0)
        .reduce((sum, m) => sum + Math.abs(m.quantite), 0);

      timelineData.push({
        date: dateStr,
        movements: dayMovements.length,
        inflow,
        outflow
      });
    }

    // Generate anomalies
    const anomalies = await this.detectAnomalies(movements);

    return {
      totalMovements,
      movementsByType,
      movementsByStore,
      movementsByProduct,
      movementsByUser,
      timelineData,
      anomalies,
      generatedAt: new Date()
    };
  }

  async generateLogisticsFlowReport(
    storeId: string,
    storeName: string,
    startDate: Date,
    endDate: Date
  ): Promise<LogisticsFlowReport> {
    const filters: TraceabilityFilters = {
      storeIds: [storeId],
      dateRange: { start: startDate, end: endDate }
    };

    const movements = await this.getMovements(filters);

    // Calculate inbound flows
    const inboundFlows = {
      arrivals: movements.filter(m => m.type === 'arrivage').length,
      transfers: movements.filter(m => m.type === 'transfert_entree').length,
      adjustments: movements.filter(m => m.type === 'ajustement' && m.quantite > 0).length
    };

    // Calculate outbound flows
    const outboundFlows = {
      sales: movements.filter(m => m.type === 'vente').length,
      losses: movements.filter(m => m.type === 'perte').length,
      transfers: movements.filter(m => m.type === 'transfert_sortie').length
    };

    // Calculate net flow
    const totalInbound = inboundFlows.arrivals + inboundFlows.transfers + inboundFlows.adjustments;
    const totalOutbound = outboundFlows.sales + outboundFlows.losses + outboundFlows.transfers;
    const netFlow = totalInbound - totalOutbound;

    // Calculate flow efficiency
    const flowEfficiency = totalInbound > 0 ? ((totalInbound - outboundFlows.losses) / totalInbound) * 100 : 0;

    // Calculate average processing time (mock)
    const averageProcessingTime = Math.floor(Math.random() * 24) + 1;

    // Get top products
    const productMovements = new Map<string, { name: string; movements: number; netQuantity: number }>();
    movements.forEach(m => {
      const existing = productMovements.get(m.productId) || { 
        name: m.product.name, 
        movements: 0, 
        netQuantity: 0 
      };
      existing.movements++;
      existing.netQuantity += m.quantite;
      productMovements.set(m.productId, existing);
    });

    const topProducts = Array.from(productMovements.entries())
      .map(([productId, data]) => ({
        productId,
        productName: data.name,
        totalMovements: data.movements,
        netQuantity: data.netQuantity
      }))
      .sort((a, b) => b.totalMovements - a.totalMovements)
      .slice(0, 10);

    return {
      storeId,
      storeName,
      period: { start: startDate, end: endDate },
      inboundFlows,
      outboundFlows,
      netFlow,
      flowEfficiency,
      averageProcessingTime,
      topProducts,
      generatedAt: new Date()
    };
  }

  async exportToCSV(filters: TraceabilityFilters = {}): Promise<string> {
    const movements = await this.getMovements(filters);
    
    const headers = [
      'Date',
      'Type',
      'Magasin',
      'Produit',
      'Quantité',
      'Coût Unitaire',
      'Valeur',
      'Référence',
      'Type Référence',
      'Créé Par',
      'Commentaire'
    ];

    const rows = movements.map(m => [
      m.date.toLocaleDateString('fr-FR'),
      m.type,
      m.store.name,
      m.product.name,
      m.quantite.toString(),
      (m.coutUnitaire || 0).toString(),
      (m.valeur || 0).toString(),
      m.referenceId,
      m.referenceType,
      m.createdBy,
      m.commentaire || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }

  async exportToJSON(filters: TraceabilityFilters = {}): Promise<string> {
    const movements = await this.getMovements(filters);
    const report = await this.generateTraceabilityReport(filters);
    
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        totalMovements: movements.length,
        filters
      },
      report,
      movements: movements.map(m => ({
        ...m,
        date: m.date.toISOString(),
        createdAt: m.createdAt.toISOString()
      }))
    };

    return JSON.stringify(exportData, null, 2);
  }

  private async initializeMockData(): Promise<void> {
    try {
      // Load products
      this.mockProducts = await productService.getActiveProducts();
      
      // Generate mock movements
      this.mockMovements = this.generateMockMovements();
    } catch (error) {
      console.error('Error initializing mock data:', error);
      // Fallback to basic mock data
      this.mockProducts = [
        { id: '1', name: 'Thon Rouge', category: 'Poissons Frais' } as Product,
        { id: '2', name: 'Crevettes Roses', category: 'Crustacés' } as Product,
        { id: '3', name: 'Soles', category: 'Poissons Frais' } as Product,
        { id: '4', name: 'Pack Sardines', category: 'Conserves' } as Product
      ];
      this.mockMovements = this.generateMockMovements();
    }
  }

  private generateMockMovements(): MouvementStock[] {
    const movements: MouvementStock[] = [];
    const stores = [
      { id: 'store-1', name: 'Hub Distribution' },
      { id: 'store-2', name: 'Boutique Centre-Ville' },
      { id: 'store-3', name: 'Marché Sandaga' },
      { id: 'store-4', name: 'Point de Vente Almadies' }
    ];
    const users = ['user-1', 'user-2', 'user-3', 'user-4'];
    const types: Array<MouvementStock['type']> = [
      'arrivage', 'transfert_sortie', 'transfert_entree', 'vente', 'perte', 'ajustement'
    ];
    const referenceTypes = ['bon_reception', 'transfert', 'vente', 'perte', 'inventaire'];

    // Generate 200 mock movements over the last 60 days
    for (let i = 0; i < 200; i++) {
      const product = this.mockProducts[Math.floor(Math.random() * this.mockProducts.length)];
      const store = stores[Math.floor(Math.random() * stores.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const referenceType = referenceTypes[Math.floor(Math.random() * referenceTypes.length)];
      
      const date = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000);
      
      const quantity = type === 'perte' || type === 'vente' || type === 'transfert_sortie' 
        ? -(Math.floor(Math.random() * 20) + 1)
        : Math.floor(Math.random() * 50) + 1;
      
      const coutUnitaire = Math.floor(Math.random() * 5000) + 1000;
      const valeur = Math.abs(quantity) * coutUnitaire;

      movements.push({
        id: `movement-${i}`,
        date,
        type,
        storeId: store.id,
        store,
        productId: product.id,
        product,
        quantite: quantity,
        coutUnitaire,
        valeur,
        referenceId: `${referenceType.toUpperCase()}-${String(i).padStart(4, '0')}`,
        referenceType,
        createdBy: user,
        createdAt: date,
        commentaire: Math.random() > 0.7 ? `Commentaire automatique pour mouvement ${i}` : undefined
      });
    }

    return movements.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  private async detectAnomalies(movements: MouvementStock[]): Promise<TraceabilityAnomaly[]> {
    const anomalies: TraceabilityAnomaly[] = [];

    // Detect quantity mismatches (mock logic)
    const suspiciousMovements = movements.filter(m => Math.abs(m.quantite) > 100);
    suspiciousMovements.forEach((movement, index) => {
      if (Math.random() > 0.8) { // 20% chance of being flagged as anomaly
        anomalies.push({
          id: `anomaly-quantity-${index}`,
          type: 'quantity_mismatch',
          severity: Math.abs(movement.quantite) > 200 ? 'high' : 'medium',
          description: `Quantité inhabituelle détectée: ${Math.abs(movement.quantite)} unités pour ${movement.product.name}`,
          movementId: movement.id,
          detectedAt: new Date(),
          resolved: Math.random() > 0.6 // 40% chance of being resolved
        });
      }
    });

    // Detect timing anomalies (movements outside business hours)
    movements.forEach((movement, index) => {
      const hour = movement.date.getHours();
      if ((hour < 6 || hour > 22) && Math.random() > 0.9) { // 10% chance for off-hours movements
        anomalies.push({
          id: `anomaly-timing-${index}`,
          type: 'timing_anomaly',
          severity: 'low',
          description: `Mouvement enregistré en dehors des heures d'ouverture: ${movement.date.toLocaleString('fr-FR')}`,
          movementId: movement.id,
          detectedAt: new Date(),
          resolved: Math.random() > 0.5
        });
      }
    });

    // Detect potential duplicates (same product, store, quantity within 1 hour)
    for (let i = 0; i < movements.length - 1; i++) {
      const current = movements[i];
      const next = movements[i + 1];
      
      if (
        current.productId === next.productId &&
        current.storeId === next.storeId &&
        current.quantite === next.quantite &&
        Math.abs(current.date.getTime() - next.date.getTime()) < 60 * 60 * 1000 && // Within 1 hour
        Math.random() > 0.95 // 5% chance
      ) {
        anomalies.push({
          id: `anomaly-duplicate-${i}`,
          type: 'duplicate_movement',
          severity: 'medium',
          description: `Mouvements potentiellement dupliqués détectés pour ${current.product.name}`,
          movementId: current.id,
          detectedAt: new Date(),
          resolved: Math.random() > 0.7
        });
      }
    }

    return anomalies.slice(0, 10); // Limit to 10 anomalies
  }
}

export const traceabilityService = new TraceabilityService();