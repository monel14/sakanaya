import { 
  SalesReportData, 
  PerformanceReportData, 
  PriceImpactReportData,
  ReportFilters
} from '../types';
import { realMCPReportsService } from './realMCPReportsService';

/**
 * Service principal pour la génération de rapports
 * Utilise le service MCP pour récupérer les données de Supabase
 */
class ReportsService {
  // Utilise le service MCP réel pour les données
  private mcpService = realMCPReportsService;

  /**
   * Génère un rapport des ventes
   */
  async generateSalesReport(filters: ReportFilters): Promise<SalesReportData> {
    return await this.mcpService.generateSalesReport(filters);
  }

  /**
   * Génère un rapport de performance des employés
   */
  async generatePerformanceReport(filters: ReportFilters): Promise<PerformanceReportData> {
    return await this.mcpService.generatePerformanceReport(filters);
  }

  /**
   * Génère un rapport d'impact des prix
   */
  async generatePriceImpactReport(filters: ReportFilters): Promise<PriceImpactReportData> {
    return await this.mcpService.generatePriceImpactReport(filters);
  }
}

export const reportsService = new ReportsService();