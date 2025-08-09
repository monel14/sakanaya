import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupplierManagement } from '../SupplierManagement';
import { supplierService } from '../../../services/supplierService';

// Mock the supplier service
vi.mock('../../../services/supplierService', () => ({
  supplierService: {
    getAllSuppliers: vi.fn(),
    getSupplierStats: vi.fn(),
    createSupplier: vi.fn(),
    updateSupplier: vi.fn(),
    toggleSupplierStatus: vi.fn(),
    deleteSupplier: vi.fn()
  }
}));

const mockSuppliers = [
  {
    id: '1',
    name: 'Fournisseur Test 1',
    contact: 'Contact 1',
    phone: '+221 77 123 45 67',
    email: 'test1@example.com',
    address: 'Adresse 1',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    createdBy: 'user-1'
  },
  {
    id: '2',
    name: 'Fournisseur Test 2',
    contact: 'Contact 2',
    phone: '+221 77 987 65 43',
    email: 'test2@example.com',
    address: 'Adresse 2',
    isActive: false,
    createdAt: new Date('2024-01-02'),
    createdBy: 'user-1'
  }
];

const mockStats = {
  total: 2,
  active: 1,
  inactive: 1,
  recentlyAdded: 2
};

describe('SupplierManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (supplierService.getAllSuppliers as any).mockResolvedValue(mockSuppliers.filter(s => s.isActive));
    (supplierService.getSupplierStats as any).mockResolvedValue(mockStats);
  });

  it('should render supplier management interface', async () => {
    render(<SupplierManagement />);

    // Check header
    expect(screen.getByText('Gestion des Fournisseurs')).toBeInTheDocument();
    expect(screen.getByText('Nouveau Fournisseur')).toBeInTheDocument();

    // Wait for suppliers to load
    await waitFor(() => {
      expect(screen.getByText('Fournisseur Test 1')).toBeInTheDocument();
    });
  });

  it('should show create supplier form when clicking new supplier button', async () => {
    render(<SupplierManagement />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Fournisseur Test 1')).toBeInTheDocument();
    });

    // Click new supplier button
    fireEvent.click(screen.getByText('Nouveau Fournisseur'));

    // Check if form is shown
    expect(screen.getByText('Nouveau fournisseur')).toBeInTheDocument();
    expect(screen.getByLabelText('Nom du fournisseur *')).toBeInTheDocument();
  });

  it('should filter suppliers based on search query', async () => {
    render(<SupplierManagement />);

    // Wait for suppliers to load
    await waitFor(() => {
      expect(screen.getByText('Fournisseur Test 1')).toBeInTheDocument();
    });

    // Search for specific supplier
    const searchInput = screen.getByPlaceholderText('Rechercher un fournisseur...');
    fireEvent.change(searchInput, { target: { value: 'Test 1' } });

    // Should show filtered results
    expect(screen.getByText('Fournisseur Test 1')).toBeInTheDocument();
  });

  it('should toggle show inactive suppliers', async () => {
    render(<SupplierManagement />);

    // Initially should only show active suppliers
    await waitFor(() => {
      expect(screen.getByText('Fournisseur Test 1')).toBeInTheDocument();
    });

    // Mock to return all suppliers when including inactive
    (supplierService.getAllSuppliers as any).mockResolvedValue(mockSuppliers);

    // Toggle show inactive
    const showInactiveCheckbox = screen.getByLabelText('Afficher les inactifs');
    fireEvent.click(showInactiveCheckbox);

    // Should call service with includeInactive = true
    await waitFor(() => {
      expect(supplierService.getAllSuppliers).toHaveBeenCalledWith(true);
    });
  });

  it('should handle supplier creation', async () => {
    const newSupplier = {
      id: '3',
      name: 'Nouveau Fournisseur',
      contact: 'Nouveau Contact',
      phone: '+221 77 111 22 33',
      email: 'nouveau@example.com',
      address: 'Nouvelle Adresse',
      isActive: true,
      createdAt: new Date(),
      createdBy: 'current-user-id'
    };

    (supplierService.createSupplier as any).mockResolvedValue(newSupplier);

    render(<SupplierManagement />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Fournisseur Test 1')).toBeInTheDocument();
    });

    // Click new supplier button
    fireEvent.click(screen.getByText('Nouveau Fournisseur'));

    // Fill form
    fireEvent.change(screen.getByLabelText('Nom du fournisseur *'), {
      target: { value: 'Nouveau Fournisseur' }
    });

    // Submit form
    fireEvent.click(screen.getByText('Créer'));

    // Should call create service
    await waitFor(() => {
      expect(supplierService.createSupplier).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Nouveau Fournisseur'
        }),
        'current-user-id'
      );
    });
  });

  it('should handle errors gracefully', async () => {
    (supplierService.getAllSuppliers as any).mockRejectedValue(new Error('Erreur de test'));

    render(<SupplierManagement />);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('Erreur de test')).toBeInTheDocument();
    });
  });
});