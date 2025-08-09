import { BonReception, LigneReception } from '../types';
import { 
  validateBonReception, 
  validateBonReceptionDraft, 
  validateForAutoSave,
  ValidationResult,
  StockValidationError 
} from '../utils/stockValidations';
import { 
  calculateLigneReceptionSousTotal,
  generateBonReceptionNumber
} from '../utils/stockCalculations';
import { stockService } from '@/shared/services/stockService';

export interface BonReceptionForm {
  id?: string;
  supplierId: string;
  storeId: string;
  dateReception: Date;
  lignes: LigneReceptionForm[];
  commentaires?: string;
}

export interface LigneReceptionForm {
  id?: string;
  productId: string;
  quantiteRecue: number;
  coutUnitaire: number;
  sousTotal?: number; // Calculated automatically
}

export interface BonReceptionSaveResult {
  success: boolean;
  bonReception?: BonReception;
  errors?: StockValidationError[];
  warnings?: StockValidationError[];
}

export interface AutoSaveData {
  formData: BonReceptionForm;
  lastSaved: Date;
  isDirty: boolean;
}

class BonReceptionService {
  private bonsReception: BonReception[] = [];
  private autoSaveData: Map<string, AutoSaveData> = new Map();
  private nextSequence = 1;

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize with some mock data for testing
    const mockBon: BonReception = {
      id: 'bon-1',
      numero: 'BR-2024-0001',
      dateReception: new Date(),
      supplierId: 'supplier-1',
      supplier: {
        id: 'supplier-1',
        name: 'Fournisseur Test',
        contact: 'Jean Dupont',
        phone: '+221 77 123 45 67',
        email: 'contact@fournisseur-test.com',
        isActive: true,
        createdAt: new Date(),
        createdBy: 'director-1'
      },
      storeId: 'store-1',
      store: { id: 'store-1', name: 'Hub Distribution' },
      lignes: [
        {
          id: 'ligne-1',
          bonReceptionId: 'bon-1',
          productId: '1',
          product: {
            id: '1',
            name: 'Thon Rouge',
            unit: 'kg',
            unitPrice: 6500,
            category: 'Poisson',
            priceType: 'variable',
            isActive: true,
            createdAt: new Date(),
            allowDecimals: true
          },
          quantiteRecue: 10.5,
          coutUnitaire: 5000,
          sousTotal: 52500
        }
      ],
      totalValue: 52500,
      status: 'validated',
      createdBy: 'director-1',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      validatedBy: 'director-1',
      validatedAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
      commentaires: 'Livraison hebdomadaire'
    };

