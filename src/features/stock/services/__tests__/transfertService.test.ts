import { describe, it, expect, beforeEach, vi } from 'vitest';
import { transfertService, CreateTransfertData, ReceptionData } from '../transfertService';
import { TransfertStock, TransfertStatus } from '../../shared/types';

// Mock the MCP Supabase calls
vi.mock('@/lib/mcp', () => ({
  mcp_supabase_execute_sql: vi.fn()
}));

describe('TransfertService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllTransferts', () => {
    it('should return all transferts', async () => {
      const transferts = await transfertService.getAllTransferts();
      
      expect(Array.isArray(transferts)).toBe(true);
      
      if (transferts.length > 0) {
        const transfert = transferts[0];
        expect(transfert).toHaveProperty('id');
        expect(transfert).toHaveProperty('numero');
        expect(transfert).toHaveProperty('storeSourceId');
        expect(transfert).toHaveProperty('storeDestinationId');
        expect(transfert).toHaveProperty('status');
        expect(transfert).toHaveProperty('lignes');
        expect(Array.isArray(transfert.lignes)).toBe(true);
      }
    });

    it('should filter transferts by store when specified', async () => {
      const storeId = 'store-1';
      const transferts = await transfertService.getTransfertsByStore(storeId);
      
      expect(Array.isArray(transferts)).toBe(true);
      transferts.forEach(transfert => {
        expect(
          transfert.storeSourceId === storeId || transfert.storeDestinationId === storeId
        ).toBe(true);
      });
    });

    it('should filter transferts by status when specified', async () => {
      const status: TransfertStatus = 'en_transit';
      const transferts = await transfertService.getTransfertsByStatus(status);
      
      expect(Array.isArray(transferts)).toBe(true);
      transferts.forEach(transfert => {
        expect(transfert.status).toBe(status);
      });
    });
  });

  describe('getTransfertById', () => {
    it('should return transfert when found', async () => {
      const transferts = await transfertService.getAllTransferts();
      if (transferts.length > 0) {
        const firstTransfert = transferts[0];
        const foundTransfert = await transfertService.getTransfertById(firstTransfert.id);
        
        expect(foundTransfert).not.toBeNull();
        expect(foundTransfert?.id).toBe(firstTransfert.id);
        expect(foundTransfert?.numero).toBe(firstTransfert.numero);
      }
    });

    it('should return null when transfert not found', async () => {
      const nonExistentId = 'non-existent-id';
      const transfert = await transfertService.getTransfertById(nonExistentId);
      
      expect(transfert).toBeNull();
    });
  });

  describe('createTransfert', () => {
    const validTransfertData: CreateTransfertData = {
      storeSourceId: 'store-1',
      storeDestinationId: 'store-2',
      lignes: [
        {
          productId: 'product-1',
          quantiteEnvoyee: 10
        },
        {
          productId: 'product-2',
          quantiteEnvoyee: 5
        }
      ],
      commentaires: 'Test transfert'
    };

    it('should create transfert with valid data', async () => {
      const createdBy = 'test-user-id';
      const transfert = await transfertService.createTransfert(validTransfertData, createdBy);
      
      expect(transfert).toBeDefined();
      expect(transfert.storeSourceId).toBe(validTransfertData.storeSourceId);
      expect(transfert.storeDestinationId).toBe(validTransfertData.storeDestinationId);
      expect(transfert.lignes).toHaveLength(validTransfertData.lignes.length);
      expect(transfert.status).toBe('en_transit');
      expect(transfert.createdBy).toBe(createdBy);
      expect(transfert.numero).toMatch(/^TR-\d{4}-\d{4}$/);
      expect(transfert.id).toBeDefined();
      expect(transfert.dateCreation).toBeInstanceOf(Date);
    });

    it('should throw error when source and destination stores are the same', async () => {
      const invalidData: CreateTransfertData = {
        storeSourceId: 'store-1',
        storeDestinationId: 'store-1', // Same as source
        lignes: [
          {
            productId: 'product-1',
            quantiteEnvoyee: 10
          }
        ]
      };

      await expect(
        transfertService.createTransfert(invalidData, 'test-user-id')
      ).rejects.toThrow('Le magasin source et destination ne peuvent pas être identiques');
    });

    it('should throw error when no lines provided', async () => {
      const invalidData: CreateTransfertData = {
        storeSourceId: 'store-1',
        storeDestinationId: 'store-2',
        lignes: [] // Empty lines
      };

      await expect(
        transfertService.createTransfert(invalidData, 'test-user-id')
      ).rejects.toThrow('Au moins une ligne de transfert est requise');
    });

    it('should throw error when quantity is invalid', async () => {
      const invalidData: CreateTransfertData = {
        storeSourceId: 'store-1',
        storeDestinationId: 'store-2',
        lignes: [
          {
            productId: 'product-1',
            quantiteEnvoyee: -5 // Negative quantity
          }
        ]
      };

      await expect(
        transfertService.createTransfert(invalidData, 'test-user-id')
      ).rejects.toThrow('La quantité doit être positive');
    });
  });

  describe('receiveTransfert', () => {
    const validReceptionData: ReceptionData = {
      lignes: [
        {
          ligneTransfertId: 'ligne-1',
          quantiteRecue: 8,
          commentaire: 'Légère perte en transit'
        },
        {
          ligneTransfertId: 'ligne-2',
          quantiteRecue: 5
        }
      ],
      commentairesReception: 'Réception OK'
    };

    it('should receive transfert with valid data', async () => {
      const transferts = await transfertService.getAllTransferts();
      const enTransitTransfert = transferts.find(t => t.status === 'en_transit');
      
      if (enTransitTransfert) {
        const receivedBy = 'test-user-id';
        const updatedTransfert = await transfertService.receiveTransfert(
          enTransitTransfert.id,
          validReceptionData,
          receivedBy
        );
        
        expect(updatedTransfert.status).toBe('termine');
        expect(updatedTransfert.receptionneBy).toBe(receivedBy);
        expect(updatedTransfert.receptionneAt).toBeInstanceOf(Date);
        expect(updatedTransfert.commentairesReception).toBe(validReceptionData.commentairesReception);
        
        // Check that received quantities are updated
        updatedTransfert.lignes.forEach(ligne => {
          expect(ligne.quantiteRecue).toBeDefined();
          expect(ligne.quantiteRecue).toBeGreaterThanOrEqual(0);
        });
      }
    });

    it('should mark transfert as "termine_avec_ecart" when there are discrepancies', async () => {
      const transferts = await transfertService.getAllTransferts();
      const enTransitTransfert = transferts.find(t => t.status === 'en_transit');
      
      if (enTransitTransfert && enTransitTransfert.lignes.length > 0) {
        const receptionWithEcart: ReceptionData = {
          lignes: [
            {
              ligneTransfertId: enTransitTransfert.lignes[0].id,
              quantiteRecue: enTransitTransfert.lignes[0].quantiteEnvoyee - 2 // Create discrepancy
            }
          ]
        };

        const updatedTransfert = await transfertService.receiveTransfert(
          enTransitTransfert.id,
          receptionWithEcart,
          'test-user-id'
        );
        
        expect(updatedTransfert.status).toBe('termine_avec_ecart');
        
        // Check that ecart is calculated
        const ligneWithEcart = updatedTransfert.lignes.find(l => l.ecart !== 0);
        expect(ligneWithEcart).toBeDefined();
        expect(ligneWithEcart!.ecart).toBe(-2);
      }
    });

    it('should throw error when trying to receive already received transfert', async () => {
      const transferts = await transfertService.getAllTransferts();
      const completedTransfert = transferts.find(t => t.status === 'termine');
      
      if (completedTransfert) {
        await expect(
          transfertService.receiveTransfert(completedTransfert.id, validReceptionData, 'test-user-id')
        ).rejects.toThrow('Ce transfert a déjà été réceptionné');
      }
    });

    it('should throw error when transfert not found', async () => {
      await expect(
        transfertService.receiveTransfert('non-existent-id', validReceptionData, 'test-user-id')
      ).rejects.toThrow('Transfert non trouvé');
    });
  });

  describe('cancelTransfert', () => {
    it('should cancel transfert in transit', async () => {
      const transferts = await transfertService.getAllTransferts();
      const enTransitTransfert = transferts.find(t => t.status === 'en_transit');
      
      if (enTransitTransfert) {
        const cancelledTransfert = await transfertService.cancelTransfert(
          enTransitTransfert.id,
          'test-user-id',
          'Annulation pour test'
        );
        
        expect(cancelledTransfert.status).toBe('annule');
        expect(cancelledTransfert.commentaires).toContain('Annulation pour test');
      }
    });

    it('should throw error when trying to cancel completed transfert', async () => {
      const transferts = await transfertService.getAllTransferts();
      const completedTransfert = transferts.find(t => t.status === 'termine');
      
      if (completedTransfert) {
        await expect(
          transfertService.cancelTransfert(completedTransfert.id, 'test-user-id', 'Test')
        ).rejects.toThrow('Impossible d\'annuler un transfert déjà réceptionné');
      }
    });
  });

  describe('getTransfertStats', () => {
    it('should return correct transfert statistics', async () => {
      const stats = await transfertService.getTransfertStats();
      
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('enTransit');
      expect(stats).toHaveProperty('termine');
      expect(stats).toHaveProperty('termineAvecEcart');
      expect(stats).toHaveProperty('annule');
      
      expect(typeof stats.total).toBe('number');
      expect(typeof stats.enTransit).toBe('number');
      expect(typeof stats.termine).toBe('number');
      expect(typeof stats.termineAvecEcart).toBe('number');
      expect(typeof stats.annule).toBe('number');
      
      expect(stats.total).toBeGreaterThanOrEqual(0);
      expect(stats.enTransit).toBeGreaterThanOrEqual(0);
      expect(stats.termine).toBeGreaterThanOrEqual(0);
      expect(stats.termineAvecEcart).toBeGreaterThanOrEqual(0);
      expect(stats.annule).toBeGreaterThanOrEqual(0);
    });
  });

  describe('validateTransfertData', () => {
    it('should validate correct transfert data', () => {
      const validData: CreateTransfertData = {
        storeSourceId: 'store-1',
        storeDestinationId: 'store-2',
        lignes: [
          {
            productId: 'product-1',
            quantiteEnvoyee: 10
          }
        ]
      };

      const result = transfertService.validateTransfertData(validData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject transfert data with same source and destination', () => {
      const invalidData: CreateTransfertData = {
        storeSourceId: 'store-1',
        storeDestinationId: 'store-1', // Same as source
        lignes: [
          {
            productId: 'product-1',
            quantiteEnvoyee: 10
          }
        ]
      };

      const result = transfertService.validateTransfertData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('storeDestinationId');
      expect(result.errors[0].code).toBe('SAME_SOURCE_DESTINATION');
    });

    it('should reject transfert data without lines', () => {
      const invalidData: CreateTransfertData = {
        storeSourceId: 'store-1',
        storeDestinationId: 'store-2',
        lignes: [] // Empty lines
      };

      const result = transfertService.validateTransfertData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('lignes');
      expect(result.errors[0].code).toBe('NO_LINES');
    });

    it('should reject transfert data with invalid quantities', () => {
      const invalidData: CreateTransfertData = {
        storeSourceId: 'store-1',
        storeDestinationId: 'store-2',
        lignes: [
          {
            productId: 'product-1',
            quantiteEnvoyee: -5 // Negative quantity
          }
        ]
      };

      const result = transfertService.validateTransfertData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('lignes.0.quantiteEnvoyee');
      expect(result.errors[0].code).toBe('INVALID_QUANTITY');
    });
  });

  describe('generateTransfertNumber', () => {
    it('should generate transfert number with correct format', () => {
      const numero = transfertService.generateTransfertNumber();
      
      expect(numero).toMatch(/^TR-\d{4}-\d{4}$/);
      
      const parts = numero.split('-');
      expect(parts).toHaveLength(3);
      expect(parts[0]).toBe('TR');
      expect(parts[1]).toHaveLength(4); // Year
      expect(parts[2]).toHaveLength(4); // Sequence
    });

    it('should generate unique transfert numbers', () => {
      const numero1 = transfertService.generateTransfertNumber();
      const numero2 = transfertService.generateTransfertNumber();
      
      expect(numero1).not.toBe(numero2);
    });
  });

  describe('calculateTransfertTotals', () => {
    it('should calculate transfert totals correctly', () => {
      const mockTransfert: TransfertStock = {
        id: 'transfert-1',
        numero: 'TR-2024-0001',
        dateCreation: new Date(),
        storeSourceId: 'store-1',
        storeDestinationId: 'store-2',
        status: 'en_transit',
        createdBy: 'user-1',
        createdAt: new Date(),
        lignes: [
          {
            id: 'ligne-1',
            transfertId: 'transfert-1',
            productId: 'product-1',
            quantiteEnvoyee: 10,
            quantiteRecue: 8,
            ecart: -2
          },
          {
            id: 'ligne-2',
            transfertId: 'transfert-1',
            productId: 'product-2',
            quantiteEnvoyee: 5,
            quantiteRecue: 5,
            ecart: 0
          }
        ]
      };

      const totals = transfertService.calculateTransfertTotals(mockTransfert);
      
      expect(totals.totalEnvoye).toBe(15);
      expect(totals.totalRecu).toBe(13);
      expect(totals.totalEcart).toBe(-2);
      expect(totals.nombreLignes).toBe(2);
      expect(totals.lignesAvecEcart).toBe(1);
    });
  });
});