import React, { useState, useEffect } from 'react';
import { Supplier } from '../../types';
import { supplierService } from '../../services/supplierService';
import { SupplierForm } from './SupplierForm';
import { SupplierList } from './SupplierList';
import { SupplierStats } from './SupplierStats';

export const SupplierManagement: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  // Load suppliers on component mount
  useEffect(() => {
    loadSuppliers();
  }, [showInactive]);

  // Filter suppliers based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSuppliers(suppliers);
    } else {
      const filtered = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.contact?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.phone?.includes(searchQuery) ||
        supplier.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSuppliers(filtered);
    }
  }, [suppliers, searchQuery]);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await supplierService.getAllSuppliers(showInactive);
      setSuppliers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des fournisseurs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSupplier = () => {
    setEditingSupplier(null);
    setShowForm(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  const handleFormSubmit = (supplier: Supplier) => {
    if (editingSupplier) {
      // Update existing supplier in the list
      setSuppliers(prev => prev.map(s => s.id === supplier.id ? supplier : s));
    } else {
      // Add new supplier to the list
      setSuppliers(prev => [supplier, ...prev]);
    }
    setShowForm(false);
    setEditingSupplier(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingSupplier(null);
  };

  const handleToggleStatus = async (supplier: Supplier) => {
    try {
      const updatedSupplier = await supplierService.toggleSupplierStatus(
        supplier.id,
        !supplier.isActive,
        'current-user-id' // TODO: Get from auth context
      );
      setSuppliers(prev => prev.map(s => s.id === supplier.id ? updatedSupplier : s));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification du statut');
    }
  };

  const handleDeleteSupplier = async (supplier: Supplier) => {
    if (!confirm(`Êtes-vous sûr de vouloir désactiver le fournisseur "${supplier.name}" ?`)) {
      return;
    }

    try {
      await supplierService.deleteSupplier(supplier.id, 'current-user-id'); // TODO: Get from auth context
      setSuppliers(prev => prev.map(s => s.id === supplier.id ? { ...s, isActive: false } : s));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  if (showForm) {
    return (
      <SupplierForm
        supplier={editingSupplier || undefined}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Fournisseurs</h1>
          <p className="text-gray-600">Gérez vos fournisseurs et leurs informations de contact</p>
        </div>
        <button
          onClick={handleCreateSupplier}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nouveau Fournisseur</span>
        </button>
      </div>

      {/* Statistics */}
      <SupplierStats />

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Rechercher un fournisseur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Show inactive toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showInactive"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="showInactive" className="ml-2 block text-sm text-gray-700">
              Afficher les inactifs
            </label>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suppliers List */}
      <SupplierList
        suppliers={filteredSuppliers}
        loading={loading}
        onEdit={handleEditSupplier}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteSupplier}
        onRefresh={loadSuppliers}
      />
    </div>
  );
};