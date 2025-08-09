import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { TraceabilityReports } from '../components/ConsultationStock/TraceabilityReports';

export const TraceabilityDemo: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Démonstration - Système de Traçabilité</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 mb-4">
            Interface complète de traçabilité des stocks avec journal détaillé des mouvements,
            filtrage avancé, statistiques et export des données.
          </p>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Fonctionnalités Disponibles :</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Journal complet des mouvements de stock</li>
                <li>• Filtrage avancé par produit, magasin, type et période</li>
                <li>• Recherche textuelle dans tous les champs</li>
                <li>• Tri interactif par colonnes</li>
                <li>• Statistiques en temps réel</li>
                <li>• Export CSV des données filtrées</li>
                <li>• Vue détaillée de chaque mouvement</li>
                <li>• Interface responsive et intuitive</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <TraceabilityReports showAdvancedFilters={true} />
    </div>
  );
};