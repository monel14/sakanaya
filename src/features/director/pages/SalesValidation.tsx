import React, { useState } from 'react';

interface SalesValidationProps {
  user: any;
}

export const SalesValidation: React.FC<SalesValidationProps> = ({ user }) => {
  const [filter, setFilter] = useState('pending');

  const validationRequests = [
    {
      id: '1',
      date: '2024-01-15',
      store: 'Magasin Principal',
      manager: 'Marie Diop',
      total: 1250.00,
      reason: 'Correction erreur de saisie - client régulier',
      status: 'pending',
      requestedAt: '2024-01-15 18:30',
      items: [
        { product: 'Saumon frais', quantity: 2.5, unitPrice: 25.50, total: 63.75 },
        { product: 'Crevettes', quantity: 1.0, unitPrice: 18.00, total: 18.00 },
      ]
    },
    {
      id: '2',
      date: '2024-01-14',
      store: 'Magasin Secondaire',
      manager: 'Amadou Ba',
      total: 890.50,
      reason: 'Ajout vente oubliée en fin de journée',
      status: 'pending',
      requestedAt: '2024-01-14 19:15',
      items: [
        { product: 'Thon rouge', quantity: 1.5, unitPrice: 35.00, total: 52.50 },
        { product: 'Huîtres (douzaine)', quantity: 3, unitPrice: 12.00, total: 36.00 },
      ]
    },
    {
      id: '3',
      date: '2024-01-13',
      store: 'Magasin Principal',
      manager: 'Marie Diop',
      total: 2150.00,
      reason: 'Modification prix suite négociation client',
      status: 'validated',
      requestedAt: '2024-01-13 17:45',
      validatedAt: '2024-01-13 20:30',
      validatedBy: 'Directeur',
      items: []
    }
  ];

  const filteredRequests = validationRequests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const handleValidate = (requestId: string) => {
    console.log('Valider la demande:', requestId);
    // TODO: Implémenter la validation
  };

  const handleReject = (requestId: string, reason: string) => {
    console.log('Rejeter la demande:', requestId, reason);
    // TODO: Implémenter le rejet
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Validation des Clôtures
        </h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Filtrer:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="pending">En attente</option>
            <option value="validated">Validées</option>
            <option value="rejected">Rejetées</option>
            <option value="all">Toutes</option>
          </select>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            En Attente
          </h3>
          <p className="text-3xl font-bold text-orange-600">
            {validationRequests.filter(r => r.status === 'pending').length}
          </p>
          <p className="text-sm text-gray-500">Demandes</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Validées
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {validationRequests.filter(r => r.status === 'validated').length}
          </p>
          <p className="text-sm text-gray-500">Cette semaine</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Rejetées
          </h3>
          <p className="text-3xl font-bold text-red-600">
            {validationRequests.filter(r => r.status === 'rejected').length}
          </p>
          <p className="text-sm text-gray-500">Cette semaine</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Temps Moyen
          </h3>
          <p className="text-3xl font-bold text-blue-600">2h</p>
          <p className="text-sm text-gray-500">Traitement</p>
        </div>
      </div>

      {/* Liste des demandes */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <div key={request.id} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Clôture du {request.date}
                </h3>
                <p className="text-sm text-gray-600">
                  {request.store} - {request.manager}
                </p>
                <p className="text-sm text-gray-500">
                  Demandé le {request.requestedAt}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {request.total.toFixed(2)} CFA
                </p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  request.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                  request.status === 'validated' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {request.status === 'pending' ? 'En attente' :
                   request.status === 'validated' ? 'Validée' : 'Rejetée'}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Raison de la demande:</h4>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                {request.reason}
              </p>
            </div>

            {request.items.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Détail des articles:</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Produit
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Quantité
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Prix unitaire
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {request.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.product}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{item.unitPrice.toFixed(2)} CFA</td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">{item.total.toFixed(2)} CFA</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {request.status === 'pending' && (
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => handleReject(request.id, 'Raison du rejet')}
                  className="px-4 py-2 text-red-700 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                >
                  Rejeter
                </button>
                <button
                  onClick={() => handleValidate(request.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Valider
                </button>
              </div>
            )}

            {request.status === 'validated' && request.validatedAt && (
              <div className="text-sm text-green-600 text-right">
                Validée le {request.validatedAt} par {request.validatedBy}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucune demande de validation trouvée</p>
        </div>
      )}
    </div>
  );
};