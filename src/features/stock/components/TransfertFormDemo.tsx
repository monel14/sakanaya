import React, { useState } from 'react';
import { TransfertForm } from './TransfertForm';

export const TransfertFormDemo: React.FC = () => {
  const [showForm, setShowForm] = useState(false);

  const handleTransfertCreated = (transfert: any) => {
    console.log('Transfert créé:', transfert);
    alert(`Transfert ${transfert.numero} créé avec succès !`);
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  if (!showForm) {
    return (
      <div className="p-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Démonstration - Formulaire de Transfert
          </h2>
          <p className="text-gray-600 mb-6">
            Cliquez sur le bouton ci-dessous pour tester le formulaire de création de transfert inter-magasins.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Ouvrir le formulaire de transfert
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <TransfertForm
        onTransfertCreated={handleTransfertCreated}
        onCancel={handleCancel}
        defaultSourceStoreId="store-1"
      />
    </div>
  );
};

export default TransfertFormDemo;