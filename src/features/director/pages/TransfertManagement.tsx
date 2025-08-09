import React, { useState } from 'react';
import { Truck, Plus, Package, ArrowRightLeft } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../shared/components/ui/Tabs';
import { Modal, ModalBody } from '../../../shared/components/ui/Modal';

// Import des composants de transfert
import { TransfertForm } from '../../stock/components/Transfert/TransfertForm';
import { TransfertList } from '../../stock/components/Transfert/TransfertList';
import { ReceptionForm } from '../../stock/components/Transfert/ReceptionForm';

interface TransfertManagementProps {
  user: any;
}

export const TransfertManagement: React.FC<TransfertManagementProps> = ({ user }) => {
  const [showNewTransfertModal, setShowNewTransfertModal] = useState(false);
  const [selectedTransfert, setSelectedTransfert] = useState(null);
  const [showReceptionModal, setShowReceptionModal] = useState(false);

  const handleTransfertCreated = (transfert: any) => {
    setShowNewTransfertModal(false);
    // Refresh the list or show success message
  };

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
            Gestion des Transferts Inter-Magasins
          </h1>
        </div>
        <button 
          onClick={() => setShowNewTransfertModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Transfert
        </button>
      </div>

      <Tabs defaultValue="all" className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 pb-0">
          <TabsList>
            <TabsTrigger value="all">Tous les Transferts</TabsTrigger>
            <TabsTrigger value="pending">En Transit</TabsTrigger>
            <TabsTrigger value="completed">Terminés</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="p-6">
          <TransfertList 
            onReceptionClick={handleReceptionClick}
            userRole={user.role}
            currentStoreId={user.storeId}
          />
        </TabsContent>

        <TabsContent value="pending" className="p-6">
          <TransfertList 
            statusFilter="en_transit"
            onReceptionClick={handleReceptionClick}
            userRole={user.role}
            currentStoreId={user.storeId}
          />
        </TabsContent>

        <TabsContent value="completed" className="p-6">
          <TransfertList 
            statusFilter="termine"
            onReceptionClick={handleReceptionClick}
            userRole={user.role}
            currentStoreId={user.storeId}
          />
        </TabsContent>
      </Tabs>

      {/* Modal Nouveau Transfert */}
      <Modal
        isOpen={showNewTransfertModal}
        onClose={() => setShowNewTransfertModal(false)}
        title="Nouveau Transfert Inter-Magasins"
        maxWidth="4xl"
      >
        <ModalBody>
          <TransfertForm
            currentStoreId={user.storeId}
            userRole={user.role}
            onSuccess={handleTransfertCreated}
            onCancel={() => setShowNewTransfertModal(false)}
          />
        </ModalBody>
      </Modal>

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