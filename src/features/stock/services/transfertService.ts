import { TransfertStock, LigneTransfert, TransfertStockSchema, StockLevel } from '../types';
import { Product } from '../../sales/types';
import { 
  generateTransferNumber,
  calculateTransferVariance
} from '../utils/stockCalculations';
import { validateTransfert, validateTransfertReception, ValidationResult } from '../utils/stockValidations';

export interface CreateTransfertData {
  storeSourceId: string;
  storeDestinationId: string;
  lignes: Array<{
    productId: string;
    quantiteEnvoyee: number;
  }>;
  commentaires?: string;
}

export interface ReceptionTransfertData {
  transfertId: string;
  lignesReception: Array<{
    productId: string;
    quantiteRecue: number;
    commentaire?: string;
  }>;
  commentairesReception?: string;
}

class TransfertService {
  private transferts: TransfertStock[] = [];
  private nextSequence = 1;

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock data will be populated when needed
    this.transferts = [];
  }

  /**
   * Get all transfers
   */
  async getAllTransferts(
    storeId?: string,
    status?: 'en_transit' | 'termine' | 'termine_avec_ecart',
    dateRange?: [Date, Date]
  ): Promise<TransfertStock[]> {
    let transferts = [...this.transferts];

    // Filter by store (source or destination)
    if (storeId) {
      transferts = transferts.filter(transfert => 
        transfert.storeSourceId === storeId || transfert.storeDestinationId === storeId
      );
    }

    // Filter by status
    if (status) {
      transferts = transferts.filter(transfert => transfert.status === status);
    }

    // Filter by date range
    if (dateRange) {
      const [startDate, endDate] = dateRange;
      transferts = transferts.filter(transfert => 
        transfert.dateCreation >= startDate && transfert.dateCreation <= endDate
      );
    }

    // Sort by date (most recent first)
    return transferts.sort((a, b) => b.dateCreation.getTime() - a.dateCreation.getTime());
  }

  /**
   * Get transfer by ID
   */
  async getTransfertById(id: string): Promise<TransfertStock | null> {
    const transfert = this.transferts.find(t => t.id === id);
    return transfert || null;
  }

  /**
   * Get pending transfers for a destination store
   */
  async getPendingTransferts(storeDestinationId: string): Promise<TransfertStock[]> {
    return this.transferts.filter(transfert => 
      transfert.storeDestinationId === storeDestinationId && 
      transfert.status === 'en_transit'
    );
  }

  /**
   * Create new transfer
   */
  async createTransfert(
    data: CreateTransfertData,
    createdBy: string,
    storeSource: { id: string; name: string },
    storeDestination: { id: string; name: string },
    products: Product[],
    stockLevels: StockLevel[]
  ): Promise<TransfertStock> {
    // Validate input data
    const validation = this.validateTransfertData(data, stockLevels);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Generate transfer number
    const currentYear = new Date().getFullYear();
    const numero = generateTransferNumber(currentYear, this.nextSequence++);

    // Create lines
    const lignes: LigneTransfert[] = data.lignes.map((ligneData, index) => {
      const product = products.find(p => p.id === ligneData.productId);
      if (!product) {
        throw new Error(`Produit non trouvé: ${ligneData.productId}`);
      }

      return {
        id: `ligne-transfert-${Date.now()}-${index}`,
        transfertId: '', // Will be set after creating the transfer
        productId: ligneData.productId,
        product,
        quantiteEnvoyee: ligneData.quantiteEnvoyee
      };
    });

    // Create transfer
    const transfert: TransfertStock = {
      id: `transfert-${Date.now()}`,
      numero,
      dateCreation: new Date(),
      storeSourceId: data.storeSourceId,
      storeSource,
      storeDestinationId: data.storeDestinationId,
      storeDestination,
      lignes: [],
      status: 'en_transit',
      createdBy,
      createdAt: new Date(),
      commentaires: data.commentaires
    };

    // Set transfertId for lines
    lignes.forEach(ligne => {
      ligne.transfertId = transfert.id;
    });
    transfert.lignes = lignes;

    // Validate with schema
    const validatedTransfert = TransfertStockSchema.parse(transfert) as TransfertStock;

    // Add to collection
    this.transferts.push(validatedTransfert);

    // Here we would also:
    // 1. Decrement source store stock
    // 2. Set reserved quantity for destination
    // 3. Create stock movements
    // This will be handled by the stock service

    return validatedTransfert;
  }

  /**
   * Receive transfer
   */
  async receiveTransfert(
    data: ReceptionTransfertData,
    receptionneBy: string
  ): Promise<TransfertStock> {
    const transfert = await this.getTransfertById(data.transfertId);
    
    if (!transfert) {
      throw new Error('Transfert non trouvé');
    }

    if (transfert.status !== 'en_transit') {
      throw new Error('Le transfert doit être en transit pour être réceptionné');
    }

    // Validate reception data
    const validation = validateTransfertReception(transfert, data.lignesReception);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Update transfer lines with received quantities
    const updatedLignes = transfert.lignes.map(ligne => {
      const receptionLigne = data.lignesReception.find(r => r.productId === ligne.productId);
      
      if (receptionLigne) {
        const ecart = calculateTransferVariance(ligne.quantiteEnvoyee, receptionLigne.quantiteRecue);
        
        return {
          ...ligne,
          quantiteRecue: receptionLigne.quantiteRecue,
          ecart,
          commentaire: receptionLigne.commentaire
        };
      }
      
      return ligne;
    });

    // Determine final status
    const hasVariances = updatedLignes.some(ligne => 
      ligne.ecart !== undefined && Math.abs(ligne.ecart) > 0.01
    );
    
    const finalStatus: 'termine' | 'termine_avec_ecart' = hasVariances ? 'termine_avec_ecart' : 'termine';

    // Update transfer
    const updatedTransfert: TransfertStock = {
      ...transfert,
      lignes: updatedLignes,
      status: finalStatus,
      receptionneBy,
      receptionneAt: new Date(),
      commentairesReception: data.commentairesReception
    };

    // Update in collection
    const index = this.transferts.findIndex(t => t.id === data.transfertId);
    this.transferts[index] = updatedTransfert;

    // Here we would also:
    // 1. Increment destination store stock with received quantities
    // 2. Record losses in transit if any
    // 3. Create stock movements
    // This will be handled by the stock service

    return updatedTransfert;
  }

  /**
   * Cancel transfer (only if in transit)
   */
  async cancelTransfert(id: string, cancelledBy: string, reason?: string): Promise<TransfertStock> {
    const transfert = await this.getTransfertById(id);
    
    if (!transfert) {
      throw new Error('Transfert non trouvé');
    }

    if (transfert.status !== 'en_transit') {
      throw new Error('Seuls les transferts en transit peuvent être annulés');
    }

    // For now, we'll just mark as cancelled in comments
    // In a real implementation, we'd have a 'cancelled' status
    const updatedTransfert: TransfertStock = {
      ...transfert,
      commentaires: `${transfert.commentaires || ''}\nANNULÉ par ${cancelledBy}: ${reason || 'Aucune raison spécifiée'}`
    };

    // Update in collection
    const index = this.transferts.findIndex(t => t.id === id);
    this.transferts[index] = updatedTransfert;

    // Here we would also:
    // 1. Restore source store stock
    // 2. Remove reserved quantity
    // 3. Create reversal stock movements
    // This will be handled by the stock service

    return updatedTransfert;
  }

  /**
   * Get transfers by source store
   */
  async getTransfertsBySource(storeSourceId: string, dateRange?: [Date, Date]): Promise<TransfertStock[]> {
    return this.getAllTransferts(storeSourceId, undefined, dateRange)
      .then(transferts => transferts.filter(t => t.storeSourceId === storeSourceId));
  }

  /**
   * Get transfers by destination store
   */
  async getTransfertsByDestination(storeDestinationId: string, dateRange?: [Date, Date]): Promise<TransfertStock[]> {
    return this.getAllTransferts(storeDestinationId, undefined, dateRange)
      .then(transferts => transferts.filter(t => t.storeDestinationId === storeDestinationId));
  }

  /**
   * Get transfer statistics
   */
  async getTransfertStats(
    storeId?: string,
    dateRange?: [Date, Date]
  ): Promise<{
    totalTransferts: number;
    enTransit: number;
    termines: number;
    terminesAvecEcart: number;
    totalQuantityTransferred: number;
    averageVariance: number;
  }> {
    const transferts = await this.getAllTransferts(storeId, undefined, dateRange);
    
    const totalQuantityTransferred = transferts
      .flatMap(t => t.lignes)
      .reduce((sum, ligne) => sum + ligne.quantiteEnvoyee, 0);

    const completedTransferts = transferts.filter(t => 
      t.status === 'termine' || t.status === 'termine_avec_ecart'
    );

    const totalVariance = completedTransferts
      .flatMap(t => t.lignes)
      .filter(ligne => ligne.ecart !== undefined)
      .reduce((sum, ligne) => sum + Math.abs(ligne.ecart!), 0);

    const totalCompletedLines = completedTransferts
      .flatMap(t => t.lignes)
      .filter(ligne => ligne.ecart !== undefined).length;

    return {
      totalTransferts: transferts.length,
      enTransit: transferts.filter(t => t.status === 'en_transit').length,
      termines: transferts.filter(t => t.status === 'termine').length,
      terminesAvecEcart: transferts.filter(t => t.status === 'termine_avec_ecart').length,
      totalQuantityTransferred,
      averageVariance: totalCompletedLines > 0 ? totalVariance / totalCompletedLines : 0
    };
  }

  /**
   * Search transfers
   */
  async searchTransferts(
    query: string,
    storeId?: string,
    status?: 'en_transit' | 'termine' | 'termine_avec_ecart'
  ): Promise<TransfertStock[]> {
    const transferts = await this.getAllTransferts(storeId, status);
    
    if (!query.trim()) {
      return transferts;
    }

    const searchTerm = query.toLowerCase();
    return transferts.filter(transfert =>
      transfert.numero.toLowerCase().includes(searchTerm) ||
      transfert.storeSource.name.toLowerCase().includes(searchTerm) ||
      transfert.storeDestination.name.toLowerCase().includes(searchTerm) ||
      transfert.commentaires?.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Get variance report
   */
  async getVarianceReport(
    dateRange?: [Date, Date],
    storeId?: string
  ): Promise<Array<{
    transfertId: string;
    numero: string;
    dateCreation: Date;
    storeSource: string;
    storeDestination: string;
    productName: string;
    quantiteEnvoyee: number;
    quantiteRecue: number;
    ecart: number;
    ecartPercentage: number;
  }>> {
    const transferts = await this.getAllTransferts(storeId, undefined, dateRange);
    
    const completedTransferts = transferts.filter(t => 
      t.status === 'termine' || t.status === 'termine_avec_ecart'
    );

    const report: Array<{
      transfertId: string;
      numero: string;
      dateCreation: Date;
      storeSource: string;
      storeDestination: string;
      productName: string;
      quantiteEnvoyee: number;
      quantiteRecue: number;
      ecart: number;
      ecartPercentage: number;
    }> = [];

    completedTransferts.forEach(transfert => {
      transfert.lignes.forEach(ligne => {
        if (ligne.quantiteRecue !== undefined && ligne.ecart !== undefined) {
          const ecartPercentage = ligne.quantiteEnvoyee > 0 
            ? (Math.abs(ligne.ecart) / ligne.quantiteEnvoyee) * 100 
            : 0;

          report.push({
            transfertId: transfert.id,
            numero: transfert.numero,
            dateCreation: transfert.dateCreation,
            storeSource: transfert.storeSource.name,
            storeDestination: transfert.storeDestination.name,
            productName: ligne.product.name,
            quantiteEnvoyee: ligne.quantiteEnvoyee,
            quantiteRecue: ligne.quantiteRecue,
            ecart: ligne.ecart,
            ecartPercentage
          });
        }
      });
    });

    return report.sort((a, b) => Math.abs(b.ecartPercentage) - Math.abs(a.ecartPercentage));
  }

  /**
   * Validate transfer data
   */
  private validateTransfertData(data: CreateTransfertData, stockLevels: StockLevel[]): ValidationResult {
    return validateTransfert({
      storeSourceId: data.storeSourceId,
      storeDestinationId: data.storeDestinationId,
      lignes: data.lignes.map(ligne => ({
        id: '',
        transfertId: '',
        productId: ligne.productId,
        product: {} as Product,
        quantiteEnvoyee: ligne.quantiteEnvoyee
      }))
    } as Partial<TransfertStock>, stockLevels);
  }

  /**
   * Get next sequence number for transfer numbering
   */
  private getNextSequence(): number {
    return this.nextSequence++;
  }
}

export const transfertService = new TransfertService();