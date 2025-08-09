import React, { useState } from 'react';
import { ClipboardList, Plus, AlertTriangle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/Tabs';
import { Modal, ModalBody } from '../../../components/ui/Modal';

// Import des composants d'inventaire
import { InventaireForm } from '../../stock/components/Inventaire/InventaireForm';
import { ComptageSheet } from '../../stock/components/Inventaire/ComptageSheet';
import { InventaireList } from '../../stock/components/Inventaire/InventaireList';

interface ManagerInventaireProps {
  user: any;
}

export const ManagerInventaire: React.FC<ManagerInventaireProps> = ({ user }) => {
  const [showNewInventaireModal, setShowNewInventaireModal] = useState(false);
  const [selectedInventaire, setSelectedInventaire] = useState(null);
  const [showComptageModal, setShowComptageModal] = useState(false);

  const storeName = user.store || 'Mon Magasin';

  const handleInventaireCreated = (inventaire: any) => {
    setShowNewInventaireModal(false);
    // Refresh the list or show success message
  };

  const handleComptageClick = (inventaire: any) => {
    setSelectedInventaire(inventaire);
    setShowComptageModal(true);
  };

  const handleComptageCompleted = (inventaire: any) => {
    setShowComptageModal(false);
    setSelectedInventaire(null);
    // Refresh the list or show success message
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ClipboardList className="h-8 w-8 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Inventaires - {storeName}
          </h1>
        </div>
        <button 
          onClick={() => setShowNewInventaireModal(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Inventaire
        </button>
      </div>

      {/* Instructions pour le gérant */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <ClipboardList className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-green-900 mb-1">Guide de l'inventaire physique</h3>
            <p className="text-sm text-green-800">
              1. Créez un nouvel inventaire pour générer la liste des produits à compter
              <br />
              2. Effectuez le comptage physique en magasin
              <br />
              3. Saisissez les quantités réelles dans la feuille de comptage
              <br />
              4. Soumettez l'inventaire au directeur pour validation
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="current" className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 pb-0">
          <TabsList>
            <TabsTrigger value="current">En Cours</TabsTrigger>
            <TabsTrigger value="pending">En Attente de Validation</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="current" className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Inventaires en cours de comptage
            </h3>
            <p className="text-sm text-gray-600">
              Terminez le comptage des inventaires commencés.
            </p>
          </div>
          
          <InventaireList 
            statusFilter="en_cours"
            onComptageClick={handleComptageClick}
            userRole={user.role}
            currentStoreId={user.storeId}
          />
        </TabsContent>

        <TabsContent value="pending" className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Inventaires en attente de validation
            </h3>
            <p className="text-sm text-gray-600">
              Ces inventaires ont été soumis au directeur pour validation.
            </p>
          </div>
          
          <InventaireList 
            statusFilter="en_attente_validation"
            userRole={user.role}
            currentStoreId={user.storeId}
          />
        </TabsContent>

        <TabsContent value="history" className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Historique des inventaires
            </h3>
            <p className="text-sm text-gray-600">
              Consultez tous les inventaires réalisés dans votre magasin.
            </p>
          </div>
          
          <InventaireList 
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
        maxWidth="xl"
      >
        <ModalBody>
          <InventaireForm
            storeId={user.storeId}
            onSuccess={handleInventaireCreated}
            onCancel={() => setShowNewInventaireModal(false)}
          />
        </ModalBody>
      </Modal>

      {/* Modal Comptage */}
      {selectedInventaire && (
        <Modal
          isOpen={showComptageModal}
          onClose={() => setShowComptageModal(false)}
          title="Feuille de Comptage"
          maxWidth="6xl"
        >
          <ModalBody>
            <ComptageSheet
              inventaire={selectedInventaire}
              onSuccess={handleComptageCompleted}
              onCancel={() => setShowComptageModal(false)}
            />
          </ModalBody>
        </Modal>
      )}
    </div>
  );
};