import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BonReceptionForm } from '../BonReceptionForm';
import { simpleBonReceptionService } from '../../shared/services/simpleBonReceptionService';

// Mock the service
vi.mock('../../services/simpleBonReceptionService', () => ({
  simpleBonReceptionService: {
    createBonReception: vi.fn(),
    validateBonReception: vi.fn()
  }
}));

describe('BonReceptionForm', () => {
  const mockOnBonCreated = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the form with all required fields', () => {
    render(
      <BonReceptionForm
        storeId="store-1"
        onBonCreated={mockOnBonCreated}
        onCancel={mockOnCancel}
      />
    );

    // Check header
    expect(screen.getByText('Nouveau Bon de Réception Fournisseur')).toBeInTheDocument();

    // Check sections
    expect(screen.getByText('📋 Informations Générales')).toBeInTheDocument();
    expect(screen.getByText('📦 Lignes de Produits')).toBeInTheDocument();

    // Check required fields
    expect(screen.getByLabelText('Date de réception *')).toBeInTheDocument();
    expect(screen.getByLabelText('Nom du fournisseur *')).toBeInTheDocument();
    expect(screen.getByLabelText('Magasin de réception *')).toBeInTheDocument();

    // Check buttons
    expect(screen.getByText('Sauvegarder en brouillon')).toBeInTheDocument();
    expect(screen.getByText('Valider le bon de réception')).toBeInTheDocument();
  });

  it('should add and remove product lines', () => {
    render(
      <BonReceptionForm
        storeId="store-1"
        onBonCreated={mockOnBonCreated}
        onCancel={mockOnCancel}
      />
    );

    // Initially should have 1 line
    expect(screen.getAllByText('Sélectionner un produit')).toHaveLength(1);

    // Add a line
    fireEvent.click(screen.getByText('Ajouter une ligne'));
    expect(screen.getAllByText('Sélectionner un produit')).toHaveLength(2);

    // Remove a line (should have delete button now)
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(btn => 
      btn.querySelector('svg') && btn.getAttribute('type') === 'button'
    );
    
    if (deleteButton) {
      fireEvent.click(deleteButton);
      expect(screen.getAllByText('Sélectionner un produit')).toHaveLength(1);
    }
  });

  it('should calculate subtotals automatically', async () => {
    render(
      <BonReceptionForm
        storeId="store-1"
        onBonCreated={mockOnBonCreated}
        onCancel={mockOnCancel}
      />
    );

    // Find quantity and cost inputs
    const quantityInput = screen.getByPlaceholderText('0.0');
    const costInput = screen.getByPlaceholderText('0');

    // Enter values
    fireEvent.change(quantityInput, { target: { value: '10' } });
    fireEvent.change(costInput, { target: { value: '1000' } });

    // Check if subtotal is calculated (10 * 1000 = 10000)
    await waitFor(() => {
      expect(screen.getByText('10 000 CFA')).toBeInTheDocument();
    });
  });

  it('should validate required fields', async () => {
    render(
      <BonReceptionForm
        storeId="store-1"
        onBonCreated={mockOnBonCreated}
        onCancel={mockOnCancel}
      />
    );

    // Try to submit without filling required fields
    fireEvent.click(screen.getByText('Valider le bon de réception'));

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText('Le nom du fournisseur est requis')).toBeInTheDocument();
    });
  });

  it('should create bon reception when form is valid', async () => {
    const mockBon = {
      id: 'bon-123',
      numero: 'BR-2024-0001',
      dateReception: new Date(),
      nomFournisseur: 'Test Supplier',
      storeId: 'store-1',
      store: { id: 'store-1', name: 'Magasin Central' },
      lignes: [],
      totalValue: 10000,
      status: 'validated' as const,
      createdBy: 'user-1',
      createdAt: new Date()
    };

    (simpleBonReceptionService.createBonReception as any).mockResolvedValue(mockBon);
    (simpleBonReceptionService.validateBonReception as any).mockResolvedValue(mockBon);

    render(
      <BonReceptionForm
        storeId="store-1"
        onBonCreated={mockOnBonCreated}
        onCancel={mockOnCancel}
      />
    );

    // Fill required fields
    fireEvent.change(screen.getByLabelText('Nom du fournisseur *'), {
      target: { value: 'Test Supplier' }
    });

    // Select product
    const productSelect = screen.getAllByRole('combobox')[1]; // First is store, second is product
    fireEvent.change(productSelect, { target: { value: 'prod-1' } });

    // Fill quantity and cost
    const quantityInput = screen.getByPlaceholderText('0.0');
    const costInput = screen.getByPlaceholderText('0');
    fireEvent.change(quantityInput, { target: { value: '10' } });
    fireEvent.change(costInput, { target: { value: '1000' } });

    // Submit form
    fireEvent.click(screen.getByText('Valider le bon de réception'));

    // Should call service and callback
    await waitFor(() => {
      expect(simpleBonReceptionService.createBonReception).toHaveBeenCalled();
      expect(simpleBonReceptionService.validateBonReception).toHaveBeenCalled();
      expect(mockOnBonCreated).toHaveBeenCalledWith(mockBon);
    });
  });

  it('should save as draft when draft button is clicked', async () => {
    const mockBon = {
      id: 'bon-123',
      numero: 'BR-2024-0001',
      dateReception: new Date(),
      nomFournisseur: 'Test Supplier',
      storeId: 'store-1',
      store: { id: 'store-1', name: 'Magasin Central' },
      lignes: [],
      totalValue: 10000,
      status: 'draft' as const,
      createdBy: 'user-1',
      createdAt: new Date()
    };

    (simpleBonReceptionService.createBonReception as any).mockResolvedValue(mockBon);

    render(
      <BonReceptionForm
        storeId="store-1"
        onBonCreated={mockOnBonCreated}
        onCancel={mockOnCancel}
      />
    );

    // Fill required fields
    fireEvent.change(screen.getByLabelText('Nom du fournisseur *'), {
      target: { value: 'Test Supplier' }
    });

    // Select product and fill details
    const productSelect = screen.getAllByRole('combobox')[1];
    fireEvent.change(productSelect, { target: { value: 'prod-1' } });

    const quantityInput = screen.getByPlaceholderText('0.0');
    const costInput = screen.getByPlaceholderText('0');
    fireEvent.change(quantityInput, { target: { value: '10' } });
    fireEvent.change(costInput, { target: { value: '1000' } });

    // Click draft button
    fireEvent.click(screen.getByText('Sauvegarder en brouillon'));

    // Should call service but not validate
    await waitFor(() => {
      expect(simpleBonReceptionService.createBonReception).toHaveBeenCalled();
      expect(simpleBonReceptionService.validateBonReception).not.toHaveBeenCalled();
      expect(mockOnBonCreated).toHaveBeenCalledWith(mockBon);
    });
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(
      <BonReceptionForm
        storeId="store-1"
        onBonCreated={mockOnBonCreated}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('Annuler'));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});