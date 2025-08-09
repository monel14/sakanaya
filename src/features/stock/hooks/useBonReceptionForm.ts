import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { 
  bonReceptionService, 
  BonReceptionForm, 
  LigneReceptionForm,
  BonReceptionSaveResult 
} from '../services/bonReceptionService';
import { 
  ValidationResult, 
  StockValidationError,
  getFieldErrors,
  hasFieldError 
} from '../utils/stockValidations';
import { toast } from 'sonner';

export interface UseBonReceptionFormOptions {
  autoSaveInterval?: number; // milliseconds
  enableAutoSave?: boolean;
  initialSupplierId?: string;
  initialStoreId?: string;
}

export interface UseBonReceptionFormReturn {
  // Form state
  form: BonReceptionForm;
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;
  lastSaved: Date | null;
  
  // Validation
  validation: ValidationResult;
  hasErrors: boolean;
  hasWarnings: boolean;
  
  // Form actions
  updateForm: (updates: Partial<BonReceptionForm>) => void;
  addLigne: (productId?: string) => void;
  removeLigne: (ligneId: string) => void;
  updateLigne: (ligneId: string, updates: Partial<LigneReceptionForm>) => void;
  
  // Save actions
  saveDraft: () => Promise<BonReceptionSaveResult>;
  validateAndSave: () => Promise<BonReceptionSaveResult>;
  
  // Utility functions
  getFieldError: (field: string, lineIndex?: number) => StockValidationError | null;
  hasFieldError: (field: string, lineIndex?: number) => boolean;
  getFieldErrors: (field: string, lineIndex?: number) => StockValidationError[];
  calculateTotal: () => number;
  
  // Auto-save
  triggerAutoSave: () => void;
  clearAutoSave: () => void;
}

