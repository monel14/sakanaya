import { useState, useEffect } from 'react';
import { Inventaire } from '../types';
import { 
  inventaireService, 
  CreateInventaireData, 
  UpdateInventaireData 
} from '../services/inventaireService';
import { useStockLevels } from './useStockLevels';

export interface UseInventaireReturn {
  // State
  inventaires: Inventaire[];
  currentInventaire: Inventaire | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  createInventaire: (data: CreateInventaireData, storeId: string) => Promise<Inventaire>;
  updateInventaire: (data: UpdateInventaireData) => Promise<Inventaire>;
  submitInventaire: (inventaireId: string) => Promise<Inventaire>;
  validateInventaire: (inventaireId: string) => Promise<Inventaire>;
  rejectInventaire: (inventaireId: string, reason: string) => Promise<Inventaire>;
  deleteInventaire: (inventaireId: string) => Promise<void>;
  loadInventaire: (inventaireId: string) => Promise<void>;
  loadInventaires: (storeId?: string, status?: 'en_cours' | 'en_attente_validation' | 'valide') => Promise<void>;
  getPendingInventaires: () => Promise<void>;
  
  // Computed values
  completionPercentage: number;
  hasUnsavedChanges: boolean;
  canSubmit: boolean;
  canValidate: boolean;
}

