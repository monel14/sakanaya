import { useState, useCallback, useEffect } from 'react';
import { ViewType } from '../types';

interface UseNavigationReturn {
  activeView: ViewType;
  sidebarOpen: boolean;
  handleViewChange: (view: ViewType) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useNavigation = (isMobile: boolean): UseNavigationReturn => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(!isMobile);

  const handleViewChange = useCallback((view: ViewType) => {
    setActiveView(view);
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  // Close sidebar on mobile when view changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [activeView, isMobile]);

  return {
    activeView,
    sidebarOpen,
    handleViewChange,
    toggleSidebar,
    setSidebarOpen
  };
};