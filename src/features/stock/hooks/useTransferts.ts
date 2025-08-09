import { useState, useEffect, useCallback } from 'react';
import { TransfertStock, LigneTransfert } from '../types';

// Mock data for demonstration
const mockTransferts: TransfertStock[] = [
  {
    id: 'transfert-1',
    numero: 'TR-2024-0001',
    dateCreation: new Date('2024-01-15'),
    storeSourceId: 'store-1',
    storeSource: { id: 'store-1', name: 'Hub Distribution' },
    storeDestinationId: 'store-2',
    storeDestination: { id: 'store-2', name: 'Boutique Centre-Ville' },
    lignes: [
      {
        id: 'ligne-1',
        transfertId: 'transfert-1',
        productId: 'prod-1',
        product: {
          id: 'prod-1',
          name: 'Thiéboudienne Premium',
          category: 'Plats',
          price: 2500
        },
        quantiteEnvoyee: 10,
        quantiteRecue: 10
      },
      {
        id: 'ligne-2',
        transfertId: 'transfert-1',
        productId: 'prod-2',
        product: {
          id: 'prod-2',
          name: 'Yassa Poulet',
          category: 'Plats',
          price: 2000
        },
        quantiteEnvoyee: 5,
        quantiteRecue: 4,
        ecart: -1,
        commentaire: 'Une unité endommagée pendant le transport'
      }
    ],
    status: 'termine_avec_ecart',
    createdBy: 'user-1',
    createdAt: new Date('2024-01-15T10:00:00'),
    receptionneBy: 'user-2',
    receptionneAt: new Date('2024-01-15T14:30:00'),
    commentaires: 'Transfert urgent pour réapprovisionner la boutique',
    commentairesReception: 'Réception partielle - une unité endommagée'
  },
  {
    id: 'transfert-2',
    numero: 'TR-2024-0002',
    dateCreation: new Date('2024-01-16'),
    storeSourceId: 'store-1',
    storeSource: { id: 'store-1', name: 'Hub Distribution' },
    storeDestinationId: 'store-3',
    storeDestination: { id: 'store-3', name: 'Marché Sandaga' },
    lignes: [
      {
        id: 'ligne-3',
        transfertId: 'transfert-2',
        productId: 'prod-3',
        product: {
          id: 'prod-3',
          name: 'Mafé Traditionnel',
          category: 'Plats',
          price: 1800
        },
        quantiteEnvoyee: 8
      }
    ],
    status: 'en_transit',
    createdBy: 'user-1',
    createdAt: new Date('2024-01-16T09:15:00'),
    commentaires: 'Transfert pour le marché du weekend'
  }
];

interface UseTransfertsReturn {
  transferts: TransfertStock[];
  loading: boolean;
  error: string | null;
  createTransfert: (transfertData: Omit<TransfertStock, 'id' | 'numero' | 'dateCreation' | 'createdAt'>) => Promise<TransfertStock | null>;
  updateTransfert: (id: string, updates: Partial<TransfertStock>) => Promise<TransfertStock | null>;
  receiveTransfert: (id: string, receptionData: { quantitesRecues: Record<string, number>; commentaires?: string }) => Promise<TransfertStock | null>;
  loadTransferts: (storeId?: string, status?: TransfertStock['status']) => Promise<void>;
  getTransfertById: (id: string) => TransfertStock | undefined;
  refreshTransferts: () => Promise<void>;
}

