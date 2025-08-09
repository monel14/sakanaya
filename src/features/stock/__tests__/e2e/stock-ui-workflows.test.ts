import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

// Import des composants UI
import { StockManagementPage } from '../../shared/components/StockManagementPage';
import { BonReceptionForm } from '../../shared/components/ArrivageFournisseur/BonReceptionForm';
import { BonReceptionList } from '../../shared/components/ArrivageFournisseur/BonReceptionList';
import { TransfertForm } from '../../shared/components/Transfert/TransfertForm';
import { TransfertList } from '../../shared/components/Transfert/TransfertList';
import { ReceptionForm } from '../../shared/components/Transfert/ReceptionForm';
import { InventaireForm } from '../../shared/components/Inventaire/InventaireForm';
import { InventaireList } from '../../shared/components/Inventaire/InventaireList';
import { StockDirectorView } from '../../shared/components/ConsultationStock/StockDirectorView';
import { MobileStockManagement } from '../../shared/components/mobile/MobileStockManagement';

// Mock des services
vi.mock('../../services/stockService');
vi.mock('../../services/supplierService');
vi.mock('../../services/transfertService');
vi.mock('../../services/inventaireService');

// Mock du contexte utilisateur
const mockUser = {
  id: 'user-1',
  email: 'director@sakanaya.com',
  role: 'director',
  storeId: 'store-1',
  storeName: 'Hub Distribution'
};

vi.mock('@/shared/context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: true
  })
}));

