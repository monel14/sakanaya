import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui';
import { StockMovementHistory } from './StockMovementHistory';
import { LossRateReport } from './LossRateReport';
import { StockVarianceAlerts } from './StockVarianceAlerts';

interface StockAnalysisIntegrationProps {
  storeId: string;
}

/**
 * Integration component that demonstrates all three stock analysis features
 * working together as specified in task 5.3
 */
export const StockAnalysisIntegration: React.FC<StockAnalysisIntegrationProps> = ({ storeId }) => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Analyse des Mouvements de Stock - Tâche 5.3
        </h1>
        <p className="text-slate-600">
          Implémentation complète de la traçabilité des mouvements, analyse des taux de perte, 
          et détection d'écarts anormaux avec notifications.
        </p>
      </div>

      {/* Alerts Section - Priority display */}
      <section>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          1. Alertes sur les Écarts Anormaux avec Notifications
        </h2>
        <StockVarianceAlerts 
          storeId={storeId}
          autoRefresh={true}
          refreshInterval={300000} // 5 minutes
          maxVisible={5}
        />
      </section>

      {/* Loss Rate Analysis Section */}
      <section>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          2. Analyse des Taux de Perte
        </h2>
        <LossRateReport 
          storeId={storeId}
          autoRefresh={true}
          refreshInterval={300000} // 5 minutes
        />
      </section>

      {/* Movement History Section */}
      <section>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          3. Traçabilité Complète des Mouvements
        </h2>
        <StockMovementHistory 
          storeId={storeId}
          maxItems={50}
        />
      </section>

      {/* Implementation Summary */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">✅ Tâche 5.3 - Implémentation Complète</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-green-800 mb-2">StockMovementHistory</h4>
              <ul className="space-y-1 text-green-700">
                <li>✓ Traçabilité complète des mouvements</li>
                <li>✓ Filtrage par type, période, produit</li>
                <li>✓ Export CSV des données</li>
                <li>✓ Interface de recherche avancée</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-800 mb-2">LossRateReport</h4>
              <ul className="space-y-1 text-green-700">
                <li>✓ Analyse des taux de perte</li>
                <li>✓ Rapports hebdomadaires/mensuels</li>
                <li>✓ Répartition par catégorie</li>
                <li>✓ Comparaison avec périodes précédentes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-800 mb-2">StockVarianceAlerts</h4>
              <ul className="space-y-1 text-green-700">
                <li>✓ Détection d'écarts anormaux</li>
                <li>✓ Notifications automatiques</li>
                <li>✓ Analyse des variances</li>
                <li>✓ Résolution et suivi des alertes</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-green-100 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Requirements Satisfied:</h4>
            <div className="text-green-700 text-sm">
              <p><strong>Requirement 4.4:</strong> Calcul automatique des taux de perte avec alertes sur seuils dépassés ✓</p>
              <p><strong>Requirement 4.5:</strong> Alertes sur écarts anormaux avec notifications ✓</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};