import React, { useState } from 'react';
import { ClipboardList, Plus, CheckCircle, Clock } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/Tabs';
import { Modal, ModalBody } from '../../../components/ui/Modal';

// Import des composants d'inventaire
import { InventaireForm } from '../../stock/components/Inventaire/InventaireForm';
import { InventaireList } from '../../stock/components/Inventaire/InventaireList';
import { InventaireReports } from '../../stock/components/Inventaire/InventaireReports';
import { ValidationInventaire } from '../../stock/components/Inventaire/ValidationInventaire';

interface InventaireManagementProps {
  user: any;
}

export const InventaireManagement: React.FC<InventaireManagementProps> = ({ user }) => {
  const [showNewInventaireModal, setShowNewInventaireModal] = useState(false);
  const [selectedInventaire, setSelectedInventaire] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);

  const handleInventaireCreated = (inventaire: any) => {
    setShowNewInventaireModal(false);
    // Refresh the list or show success message
  };

  const handleValidationClick = (inventaire: any) => {
    setSelectedInventaire(inventaire);
    setShowValidationModal(true);
  };

  const handleValidationCompleted = (inventaire: any) => {
    setShowValidationModal(false);
    setSelectedInventaire(null);
    // Refresh the list or show success message
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ClipboardList className="h-8 w-8 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des Inventaires Physiques
          </h1>
        </div>
        {user.role === 'director' && (
          <button 
            onClick={() => setShowNewInventaireModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvel Inventaire
          </button>
        )}
      </div>

      <Tabs defaultValue="list" className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 pb-0">
          <TabsList>
            <TabsTrigger value="list">Liste des Inventaires</TabsTrigger>
            <TabsTrigger value="pending">En Attente de Validation</TabsTrigger>
            <TabsTrigger value="reports">Rapports & Analyses</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list" className="p-6">
          <InventaireList 
            onValidationClick={handleValidationClick}
            userRole={user.role}
            currentStoreId={user.storeId}
          />
        </TabsContent>

        <TabsContent value="pending" className="p-6">
          <InventaireList 
            statusFilter="en_attente_validation"
            onValidationClick={handleValidationClick}
            userRole={user.role}
            currentStoreId={user.storeId}
          />
        </TabsContent>

        <TabsContent value="reports" className="p-6">
          <InventaireReports 
            userRole={user.role}
            currentStoreId={user.storeId}
          />
        </TabsContent>
      </Tabs>

      {/* Modal Nouvel Inventaire */}
      <Modal
        isOpen={showNewInventaireModal}
        onClose={() => setShowNewInventaireModal(false)}
        title="Nouvel Inventaire Physique"
        maxWidth="4xl"
      >
        <ModalBody>
          <InventaireForm
            storeId={user.storeId}
            onSuccess={handleInventaireCreated}
            onCancel={() => setShowNewInventaireModal(false)}
          />
        </ModalBody>
      </Modal>

      {/* Modal Validation */}
      {selectedInventaire && (
        <Modal
          isOpen={showValidationModal}
          onClose={() => setShowValidationModal(false)}
          title="Validation d'Inventaire"
          maxWidth="6xl"
        >
          <ModalBody>
            <ValidationInventaire
              inventaire={selectedInventaire}
              onValidationCompleted={handleValidationCompleted}
              onCancel={() => setShowValidationModal(false)}
            />
          </ModalBody>
        </Modal>
      )}
    </div>
  );
};