export const useTransferts = (
  userId: string,
  userRole: 'director' | 'manager',
  currentStoreId?: string
): UseTransfertsReturn => {
  const [transferts, setTransferts] = useState<TransfertStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate next transfer number
  const generateTransfertNumber = (): string => {
    const year = new Date().getFullYear();
    const existingNumbers = transferts
      .map(t => t.numero)
      .filter(num => num.startsWith(`TR-${year}-`))
      .map(num => parseInt(num.split('-')[2]))
      .filter(num => !isNaN(num));
    
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    return `TR-${year}-${nextNumber.toString().padStart(4, '0')}`;
  };

  // Load transfers based on filters
  const loadTransferts = useCallback(async (storeId?: string, status?: TransfertStock['status']) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      let filteredTransferts = [...mockTransferts];

      // Filter by store (for managers, only show transfers involving their store)
      if (userRole === 'manager' && currentStoreId) {
        filteredTransferts = filteredTransferts.filter(
          t => t.storeSourceId === currentStoreId || t.storeDestinationId === currentStoreId
        );
      } else if (storeId) {
        filteredTransferts = filteredTransferts.filter(
          t => t.storeSourceId === storeId || t.storeDestinationId === storeId
        );
      }

      // Filter by status
      if (status) {
        filteredTransferts = filteredTransferts.filter(t => t.status === status);
      }

      // Sort by creation date (newest first)
      filteredTransferts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setTransferts(filteredTransferts);
    } catch (err) {
      setError('Erreur lors du chargement des transferts');
      console.error('Error loading transfers:', err);
    } finally {
      setLoading(false);
    }
  }, [userRole, currentStoreId]);

  // Create a new transfer
  const createTransfert = useCallback(async (
    transfertData: Omit<TransfertStock, 'id' | 'numero' | 'dateCreation' | 'createdAt'>
  ): Promise<TransfertStock | null> => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newTransfert: TransfertStock = {
        ...transfertData,
        id: `transfert-${Date.now()}`,
        numero: generateTransfertNumber(),
        dateCreation: new Date(),
        createdAt: new Date(),
        lignes: transfertData.lignes.map(ligne => ({
          ...ligne,
          id: `ligne-${Date.now()}-${Math.random()}`,
          transfertId: `transfert-${Date.now()}`
        }))
      };

      // Add to mock data
      mockTransferts.unshift(newTransfert);
      
      // Refresh the list
      await loadTransferts();

      return newTransfert;
    } catch (err) {
      setError('Erreur lors de la création du transfert');
      console.error('Error creating transfer:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadTransferts]);

  // Update a transfer
  const updateTransfert = useCallback(async (
    id: string,
    updates: Partial<TransfertStock>
  ): Promise<TransfertStock | null> => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const transfertIndex = mockTransferts.findIndex(t => t.id === id);
      if (transfertIndex === -1) {
        throw new Error('Transfert non trouvé');
      }

      const updatedTransfert = {
        ...mockTransferts[transfertIndex],
        ...updates
      };

      mockTransferts[transfertIndex] = updatedTransfert;

      // Refresh the list
      await loadTransferts();

      return updatedTransfert;
    } catch (err) {
      setError('Erreur lors de la mise à jour du transfert');
      console.error('Error updating transfer:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadTransferts]);

  // Receive a transfer (for managers)
  const receiveTransfert = useCallback(async (
    id: string,
    receptionData: { quantitesRecues: Record<string, number>; commentaires?: string }
  ): Promise<TransfertStock | null> => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const transfertIndex = mockTransferts.findIndex(t => t.id === id);
      if (transfertIndex === -1) {
        throw new Error('Transfert non trouvé');
      }

      const transfert = mockTransferts[transfertIndex];
      
      // Update lines with received quantities
      const updatedLignes = transfert.lignes.map(ligne => {
        const quantiteRecue = receptionData.quantitesRecues[ligne.id] || 0;
        const ecart = quantiteRecue - ligne.quantiteEnvoyee;
        
        return {
          ...ligne,
          quantiteRecue,
          ecart: ecart !== 0 ? ecart : undefined
        };
      });

      // Determine final status
      const hasVariances = updatedLignes.some(l => l.ecart !== undefined && l.ecart !== 0);
      const newStatus: TransfertStock['status'] = hasVariances ? 'termine_avec_ecart' : 'termine';

      const updatedTransfert: TransfertStock = {
        ...transfert,
        lignes: updatedLignes,
        status: newStatus,
        receptionneBy: userId,
        receptionneAt: new Date(),
        commentairesReception: receptionData.commentaires
      };

      mockTransferts[transfertIndex] = updatedTransfert;

      // Refresh the list
      await loadTransferts();

      return updatedTransfert;
    } catch (err) {
      setError('Erreur lors de la réception du transfert');
      console.error('Error receiving transfer:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId, loadTransferts]);

  // Get transfer by ID
  const getTransfertById = useCallback((id: string): TransfertStock | undefined => {
    return transferts.find(t => t.id === id);
  }, [transferts]);

  // Refresh transfers
  const refreshTransferts = useCallback(async () => {
    await loadTransferts();
  }, [loadTransferts]);

  // Load transfers on mount
  useEffect(() => {
    loadTransferts();
  }, [loadTransferts]);

  return {
    transferts,
    loading,
    error,
    createTransfert,
    updateTransfert,
    receiveTransfert,
    loadTransferts,
    getTransfertById,
    refreshTransferts
  };
};