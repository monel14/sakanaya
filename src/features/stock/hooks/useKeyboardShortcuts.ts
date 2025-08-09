import { useEffect, useCallback, useRef } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  category?: string;
  preventDefault?: boolean;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
) {
  const {
    enabled = true,
    preventDefault = true,
    stopPropagation = true
  } = options;

  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true'
    ) {
      return;
    }

    const matchingShortcut = shortcutsRef.current.find(shortcut => {
      const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatch = (shortcut.ctrlKey ?? false) === event.ctrlKey;
      const altMatch = (shortcut.altKey ?? false) === event.altKey;
      const shiftMatch = (shortcut.shiftKey ?? false) === event.shiftKey;
      const metaMatch = (shortcut.metaKey ?? false) === event.metaKey;

      return keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch;
    });

    if (matchingShortcut) {
      if (preventDefault || matchingShortcut.preventDefault) {
        event.preventDefault();
      }
      if (stopPropagation) {
        event.stopPropagation();
      }
      matchingShortcut.action();
    }
  }, [enabled, preventDefault, stopPropagation]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);

  return {
    shortcuts: shortcutsRef.current
  };
}

// Stock-specific keyboard shortcuts
export function useStockKeyboardShortcuts({
  onRefresh,
  onNewArrival,
  onNewTransfer,
  onNewLoss,
  onSearch,
  onFilter,
  onExport,
  onHelp,
  enabled = true
}: {
  onRefresh?: () => void;
  onNewArrival?: () => void;
  onNewTransfer?: () => void;
  onNewLoss?: () => void;
  onSearch?: () => void;
  onFilter?: () => void;
  onExport?: () => void;
  onHelp?: () => void;
  enabled?: boolean;
}) {
  const shortcuts: KeyboardShortcut[] = [
    // Refresh data
    {
      key: 'F5',
      action: () => onRefresh?.(),
      description: 'Actualiser les données',
      category: 'Navigation'
    },
    {
      key: 'r',
      ctrlKey: true,
      action: () => onRefresh?.(),
      description: 'Actualiser les données',
      category: 'Navigation'
    },
    
    // New entries
    {
      key: 'n',
      ctrlKey: true,
      action: () => onNewArrival?.(),
      description: 'Nouvel arrivage',
      category: 'Actions'
    },
    {
      key: 't',
      ctrlKey: true,
      action: () => onNewTransfer?.(),
      description: 'Nouveau transfert',
      category: 'Actions'
    },
    {
      key: 'l',
      ctrlKey: true,
      action: () => onNewLoss?.(),
      description: 'Nouvelle perte',
      category: 'Actions'
    },
    
    // Search and filter
    {
      key: 'f',
      ctrlKey: true,
      action: () => onSearch?.(),
      description: 'Rechercher',
      category: 'Navigation'
    },
    {
      key: 'f',
      ctrlKey: true,
      shiftKey: true,
      action: () => onFilter?.(),
      description: 'Filtres avancés',
      category: 'Navigation'
    },
    
    // Export
    {
      key: 'e',
      ctrlKey: true,
      action: () => onExport?.(),
      description: 'Exporter les données',
      category: 'Actions'
    },
    
    // Help
    {
      key: 'F1',
      action: () => onHelp?.(),
      description: 'Aide et raccourcis',
      category: 'Aide'
    },
    {
      key: '?',
      shiftKey: true,
      action: () => onHelp?.(),
      description: 'Aide et raccourcis',
      category: 'Aide'
    }
  ];

  return useKeyboardShortcuts(shortcuts.filter(s => {
    // Only include shortcuts that have corresponding actions
    switch (s.description) {
      case 'Actualiser les données':
        return !!onRefresh;
      case 'Nouvel arrivage':
        return !!onNewArrival;
      case 'Nouveau transfert':
        return !!onNewTransfer;
      case 'Nouvelle perte':
        return !!onNewLoss;
      case 'Rechercher':
        return !!onSearch;
      case 'Filtres avancés':
        return !!onFilter;
      case 'Exporter les données':
        return !!onExport;
      case 'Aide et raccourcis':
        return !!onHelp;
      default:
        return true;
    }
  }), { enabled });
}

// Keyboard shortcuts help component
interface KeyboardShortcutsHelpProps {
  shortcuts: KeyboardShortcut[];
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsHelp({ shortcuts, isOpen, onClose }: KeyboardShortcutsHelpProps) {
  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'Général';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  const formatShortcut = (shortcut: KeyboardShortcut) => {
    const keys = [];
    
    if (shortcut.ctrlKey) keys.push('Ctrl');
    if (shortcut.altKey) keys.push('Alt');
    if (shortcut.shiftKey) keys.push('Shift');
    if (shortcut.metaKey) keys.push('Cmd');
    
    keys.push(shortcut.key === ' ' ? 'Space' : shortcut.key.toUpperCase());
    
    return keys.join(' + ');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Raccourcis Clavier
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <span className="sr-only">Fermer</span>
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-gray-900 mb-3 border-b border-gray-200 pb-1">
                    {category}
                  </h4>
                  <div className="space-y-2">
                    {categoryShortcuts.map((shortcut, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-700">
                          {shortcut.description}
                        </span>
                        <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
                          {formatShortcut(shortcut)}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                💡 Astuce: Les raccourcis ne fonctionnent pas lorsque vous tapez dans un champ de saisie.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for managing keyboard shortcuts state
export function useKeyboardShortcutsState() {
  const [showHelp, setShowHelp] = React.useState(false);
  const [enabled, setEnabled] = React.useState(true);

  const toggleHelp = useCallback(() => {
    setShowHelp(prev => !prev);
  }, []);

  const toggleEnabled = useCallback(() => {
    setEnabled(prev => !prev);
  }, []);

  return {
    showHelp,
    enabled,
    toggleHelp,
    toggleEnabled,
    setShowHelp,
    setEnabled
  };
}

// Context for keyboard shortcuts
import React, { createContext, useContext } from 'react';

interface KeyboardShortcutsContextType {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
  shortcuts: KeyboardShortcut[];
  addShortcuts: (shortcuts: KeyboardShortcut[]) => void;
  removeShortcuts: (keys: string[]) => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | null>(null);

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = React.useState(true);
  const [showHelp, setShowHelp] = React.useState(false);
  const [shortcuts, setShortcuts] = React.useState<KeyboardShortcut[]>([]);

  const addShortcuts = useCallback((newShortcuts: KeyboardShortcut[]) => {
    setShortcuts(prev => [...prev, ...newShortcuts]);
  }, []);

  const removeShortcuts = useCallback((keys: string[]) => {
    setShortcuts(prev => prev.filter(s => !keys.includes(s.key)));
  }, []);

  const value = {
    enabled,
    setEnabled,
    showHelp,
    setShowHelp,
    shortcuts,
    addShortcuts,
    removeShortcuts
  };

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
      <KeyboardShortcutsHelp
        shortcuts={shortcuts}
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </KeyboardShortcutsContext.Provider>
  );
}

export function useKeyboardShortcutsContext() {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcutsContext must be used within KeyboardShortcutsProvider');
  }
  return context;
}