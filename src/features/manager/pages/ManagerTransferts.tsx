import React, { useState } from 'react';
import { Truck, Package, CheckCircle, Clock } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/Tabs';
import { Modal, ModalBody } from '../../../components/ui/Modal';

// Import des composants de transfert
import { TransfertList } from '../../stock/components/Transfert/TransfertList';
import { ReceptionForm } from '../../stock/components/Transfert/ReceptionForm';

interface ManagerTransfertsProps {
  user: any;
}

export const ManagerTransferts: React.FC<ManagerTransfertsProps> = ({ user }) => {
  const [selectedTransfert, setSelectedTransfert] = useState(null);
  const [showReceptionModal, setShowReceptionModal] = useState(false);

  const storeName = user.store || 'Mon Magasin';

  const handleReceptionClick = (transfert: any) => {
    setSelectedTransfert(transfert);
    setShowReceptionModal(true);
  };

  const handleReceptionCompleted = (transfert: any) => {
    setShowReceptionModal(false);
    setSelectedTransfert(null);
    // Refresh the list or show success message
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Truck className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Transferts - {storeName}
          </h1>
        </div>
      </div>

      {/* Alertes de réceptions en attente */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Package className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">Réceptions en attente</h3>
            <p className="text-sm text-blue-800">
              Vous avez des transferts en attente de réception. Vérifiez l'onglet "À Réceptionner" pour les traiter.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="incoming" className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 pb-0">
          <TabsList>
            <TabsTrigger value="incoming">À Réceptionner</TabsTrigger>
            <TabsTrigger value="outgoing">Envoyés</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="incoming" className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Transferts entrants à réceptionner
            </h3>
            <p className="text-sm text-gray-600">
              Contrôlez et validez les transferts reçus dans votre magasin.
            </p>
          </div>
          
          <TransfertList 
            direction="incoming"
            statusFilter="en_transit"
            onReceptionClick={handleReceptionClick}
            userRole={user.role}
            currentStoreId={user.storeId}
          />
        </TabsContent>

        <TabsContent value="outgoing" className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Transferts sortants de votre magasin
            </h3>
            <p className="text-sm text-gray-600">
              Suivez les transferts que vous avez envoyés vers d'autres magasins.
            </p>
          </div>
          
          <TransfertList 
            direction="outgoing"
            userRole={user.role}
            currentStoreId={user.storeId}
          />
        </TabsContent>

        <TabsContent value="history" className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Historique complet des transferts
            </h3>
            <p className="text-sm text-gray-600">
              Consultez l'historique de tous les transferts impliquant votre magasin.
            </p>
          </div>
          
          <TransfertList 
            userRole={user.role}
            currentStoreId={user.storeId}
          />
        </TabsContent>
      </Tabs>

      {/* Modal Réception */}
      {selectedTransfert && (
        <Modal
          isOpen={showReceptionModal}
          onClose={() => setShowReceptionModal(false)}
          title="Réception de Transfert"
          maxWidth="4xl"
        >
          <ModalBody>
            <ReceptionForm
              transfert={selectedTransfert}
              onSuccess={handleReceptionCompleted}
              onCancel={() => setShowReceptionModal(false)}
            />
          </ModalBody>
        </Modal>
      )}
    </div>
  );
};