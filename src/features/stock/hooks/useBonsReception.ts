import { useState, useEffect } from 'react';
import { BonReception, MouvementStock } from '../types';
import { Product } from '../../sales/types';

// Mock data for demonstration - replace with actual API calls
const mockBonsReception: BonReception[] = [
  {
    id: '1',
    numero: 'BR-2024-0001',
    dateReception: new Date('2024-01-15'),
    supplierId: 'supplier-1',
    supplier: {
      id: 'supplier-1',
      name: 'Fournisseur Océan',
      contact: 'Jean Dupont',
      phone: '+221 77 123 45 67',
      email: 'contact@ocean.sn',
      address: '123 Rue de la Pêche, Dakar',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      createdBy: 'admin'
    },
    storeId: 'store-1',
    store: { id: 'store-1', name: 'Hub Distribution' },
    lignes: [
      {
        id: 'ligne-1',
        bonReceptionId: '1',
        productId: 'product-1',
        product: {
          id: 'product-1',
          name: 'Thon Rouge',
          unit: 'kg',
          unitPrice: 8000,
          category: 'Poissons',
          priceType: 'fixed' as const,
          isActive: true,
          createdAt: new Date('2024-01-01'),
          allowDecimals: true
        },
        quantiteRecue: 50,
        coutUnitaire: 6000,
        sousTotal: 300000
      },
      {
        id: 'ligne-2',
        bonReceptionId: '1',
        productId: 'product-2',
        product: {
          id: 'product-2',
          name: 'Dorade',
          unit: 'kg',
          unitPrice: 5000,
          category: 'Poissons',
          priceType: 'fixed' as const,
          isActive: true,
          createdAt: new Date('2024-01-01'),
          allowDecimals: true
        },
        quantiteRecue: 30,
        coutUnitaire: 4000,
        sousTotal: 120000
      }
    ],
    totalValue: 420000,
    status: 'validated',
    createdBy: 'Directeur',
    createdAt: new Date('2024-01-15T08:30:00'),
    validatedBy: 'Directeur',
    validatedAt: new Date('2024-01-15T09:15:00'),
    commentaires: 'Livraison conforme, produits de bonne qualité'
  },
  {
    id: '2',
    numero: 'BR-2024-0002',
    dateReception: new Date('2024-01-16'),
    supplierId: 'supplier-2',
    supplier: {
      id: 'supplier-2',
      name: 'Marée Fraîche SARL',
      contact: 'Fatou Sall',
      phone: '+221 76 987 65 43',
      email: 'fatou@mareefraiche.sn',
      address: '456 Avenue des Pêcheurs, Rufisque',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      createdBy: 'admin'
    },
    storeId: 'store-2',
    store: { id: 'store-2', name: 'Magasin Centre-Ville' },
    lignes: [
      {
        id: 'ligne-3',
        bonReceptionId: '2',
        productId: 'product-3',
        product: {
          id: 'product-3',
          name: 'Crevettes',
          unit: 'kg',
          unitPrice: 12000,
          category: 'Crustacés',
          priceType: 'fixed' as const,
          isActive: true,
          createdAt: new Date('2024-01-01'),
          allowDecimals: true
        },
        quantiteRecue: 20,
        coutUnitaire: 10000,
        sousTotal: 200000
      }
    ],
    totalValue: 200000,
    status: 'draft',
    createdBy: 'Gérant Centre-Ville',
    createdAt: new Date('2024-01-16T14:20:00'),
    commentaires: 'En attente de validation'
  }
];

const mockMouvements: MouvementStock[] = [
  {
    id: 'mouv-1',
    date: new Date('2024-01-15T09:15:00'),
    type: 'arrivage',
    storeId: 'store-1',
    store: { id: 'store-1', name: 'Hub Distribution' },
    productId: 'product-1',
    product: {
      id: 'product-1',
      name: 'Thon Rouge',
      unit: 'kg',
      unitPrice: 8000,
      category: 'Poissons',
      priceType: 'fixed' as const,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      allowDecimals: true
    },
    quantite: 50,
    coutUnitaire: 6000,
    valeur: 300000,
    referenceId: '1',
    referenceType: 'bon_reception',
    createdBy: 'Directeur',
    createdAt: new Date('2024-01-15T09:15:00'),
    commentaire: 'Arrivage depuis BR-2024-0001'
  }
];

export interface UseBonsReceptionReturn {
  bonsReception: BonReception[];
  loading: boolean;
  error: string | null;
  getBonById: (id: string) => BonReception | undefined;
  getMouvementsByBonId: (bonId: string) => MouvementStock[];
  refreshBons: () => Promise<void>;
  createBon: (bon: Omit<BonReception, 'id' | 'numero' | 'createdAt'>) => Promise<BonReception>;
  updateBon: (id: string, updates: Partial<BonReception>) => Promise<BonReception>;
  validateBon: (id: string, validatedBy: string) => Promise<BonReception>;
  deleteBon: (id: string) => Promise<void>;
}

export const useBonsReception = (): UseBonsReceptionReturn => {
  const [bonsReception, setBonsReception] = useState<BonReception[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate API call to load bons de réception
  const loadBonsReception = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBonsReception(mockBonsReception);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des bons de réception');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadBonsReception();
  }, []);

  const getBonById = (id: string): BonReception | undefined => {
    return bonsReception.find(bon => bon.id === id);
  };

  const getMouvementsByBonId = (bonId: string): MouvementStock[] => {
    return mockMouvements.filter(mouvement => mouvement.referenceId === bonId);
  };

  const refreshBons = async (): Promise<void> => {
    await loadBonsReception();
  };

  const createBon = async (bonData: Omit<BonReception, 'id' | 'numero' | 'createdAt'>): Promise<BonReception> => {
    try {
      setLoading(true);
      
      // Generate new ID and numero
      const newId = `bon-${Date.now()}`;
      const year = new Date().getFullYear();
      const nextNumber = bonsReception.length + 1;
      const numero = `BR-${year}-${nextNumber.toString().padStart(4, '0')}`;
      
      const newBon: BonReception = {
        ...bonData,
        id: newId,
        numero,
        createdAt: new Date()
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setBonsReception(prev => [...prev, newBon]);
      return newBon;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du bon');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBon = async (id: string, updates: Partial<BonReception>): Promise<BonReception> => {
    try {
      setLoading(true);
      
      const existingBon = getBonById(id);
      if (!existingBon) {
        throw new Error('Bon de réception non trouvé');
      }
      
      const updatedBon: BonReception = {
        ...existingBon,
        ...updates
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setBonsReception(prev => prev.map(bon => bon.id === id ? updatedBon : bon));
      return updatedBon;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du bon');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const validateBon = async (id: string, validatedBy: string): Promise<BonReception> => {
    try {
      const updates: Partial<BonReception> = {
        status: 'validated',
        validatedBy,
        validatedAt: new Date()
      };
      
      return await updateBon(id, updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la validation du bon');
      throw err;
    }
  };

  const deleteBon = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      
      const existingBon = getBonById(id);
      if (!existingBon) {
        throw new Error('Bon de réception non trouvé');
      }
      
      if (existingBon.status === 'validated') {
        throw new Error('Impossible de supprimer un bon validé');
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setBonsReception(prev => prev.filter(bon => bon.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du bon');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    bonsReception,
    loading,
    error,
    getBonById,
    getMouvementsByBonId,
    refreshBons,
    createBon,
    updateBon,
    validateBon,
    deleteBon
  };
};

export default useBonsReception;