    this.bonsReception.push(mockBon);
    this.nextSequence = 2;
  }

  /**
   * Create a new reception voucher form
   */
  createNewBonReceptionForm(supplierId?: string, storeId?: string): BonReceptionForm {
    return {
      supplierId: supplierId || '',
      storeId: storeId || '',
      dateReception: new Date(),
      lignes: [],
      commentaires: ''
    };
  }

  /**
   * Add a new line to the form
   */
  addLigneToForm(form: BonReceptionForm, productId: string = ''): BonReceptionForm {
    const newLigne: LigneReceptionForm = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productId,
      quantiteRecue: 0,
      coutUnitaire: 0,
      sousTotal: 0
    };

    return {
      ...form,
      lignes: [...form.lignes, newLigne]
    };
  }

  /**
   * Remove a line from the form
   */
  removeLigneFromForm(form: BonReceptionForm, ligneId: string): BonReceptionForm {
    return {
      ...form,
      lignes: form.lignes.filter(ligne => ligne.id !== ligneId)
    };
  }

  /**
   * Update a line in the form
   */
  updateLigneInForm(
    form: BonReceptionForm, 
    ligneId: string, 
    updates: Partial<LigneReceptionForm>
  ): BonReceptionForm {
    const updatedLignes = form.lignes.map(ligne => {
      if (ligne.id === ligneId) {
        const updatedLigne = { ...ligne, ...updates };
        
        // Recalculate subtotal if quantity or unit cost changed
        if (updates.quantiteRecue !== undefined || updates.coutUnitaire !== undefined) {
          updatedLigne.sousTotal = calculateLigneReceptionSousTotal(
            updatedLigne.quantiteRecue, 
            updatedLigne.coutUnitaire
          );
        }
        
        return updatedLigne;
      }
      return ligne;
    });

    return {
      ...form,
      lignes: updatedLignes
    };
  }

  /**
   * Calculate form total
   */
  calculateFormTotal(form: BonReceptionForm): number {
    return form.lignes.reduce((total, ligne) => {
      const sousTotal = ligne.sousTotal || calculateLigneReceptionSousTotal(
        ligne.quantiteRecue, 
        ligne.coutUnitaire
      );
      return total + sousTotal;
    }, 0);
  }

  /**
   * Auto-save form data
   */
  async autoSaveForm(userId: string, form: BonReceptionForm): Promise<void> {
    validateForAutoSave(this.convertFormToBonReception(form));
    
    this.autoSaveData.set(userId, {
      formData: form,
      lastSaved: new Date(),
      isDirty: false
    });
  }

  /**
   * Get auto-saved form data
   */
  getAutoSavedForm(userId: string): AutoSaveData | null {
    return this.autoSaveData.get(userId) || null;
  }

  /**
   * Clear auto-saved data
   */
  clearAutoSavedForm(userId: string): void {
    this.autoSaveData.delete(userId);
  }

  /**
   * Mark form as dirty (needs auto-save)
   */
  markFormAsDirty(userId: string): void {
    const autoSaveData = this.autoSaveData.get(userId);
    if (autoSaveData) {
      autoSaveData.isDirty = true;
    }
  }

  /**
   * Save as draft
   */
  async saveDraft(form: BonReceptionForm, userId: string): Promise<BonReceptionSaveResult> {
    const bonReception = this.convertFormToBonReception(form);
    const validation = validateBonReceptionDraft(bonReception);

    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
        warnings: validation.warnings
      };
    }

    // Generate ID and number if new
    if (!bonReception.id) {
      bonReception.id = `bon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      bonReception.numero = generateBonReceptionNumber(
        new Date().getFullYear(), 
        this.nextSequence++
      );
      bonReception.createdBy = userId;
      bonReception.createdAt = new Date();
    }

    bonReception.status = 'draft';
    bonReception.totalValue = this.calculateFormTotal(form);

    // Save or update
    const completeBon = bonReception as BonReception;
    const existingIndex = this.bonsReception.findIndex(bon => bon.id === completeBon.id);
    if (existingIndex >= 0) {
      this.bonsReception[existingIndex] = completeBon;
    } else {
      this.bonsReception.push(completeBon);
    }

    // Clear auto-save data
    this.clearAutoSavedForm(userId);

    return {
      success: true,
      bonReception: completeBon,
      warnings: validation.warnings
    };
  }

  /**
   * Validate and save final reception voucher
   */
  async validateAndSave(form: BonReceptionForm, userId: string): Promise<BonReceptionSaveResult> {
    const bonReception = this.convertFormToBonReception(form);
    const validation = validateBonReception(bonReception);

    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
        warnings: validation.warnings
      };
    }

    // Generate ID and number if new
    if (!bonReception.id) {
      bonReception.id = `bon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      bonReception.numero = generateBonReceptionNumber(
        new Date().getFullYear(), 
        this.nextSequence++
      );
      bonReception.createdBy = userId;
      bonReception.createdAt = new Date();
    }

    bonReception.status = 'validated';
    bonReception.validatedBy = userId;
    bonReception.validatedAt = new Date();
    bonReception.totalValue = this.calculateFormTotal(form);

    // Save or update
    const completeBon = bonReception as BonReception;
    const existingIndex = this.bonsReception.findIndex(bon => bon.id === completeBon.id);
    if (existingIndex >= 0) {
      this.bonsReception[existingIndex] = completeBon;
    } else {
      this.bonsReception.push(completeBon);
    }

    // Process stock movements and CUMP calculations
    try {
      await this.processValidatedBonReception(completeBon);
    } catch (error) {
      console.error('Error processing validated bon reception:', error);
      // Revert status if stock processing fails
      completeBon.status = 'draft';
      completeBon.validatedBy = undefined;
      completeBon.validatedAt = undefined;
      
      return {
        success: false,
        errors: [{
          type: 'PROCESSING_ERROR' as any,
          message: 'Erreur lors du traitement du stock. Le bon a été sauvé en brouillon.'
        }]
      };
    }

    // Clear auto-save data
    this.clearAutoSavedForm(userId);

    return {
      success: true,
      bonReception: completeBon,
      warnings: validation.warnings
    };
  }

  /**
   * Get reception vouchers with filtering
   */
  async getBonsReception(filters?: {
    storeId?: string;
    supplierId?: string;
    status?: 'draft' | 'validated';
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<BonReception[]> {
    let filtered = [...this.bonsReception];

    if (filters) {
      if (filters.storeId) {
        filtered = filtered.filter(bon => bon.storeId === filters.storeId);
      }
      
      if (filters.supplierId) {
        filtered = filtered.filter(bon => bon.supplierId === filters.supplierId);
      }
      
      if (filters.status) {
        filtered = filtered.filter(bon => bon.status === filters.status);
      }
      
      if (filters.dateFrom) {
        filtered = filtered.filter(bon => bon.dateReception >= filters.dateFrom!);
      }
      
      if (filters.dateTo) {
        filtered = filtered.filter(bon => bon.dateReception <= filters.dateTo!);
      }
    }

    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get a specific reception voucher
   */
  async getBonReception(id: string): Promise<BonReception | null> {
    return this.bonsReception.find(bon => bon.id === id) || null;
  }

  /**
   * Delete a draft reception voucher
   */
  async deleteDraft(id: string, userId: string): Promise<boolean> {
    const bonIndex = this.bonsReception.findIndex(bon => 
      bon.id === id && bon.status === 'draft' && bon.createdBy === userId
    );

    if (bonIndex >= 0) {
      this.bonsReception.splice(bonIndex, 1);
      return true;
    }

    return false;
  }

  /**
   * Convert form to BonReception object
   */
  private convertFormToBonReception(form: BonReceptionForm): Partial<BonReception> {
    const lignes: Partial<LigneReception>[] = form.lignes.map(ligneForm => ({
      id: ligneForm.id,
      productId: ligneForm.productId,
      quantiteRecue: ligneForm.quantiteRecue,
      coutUnitaire: ligneForm.coutUnitaire,
      sousTotal: ligneForm.sousTotal || calculateLigneReceptionSousTotal(
        ligneForm.quantiteRecue, 
        ligneForm.coutUnitaire
      )
    }));

    return {
      id: form.id,
      supplierId: form.supplierId,
      storeId: form.storeId,
      dateReception: form.dateReception,
      lignes: lignes as LigneReception[],
      commentaires: form.commentaires,
      totalValue: this.calculateFormTotal(form)
    };
  }

  /**
   * Process validated reception voucher (update stock and CUMP)
   */
  private async processValidatedBonReception(bonReception: BonReception): Promise<void> {
    // This would integrate with the stock service to update stock levels and CUMP
    // For now, we'll simulate the process
    
    const productAverageCosts: Record<string, number> = {};
    
    // In a real implementation, we would:
    // 1. Update stock levels for each product
    // 2. Calculate new CUMP for each product
    // 3. Create stock movement records
    // 4. Update product average costs
    
    await stockService.processBonReceptionValidation(bonReception, productAverageCosts);
  }

  /**
   * Get validation errors for a form
   */
  validateForm(form: BonReceptionForm): ValidationResult {
    const bonReception = this.convertFormToBonReception(form);
    return validateBonReception(bonReception);
  }

  /**
   * Get draft validation errors for a form
   */
  validateDraftForm(form: BonReceptionForm): ValidationResult {
    const bonReception = this.convertFormToBonReception(form);
    return validateBonReceptionDraft(bonReception);
  }

  /**
   * Get recent reception vouchers for a store
   */
  async getRecentBonsReception(storeId: string, limit: number = 5): Promise<BonReception[]> {
    const bons = await this.getBonsReception({ storeId });
    return bons.slice(0, limit);
  }

  /**
   * Get reception statistics
   */
  async getReceptionStats(storeId?: string, period: 'week' | 'month' = 'month'): Promise<{
    totalBons: number;
    totalValue: number;
    averageValue: number;
    draftCount: number;
    validatedCount: number;
  }> {
    const now = new Date();
    const startDate = new Date();
    
    if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate.setMonth(now.getMonth() - 1);
    }

    const bons = await this.getBonsReception({
      storeId,
      dateFrom: startDate,
      dateTo: now
    });

    const totalValue = bons.reduce((sum, bon) => sum + bon.totalValue, 0);
    const draftCount = bons.filter(bon => bon.status === 'draft').length;
    const validatedCount = bons.filter(bon => bon.status === 'validated').length;

    return {
      totalBons: bons.length,
      totalValue,
      averageValue: bons.length > 0 ? totalValue / bons.length : 0,
      draftCount,
      validatedCount
    };
  }
}

export const bonReceptionService = new BonReceptionService();