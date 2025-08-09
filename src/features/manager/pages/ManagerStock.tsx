import React, { useState } from 'react';
import { Package, Truck, AlertTriangle, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { Modal, ModalBody, ModalFooter } from '../../../shared/components/ui/Modal';

interface ManagerStockProps {
  user: any;
}

export const ManagerStock: React.FC<ManagerStockProps> = ({ user }) => {
  const [showLossModal, setShowLossModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [lossEntries, setLossEntries] = useState([
    { id: 1, product: '', quantity: 0, category: 'perte', reason: '' }
  ]);

  const storeName = user.store || 'Pointe des Almadies';

  // Données mockées pour les réceptions en attente
  const pendingReceptions = [
    {
      id: 'BT-0128',
      from: 'Hub',
      products: [
        { name: 'Thon Rouge', quantity: 15, unit: 'kg' },
        { name: 'Crevettes', quantity: 10, unit: 'kg' }
      ],
      date: '04/08/2025',
      status: 'en_attente'
    }
  ];

  // Données mockées pour le stock actuel
  const currentStock = [
    { product: 'Thon Rouge', quantity: 25.5, unit: 'kg', status: 'normal' },
    { product: 'Crevettes', quantity: 8.2, unit: 'kg', status: 'bas' },
    { product: 'Soles', quantity: 15.8, unit: 'kg', status: 'normal' },
    { product: 'Bars', quantity: 12.3, unit: 'kg', status: 'normal' }
  ];

  const addLossEntry = () => {
    setLossEntries([
      ...lossEntries,
      { id: Date.now(), product: '', quantity: 0, category: 'perte', reason: '' }
    ]);
  };

  const updateLossEntry = (id: number, field: string, value: any) => {
    setLossEntries(prev =>
      prev.map(entry =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const removeLossEntry = (id: number) => {
    if (lossEntries.length > 1) {
      setLossEntries(prev => prev.filter(entry => entry.id !== id));
    }
  };

  const handleReceiveTransfer = (transferId: string) => {
    setShowReceiveModal(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      normal: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Normal' },
      bas: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle, text: 'Stock Bas' },
      en_attente: { color: 'bg-blue-100 text-blue-800', icon: Package, text: 'En Attente' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Package className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion de mon Stock - {storeName}
          </h1>
        </div>
      </div>

      {/* Réceptions en attente */}
      {pendingReceptions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Truck className="h-6 w-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Réception en attente</h2>
            </div>
            
            {pendingReceptions.map((reception) => (
              <div key={reception.id} className="p-4 border border-blue-300 rounded-lg bg-blue-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-blue-900">
                    Bon de Transfert #{reception.id} (depuis {reception.from})
                  </h3>
                  {getStatusBadge(reception.status)}
                </div>
                
                <div className="mb-3">
                  <p className="text-sm text-blue-800 mb-2">Produits à réceptionner :</p>
                  <div className="flex flex-wrap gap-2">
                    {reception.products.map((product, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {product.name}: {product.quantity}{product.unit}
                      </span>
                    ))}
                  </div>
                </div>
                
                <button 
                  onClick={() => handleReceiveTransfer(reception.id)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Contrôler & Valider la Réception
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock actuel */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock Actuel</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantité</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentStock.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {item.product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getStatusBadge(item.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Déclaration des pertes */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h2 className="text-lg font-semibold text-gray-900">Déclaration des Pertes & Invendus</h2>
            </div>
            <button 
              onClick={() => setShowLossModal(true)}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Déclarer des Pertes
            </button>
          </div>
          
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-800">
              Déclarez ici tous les produits invendus, avariés ou perdus. Ces déclarations impactent automatiquement votre stock et sont transmises au directeur.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Réception */}
      <Modal
        isOpen={showReceiveModal}
        onClose={() => setShowReceiveModal(false)}
        title="Contrôle et Validation de Réception"
        maxWidth="xl"
      >
        <ModalBody>
          <div className="mb-4">
            <h3 className="font-medium text-gray-900 mb-2">Bon de Transfert #BT-0128</h3>
            <p className="text-sm text-gray-600">Provenance: Hub de Distribution</p>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3 text-sm font-medium text-gray-700 border-b pb-2">
              <div>Produit</div>
              <div className="text-center">Quantité Prévue</div>
              <div className="text-center">Quantité Reçue</div>
              <div className="text-center">État</div>
            </div>
            
            <div className="grid grid-cols-4 gap-3 items-center">
              <div className="text-sm text-gray-900">Thon Rouge</div>
              <div className="text-center text-sm text-gray-600">15.0 kg</div>
              <div className="text-center">
                <input 
                  type="number" 
                  defaultValue="15.0"
                  step="0.1"
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded text-center"
                />
              </div>
              <div className="text-center">
                <select className="text-xs border border-gray-300 rounded px-2 py-1">
                  <option value="bon">Bon état</option>
                  <option value="moyen">État moyen</option>
                  <option value="mauvais">Mauvais état</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-3 items-center">
              <div className="text-sm text-gray-900">Crevettes</div>
              <div className="text-center text-sm text-gray-600">10.0 kg</div>
              <div className="text-center">
                <input 
                  type="number" 
                  defaultValue="10.0"
                  step="0.1"
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded text-center"
                />
              </div>
              <div className="text-center">
                <select className="text-xs border border-gray-300 rounded px-2 py-1">
                  <option value="bon">Bon état</option>
                  <option value="moyen">État moyen</option>
                  <option value="mauvais">Mauvais état</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commentaires sur la réception
            </label>
            <textarea 
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Remarques sur l'état des produits, conditions de transport..."
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <button 
            onClick={() => setShowReceiveModal(false)}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Annuler
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            Valider la Réception
          </button>
        </ModalFooter>
      </Modal>

      {/* Modal Déclaration des Pertes */}
      <Modal
        isOpen={showLossModal}
        onClose={() => setShowLossModal(false)}
        title="Déclaration des Pertes & Invendus"
        maxWidth="xl"
      >
        <ModalBody>
          <div className="space-y-4">
            {lossEntries.map((entry, index) => (
              <div key={entry.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Produit
                    </label>
                    <select 
                      value={entry.product}
                      onChange={(e) => updateLossEntry(entry.id, 'product', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sélectionner...</option>
                      <option value="thon">Thon Rouge</option>
                      <option value="crevettes">Crevettes</option>
                      <option value="soles">Soles</option>
                      <option value="bars">Bars</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantité
                    </label>
                    <input 
                      type="number"
                      value={entry.quantity || ''}
                      onChange={(e) => updateLossEntry(entry.id, 'quantity', parseFloat(e.target.value) || 0)}
                      step="0.1"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 2.3"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catégorie
                    </label>
                    <select 
                      value={entry.category}
                      onChange={(e) => updateLossEntry(entry.id, 'category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="perte">Perte</option>
                      <option value="demarque">Démarque</option>
                      <option value="avarie">Avarie</option>
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      onClick={() => removeLossEntry(entry.id)}
                      className="w-full flex items-center justify-center px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Raison / Commentaire
                  </label>
                  <input 
                    type="text"
                    value={entry.reason}
                    onChange={(e) => updateLossEntry(entry.id, 'reason', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Produit avarié, cassé, périmé..."
                  />
                </div>
              </div>
            ))}
            
            <button 
              onClick={addLossEntry}
              className="flex items-center px-4 py-2 text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une ligne
            </button>
          </div>
        </ModalBody>
        <ModalFooter>
          <button 
            onClick={() => setShowLossModal(false)}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Annuler
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
            Déclarer les Pertes
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
};