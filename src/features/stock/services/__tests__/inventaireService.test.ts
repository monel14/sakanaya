import { describe, it, expect, beforeEach, vi } from 'vitest';
import { inventaireService, CreateInventaireData, ValidationData } from '../inventaireService';
import { Inventaire, InventaireStatus } from '../../types';

// Mock the MCP Supabase calls
vi.mock('@/lib/mcp', () => ({
  mcp_supabase_execute_sql: vi.fn()
}));

describe('InventaireService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllInventaires', () => {
    it('should return all inventaires', async () => {
      const inventaires = await inventaireService.getAllInventaires();
      
      expect(Array.isArray(inventaires)).toBe(true);
      
      if (inventaires.length > 0) {
        const inventaire = inventaires[0];
        expect(inventaire).toHaveProperty('id');
        expect(inventaire).toHaveProperty('numero');
        expect(inventaire).toHaveProperty('storeId');
        expect(inventaire).toHaveProperty('status');
        expect(inventaire).toHaveProperty('lignes');
        expect(Array.isArray(inventaire.lignes)).toBe(true);
      }
    });

    it('should filter inventaires by store when specified', async () => {
      const storeId = 'store-1';
      const inventaires = await inventaireService.getInventairesByStore(storeId);
      
      expect(Array.isArray(inventaires)).toBe(true);
      inventaires.forEach(inventaire => {
        expect(inventaire.storeId).toBe(storeId);
      });
    });

    it('should filter inventaires by status when specified', async () => {
      const status: InventaireStatus = 'en_attente_validation';
      const inventaires = await inventaireService.getInventairesByStatus(status);
      
      expect(Array.isArray(inventaires)).toBe(true);
      inventaires.forEach(inventaire => {
        expect(inventaire.status).toBe(status);
      });
    });
  });

  describe('getInventaireById', () => {
    it('should return inventaire when found', async () => {
      const inventaires = await inventaireService.getAllInventaires();
      if (inventaires.length > 0) {
        const firstInventaire = inventaires[0];
        const foundInventaire = await inventaireService.getInventaireById(firstInventaire.id);
        
        expect(foundInventaire).not.toBeNull();
        expect(foundInventaire?.id).toBe(firstInventaire.id);
        expect(foundInventaire?.numero).toBe(firstInventaire.numero);
      }
    });

    it('should return null when inventaire not found', async () => {
      const nonExistentId = 'non-existent-id';
      const inventaire = await inventaireService.getInventaireById(nonExistentId);
      
      expect(inventaire).toBeNull();
    });
  });

  describe('createInventaire', () => {
    const validInventaireData: CreateInventaireData = {
      storeId: 'store-1',
      commentaires: 'Inventaire mensuel'
    };

    it('should create inventaire with valid data', async () => {
      const createdBy = 'test-user-id';
      const inventaire = await inventaireService.createInventaire(validInventaireData, createdBy);
      
      expect(inventaire).toBeDefined();
      expect(inventaire.storeId).toBe(validInventaireData.storeId);
      expect(inventaire.commentaires).toBe(validInventaireData.commentaires);
      expect(inventaire.status).toBe('en_cours');
      expect(inventaire.createdBy).toBe(createdBy);
      expect(inventaire.numero).toMatch(/^INV-\d{4}-\d{4}$/);
      expect(inventaire.id).toBeDefined();
      expect(inventaire.date).toBeInstanceOf(Date);
      expect(inventaire.lignes).toBeDefined();
      expect(Array.isArray(inventaire.lignes)).toBe(true);
    });

    it('should generate inventory lines for all products in store', async () => {
      const inventaire = await inventaireService.createInventaire(validInventaireData, 'test-user-id');
      
      expect(inventaire.lignes.length).toBeGreaterThan(0);
      
      inventaire.lignes.forEach(ligne => {
        expect(ligne).toHaveProperty('productId');
        expect(ligne).toHaveProperty('quantiteTheorique');
        expect(ligne.quantiteTheorique).toBeGreaterThanOrEqual(0);
        expect(ligne.quantitePhysique).toBeUndefined(); // Not counted yet
        expect(ligne.ecart).toBeUndefined();
      });
    });

    it('should throw error when store not found', async () => {
      const invalidData: CreateInventaireData = {
        storeId: 'non-existent-store'
      };

      await expect(
        inventaireService.createInventaire(invalidData, 'test-user-id')
      ).rejects.toThrow('Magasin non trouvé');
    });
  });

  describe('updateInventaireCounting', () => {
    it('should update counting data for inventaire', async () => {
      const inventaires = await inventaireService.getAllInventaires();
      const enCoursInventaire = inventaires.find(i => i.status === 'en_cours');
      
      if (enCoursInventaire && enCoursInventaire.lignes.length > 0) {
        const countingData = [
          {
            ligneId: enCoursInventaire.lignes[0].id,
            quantitePhysique: 15,
            commentaire: 'Comptage OK'
          }
        ];

        const updatedInventaire = await inventaireService.updateInventaireCounting(
          enCoursInventaire.id,
          countingData,
          'test-user-id'
        );
        
        expect(updatedInventaire.lignes[0].quantitePhysique).toBe(15);
        expect(updatedInventaire.lignes[0].commentaire).toBe('Comptage OK');
        expect(updatedInventaire.lignes[0].ecart).toBeDefined();
        expect(updatedInventaire.lignes[0].valeurEcart).toBeDefined();
      }
    });

    it('should calculate ecarts correctly', async () => {
      const inventaires = await inventaireService.getAllInventaires();
      const enCoursInventaire = inventaires.find(i => i.status === 'en_cours');
      
      if (enCoursInventaire && enCoursInventaire.lignes.length > 0) {
        const ligne = enCoursInventaire.lignes[0];
        const quantitePhysique = ligne.quantiteTheorique + 5; // Add 5 to create positive ecart
        
        const countingData = [
          {
            ligneId: ligne.id,
            quantitePhysique: quantitePhysique
          }
        ];

        const updatedInventaire = await inventaireService.updateInventaireCounting(
          enCoursInventaire.id,
          countingData,
          'test-user-id'
        );
        
        const updatedLigne = updatedInventaire.lignes.find(l => l.id === ligne.id);
        expect(updatedLigne?.ecart).toBe(5);
        expect(updatedLigne?.valeurEcart).toBeGreaterThan(0);
      }
    });

    it('should throw error when inventaire not found', async () => {
      const countingData = [
        {
          ligneId: 'ligne-1',
          quantitePhysique: 10
        }
      ];

      await expect(
        inventaireService.updateInventaireCounting('non-existent-id', countingData, 'test-user-id')
      ).rejects.toThrow('Inventaire non trouvé');
    });

    it('should throw error when inventaire is not in progress', async () => {
      const inventaires = await inventaireService.getAllInventaires();
      const validatedInventaire = inventaires.find(i => i.status === 'valide');
      
      if (validatedInventaire) {
        const countingData = [
          {
            ligneId: 'ligne-1',
            quantitePhysique: 10
          }
        ];

        await expect(
          inventaireService.updateInventaireCounting(validatedInventaire.id, countingData, 'test-user-id')
        ).rejects.toThrow('Cet inventaire ne peut plus être modifié');
      }
    });
  });

  describe('submitInventaire', () => {
    it('should submit inventaire for validation', async () => {
      const inventaires = await inventaireService.getAllInventaires();
      const enCoursInventaire = inventaires.find(i => i.status === 'en_cours');
      
      if (enCoursInventaire) {
        const submittedInventaire = await inventaireService.submitInventaire(
          enCoursInventaire.id,
          'test-user-id'
        );
        
        expect(submittedInventaire.status).toBe('en_attente_validation');
        expect(submittedInventaire.totalEcarts).toBeDefined();
        expect(submittedInventaire.valeurEcarts).toBeDefined();
      }
    });

    it('should calculate totals when submitting', async () => {
      const inventaires = await inventaireService.getAllInventaires();
      const enCoursInventaire = inventaires.find(i => i.status === 'en_cours');
      
      if (enCoursInventaire) {
        const submittedInventaire = await inventaireService.submitInventaire(
          enCoursInventaire.id,
          'test-user-id'
        );
        
        expect(typeof submittedInventaire.totalEcarts).toBe('number');
        expect(typeof submittedInventaire.valeurEcarts).toBe('number');
        expect(submittedInventaire.totalEcarts).toBeGreaterThanOrEqual(0);
        expect(submittedInventaire.valeurEcarts).toBeGreaterThanOrEqual(0);
      }
    });

    it('should throw error when inventaire not found', async () => {
      await expect(
        inventaireService.submitInventaire('non-existent-id', 'test-user-id')
      ).rejects.toThrow('Inventaire non trouvé');
    });

    it('should throw error when inventaire is not in progress', async () => {
      const inventaires = await inventaireService.getAllInventaires();
      const validatedInventaire = inventaires.find(i => i.status === 'valide');
      
      if (validatedInventaire) {
        await expect(
          inventaireService.submitInventaire(validatedInventaire.id, 'test-user-id')
        ).rejects.toThrow('Cet inventaire ne peut pas être soumis');
      }
    });
  });

  describe('validateInventaire', () => {
    const validationData: ValidationData = {
      approved: true,
      commentairesValidation: 'Inventaire approuvé'
    };

    it('should validate and approve inventaire', async () => {
      const inventaires = await inventaireService.getAllInventaires();
      const pendingInventaire = inventaires.find(i => i.status === 'en_attente_validation');
      
      if (pendingInventaire) {
        const validatedInventaire = await inventaireService.validateInventaire(
          pendingInventaire.id,
          validationData,
          'test-user-id'
        );
        
        expect(validatedInventaire.status).toBe('valide');
        expect(validatedInventaire.validatedBy).toBe('test-user-id');
        expect(validatedInventaire.validatedAt).toBeInstanceOf(Date);
        expect(validatedInventaire.commentaires).toContain(validationData.commentairesValidation);
      }
    });

    it('should reject inventaire when not approved', async () => {
      const inventaires = await inventaireService.getAllInventaires();
      const pendingInventaire = inventaires.find(i => i.status === 'en_attente_validation');
      
      if (pendingInventaire) {
        const rejectionData: ValidationData = {
          approved: false,
          commentairesValidation: 'Inventaire rejeté - recompter'
        };

        const rejectedInventaire = await inventaireService.validateInventaire(
          pendingInventaire.id,
          rejectionData,
          'test-user-id'
        );
        
        expect(rejectedInventaire.status).toBe('en_cours');
        expect(rejectedInventaire.commentaires).toContain(rejectionData.commentairesValidation);
      }
    });

    it('should throw error when inventaire not found', async () => {
      await expect(
        inventaireService.validateInventaire('non-existent-id', validationData, 'test-user-id')
      ).rejects.toThrow('Inventaire non trouvé');
    });

    it('should throw error when inventaire is not pending validation', async () => {
      const inventaires = await inventaireService.getAllInventaires();
      const validatedInventaire = inventaires.find(i => i.status === 'valide');
      
      if (validatedInventaire) {
        await expect(
          inventaireService.validateInventaire(validatedInventaire.id, validationData, 'test-user-id')
        ).rejects.toThrow('Cet inventaire ne peut pas être validé');
      }
    });
  });

  describe('getInventaireStats', () => {
    it('should return correct inventaire statistics', async () => {
      const stats = await inventaireService.getInventaireStats();
      
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('enCours');
      expect(stats).toHaveProperty('enAttenteValidation');
      expect(stats).toHaveProperty('valide');
      expect(stats).toHaveProperty('totalEcartsValue');
      expect(stats).toHaveProperty('averageEcartPercentage');
      
      expect(typeof stats.total).toBe('number');
      expect(typeof stats.enCours).toBe('number');
      expect(typeof stats.enAttenteValidation).toBe('number');
      expect(typeof stats.valide).toBe('number');
      expect(typeof stats.totalEcartsValue).toBe('number');
      expect(typeof stats.averageEcartPercentage).toBe('number');
      
      expect(stats.total).toBeGreaterThanOrEqual(0);
      expect(stats.enCours).toBeGreaterThanOrEqual(0);
      expect(stats.enAttenteValidation).toBeGreaterThanOrEqual(0);
      expect(stats.valide).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getInventairesByPeriod', () => {
    it('should return inventaires within specified period', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      
      const inventaires = await inventaireService.getInventairesByPeriod(startDate, endDate);
      
      expect(Array.isArray(inventaires)).toBe(true);
      inventaires.forEach(inventaire => {
        expect(inventaire.date.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
        expect(inventaire.date.getTime()).toBeLessThanOrEqual(endDate.getTime());
      });
    });

    it('should return empty array when no inventaires in period', async () => {
      const startDate = new Date('2030-01-01');
      const endDate = new Date('2030-12-31');
      
      const inventaires = await inventaireService.getInventairesByPeriod(startDate, endDate);
      
      expect(Array.isArray(inventaires)).toBe(true);
      expect(inventaires).toHaveLength(0);
    });
  });

  describe('generateInventaireNumber', () => {
    it('should generate inventaire number with correct format', () => {
      const numero = inventaireService.generateInventaireNumber();
      
      expect(numero).toMatch(/^INV-\d{4}-\d{4}$/);
      
      const parts = numero.split('-');
      expect(parts).toHaveLength(3);
      expect(parts[0]).toBe('INV');
      expect(parts[1]).toHaveLength(4); // Year
      expect(parts[2]).toHaveLength(4); // Sequence
    });

    it('should generate unique inventaire numbers', () => {
      const numero1 = inventaireService.generateInventaireNumber();
      const numero2 = inventaireService.generateInventaireNumber();
      
      expect(numero1).not.toBe(numero2);
    });
  });

  describe('calculateInventaireTotals', () => {
    it('should calculate inventaire totals correctly', () => {
      const mockInventaire: Inventaire = {
        id: 'inventaire-1',
        numero: 'INV-2024-0001',
        date: new Date(),
        storeId: 'store-1',
        status: 'valide',
        createdBy: 'user-1',
        createdAt: new Date(),
        totalEcarts: 0,
        valeurEcarts: 0,
        lignes: [
          {
            id: 'ligne-1',
            inventaireId: 'inventaire-1',
            productId: 'product-1',
            quantiteTheorique: 10,
            quantitePhysique: 8,
            ecart: -2,
            valeurEcart: -10000
          },
          {
            id: 'ligne-2',
            inventaireId: 'inventaire-1',
            productId: 'product-2',
            quantiteTheorique: 5,
            quantitePhysique: 7,
            ecart: 2,
            valeurEcart: 6000
          }
        ]
      };

      const totals = inventaireService.calculateInventaireTotals(mockInventaire);
      
      expect(totals.totalEcarts).toBe(4); // Absolute sum: |-2| + |2| = 4
      expect(totals.valeurEcarts).toBe(16000); // Absolute sum: |-10000| + |6000| = 16000
      expect(totals.nombreLignes).toBe(2);
      expect(totals.lignesAvecEcart).toBe(2);
      expect(totals.ecartPositif).toBe(2);
      expect(totals.ecartNegatif).toBe(-2);
    });

    it('should handle inventaire without ecarts', () => {
      const mockInventaire: Inventaire = {
        id: 'inventaire-1',
        numero: 'INV-2024-0001',
        date: new Date(),
        storeId: 'store-1',
        status: 'valide',
        createdBy: 'user-1',
        createdAt: new Date(),
        totalEcarts: 0,
        valeurEcarts: 0,
        lignes: [
          {
            id: 'ligne-1',
            inventaireId: 'inventaire-1',
            productId: 'product-1',
            quantiteTheorique: 10,
            quantitePhysique: 10,
            ecart: 0,
            valeurEcart: 0
          }
        ]
      };

      const totals = inventaireService.calculateInventaireTotals(mockInventaire);
      
      expect(totals.totalEcarts).toBe(0);
      expect(totals.valeurEcarts).toBe(0);
      expect(totals.nombreLignes).toBe(1);
      expect(totals.lignesAvecEcart).toBe(0);
      expect(totals.ecartPositif).toBe(0);
      expect(totals.ecartNegatif).toBe(0);
    });
  });
});