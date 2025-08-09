import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TransfertForm } from '../TransfertForm';

// Mock the useTransferts hook
jest.mock('../../hooks/useTransferts', () => ({
  useTransferts: () => ({
    stores: [
      { id: 'store-1', name: 'Hub Distribution' },
      { id: 'store-2', name: 'Magasin Centre-Ville' }
    ],
    products: [
      { id: 'product-1', name: 'Thon Rouge', unit: 'kg' },
      { id: 'product-2', name: 'Dorade', unit: 'kg' }
    ],
    stockLevels: [
      {
        storeId: 'store-1',
        productId: 'product-1',
        quantity: 100,
        reservedQuantity: 10,
        availableQuantity: 90,
        lastUpdated: new Date()
      }
    ],
    getStockLevel: (storeId: string, productId: string) => ({
      storeId,
      productId,
      quantity: 100,
      reservedQuantity: 10,
      availableQuantity: 90,
      lastUpdated: new Date()
    }),
    createTransfert: jest.fn().mockResolvedValue({
      id: 'transfert-1',
      numero: 'TR-2024-0001',
      status: 'en_transit'
    })
  })
}));

describe('TransfertForm', () => {
  it('renders the form correctly', () => {
    render(<TransfertForm />);
    
    expect(screen.getByText('Nouveau Transfert Inter-Magasins')).toBeInTheDocument();
    expect(screen.getByLabelText(/Magasin source/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Magasin destination/)).toBeInTheDocument();
    expect(screen.getByText('Créer le transfert')).toBeInTheDocument();
  });

  it('shows validation errors for empty required fields', async () => {
    render(<TransfertForm />);
    
    const submitButton = screen.getByText('Créer le transfert');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Magasin source requis')).toBeInTheDocument();
      expect(screen.getByText('Magasin destination requis')).toBeInTheDocument();
    });
  });

  it('prevents selecting the same store for source and destination', async () => {
    render(<TransfertForm />);
    
    const sourceSelect = screen.getByLabelText(/Magasin source/);
    const destinationSelect = screen.getByLabelText(/Magasin destination/);
    
    fireEvent.change(sourceSelect, { target: { value: 'store-1' } });
    fireEvent.change(destinationSelect, { target: { value: 'store-1' } });
    
    const submitButton = screen.getByText('Créer le transfert');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Le magasin source et destination doivent être différents')).toBeInTheDocument();
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = jest.fn();
    render(<TransfertForm onCancel={onCancel} />);
    
    const cancelButton = screen.getByText('Annuler');
    fireEvent.click(cancelButton);
    
    expect(onCancel).toHaveBeenCalled();
  });
});