// Wrapper pour les tests UI
const UITestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Stock Management UI E2E Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  describe('Main Stock Management Interface', () => {
    it('should render main interface with role-based navigation', async () => {
      render(
        <UITestWrapper>
          <StockManagementPage />
        </UITestWrapper>
      );

      // Vérifier la présence des éléments principaux
      expect(screen.getByText('Gestion des Stocks')).toBeInTheDocument();
      
      // Vérifier les options disponibles pour un directeur
      expect(screen.getByText('Arrivage Fournisseur')).toBeInTheDocument();
      expect(screen.getByText('Transferts Inter-Magasins')).toBeInTheDocument();
      expect(screen.getByText('Inventaires')).toBeInTheDocument();
      expect(screen.getByText('Consultation Stocks')).toBeInTheDocument();
      expect(screen.getByText('Gestion Fournisseurs')).toBeInTheDocument();
    });

    it('should navigate between different modules', async () => {
      render(
        <UITestWrapper>
          <StockManagementPage />
        </UITestWrapper>
      );

      // Navigation vers Arrivage Fournisseur
      await user.click(screen.getByText('Arrivage Fournisseur'));
      await waitFor(() => {
        expect(screen.getByText('Bons de Réception')).toBeInTheDocument();
      });

      // Navigation vers Transferts
      await user.click(screen.getByText('Transferts Inter-Magasins'));
      await waitFor(() => {
        expect(screen.getByText('Transferts de Stock')).toBeInTheDocument();
      });

      // Navigation vers Inventaires
      await user.click(screen.getByText('Inventaires'));
      await waitFor(() => {
        expect(screen.getByText('Inventaires Physiques')).toBeInTheDocument();
      });
    });
  });

  describe('Bon de Réception Workflow UI', () => {
    it('should complete bon de réception creation workflow', async () => {
      const mockSuppliers = [
        { id: 'supplier-1', name: 'Fournisseur Test', isActive: true }
      ];
      const mockStores = [
        { id: 'store-1', name: 'Hub Distribution', isActive: true }
      ];
      const mockProducts = [
        { id: 'product-1', name: 'Thon Rouge', unit: 'kg', isActive: true }
      ];

      render(
        <UITestWrapper>
          <BonReceptionForm
            suppliers={mockSuppliers}
            stores={mockStores}
            products={mockProducts}
            onSubmit={vi.fn()}
          />
        </UITestWrapper>
      );

      // Remplir les informations générales
      await user.selectOptions(screen.getByLabelText('Fournisseur'), 'supplier-1');
      await user.selectOptions(screen.getByLabelText('Magasin de réception'), 'store-1');

      // Ajouter une ligne de produit
      await user.click(screen.getByText('Ajouter un produit'));
      
      const productSelect = screen.getByLabelText('Produit');
      await user.selectOptions(productSelect, 'product-1');
      
      const quantityInput = screen.getByLabelText('Quantité reçue');
      await user.type(quantityInput, '50');
      
      const costInput = screen.getByLabelText('Coût unitaire (CFA)');
      await user.type(costInput, '5000');

      // Vérifier le calcul automatique du sous-total
      await waitFor(() => {
        expect(screen.getByText('250 000 CFA')).toBeInTheDocument();
      });

      // Valider le bon
      await user.click(screen.getByText('Valider le Bon de Réception'));

      // Vérifier la soumission
      await waitFor(() => {
        expect(screen.getByText('Bon de réception créé avec succès')).toBeInTheDocument();
      });
    });

    it('should validate form inputs and show errors', async () => {
      render(
        <UITestWrapper>
          <BonReceptionForm
            suppliers={[]}
            stores={[]}
            products={[]}
            onSubmit={vi.fn()}
          />
        </UITestWrapper>
      );

      // Essayer de valider sans données
      await user.click(screen.getByText('Valider le Bon de Réception'));

      // Vérifier les messages d'erreur
      await waitFor(() => {
        expect(screen.getByText('Veuillez sélectionner un fournisseur')).toBeInTheDocument();
        expect(screen.getByText('Veuillez sélectionner un magasin')).toBeInTheDocument();
        expect(screen.getByText('Au moins une ligne de produit est requise')).toBeInTheDocument();
      });
    });
  });

  describe('Transfert Workflow UI', () => {
    it('should complete transfer creation and reception workflow', async () => {
      const mockStores = [
        { id: 'store-1', name: 'Hub Distribution', isActive: true },
        { id: 'store-2', name: 'Magasin Centre', isActive: true }
      ];
      const mockProducts = [
        { id: 'product-1', name: 'Thon Rouge', unit: 'kg', isActive: true }
      ];
      const mockStockLevels = {
        'product-1': { quantity: 100, available: 100 }
      };

      // Test création de transfert
      render(
        <UITestWrapper>
          <TransfertForm
            stores={mockStores}
            products={mockProducts}
            stockLevels={mockStockLevels}
            onSubmit={vi.fn()}
          />
        </UITestWrapper>
      );

      // Sélectionner les magasins
      await user.selectOptions(screen.getByLabelText('Magasin source'), 'store-1');
      await user.selectOptions(screen.getByLabelText('Magasin destination'), 'store-2');

      // Ajouter une ligne de transfert
      await user.click(screen.getByText('Ajouter un produit'));
      await user.selectOptions(screen.getByLabelText('Produit'), 'product-1');
      await user.type(screen.getByLabelText('Quantité à transférer'), '30');

      // Vérifier l'affichage du stock disponible
      expect(screen.getByText('Stock disponible: 100 kg')).toBeInTheDocument();

      // Créer le transfert
      await user.click(screen.getByText('Créer le Transfert'));

      await waitFor(() => {
        expect(screen.getByText('Transfert créé avec succès')).toBeInTheDocument();
      });
    });

    it('should handle transfer reception with discrepancies', async () => {
      const mockTransfert = {
        id: 'transfert-1',
        numero: 'TR-2024-0001',
        storeSource: { name: 'Hub Distribution' },
        storeDestination: { name: 'Magasin Centre' },
        lignes: [{
          id: 'ligne-1',
          product: { name: 'Thon Rouge', unit: 'kg' },
          quantiteEnvoyee: 30
        }],
        status: 'en_transit'
      };

      render(
        <UITestWrapper>
          <ReceptionForm
            transfert={mockTransfert}
            onSubmit={vi.fn()}
          />
        </UITestWrapper>
      );

      // Saisir une quantité reçue différente
      const receivedInput = screen.getByLabelText('Quantité reçue');
      await user.clear(receivedInput);
      await user.type(receivedInput, '28');

      // Ajouter un commentaire pour l'écart
      const commentInput = screen.getByLabelText('Commentaire');
      await user.type(commentInput, 'Perte de 2kg en transit');

      // Vérifier l'affichage de l'écart
      expect(screen.getByText('Écart: -2 kg')).toBeInTheDocument();
      expect(screen.getByText('Écart détecté')).toBeInTheDocument();

      // Valider la réception
      await user.click(screen.getByText('Valider la Réception'));

      await waitFor(() => {
        expect(screen.getByText('Réception validée avec écart')).toBeInTheDocument();
      });
    });
  });

  describe('Inventaire Workflow UI', () => {
    it('should complete inventory counting workflow', async () => {
      const mockStore = { id: 'store-1', name: 'Magasin Test' };
      const mockProducts = [
        { 
          id: 'product-1', 
          name: 'Thon Rouge', 
          unit: 'kg',
          stockLevel: { quantity: 100 }
        },
        { 
          id: 'product-2', 
          name: 'Saumon', 
          unit: 'kg',
          stockLevel: { quantity: 50 }
        }
      ];

      render(
        <UITestWrapper>
          <InventaireForm
            store={mockStore}
            products={mockProducts}
            onSubmit={vi.fn()}
          />
        </UITestWrapper>
      );

      // Vérifier l'affichage des produits avec quantités théoriques
      expect(screen.getByText('Thon Rouge')).toBeInTheDocument();
      expect(screen.getByText('Théorique: 100 kg')).toBeInTheDocument();
      expect(screen.getByText('Saumon')).toBeInTheDocument();
      expect(screen.getByText('Théorique: 50 kg')).toBeInTheDocument();

      // Saisir les quantités physiques
      const thonPhysicalInput = screen.getByLabelText('Quantité physique Thon Rouge');
      await user.type(thonPhysicalInput, '95');

      const saumonPhysicalInput = screen.getByLabelText('Quantité physique Saumon');
      await user.type(saumonPhysicalInput, '52');

      // Vérifier le calcul des écarts
      await waitFor(() => {
        expect(screen.getByText('Écart: -5 kg')).toBeInTheDocument();
        expect(screen.getByText('Écart: +2 kg')).toBeInTheDocument();
      });

      // Soumettre l'inventaire
      await user.click(screen.getByText('Soumettre pour Validation'));

      await waitFor(() => {
        expect(screen.getByText('Inventaire soumis pour validation')).toBeInTheDocument();
      });
    });

    it('should highlight significant discrepancies', async () => {
      const mockStore = { id: 'store-1', name: 'Magasin Test' };
      const mockProducts = [
        { 
          id: 'product-1', 
          name: 'Thon Rouge', 
          unit: 'kg',
          stockLevel: { quantity: 100 },
          averageCost: 5000
        }
      ];

      render(
        <UITestWrapper>
          <InventaireForm
            store={mockStore}
            products={mockProducts}
            onSubmit={vi.fn()}
          />
        </UITestWrapper>
      );

      // Saisir une quantité avec écart important
      const physicalInput = screen.getByLabelText('Quantité physique Thon Rouge');
      await user.type(physicalInput, '60'); // Écart de -40 kg

      // Vérifier l'alerte d'écart important
      await waitFor(() => {
        expect(screen.getByText('Écart important détecté!')).toBeInTheDocument();
        expect(screen.getByText('Valeur de l\'écart: -200 000 CFA')).toBeInTheDocument();
      });

      // Vérifier que le champ est mis en évidence
      expect(physicalInput).toHaveClass('border-red-500');
    });
  });

  describe('Mobile Interface Tests', () => {
    it('should render mobile-optimized interface', async () => {
      // Simuler un écran mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <UITestWrapper>
          <MobileStockManagement />
        </UITestWrapper>
      );

      // Vérifier les éléments mobile
      expect(screen.getByText('Stock Mobile')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();

      // Vérifier les cartes tactiles
      const stockCards = screen.getAllByTestId('stock-card');
      expect(stockCards.length).toBeGreaterThan(0);

      // Test de navigation tactile
      await user.click(stockCards[0]);
      await waitFor(() => {
        expect(screen.getByText('Détails du Produit')).toBeInTheDocument();
      });
    });

    it('should handle touch gestures for stock operations', async () => {
      render(
        <UITestWrapper>
          <MobileStockManagement />
        </UITestWrapper>
      );

      // Simuler un swipe pour révéler les actions
      const stockCard = screen.getByTestId('stock-card-product-1');
      
      // Simuler un touchstart et touchend pour le swipe
      fireEvent.touchStart(stockCard, {
        touches: [{ clientX: 100, clientY: 100 }]
      });
      
      fireEvent.touchEnd(stockCard, {
        changedTouches: [{ clientX: 50, clientY: 100 }]
      });

      // Vérifier l'apparition des actions
      await waitFor(() => {
        expect(screen.getByText('Déclarer Perte')).toBeInTheDocument();
        expect(screen.getByText('Voir Détails')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility and UX Tests', () => {
    it('should be keyboard navigable', async () => {
      render(
        <UITestWrapper>
          <StockManagementPage />
        </UITestWrapper>
      );

      // Navigation au clavier
      await user.tab();
      expect(screen.getByText('Arrivage Fournisseur')).toHaveFocus();

      await user.tab();
      expect(screen.getByText('Transferts Inter-Magasins')).toHaveFocus();

      // Activation par Entrée
      await user.keyboard('{Enter}');
      await waitFor(() => {
        expect(screen.getByText('Transferts de Stock')).toBeInTheDocument();
      });
    });

    it('should provide proper ARIA labels and roles', async () => {
      render(
        <UITestWrapper>
          <BonReceptionForm
            suppliers={[]}
            stores={[]}
            products={[]}
            onSubmit={vi.fn()}
          />
        </UITestWrapper>
      );

      // Vérifier les labels ARIA
      expect(screen.getByRole('form')).toHaveAttribute('aria-label', 'Formulaire de bon de réception');
      expect(screen.getByRole('combobox', { name: /fournisseur/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /valider/i })).toBeInTheDocument();

      // Vérifier les descriptions d'aide
      const quantityInput = screen.getByLabelText('Quantité reçue');
      expect(quantityInput).toHaveAttribute('aria-describedby');
    });

    it('should handle loading states appropriately', async () => {
      render(
        <UITestWrapper>
          <BonReceptionList loading={true} bonsReception={[]} />
        </UITestWrapper>
      );

      // Vérifier l'indicateur de chargement
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Chargement des bons de réception...')).toBeInTheDocument();

      // Vérifier l'accessibilité de l'indicateur
      expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    });

    it('should provide clear error messages', async () => {
      const mockError = {
        type: 'VALIDATION_ERROR',
        message: 'Quantité invalide',
        field: 'quantiteRecue'
      };

      render(
        <UITestWrapper>
          <BonReceptionForm
            suppliers={[]}
            stores={[]}
            products={[]}
            onSubmit={vi.fn()}
            error={mockError}
          />
        </UITestWrapper>
      );

      // Vérifier l'affichage de l'erreur
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Quantité invalide')).toBeInTheDocument();

      // Vérifier que le champ en erreur est mis en évidence
      const quantityInput = screen.getByLabelText('Quantité reçue');
      expect(quantityInput).toHaveAttribute('aria-invalid', 'true');
      expect(quantityInput).toHaveAttribute('aria-describedby', expect.stringContaining('error'));
    });
  });

  describe('Performance and Responsiveness Tests', () => {
    it('should render large lists efficiently', async () => {
      const largeBonsList = Array.from({ length: 1000 }, (_, i) => ({
        id: `bon-${i}`,
        numero: `BR-2024-${String(i).padStart(4, '0')}`,
        dateReception: new Date(),
        supplier: { name: `Fournisseur ${i}` },
        store: { name: `Magasin ${i % 5}` },
        totalValue: 100000 + i * 1000,
        status: i % 3 === 0 ? 'validated' : 'draft'
      }));

      const startTime = performance.now();

      render(
        <UITestWrapper>
          <BonReceptionList bonsReception={largeBonsList} loading={false} />
        </UITestWrapper>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Vérifier que le rendu est rapide (moins de 1 seconde)
      expect(renderTime).toBeLessThan(1000);

      // Vérifier que la virtualisation fonctionne (pas tous les éléments rendus)
      const visibleItems = screen.getAllByTestId(/bon-reception-item/);
      expect(visibleItems.length).toBeLessThan(largeBonsList.length);
    });

    it('should handle rapid user interactions', async () => {
      render(
        <UITestWrapper>
          <TransfertForm
            stores={[
              { id: 'store-1', name: 'Store 1' },
              { id: 'store-2', name: 'Store 2' }
            ]}
            products={[{ id: 'product-1', name: 'Product 1' }]}
            stockLevels={{ 'product-1': { quantity: 100, available: 100 } }}
            onSubmit={vi.fn()}
          />
        </UITestWrapper>
      );

      const quantityInput = screen.getByLabelText('Quantité à transférer');

      // Saisie rapide de plusieurs valeurs
      await user.type(quantityInput, '10');
      await user.clear(quantityInput);
      await user.type(quantityInput, '20');
      await user.clear(quantityInput);
      await user.type(quantityInput, '30');

      // Vérifier que la dernière valeur est correctement affichée
      expect(quantityInput).toHaveValue(30);
    });
  });
});