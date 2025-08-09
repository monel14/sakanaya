import React, { useState } from 'react';
import { Plus, DollarSign, Package, Edit, History, Trash2 } from 'lucide-react';
import { usePriceManagement } from '../../../shared/hooks/usePriceManagement';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';
import { Modal, ModalBody, ModalFooter } from '../../../components/ui/Modal';

interface ProductCatalogProps {
  user: any;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ user }) => {
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPriceUpdate, setShowPriceUpdate] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [newPrice, setNewPrice] = useState('');
  const [priceReason, setPriceReason] = useState('');
  const [salesUnits, setSalesUnits] = useState([
    { name: 'Thon au Kg', price: 6500, factor: 1 },
    { name: 'Pack de Thon', price: 3500, factor: 0.5 }
  ]);

  const {
    allProducts: products,
    variableProducts,
    loading,
    error,
    updateProductPrice,
    getPriceHistory
  } = usePriceManagement(currentUser?.id);

  const categories = ['all', 'Poisson', 'Crustacé', 'Coquillage'];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const handleUpdatePrice = async (product: any) => {
    setSelectedProduct(product);
    setNewPrice(product.unitPrice.toString());
    setPriceReason('');
    setShowPriceUpdate(true);
  };

  const handlePriceSubmit = async () => {
    if (!selectedProduct || !newPrice || !priceReason.trim()) {
      addNotification({
        type: 'error',
        title: 'Champs requis',
        message: 'Veuillez remplir le prix et la raison'
      });
      return;
    }

    try {
      await updateProductPrice(selectedProduct.id, parseFloat(newPrice), priceReason.trim());
      setShowPriceUpdate(false);
      addNotification({
        type: 'success',
        title: 'Prix mis à jour',
        message: `Prix de ${selectedProduct.name} mis à jour avec succès`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de mettre à jour le prix'
      });
    }
  };

  const handleShowHistory = async (product: any) => {
    try {
      const history = await getPriceHistory(product.id);
      console.log('Historique des prix:', history);
      // TODO: Afficher dans une modal
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger l\'historique'
      });
    }
  };

  const addSalesUnit = () => {
    setSalesUnits([...salesUnits, { name: '', price: 0, factor: 1 }]);
  };

  const updateSalesUnit = (index: number, field: string, value: any) => {
    setSalesUnits(prev => 
      prev.map((unit, i) => 
        i === index ? { ...unit, [field]: value } : unit
      )
    );
  };

  const removeSalesUnit = (index: number) => {
    if (salesUnits.length > 1) {
      setSalesUnits(prev => prev.filter((_, i) => i !== index));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement des produits...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Erreur: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <DollarSign className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Produits & Prix
          </h1>
        </div>
      </div>

      {/* Mise à jour des prix variables */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <DollarSign className="h-6 w-6 text-yellow-600" />
            <h2 className="text-lg font-semibold text-gray-900">Mise à Jour des Prix du Jour</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Tous les produits ont des prix variables basés sur le prix d'achat + marge. Modifiez le prix d'achat ou la marge pour recalculer automatiquement le prix de vente.
          </p>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Prix d'Achat (CFA)</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Marge (%)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Prix de Vente (CFA)</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <input 
                        type="number" 
                        defaultValue={product.purchasePrice || 0}
                        className="w-24 px-2 py-1 text-right border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Prix d'achat"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input 
                        type="number" 
                        defaultValue={product.margin || 25}
                        className="w-16 px-2 py-1 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max="100"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="px-3 py-2 bg-blue-50 rounded-md font-semibold text-blue-900">
                        {product.unitPrice.toLocaleString()} / {product.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button 
                        onClick={() => handleUpdatePrice(product)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Mettre à jour
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600">
              <span className="inline-flex items-center">
                📅 Dernière mise à jour: 05/08/2025 à 06:30
              </span>
            </div>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              <DollarSign className="h-4 w-4 mr-2" />
              Valider les nouveaux prix
            </button>
          </div>
        </div>
      </div>

      {/* Catalogue des produits */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Package className="h-6 w-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Catalogue Produits</h2>
            </div>
            <button 
              onClick={() => setShowAddProduct(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter Produit
            </button>
          </div>

          {/* Filtres */}
          <div className="flex space-x-2 mb-4">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'Tous' : category}
              </button>
            ))}
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom Produit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unité de Stock</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Prix d'Achat</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Marge (%)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Prix de Vente</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {product.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 font-medium">
                      {(product.purchasePrice || 0).toLocaleString()} CFA
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {product.margin || 25}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 font-medium">
                      {product.unitPrice.toLocaleString()} CFA
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 text-sm">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleShowHistory(product)}
                          className="text-gray-600 hover:text-gray-900 text-sm"
                        >
                          <History className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900 text-sm">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Ajouter Produit */}
      <Modal
        isOpen={showAddProduct}
        onClose={() => setShowAddProduct(false)}
        title="Ajouter un Produit"
        maxWidth="3xl"
      >
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du Produit
              </label>
              <input 
                type="text" 
                defaultValue="Thon Rouge"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unité de Stock
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="kg">Kilogramme (kg)</option>
                <option value="piece">Pièce</option>
                <option value="litre">Litre</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de Prix
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Variable (mis à jour quotidiennement)</option>
              <option>Fixe</option>
            </select>
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <h3 className="font-semibold mb-2">Unités de Vente</h3>
            <p className="text-xs text-gray-500 mb-3">
              Définissez comment ce produit est vendu. Chaque vente décrémentera le stock principal selon le facteur de conversion.
            </p>
            
            <div className="space-y-3">
              {salesUnits.map((unit, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 bg-gray-50 rounded">
                  <div className="col-span-5">
                    <label className="text-xs text-gray-600">Nom</label>
                    <input 
                      type="text" 
                      value={unit.name}
                      onChange={(e) => updateSalesUnit(index, 'name', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="text-xs text-gray-600">Prix Vente (CFA)</label>
                    <input 
                      type="number" 
                      value={unit.price}
                      onChange={(e) => updateSalesUnit(index, 'price', parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="text-xs text-gray-600">Facteur / Unité de Stock</label>
                    <input 
                      type="number" 
                      value={unit.factor}
                      onChange={(e) => updateSalesUnit(index, 'factor', parseFloat(e.target.value))}
                      step="0.1"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div className="col-span-1 self-end">
                    <button 
                      onClick={() => removeSalesUnit(index)}
                      className="w-full p-1 text-red-500 hover:text-red-700 text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              <button 
                onClick={addSalesUnit}
                className="flex items-center px-3 py-2 text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une unité de vente
              </button>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <button 
            onClick={() => setShowAddProduct(false)}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Annuler
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Sauvegarder Produit
          </button>
        </ModalFooter>
      </Modal>

      {/* Modal de mise à jour des prix */}
      <Modal
        isOpen={showPriceUpdate}
        onClose={() => setShowPriceUpdate(false)}
        title={`Mettre à jour le prix - ${selectedProduct?.name}`}
        maxWidth="lg"
      >
        <ModalBody>
          <div className="space-y-6">
            {/* Prix actuels */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Prix actuels</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Prix d'achat:</span>
                  <div className="font-semibold">{(selectedProduct?.purchasePrice || 0).toLocaleString()} CFA</div>
                </div>
                <div>
                  <span className="text-gray-500">Marge:</span>
                  <div className="font-semibold">{selectedProduct?.margin || 25}%</div>
                </div>
                <div>
                  <span className="text-gray-500">Prix de vente:</span>
                  <div className="font-semibold text-blue-600">{selectedProduct?.unitPrice.toLocaleString()} CFA</div>
                </div>
              </div>
            </div>

            {/* Nouveaux prix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau Prix d'Achat (CFA) *
                </label>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Prix d'achat"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marge (%) *
                </label>
                <input
                  type="number"
                  defaultValue={selectedProduct?.margin || 25}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Marge"
                />
              </div>
            </div>

            {/* Prix de vente calculé */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">Prix de vente calculé:</span>
                <span className="text-lg font-bold text-blue-900">
                  {newPrice ? Math.round(parseFloat(newPrice) * 1.25).toLocaleString() : '0'} CFA
                </span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Calculé automatiquement: Prix d'achat + Marge
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raison du changement *
              </label>
              <textarea
                value={priceReason}
                onChange={(e) => setPriceReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Hausse prix fournisseur, nouveau fournisseur, ajustement marché..."
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <button
            onClick={() => setShowPriceUpdate(false)}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handlePriceSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Mettre à jour les prix
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
};