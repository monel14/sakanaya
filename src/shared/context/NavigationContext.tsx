import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface NavigationHistory {
  key: string;
  timestamp: number;
}

interface NavigationContextType {
  currentPageKey: string;
  history: NavigationHistory[];
  navigateTo: (key: string) => void;
  goBack: () => void;
  canGoBack: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPageKey, setCurrentPageKey] = useState('dashboard');
  const [history, setHistory] = useState<NavigationHistory[]>([
    { key: 'dashboard', timestamp: Date.now() }
  ]);

  const navigateTo = useCallback((key: string) => {
    if (key === currentPageKey) return;
    
    setCurrentPageKey(key);
    setHistory(prev => [
      ...prev,
      { key, timestamp: Date.now() }
    ].slice(-10)); // Garder seulement les 10 dernières entrées
  }, [currentPageKey]);

  const goBack = useCallback(() => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      const previousPage = newHistory[newHistory.length - 1];
      
      setCurrentPageKey(previousPage.key);
      setHistory(newHistory);
    }
  }, [history]);

  const canGoBack = history.length > 1;

  const value: NavigationContextType = {
    currentPageKey,
    history,
    navigateTo,
    goBack,
    canGoBack,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
