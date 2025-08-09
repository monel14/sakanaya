import { Inventaire, LigneInventaire, InventaireStatusSchema, StockLevel } from '../types';
import { Product } from '../../sales/types';
import { 
  generateInventoryNumber,
  calculateInventoryVariance,
  calculateInventoryVarianceValue,
  calculateInventoryTotalVariance,
  calculateInventoryTotalVarianceValue
} from '../utils/stockCalculations';
import { validateInventaire, ValidationResult } from '../utils/stockValidations';

export interface CreateInventaireData {
  date: Date;
  storeId: string;
  commentaires?: string;
}

export interface UpdateInventaireData {
  inventaireId: string;
  lignes: Array<{
    productId: string;
    quantitePhysique: number;
    commentaire?: string;
  }>;
  commentaires?: string;
}

class InventaireService {
  private inventaires: Inventaire[] = [];
  private nextSequence = 1;

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock data will be populated when needed
    this.inventaires = [];
  }

  /**
   * Get all inventories
   */
  async getAllInventaires(
    storeId?: string,
    status?: 'en_cours' | 'en_attente_validation' | 'valide',
    dateRange?: [Date, Date]
  ): Promise<Inventaire[]> {
    let inventaires = [...this.inventaires];

    // Filter by store
    if (storeId) {
      inventaires = inventaires.filter(inv => inv.storeId === storeId);
    }

    // Filter by status
    if (status) {
      inventaires = inventaires.filter(inv => inv.status === status);
    }

    // Filter by date range
    if (dateRange) {
      const [startDate, endDate] = dateRange;
      inventaires = inventaires.filter(inv => 
        inv.date >= startDate && inv.date <= endDate
      );
    }

    // Sort by date (most recent first)
    return inventaires.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * Get inventory by ID
   */
  async getInventaireById(id: string): Promise<Inventaire | null> {
    const inventaire = this.inventaires.find(inv => inv.id === id);
    return inventaire || null;
  }

  /**
   * Get pending inventories for validation
   */
  async getPendingInventaires(): Promise<Inventaire[]> {
    return this.inventaires.filter(inv => inv.status === 'en_attente_validation');
  }

  /**
   * Create new inventory
   */
  async createInventaire(
    data: CreateInventaireData,
    createdBy: string,
    store: { id: string; name: string },
    stockLevels: StockLevel[],
    products: Product[]
  ): Promise<Inventaire> {
    // Generate inventory number
    const currentYear = new Date().getFullYear();
    const numero = generateInventoryNumber(currentYear, this.nextSequence++);

    // Create lines from current stock levels
    const lignes: LigneInventaire[] = stockLevels
      .filter(stock => stock.storeId === data.storeId && stock.quantity > 0)
      .map((stock, index) => {
        const product = products.find(p => p.id === stock.productId);
        if (!product) {
          throw new Error(`Produit non trouvé: ${stock.productId}`);
        }

        return {
          id: `ligne-inventaire-${Date.now()}-${index}`,
          inventaireId: '', // Will be set after creating the inventory
          productId: stock.productId,
          product,
          quantiteTheorique: stock.quantity
        };
      });

    // Create inventory
    const inventaire: Inventaire = {
      id: `inventaire-${Date.now()}`,
      numero,
      date: data.date,
      storeId: data.storeId,
      store,
      lignes: [],
      status: 'en_cours',
      totalEcarts: 0,
      valeurEcarts: 0,
      createdBy,
      createdAt: new Date(),
      commentaires: data.commentaires
    };

    // Set inventaireId for lines
    lignes.forEach(ligne => {
      ligne.inventaireId = inventaire.id;
    });
    inventaire.lignes = lignes;

    // Add to collection
    this.inventaires.push(inventaire);

    return inventaire;
  }

  /**
   * Update inventory with physical counts
   */
  async updateInventaire(data: UpdateInventaireData, updatedBy: string): Promise<Inventaire> {
    const inventaire = await this.getInventaireById(data.inventaireId);
    
    if (!inventaire) {
      throw new Error('Inventaire non trouvé');
    }

    if (inventaire.status === 'valide') {
      throw new Error('Impossible de modifier un inventaire validé');
    }

    // Update lines with physical quantities
    const updatedLignes = inventaire.lignes.map(ligne => {
      const updateData = data.lignes.find(l => l.productId === ligne.productId);
      
      if (updateData) {
        const ecart = calculateInventoryVariance(ligne.quantiteTheorique, updateData.quantitePhysique);
        const valeurEcart = calculateInventoryVarianceValue(ecart, ligne.product.averageCost || 0);
        
        return {
          ...ligne,
          quantitePhysique: updateData.quantitePhysique,
          ecart,
          valeurEcart,
          commentaire: updateData.commentaire
        };
      }
      
      return ligne;
    });

    // Calculate totals
    const totalEcarts = calculateInventoryTotalVariance(updatedLignes);
    const valeurEcarts = calculateInventoryTotalVarianceValue(
      updatedLignes.map(ligne => ({
        quantiteTheorique: ligne.quantiteTheorique,
        quantitePhysique: ligne.quantitePhysique,
        product: { averageCost: ligne.product.averageCost || 0 }
      }))
    );

    // Update inventory
    const updatedInventaire: Inventaire = {
      ...inventaire,
      lignes: updatedLignes,
      totalEcarts,
      valeurEcarts,
      commentaires: data.commentaires !== undefined ? data.commentaires : inventaire.commentaires
    };

    // Update in collection
    const index = this.inventaires.findIndex(inv => inv.id === data.inventaireId);
    this.inventaires[index] = updatedInventaire;

    return updatedInventaire;
  }

  /**
   * Submit inventory for validation
   */
  async submitInventaire(id: string, submittedBy: string): Promise<Inventaire> {
    const inventaire = await this.getInventaireById(id);
    
    if (!inventaire) {
      throw new Error('Inventaire non trouvé');
    }

    if (inventaire.status !== 'en_cours') {
      throw new Error('Seuls les inventaires en cours peuvent être soumis');
    }

    // Check that all lines have physical quantities
    const incompleteLines = inventaire.lignes.filter(ligne => ligne.quantitePhysique === undefined);
    if (incompleteLines.length > 0) {
      throw new Error(`${incompleteLines.length} ligne(s) n'ont pas de quantité physique saisie`);
    }

    // Validate inventory
    const validation = validateInventaire(inventaire);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Update status
    const updatedInventaire: Inventaire = {
      ...inventaire,
      status: 'en_attente_validation'
    };

    // Update in collection
    const index = this.inventaires.findIndex(inv => inv.id === id);
    this.inventaires[index] = updatedInventaire;

    return updatedInventaire;
  }

  /**
   * Validate inventory (Director only)
   */
  async validateInventaire(id: string, validatedBy: string): Promise<Inventaire> {
    const inventaire = await this.getInventaireById(id);
    
    if (!inventaire) {
      throw new Error('Inventaire non trouvé');
    }

    if (inventaire.status !== 'en_attente_validation') {
      throw new Error('L\'inventaire doit être en attente de validation');
    }

    // Update status
    const validatedInventaire: Inventaire = {
      ...inventaire,
      status: 'valide',
      validatedBy,
      validatedAt: new Date()
    };

    // Update in collection
    const index = this.inventaires.findIndex(inv => inv.id === id);
    this.inventaires[index] = validatedInventaire;

    // Here we would also:
    // 1. Create stock adjustment movements
    // 2. Update stock levels to match physical quantities
    // 3. Record variances as losses/gains
    // This will be handled by the stock service

    return validatedInventaire;
  }

  /**
   * Reject inventory (Director only)
   */
  async rejectInventaire(id: string, rejectedBy: string, reason: string): Promise<Inventaire> {
    const inventaire = await this.getInventaireById(id);
    
    if (!inventaire) {
      throw new Error('Inventaire non trouvé');
    }

    if (inventaire.status !== 'en_attente_validation') {
      throw new Error('L\'inventaire doit être en attente de validation');
    }

    // Return to in progress status with rejection reason
    const rejectedInventaire: Inventaire = {
      ...inventaire,
      status: 'en_cours',
      commentaires: `${inventaire.commentaires || ''}\nREJETÉ par ${rejectedBy}: ${reason}`
    };

    // Update in collection
    const index = this.inventaires.findIndex(inv => inv.id === id);
    this.inventaires[index] = rejectedInventaire;

    return rejectedInventaire;
  }

  /**
   * Delete inventory (only if in progress)
   */
  async deleteInventaire(id: string): Promise<void> {
    const inventaire = await this.getInventaireById(id);
    
    if (!inventaire) {
      throw new Error('Inventaire non trouvé');
    }

    if (inventaire.status === 'valide') {
      throw new Error('Impossible de supprimer un inventaire validé');
    }

    // Remove from collection
    const index = this.inventaires.findIndex(inv => inv.id === id);
    this.inventaires.splice(index, 1);
  }

  /**
   * Get inventory statistics
   */
  async getInventaireStats(
    storeId?: string,
    dateRange?: [Date, Date]
  ): Promise<{
    totalInventaires: number;
    enCours: number;
    enAttenteValidation: number;
    valides: number;
    totalVarianceValue: number;
    averageVariancePercentage: number;
  }> {
    const inventaires = await this.getAllInventaires(storeId, undefined, dateRange);
    
    const validatedInventaires = inventaires.filter(inv => inv.status === 'valide');
    const totalVarianceValue = validatedInventaires.reduce((sum, inv) => sum + Math.abs(inv.valeurEcarts), 0);
    
    // Calculate average variance percentage
    const totalTheoreticalValue = validatedInventaires.reduce((sum, inv) => {
      return sum + inv.lignes.reduce((lineSum, ligne) => {
        return lineSum + (ligne.quantiteTheorique * (ligne.product.averageCost || 0));
      }, 0);
    }, 0);
    
    const averageVariancePercentage = totalTheoreticalValue > 0 
      ? (totalVarianceValue / totalTheoreticalValue) * 100 
      : 0;

    return {
      totalInventaires: inventaires.length,
      enCours: inventaires.filter(inv => inv.status === 'en_cours').length,
      enAttenteValidation: inventaires.filter(inv => inv.status === 'en_attente_validation').length,
      valides: validatedInventaires.length,
      totalVarianceValue,
      averageVariancePercentage
    };
  }

  /**
   * Get variance analysis
   */
  async getVarianceAnalysis(
    inventaireId: string
  ): Promise<{
    totalLines: number;
    linesWithVariance: number;
    positiveVariances: number;
    negativeVariances: number;
    significantVariances: number; // > 5%
    topVariances: Array<{
      productName: string;
      theoreticalQuantity: number;
      physicalQuantity: number;
      variance: number;
      variancePercentage: number;
      varianceValue: number;
    }>;
  }> {
    const inventaire = await this.getInventaireById(inventaireId);
    
    if (!inventaire) {
      throw new Error('Inventaire non trouvé');
    }

    const linesWithPhysical = inventaire.lignes.filter(ligne => 
      ligne.quantitePhysique !== undefined && ligne.ecart !== undefined
    );

    const linesWithVariance = linesWithPhysical.filter(ligne => 
      Math.abs(ligne.ecart!) > 0.01
    );

    const positiveVariances = linesWithVariance.filter(ligne => ligne.ecart! > 0).length;
    const negativeVariances = linesWithVariance.filter(ligne => ligne.ecart! < 0).length;

    const significantVariances = linesWithVariance.filter(ligne => {
      const variancePercentage = ligne.quantiteTheorique > 0 
        ? Math.abs(ligne.ecart!) / ligne.quantiteTheorique * 100 
        : 0;
      return variancePercentage > 5;
    }).length;

    // Top 10 variances by absolute percentage
    const topVariances = linesWithVariance
      .map(ligne => {
        const variancePercentage = ligne.quantiteTheorique > 0 
          ? (ligne.ecart! / ligne.quantiteTheorique) * 100 
          : 0;
        
        return {
          productName: ligne.product.name,
          theoreticalQuantity: ligne.quantiteTheorique,
          physicalQuantity: ligne.quantitePhysique!,
          variance: ligne.ecart!,
          variancePercentage,
          varianceValue: ligne.valeurEcart || 0
        };
      })
      .sort((a, b) => Math.abs(b.variancePercentage) - Math.abs(a.variancePercentage))
      .slice(0, 10);

    return {
      totalLines: inventaire.lignes.length,
      linesWithVariance: linesWithVariance.length,
      positiveVariances,
      negativeVariances,
      significantVariances,
      topVariances
    };
  }

  /**
   * Search inventories
   */
  async searchInventaires(
    query: string,
    storeId?: string,
    status?: 'en_cours' | 'en_attente_validation' | 'valide'
  ): Promise<Inventaire[]> {
    const inventaires = await this.getAllInventaires(storeId, status);
    
    if (!query.trim()) {
      return inventaires;
    }

    const searchTerm = query.toLowerCase();
    return inventaires.filter(inventaire =>
      inventaire.numero.toLowerCase().includes(searchTerm) ||
      inventaire.store.name.toLowerCase().includes(searchTerm) ||
      inventaire.commentaires?.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Get inventory completion percentage
   */
  async getInventaireCompletion(id: string): Promise<number> {
    const inventaire = await this.getInventaireById(id);
    
    if (!inventaire) {
      return 0;
    }

    const totalLines = inventaire.lignes.length;
    const completedLines = inventaire.lignes.filter(ligne => 
      ligne.quantitePhysique !== undefined
    ).length;

    return totalLines > 0 ? (completedLines / totalLines) * 100 : 0;
  }

  /**
   * Get next sequence number for inventory numbering
   */
  private getNextSequence(): number {
    return this.nextSequence++;
  }
}

export const inventaireService = new InventaireService();