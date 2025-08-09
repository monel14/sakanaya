import React, { useState } from 'react';
import { Package, Truck, Plus, Eye, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/Tabs';
import { Modal, ModalBody, ModalFooter } from '../../../components/ui/Modal';
import { BonReceptionFormInline } from '../../stock/components/BonReceptionFormInline';
import { SimpleBonReception } from '../../stock/services/simpleBonReceptionService';

interface StockManagementProps {
  user: any;
}

export const StockManagement: React.FC<StockManagementProps> = ({ user }) => {
  const [showNewArrivalModal, setShowNewArrivalModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [recentBonsReception, setRecentBonsReception] = useState<SimpleBonReception[]>([]);

  // Données mockées pour les transferts
  const transfers = [
    {
      id: 'BT-0128',
      from: 'Hub',
      to: 'Almadies',
      status: 'en_transit',
      date: '04/08/2025',
      products: 'Thon: 15kg, Crevettes: 10kg'
    },
    {
      id: 'BT-0127',
      from: 'Hub',
      to: 'Sandaga',
      status: 'livre',
      date: '03/08/2025',
      products: 'Soles: 8kg, Bars: 12kg'
    }
  ];

  // Données mockées pour les arrivages (ancien système)
  const oldArrivals = [
    {
      id: 1,
      date: '04/08/2025',
      supplier: 'Pêcheurs de Kayar',
      products: 'Thon Rouge, Crevettes',
      totalQuantity: '125.5 kg',
      status: 'valide'
    },
    {
      id: 2,
      date: '03/08/2025',
      supplier: 'Coopérative Soumbédioune',
      products: 'Soles, Bars, Sardines',
      totalQuantity: '89.2 kg',
      status: 'valide'
    }
  ];

  // Combiner les anciens arrivages avec les nouveaux bons de réception
  const allArrivals = [
    ...recentBonsReception.map(bon => ({
      id: bon.id,
      date: bon.dateReception.toLocaleDateString('fr-FR'),
      supplier: bon.nomFournisseur,
      products: bon.lignes.map(ligne => ligne.product.name).join(', '),
      totalQuantity: `${bon.lignes.reduce((total, ligne) => total + ligne.quantiteRecue, 0)} kg`,
      totalValue: `${bon.totalValue.toLocaleString('fr-FR')} CFA`,
      status: bon.status === 'validated' ? 'valide' : 'brouillon',
      numero: bon.numero,
      type: 'nouveau'
    })),
    ...oldArrivals.map(arrival => ({ ...arrival, type: 'ancien' }))
  ];

  const handleBonReceptionCreated = (bon: SimpleBonReception) => {
    setRecentBonsReception(prev => [bon, ...prev]);
    setShowNewArrivalModal(false);
  };

  // Données mockées pour l'état des stocks
  const stockOverview = [
    { store: 'Hub de Distribution', totalStock: '450.2 kg', status: 'normal' },
    { store: 'Pointe des Almadies', totalStock: '125.8 kg', status: 'bas' },
    { store: 'Sandaga', totalStock: '89.5 kg', status: 'normal' },
    { store: 'Mermoz', totalStock: '156.3 kg', status: 'normal' }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      en_transit: { color: 'bg-blue-100 text-blue-800', icon: Clock, text: 'En Transit' },
      livre: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Livré' },
      valide: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Validé' },
      brouillon: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Brouillon' },
      normal: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Normal' },
      bas: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle, text: 'Stock Bas' }
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
            Pilotage Global des Stocks
          </h1>
        </div>
      </div>

      <Tabs defaultValue="overview" className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 pb-0">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="transfers">Transferts</TabsTrigger>
            <TabsTrigger value="arrivals">Arrivages Fournisseurs</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="p-6">
          <h3 className="text-lg font-semibold mb-4">État des stocks en temps réel</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stockOverview.map((store, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{store.store}</h4>
                  {getStatusBadge(store.status)}
                </div>
                <div className="text-2xl font-bold text-gray-900">{store.totalStock}</div>
                <div className="text-sm text-gray-500">Stock total</div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <Package className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Résumé des stocks</h4>
                <p className="text-sm text-blue-800">
                  Stock total réseau: 821.8 kg • 1 magasin en stock bas • 3 transferts en cours
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="transfers" className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Suivi des Transferts Inter-Magasins</h3>
            <button 
              onClick={() => setShowTransferModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Transfert
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#Bon</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">De</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vers</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transfers.map((transfer) => (
                  <tr key={transfer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {transfer.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {transfer.from}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {transfer.to}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(transfer.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {transfer.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                        Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="arrivals" className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold">Bons de Réception Fournisseur</h3>
              <p className="text-sm text-gray-600 mt-1">
                Nouveau système structuré avec coûts d'achat et calculs automatiques
              </p>
            </div>
            <button 
              onClick={() => setShowNewArrivalModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Bon de Réception
            </button>
          </div>

          {/* Amélioration notice */}
          {recentBonsReception.length > 0 && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900 mb-1">Nouveau système actif !</h4>
                  <p className="text-sm text-green-800">
                    {recentBonsReception.length} bon(s) de réception créé(s) avec le nouveau système structuré.
                    Coûts d'achat enregistrés pour le calcul du CUMP.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Bon</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fournisseur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produits</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantité</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valeur (CFA)</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allArrivals.map((arrival) => (
                  <tr key={arrival.id} className={`hover:bg-gray-50 ${arrival.type === 'nouveau' ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">
                          {arrival.numero || `#${arrival.id}`}
                        </span>
                        {arrival.type === 'nouveau' && (
                          <span className="ml-2 inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            Nouveau
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {arrival.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {arrival.supplier}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {arrival.products}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 font-medium">
                      {arrival.totalQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 font-medium">
                      {arrival.totalValue || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getStatusBadge(arrival.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                        {arrival.type === 'nouveau' ? 'Voir Bon' : 'Détails'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {allArrivals.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun bon de réception</h3>
              <p className="text-gray-500 mb-4">Commencez par créer votre premier bon de réception fournisseur.</p>
              <button 
                onClick={() => setShowNewArrivalModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer un bon de réception
              </button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal Nouveau Bon de Réception - Version inline */}
      <Modal
        isOpen={showNewArrivalModal}
        onClose={() => setShowNewArrivalModal(false)}
        title="Nouveau Bon de Réception Fournisseur"
        maxWidth="6xl"
      >
        <ModalBody>
          <BonReceptionFormInline
            storeId="store-1" // TODO: Get from context or user selection
            onBonCreated={handleBonReceptionCreated}
            onCancel={() => setShowNewArrivalModal(false)}
          />
        </ModalBody>
      </Modal>

      {/* Modal Nouveau Transfert */}
      <Modal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        title="Nouveau Transfert Inter-Magasins"
        maxWidth="xl"
      >
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Magasin Source
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Hub de Distribution</option>
                <option>Pointe des Almadies</option>
                <option>Sandaga</option>
                <option>Mermoz</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Magasin Destination
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Pointe des Almadies</option>
                <option>Sandaga</option>
                <option>Mermoz</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Produits à Transférer
            </label>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <select className="px-3 py-2 border border-gray-300 rounded-md">
                  <option>Thon Rouge</option>
                  <option>Crevettes</option>
                  <option>Soles</option>
                </select>
                <input 
                  type="number" 
                  placeholder="Quantité" 
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
                <div className="text-sm text-gray-500 self-center">kg</div>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                + Ajouter un produit
              </button>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <button 
            onClick={() => setShowTransferModal(false)}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Annuler
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Créer le Transfert
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
};