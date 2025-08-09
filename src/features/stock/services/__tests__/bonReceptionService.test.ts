import { describe, it, expect, beforeEach } from 'vitest';
import { bonReceptionService, BonReceptionForm } from '../bonReceptionService';

describe('BonReceptionService', () => {
  beforeEach(() => {
    // Reset service state before each test
    bonReceptionService['bonsReception'] = [];
    bonReceptionService['autoSaveData'].clear();
    bonReceptionService['nextSequence'] = 1;
  });

  describe('Form Management', () => {
    it('should create a new form with default values', () => {
      const form = bonReceptionService.createNewBonReceptionForm('supplier-1', 'store-1');
      
      expect(form.supplierId).toBe('supplier-1');
      expect(form.storeId).toBe('store-1');
      expect(form.lignes).toHaveLength(0);
      expect(form.dateReception).toBeInstanceOf(Date);
    });

    it('should add a line to the form', () => {
      const form = bonReceptionService.createNewBonReceptionForm();
      const updatedForm = bonReceptionService.addLigneToForm(form, 'product-1');
      
      expect(updatedForm.lignes).toHaveLength(1);
      expect(updatedForm.lignes[0].productId).toBe('product-1');
      expect(updatedForm.lignes[0].quantiteRecue).toBe(0);
      expect(updatedForm.lignes[0].coutUnitaire).toBe(0);
    });

    it('should remove a line from the form', () => {
      const form = bonReceptionService.createNewBonReceptionForm();
      const formWithLine = bonReceptionService.addLigneToForm(form, 'product-1');
      const ligneId = formWithLine.lignes[0].id!;
      
      const updatedForm = bonReceptionService.removeLigneFromForm(formWithLine, ligneId);
      
      expect(updatedForm.lignes).toHaveLength(0);
    });

    it('should update a line in the form', () => {
      const form = bonReceptionService.createNewBonReceptionForm();
      const formWithLine = bonReceptionService.addLigneToForm(form, 'product-1');
      const ligneId = formWithLine.lignes[0].id!;
      
      const updatedForm = bonReceptionService.updateLigneInForm(formWithLine, ligneId, {
        quantiteRecue: 10,
        coutUnitaire: 5000
      });
      
      expect(updatedForm.lignes[0].quantiteRecue).toBe(10);
      expect(updatedForm.lignes[0].coutUnitaire).toBe(5000);
      expect(updatedForm.lignes[0].sousTotal).toBe(50000);
    });

    it('should calculate form total correctly', () => {
      const form: BonReceptionForm = {
        supplierId: 'supplier-1',
        storeId: 'store-1',
        dateReception: new Date(),
        lignes: [
          {
            id: 'ligne-1',
            productId: 'product-1',
            quantiteRecue: 10,
            coutUnitaire: 5000,
            sousTotal: 50000
          },
          {
            id: 'ligne-2',
            productId: 'product-2',
            quantiteRecue: 5,
            coutUnitaire: 3000,
            sousTotal: 15000
          }
        ]
      };
      
      const total = bonReceptionService.calculateFormTotal(form);
      expect(total).toBe(65000);
    });
  });

  describe('Auto-save', () => {
    it('should auto-save form data', async () => {
      const form = bonReceptionService.createNewBonReceptionForm('supplier-1', 'store-1');
      const userId = 'user-1';
      
      await bonReceptionService.autoSaveForm(userId, form);
      
      const autoSavedData = bonReceptionService.getAutoSavedForm(userId);
      expect(autoSavedData).not.toBeNull();
      expect(autoSavedData!.formData.supplierId).toBe('supplier-1');
      expect(autoSavedData!.isDirty).toBe(false);
    });

    it('should clear auto-saved data', () => {
      const form = bonReceptionService.createNewBonReceptionForm('supplier-1', 'store-1');
      const userId = 'user-1';
      
      bonReceptionService['autoSaveData'].set(userId, {
        formData: form,
        lastSaved: new Date(),
        isDirty: false
      });
      
      bonReceptionService.clearAutoSavedForm(userId);
      
      const autoSavedData = bonReceptionService.getAutoSavedForm(userId);
      expect(autoSavedData).toBeNull();
    });

    it('should mark form as dirty', () => {
      const form = bonReceptionService.createNewBonReceptionForm('supplier-1', 'store-1');
      const userId = 'user-1';
      
      bonReceptionService['autoSaveData'].set(userId, {
        formData: form,
        lastSaved: new Date(),
        isDirty: false
      });
      
      bonReceptionService.markFormAsDirty(userId);
      
      const autoSavedData = bonReceptionService.getAutoSavedForm(userId);
      expect(autoSavedData!.isDirty).toBe(true);
    });
  });

  describe('Draft Operations', () => {
    it('should save a valid draft', async () => {
      const form: BonReceptionForm = {
        supplierId: 'supplier-1',
        storeId: 'store-1',
        dateReception: new Date(),
        lignes: [
          {
            id: 'ligne-1',
            productId: 'product-1',
            quantiteRecue: 10,
            coutUnitaire: 5000,
            sousTotal: 50000
          }
        ]
      };
      
      const result = await bonReceptionService.saveDraft(form, 'user-1');
      
      expect(result.success).toBe(true);
      expect(result.bonReception).toBeDefined();
      expect(result.bonReception!.status).toBe('draft');
      expect(result.bonReception!.numero).toMatch(/^BR-\d{4}-\d{4}$/);
    });

    it('should fail to save invalid draft', async () => {
      const form: BonReceptionForm = {
        supplierId: '', // Missing supplier
        storeId: 'store-1',
        dateReception: new Date(),
        lignes: []
      };
      
      const result = await bonReceptionService.saveDraft(form, 'user-1');
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });
  });

  describe('Validation and Save', () => {
    it('should validate and save a valid form', async () => {
      const form: BonReceptionForm = {
        supplierId: 'supplier-1',
        storeId: 'store-1',
        dateReception: new Date(),
        lignes: [
          {
            id: 'ligne-1',
            productId: 'product-1',
            quantiteRecue: 10,
            coutUnitaire: 5000,
            sousTotal: 50000
          }
        ]
      };
      
      const result = await bonReceptionService.validateAndSave(form, 'user-1');
      
      expect(result.success).toBe(true);
      expect(result.bonReception).toBeDefined();
      expect(result.bonReception!.status).toBe('validated');
      expect(result.bonReception!.validatedBy).toBe('user-1');
      expect(result.bonReception!.validatedAt).toBeDefined();
    });

    it('should fail to validate and save invalid form', async () => {
      const form: BonReceptionForm = {
        supplierId: 'supplier-1',
        storeId: 'store-1',
        dateReception: new Date(),
        lignes: [
          {
            id: 'ligne-1',
            productId: 'product-1',
            quantiteRecue: -5, // Invalid negative quantity
            coutUnitaire: 5000,
            sousTotal: -25000
          }
        ]
      };
      
      const result = await bonReceptionService.validateAndSave(form, 'user-1');
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });
  });

  describe('Form Validation', () => {
    it('should validate form correctly', () => {
      const validForm: BonReceptionForm = {
        supplierId: 'supplier-1',
        storeId: 'store-1',
        dateReception: new Date(),
        lignes: [
          {
            id: 'ligne-1',
            productId: 'product-1',
            quantiteRecue: 10,
            coutUnitaire: 5000,
            sousTotal: 50000
          }
        ]
      };
      
      const result = bonReceptionService.validateForm(validForm);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate draft form correctly', () => {
      const draftForm: BonReceptionForm = {
        supplierId: 'supplier-1',
        storeId: 'store-1',
        dateReception: new Date(),
        lignes: [] // Empty lines are OK for draft
      };
      
      const result = bonReceptionService.validateDraftForm(draftForm);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});