export function useBonReceptionForm(options: UseBonReceptionFormOptions = {}): UseBonReceptionFormReturn {
  const {
    autoSaveInterval = 30000, // 30 seconds
    enableAutoSave = true,
    initialSupplierId,
    initialStoreId
  } = options;

  const { currentUser } = useAuth();
  const [form, setForm] = useState<BonReceptionForm>(() => 
    bonReceptionService.createNewBonReceptionForm(initialSupplierId, initialStoreId)
  );
  const [isLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: [], warnings: [] });

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastFormRef = useRef<BonReceptionForm>(form);

  // Load auto-saved data on mount
  useEffect(() => {
    if (currentUser && enableAutoSave) {
      const autoSavedData = bonReceptionService.getAutoSavedForm(currentUser.id);
      if (autoSavedData && autoSavedData.formData) {
        setForm(autoSavedData.formData);
        setLastSaved(autoSavedData.lastSaved);
        setIsDirty(autoSavedData.isDirty);
        toast.info('Données récupérées depuis la sauvegarde automatique');
      }
    }
  }, [currentUser, enableAutoSave]);

  // Auto-save when form changes
  useEffect(() => {
    if (!enableAutoSave || !currentUser || !isDirty) return;

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        await bonReceptionService.autoSaveForm(currentUser.id, form);
        setLastSaved(new Date());
        setIsDirty(false);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, autoSaveInterval);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [form, isDirty, enableAutoSave, currentUser, autoSaveInterval]);

  // Validate form when it changes
  useEffect(() => {
    const newValidation = bonReceptionService.validateDraftForm(form);
    setValidation(newValidation);
  }, [form]);

  // Track form changes
  useEffect(() => {
    const formChanged = JSON.stringify(form) !== JSON.stringify(lastFormRef.current);
    if (formChanged) {
      setIsDirty(true);
      lastFormRef.current = form;
      
      if (currentUser && enableAutoSave) {
        bonReceptionService.markFormAsDirty(currentUser.id);
      }
    }
  }, [form, currentUser, enableAutoSave]);

  const updateForm = useCallback((updates: Partial<BonReceptionForm>) => {
    setForm(prev => ({ ...prev, ...updates }));
  }, []);

  const addLigne = useCallback((productId?: string) => {
    setForm(prev => bonReceptionService.addLigneToForm(prev, productId));
  }, []);

  const removeLigne = useCallback((ligneId: string) => {
    setForm(prev => bonReceptionService.removeLigneFromForm(prev, ligneId));
  }, []);

  const updateLigne = useCallback((ligneId: string, updates: Partial<LigneReceptionForm>) => {
    setForm(prev => bonReceptionService.updateLigneInForm(prev, ligneId, updates));
  }, []);

  const saveDraft = useCallback(async (): Promise<BonReceptionSaveResult> => {
    if (!currentUser) {
      return {
        success: false,
        errors: [{ type: 'UNAUTHORIZED_OPERATION' as any, message: 'Utilisateur non connecté' }]
      };
    }

    setIsSaving(true);
    try {
      const result = await bonReceptionService.saveDraft(form, currentUser.id);
      
      if (result.success) {
        setIsDirty(false);
        setLastSaved(new Date());
        toast.success('Brouillon sauvegardé');
        
        // Update form with generated ID and number
        if (result.bonReception) {
          setForm(prev => ({
            ...prev,
            id: result.bonReception!.id,
          }));
        }
      } else {
        toast.error('Erreur lors de la sauvegarde du brouillon');
      }
      
      return result;
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Erreur lors de la sauvegarde du brouillon');
      return {
        success: false,
        errors: [{ type: 'PROCESSING_ERROR' as any, message: 'Erreur système' }]
      };
    } finally {
      setIsSaving(false);
    }
  }, [form, currentUser]);

  const validateAndSave = useCallback(async (): Promise<BonReceptionSaveResult> => {
    if (!currentUser) {
      return {
        success: false,
        errors: [{ type: 'UNAUTHORIZED_OPERATION' as any, message: 'Utilisateur non connecté' }]
      };
    }

    setIsSaving(true);
    try {
      const result = await bonReceptionService.validateAndSave(form, currentUser.id);
      
      if (result.success) {
        setIsDirty(false);
        setLastSaved(new Date());
        toast.success('Bon de réception validé et sauvegardé');
        
        // Clear form for new entry
        setForm(bonReceptionService.createNewBonReceptionForm(form.supplierId, form.storeId));
        
        // Clear auto-save
        bonReceptionService.clearAutoSavedForm(currentUser.id);
      } else {
        toast.error('Erreurs de validation détectées');
      }
      
      return result;
    } catch (error) {
      console.error('Error validating and saving:', error);
      toast.error('Erreur lors de la validation');
      return {
        success: false,
        errors: [{ type: 'PROCESSING_ERROR' as any, message: 'Erreur système' }]
      };
    } finally {
      setIsSaving(false);
    }
  }, [form, currentUser]);

  const getFieldError = useCallback((field: string, lineIndex?: number): StockValidationError | null => {
    const errors = getFieldErrors(validation.errors, field, lineIndex);
    return errors.length > 0 ? errors[0] : null;
  }, [validation.errors]);

  const hasFieldErrorFn = useCallback((field: string, lineIndex?: number): boolean => {
    return hasFieldError(validation.errors, field, lineIndex);
  }, [validation.errors]);

  const getFieldErrorsFn = useCallback((field: string, lineIndex?: number): StockValidationError[] => {
    return getFieldErrors(validation.errors, field, lineIndex);
  }, [validation.errors]);

  const calculateTotal = useCallback((): number => {
    return bonReceptionService.calculateFormTotal(form);
  }, [form]);

  const triggerAutoSave = useCallback(async () => {
    if (!currentUser || !enableAutoSave) return;

    try {
      await bonReceptionService.autoSaveForm(currentUser.id, form);
      setLastSaved(new Date());
      setIsDirty(false);
      toast.success('Sauvegarde automatique effectuée');
    } catch (error) {
      console.error('Manual auto-save failed:', error);
      toast.error('Erreur lors de la sauvegarde automatique');
    }
  }, [form, currentUser, enableAutoSave]);

  const clearAutoSave = useCallback(() => {
    if (!currentUser) return;
    
    bonReceptionService.clearAutoSavedForm(currentUser.id);
    setLastSaved(null);
    setIsDirty(false);
    toast.info('Sauvegarde automatique effacée');
  }, [currentUser]);

  return {
    // Form state
    form,
    isLoading,
    isSaving,
    isDirty,
    lastSaved,
    
    // Validation
    validation,
    hasErrors: validation.errors.length > 0,
    hasWarnings: validation.warnings.length > 0,
    
    // Form actions
    updateForm,
    addLigne,
    removeLigne,
    updateLigne,
    
    // Save actions
    saveDraft,
    validateAndSave,
    
    // Utility functions
    getFieldError,
    hasFieldError: hasFieldErrorFn,
    getFieldErrors: getFieldErrorsFn,
    calculateTotal,
    
    // Auto-save
    triggerAutoSave,
    clearAutoSave
  };
}