import { BonReception, LigneReception } from '../types';
import { Product } from '../../sales/types';

// Interface simplifiée pour créer un bon de réception
export interface CreateSimpleBonReceptionData {
  dateReception: Date;
  nomFournisseur: string; // Nom simple au lieu d'un ID fournisseur
  storeId: string;
  lignes: Array<{
    productId: string;
    quantiteRecue: number;
    coutUnitaire: number;
  }>;
  commentaires?: string;
}

// Interface pour le bon de réception simplifié
export interface SimpleBonReception {
  id: string;
  numero: string;
  dateReception: Date;
  nomFournisseur: string; // Nom simple
  storeId: string;
  store: { id: string; name: string };
  lignes: SimpleLigneReception[];
  totalValue: number;
  status: 'draft' | 'validated';
  createdBy: string;
  createdAt: Date;
  validatedBy?: string;
  validatedAt?: Date;
  commentaires?: string;
}

export interface SimpleLigneReception {
  id: string;
  bonReceptionId: string;
  productId: string;
  product: Product;
  quantiteRecue: number;
  coutUnitaire: number;
  sousTotal: number;
}

class SimpleBonReceptionService {
  private bonsReception: SimpleBonReception[] = [];
  private nextSequence = 1;

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Données de test
    this.bonsReception = [];
  }

  /**
   * Générer un numéro de bon automatique
   */
  private generateBonNumber(): string {
    const year = new Date().getFullYear();
    const sequence = this.nextSequence++;
    return `BR-${year}-${sequence.toString().padStart(4, '0')}`;
  }

  /**
   * Calculer le sous-total d'une ligne
   */
  private calculateSousTotal(quantite: number, coutUnitaire: number): number {
    return quantite * coutUnitaire;
  }

  /**
   * Calculer le total d'un bon
   */
  private calculateTotal(lignes: SimpleLigneReception[]): number {
    return lignes.reduce((total, ligne) => total + ligne.sousTotal, 0);
  }

  /**
   * Créer un nouveau bon de réception
   */
  async createBonReception(
    data: CreateSimpleBonReceptionData,
    createdBy: string,
    products: Product[],
    stores: Array<{ id: string; name: string }>
  ): Promise<SimpleBonReception> {
    // Validation des données
    if (!data.nomFournisseur.trim()) {
      throw new Error('Le nom du fournisseur est requis');
    }

    if (!data.lignes || data.lignes.length === 0) {
      throw new Error('Au moins une ligne de produit est requise');
    }

    // Vérifier que tous les produits existent
    for (const ligne of data.lignes) {
      const product = products.find(p => p.id === ligne.productId);
      if (!product) {
        throw new Error(`Produit non trouvé: ${ligne.productId}`);
      }

      if (ligne.quantiteRecue <= 0) {
        throw new Error('La quantité reçue doit être positive');
      }

      if (ligne.coutUnitaire <= 0) {
        throw new Error('Le coût unitaire doit être positif');
      }
    }

    // Trouver le magasin
    const store = stores.find(s => s.id === data.storeId);
    if (!store) {
      throw new Error('Magasin non trouvé');
    }

    // Générer l'ID et le numéro
    const bonId = `bon-${Date.now()}`;
    const numero = this.generateBonNumber();

    // Créer les lignes
    const lignes: SimpleLigneReception[] = data.lignes.map((ligneData, index) => {
      const product = products.find(p => p.id === ligneData.productId)!;
      const sousTotal = this.calculateSousTotal(ligneData.quantiteRecue, ligneData.coutUnitaire);

      return {
        id: `ligne-${bonId}-${index}`,
        bonReceptionId: bonId,
        productId: ligneData.productId,
        product,
        quantiteRecue: ligneData.quantiteRecue,
        coutUnitaire: ligneData.coutUnitaire,
        sousTotal
      };
    });

    // Calculer le total
    const totalValue = this.calculateTotal(lignes);

    // Créer le bon
    const bonReception: SimpleBonReception = {
      id: bonId,
      numero,
      dateReception: data.dateReception,
      nomFournisseur: data.nomFournisseur.trim(),
      storeId: data.storeId,
      store,
      lignes,
      totalValue,
      status: 'draft',
      createdBy,
      createdAt: new Date(),
      commentaires: data.commentaires?.trim()
    };

    // Ajouter à la collection
    this.bonsReception.push(bonReception);

    return bonReception;
  }

  /**
   * Valider un bon de réception
   */
  async validateBonReception(id: string, validatedBy: string): Promise<SimpleBonReception> {
    const bon = this.bonsReception.find(b => b.id === id);
    
    if (!bon) {
      throw new Error('Bon de réception non trouvé');
    }

    if (bon.status === 'validated') {
      throw new Error('Bon de réception déjà validé');
    }

    // Mettre à jour le statut
    bon.status = 'validated';
    bon.validatedBy = validatedBy;
    bon.validatedAt = new Date();

    // TODO: Ici on mettrait à jour les stocks et calculerait le CUMP
    // await this.updateStockFromReception(bon);

    return bon;
  }

  /**
   * Obtenir tous les bons de réception
   */
  async getAllBonsReception(
    storeId?: string,
    status?: 'draft' | 'validated'
  ): Promise<SimpleBonReception[]> {
    let bons = [...this.bonsReception];

    // Filtrer par magasin
    if (storeId) {
      bons = bons.filter(bon => bon.storeId === storeId);
    }

    // Filtrer par statut
    if (status) {
      bons = bons.filter(bon => bon.status === status);
    }

    // Trier par date (plus récent en premier)
    return bons.sort((a, b) => b.dateReception.getTime() - a.dateReception.getTime());
  }

  /**
   * Obtenir un bon par ID
   */
  async getBonReceptionById(id: string): Promise<SimpleBonReception | null> {
    const bon = this.bonsReception.find(b => b.id === id);
    return bon || null;
  }

  /**
   * Rechercher des bons de réception
   */
  async searchBonsReception(
    query: string,
    storeId?: string,
    status?: 'draft' | 'validated'
  ): Promise<SimpleBonReception[]> {
    const bons = await this.getAllBonsReception(storeId, status);
    
    if (!query.trim()) {
      return bons;
    }

    const searchTerm = query.toLowerCase();
    return bons.filter(bon =>
      bon.numero.toLowerCase().includes(searchTerm) ||
      bon.nomFournisseur.toLowerCase().includes(searchTerm) ||
      bon.commentaires?.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Supprimer un bon de réception (seulement si brouillon)
   */
  async deleteBonReception(id: string): Promise<void> {
    const bonIndex = this.bonsReception.findIndex(b => b.id === id);
    
    if (bonIndex === -1) {
      throw new Error('Bon de réception non trouvé');
    }

    const bon = this.bonsReception[bonIndex];
    if (bon.status === 'validated') {
      throw new Error('Impossible de supprimer un bon de réception validé');
    }

    this.bonsReception.splice(bonIndex, 1);
  }

  /**
   * Obtenir les statistiques des bons de réception
   */
  async getReceptionStats(
    storeId?: string,
    dateRange?: [Date, Date]
  ): Promise<{
    totalBons: number;
    draftBons: number;
    validatedBons: number;
    totalValue: number;
    averageValue: number;
  }> {
    let bons = await this.getAllBonsReception(storeId);

    // Filtrer par période si spécifiée
    if (dateRange) {
      const [startDate, endDate] = dateRange;
      bons = bons.filter(bon => 
        bon.dateReception >= startDate && bon.dateReception <= endDate
      );
    }

    const validatedBons = bons.filter(bon => bon.status === 'validated');
    const totalValue = validatedBons.reduce((sum, bon) => sum + bon.totalValue, 0);

    return {
      totalBons: bons.length,
      draftBons: bons.filter(bon => bon.status === 'draft').length,
      validatedBons: validatedBons.length,
      totalValue,
      averageValue: validatedBons.length > 0 ? totalValue / validatedBons.length : 0
    };
  }

  /**
   * Calculer l'impact CUMP d'un bon de réception
   */
  async calculateCUMPImpact(
    bonReceptionId: string,
    currentStockLevels: Array<{ productId: string; quantity: number; averageCost: number }>
  ): Promise<Array<{ productId: string; newAverageCost: number; oldAverageCost: number }>> {
    const bon = await this.getBonReceptionById(bonReceptionId);
    
    if (!bon) {
      throw new Error('Bon de réception non trouvé');
    }

    return bon.lignes.map(ligne => {
      const currentStock = currentStockLevels.find(stock => stock.productId === ligne.productId);
      const currentQuantity = currentStock?.quantity || 0;
      const currentCUMP = currentStock?.averageCost || 0;

      // Formule CUMP : (Stock_Ancien × CUMP_Ancien + Quantité_Reçue × Coût_Unitaire) / (Stock_Ancien + Quantité_Reçue)
      const newCUMP = currentQuantity > 0 
        ? (currentQuantity * currentCUMP + ligne.quantiteRecue * ligne.coutUnitaire) / (currentQuantity + ligne.quantiteRecue)
        : ligne.coutUnitaire;

      return {
        productId: ligne.productId,
        newAverageCost: Math.round(newCUMP * 100) / 100, // Arrondir à 2 décimales
        oldAverageCost: currentCUMP
      };
    });
  }

  /**
   * Mettre à jour les stocks à partir d'un bon de réception validé
   */
  private async updateStockFromReception(bon: SimpleBonReception): Promise<void> {
    // TODO: Implémenter la mise à jour des stocks
    // Cette méthode devrait :
    // 1. Incrémenter les quantités en stock pour chaque produit
    // 2. Mettre à jour le CUMP de chaque produit
    // 3. Créer des mouvements de stock
    // 4. Enregistrer l'historique
    
    console.log('Mise à jour des stocks pour le bon:', bon.numero);
    console.log('Lignes à traiter:', bon.lignes);
  }
}

export const simpleBonReceptionService = new SimpleBonReceptionService();