import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui';
import { StockHistory } from '../components/ConsultationStock/StockHistory';

export const StockHistoryDemo: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Démonstration - Historique des Mouvements de Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 mb-4">
            Interface complète d'historique des mouvements avec traçabilité avancée,
            analyses logistiques et détection d'anomalies.
          </p>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Fonctionnalités Avancées :</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Journal complet avec traçabilité détaillée</li>
                <li>• Analyses statistiques et rapports de performance</li>
                <li>• Détection automatique d'anomalies</li>
                <li>• Rapports de flux logistiques par magasin</li>
                <li>• Filtrage avancé multi-critères</li>
                <li>• Export CSV et JSON des données</li>
                <li>• Visualisation des tendances temporelles</li>
                <li>• Alertes de sécurité et conformité</li>
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Types d'Analyses Disponibles :</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Répartition par type de mouvement</li>
                <li>• Performance par magasin et utilisateur</li>
                <li>• Flux entrants vs sortants</li>
                <li>• Efficacité logistique</li>
                <li>• Produits les plus actifs</li>
                <li>• Temps de traitement moyens</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <StockHistory 
        showFilters={true}
        showAnalytics={true}
        showAnomalies={true}
        maxResults={50}
      />
    </div>
  );
};