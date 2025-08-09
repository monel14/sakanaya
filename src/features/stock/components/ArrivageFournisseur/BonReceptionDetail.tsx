import React, { useState } from 'react';
import {
  ArrowLeft,
  Edit,
  FileText,
  Calendar,
  User,
  MapPin,
  Package,
  CheckCircle,
  Clock,
  Truck,
  DollarSign,
  Hash,
  MessageSquare
} from 'lucide-react';
import { BonReception, MouvementStock } from '../../types';

interface BonReceptionDetailProps {
  bon: BonReception;
  mouvements?: MouvementStock[];
  onBack: () => void;
  onEdit?: (bonId: string) => void;
  canEdit?: boolean;
  loading?: boolean;
}

export const BonReceptionDetail: React.FC<BonReceptionDetailProps> = ({
  bon,
  mouvements = [],
  onBack,
  onEdit,
  canEdit = false,
  loading = false
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const formatDateOnly = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  };

  const getStatusBadge = (status: 'draft' | 'validated') => {
    if (status === 'validated') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-4 h-4 mr-2" />
          Validé
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
        <Clock className="w-4 h-4 mr-2" />
        Brouillon
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <FileText className="w-6 h-6 mr-3 text-blue-600" />
                Bon de Réception {bon.numero}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Créé le {formatDate(bon.createdAt)} par {bon.createdBy}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusBadge(bon.status)}
            {canEdit && onEdit && bon.status === 'draft' && (
              <button
                onClick={() => onEdit(bon.id)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </button>
            )}
          </div>
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Date de Réception</p>
                <p className="text-lg font-semibold text-blue-900">{formatDateOnly(bon.dateReception)}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Valeur Totale</p>
                <p className="text-lg font-semibold text-green-900">{formatCurrency(bon.totalValue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">Lignes</p>
                <p className="text-lg font-semibold text-purple-900">{bon.lignes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <Truck className="w-8 h-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-600">Fournisseur</p>
                <p className="text-lg font-semibold text-orange-900">{bon.supplier.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Détails du Bon
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Historique & Audit
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* General Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Hash className="w-5 h-5 mr-2 text-gray-400" />
                    Informations Générales
                  </h3>

                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-600 w-24">Numéro:</span>
                      <span className="text-sm font-medium text-gray-900">{bon.numero}</span>
                    </div>

                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-600 w-24">Date:</span>
                      <span className="text-sm font-medium text-gray-900">{formatDateOnly(bon.dateReception)}</span>
                    </div>

                    <div className="flex items-center">
                      <Truck className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-600 w-24">Fournisseur:</span>
                      <span className="text-sm font-medium text-gray-900">{bon.supplier.name}</span>
                    </div>

                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-600 w-24">Magasin:</span>
                      <span className="text-sm font-medium text-gray-900">{bon.store.name}</span>
                    </div>

                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-600 w-24">Créé par:</span>
                      <span className="text-sm font-medium text-gray-900">{bon.createdBy}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Truck className="w-5 h-5 mr-2 text-gray-400" />
                    Informations Fournisseur
                  </h3>

                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-600 w-24">Contact:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {bon.supplier.contact || 'Non renseigné'}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <span className="w-4 h-4 text-gray-400 mr-3">📞</span>
                      <span className="text-sm text-gray-600 w-24">Téléphone:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {bon.supplier.phone || 'Non renseigné'}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <span className="w-4 h-4 text-gray-400 mr-3">✉️</span>
                      <span className="text-sm text-gray-600 w-24">Email:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {bon.supplier.email || 'Non renseigné'}
                      </span>
                    </div>

                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 text-gray-400 mr-3 mt-0.5" />
                      <span className="text-sm text-gray-600 w-24">Adresse:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {bon.supplier.address || 'Non renseignée'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments */}
              {bon.commentaires && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-gray-400" />
                    Commentaires
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{bon.commentaires}</p>
                  </div>
                </div>
              )}

              {/* Product Lines */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-gray-400" />
                  Lignes de Produits
                </h3>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Produit
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantité Reçue
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Coût Unitaire
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sous-Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bon.lignes.map((ligne) => (
                        <tr key={ligne.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{ligne.product.name}</div>
                            <div className="text-sm text-gray-500">{ligne.product.category}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {ligne.quantiteRecue.toLocaleString('fr-FR')}
                            </div>
                            <div className="text-sm text-gray-500">{ligne.product.unit}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(ligne.coutUnitaire)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(ligne.sousTotal)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                          Total Général:
                        </td>
                        <td className="px-6 py-4 text-right text-lg font-bold text-gray-900">
                          {formatCurrency(bon.totalValue)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Validation Info */}
              {bon.status === 'validated' && bon.validatedBy && bon.validatedAt && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-green-800">Bon Validé</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Validé par {bon.validatedBy} le {formatDate(bon.validatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Historique des Modifications</h3>

              {mouvements.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Aucun historique disponible</h4>
                  <p className="text-gray-500">
                    L'historique des modifications apparaîtra ici une fois que des mouvements de stock seront générés.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {mouvements.map((mouvement) => (
                    <div key={mouvement.id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Package className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {mouvement.type.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(mouvement.createdAt)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700">
                        <p><strong>Produit:</strong> {mouvement.product.name}</p>
                        <p><strong>Quantité:</strong> {mouvement.quantite.toLocaleString('fr-FR')}</p>
                        <p><strong>Magasin:</strong> {mouvement.store.name}</p>
                        {mouvement.commentaire && (
                          <p><strong>Commentaire:</strong> {mouvement.commentaire}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BonReceptionDetail;