export const useInventaire = (
  currentUserId: string,
  currentUserRole: 'director' | 'manager',
  currentUserStoreId?: string
): UseInventaireReturn => {
  const [inventaires, setInventaires] = useState<Inventaire[]>([]);
  const [currentInventaire, setCurrentInventaire] = useState<Inventaire | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { stockLevels } = useStockLevels();

  // Mock stores and products data - in real app, these would come from context or props
  const mockStores = [
    { id: 'store-1', name: 'Hub Distribution' },
    { id: 'store-2', name: 'Boutique Centre-Ville' },
    { id: 'store-3', name: 'Marché Sandaga' }
  ];

  const mockProducts = [
    { id: 'product-1', name: 'Thon Rouge', code: 'TR001', unit: 'kg', averageCost: 5000 },
    { id: 'product-2', name: 'Dorade', code: 'DR001', unit: 'kg', averageCost: 3500 },
    { id: 'product-3', name: 'Crevettes', code: 'CR001', unit: 'kg', averageCost: 8000 }
  ];

  const createInventaire = async (data: CreateInventaireData, storeId: string): Promise<Inventaire> => {
    setLoading(true);
    setError(null);
    
    try {
      const store = mockStores.find(s => s.id === storeId);
      if (!store) {
        throw new Error('Magasin non trouvé');
      }

      // Get current stock levels for the store
      const storeStockLevels = stockLevels.filter(sl => sl.storeId === storeId);
      
      const inventaire = await inventaireService.createInventaire(
        data,
        currentUserId,
        store,
        storeStockLevels,
        mockProducts
      );

      setInventaires(prev => [inventaire, ...prev]);
      setCurrentInventaire(inventaire);
      
      return inventaire;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de l\'inventaire';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateInventaire = async (data: UpdateInventaireData): Promise<Inventaire> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedInventaire = await inventaireService.updateInventaire(data, currentUserId);
      
      // Update in list
      setInventaires(prev => prev.map(inv => 
        inv.id === updatedInventaire.id ? updatedInventaire : inv
      ));
      
      // Update current if it's the same
      if (currentInventaire?.id === updatedInventaire.id) {
        setCurrentInventaire(updatedInventaire);
      }
      
      setHasUnsavedChanges(false);
      return updatedInventaire;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'inventaire';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitInventaire = async (inventaireId: string): Promise<Inventaire> => {
    setLoading(true);
    setError(null);
    
    try {
      const submittedInventaire = await inventaireService.submitInventaire(inventaireId, currentUserId);
      
      // Update in list
      setInventaires(prev => prev.map(inv => 
        inv.id === submittedInventaire.id ? submittedInventaire : inv
      ));
      
      // Update current if it's the same
      if (currentInventaire?.id === submittedInventaire.id) {
        setCurrentInventaire(submittedInventaire);
      }
      
      return submittedInventaire;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la soumission de l\'inventaire';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const validateInventaire = async (inventaireId: string): Promise<Inventaire> => {
    if (currentUserRole !== 'director') {
      throw new Error('Seul le directeur peut valider les inventaires');
    }

    setLoading(true);
    setError(null);
    
    try {
      const validatedInventaire = await inventaireService.validateInventaire(inventaireId, currentUserId);
      
      // Update in list
      setInventaires(prev => prev.map(inv => 
        inv.id === validatedInventaire.id ? validatedInventaire : inv
      ));
      
      // Update current if it's the same
      if (currentInventaire?.id === validatedInventaire.id) {
        setCurrentInventaire(validatedInventaire);
      }
      
      return validatedInventaire;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la validation de l\'inventaire';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectInventaire = async (inventaireId: string, reason: string): Promise<Inventaire> => {
    if (currentUserRole !== 'director') {
      throw new Error('Seul le directeur peut rejeter les inventaires');
    }

    setLoading(true);
    setError(null);
    
    try {
      const rejectedInventaire = await inventaireService.rejectInventaire(inventaireId, currentUserId, reason);
      
      // Update in list
      setInventaires(prev => prev.map(inv => 
        inv.id === rejectedInventaire.id ? rejectedInventaire : inv
      ));
      
      // Update current if it's the same
      if (currentInventaire?.id === rejectedInventaire.id) {
        setCurrentInventaire(rejectedInventaire);
      }
      
      return rejectedInventaire;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du rejet de l\'inventaire';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteInventaire = async (inventaireId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await inventaireService.deleteInventaire(inventaireId);
      
      // Remove from list
      setInventaires(prev => prev.filter(inv => inv.id !== inventaireId));
      
      // Clear current if it's the same
      if (currentInventaire?.id === inventaireId) {
        setCurrentInventaire(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'inventaire';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadInventaire = async (inventaireId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const inventaire = await inventaireService.getInventaireById(inventaireId);
      if (inventaire) {
        setCurrentInventaire(inventaire);
      } else {
        setError('Inventaire non trouvé');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement de l\'inventaire';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadInventaires = async (
    storeId?: string, 
    status?: 'en_cours' | 'en_attente_validation' | 'valide'
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // For managers, restrict to their store
      const filterStoreId = currentUserRole === 'manager' ? currentUserStoreId : storeId;
      
      const loadedInventaires = await inventaireService.getAllInventaires(filterStoreId, status);
      setInventaires(loadedInventaires);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des inventaires';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPendingInventaires = async (): Promise<void> => {
    if (currentUserRole !== 'director') {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const pendingInventaires = await inventaireService.getPendingInventaires();
      setInventaires(pendingInventaires);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des inventaires en attente';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Computed values
  const completionPercentage = currentInventaire ? 
    (currentInventaire.lignes.filter(l => l.quantitePhysique !== undefined).length / 
     currentInventaire.lignes.length) * 100 : 0;

  const canSubmit = currentInventaire && 
    currentInventaire.status === 'en_cours' && 
    completionPercentage === 100;

  const canValidate = currentInventaire && 
    currentInventaire.status === 'en_attente_validation' && 
    currentUserRole === 'director';

  // Load inventaires on mount
  useEffect(() => {
    loadInventaires();
  }, [currentUserRole, currentUserStoreId]);

  return {
    // State
    inventaires,
    currentInventaire,
    loading,
    error,
    
    // Actions
    createInventaire,
    updateInventaire,
    submitInventaire,
    validateInventaire,
    rejectInventaire,
    deleteInventaire,
    loadInventaire,
    loadInventaires,
    getPendingInventaires,
    
    // Computed values
    completionPercentage,
    hasUnsavedChanges,
    canSubmit,
    canValidate
  };
};