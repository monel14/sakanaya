import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface UIState {
  sidebarOpen: boolean;
  loading: boolean;
  theme: 'light' | 'dark';
  isMobile: boolean;
  modals: {
    [key: string]: boolean;
  };
}

interface UIContextType {
  state: UIState;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setLoading: (loading: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setIsMobile: (isMobile: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  isModalOpen: (modalId: string) => boolean;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

interface UIProviderProps {
  children: ReactNode;
}

export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  const [state, setState] = useState<UIState>({
    sidebarOpen: false,
    loading: false,
    theme: 'light',
    isMobile: window.innerWidth < 768,
    modals: {},
  });

  const setSidebarOpen = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, sidebarOpen: open }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    setState(prev => ({ ...prev, theme }));
  }, []);

  const setIsMobile = useCallback((isMobile: boolean) => {
    setState(prev => ({ ...prev, isMobile }));
  }, []);

  const openModal = useCallback((modalId: string) => {
    setState(prev => ({
      ...prev,
      modals: { ...prev.modals, [modalId]: true }
    }));
  }, []);

  const closeModal = useCallback((modalId: string) => {
    setState(prev => ({
      ...prev,
      modals: { ...prev.modals, [modalId]: false }
    }));
  }, []);

  const isModalOpen = useCallback((modalId: string) => {
    return state.modals[modalId] || false;
  }, [state.modals]);

  // Écouter les changements de taille d'écran
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobile]);

  const value: UIContextType = {
    state,
    setSidebarOpen,
    toggleSidebar,
    setLoading,
    setTheme,
    setIsMobile,
    openModal,
    closeModal,
    isModalOpen,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};