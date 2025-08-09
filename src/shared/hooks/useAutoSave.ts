import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface UseAutoSaveOptions {
  delay?: number; // Delay in milliseconds before saving
  key: string; // Unique key for localStorage
  onSave?: (data: any) => void; // Optional callback when saving
  enabled?: boolean; // Whether auto-save is enabled
}

/**
 * Custom hook for auto-saving data to localStorage
 * Provides automatic saving with debouncing and recovery functionality
 */
export const useAutoSave = <T>(
  data: T,
  options: UseAutoSaveOptions
) => {
  const {
    delay = 2000, // 2 seconds default delay
    key,
    onSave,
    enabled = true
  } = options;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');

  /**
   * Save data to localStorage
   */
  const saveData = useCallback((dataToSave: T) => {
    try {
      const serializedData = JSON.stringify(dataToSave);
      
      // Only save if data has actually changed
      if (serializedData !== lastSavedRef.current) {
        localStorage.setItem(key, serializedData);
        lastSavedRef.current = serializedData;
        
        // Call optional save callback
        if (onSave) {
          onSave(dataToSave);
        }
        
        // Show subtle save indicator
        toast.success('Données sauvegardées automatiquement', {
          duration: 1500,
          position: 'bottom-right'
        });
      }
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
      toast.error('Erreur lors de la sauvegarde automatique');
    }
  }, [key, onSave]);

  /**
   * Load saved data from localStorage
   */
  const loadSavedData = useCallback((): T | null => {
    try {
      const savedData = localStorage.getItem(key);
      if (savedData) {
        return JSON.parse(savedData) as T;
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
    return null;
  }, [key]);

  /**
   * Clear saved data from localStorage
   */
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(key);
      lastSavedRef.current = '';
    } catch (error) {
      console.error('Error clearing saved data:', error);
    }
  }, [key]);

  /**
   * Check if there is saved data available
   */
  const hasSavedData = useCallback((): boolean => {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      return false;
    }
  }, [key]);

  // Auto-save effect with debouncing
  useEffect(() => {
    if (!enabled || !data) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for saving
    timeoutRef.current = setTimeout(() => {
      saveData(data);
    }, delay);

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, saveData]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    loadSavedData,
    clearSavedData,
    hasSavedData,
    saveNow: () => saveData(data)
  };
};