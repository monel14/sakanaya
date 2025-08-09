import React from 'react';
import { Search, FileText, TrendingUp } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/Tabs';

// Import des composants de traçabilité
import { TraceabilityReports } from '../../stock/components/ConsultationStock/TraceabilityReports';
import { StockHistory } from '../../stock/components/ConsultationStock/StockHistory';

interface TraceabilityManagementProps {
  user: any;
}

export const TraceabilityManagement: React.FC<TraceabilityManagementProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Search className="h-8 w-8 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Traçabilité & Analyse des Flux
          </h1>
        </div>
      </div>

      <Tabs defaultValue="traceability" className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 pb-0">
          <TabsList>
            <TabsTrigger value="traceability">Rapports de Traçabilité</TabsTrigger>
            <TabsTrigger value="history">Historique des Mouvements</TabsTrigger>
            <TabsTrigger value="analytics">Analyses Avancées</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="traceability" className="p-6">
          <TraceabilityReports 
            userRole={user.role}
            currentStoreId={user.storeId}
          />
        </TabsContent>

        <TabsContent value="history" className="p-6">
          <StockHistory 
            userRole={user.role}
            currentStoreId={user.storeId}
          />
        </TabsContent>

        <TabsContent value="analytics" className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Statistiques de flux */}
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center space-x-3 mb-4">
                <TrendingUp className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Analyse des Flux</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-900">Arrivages ce mois</span>
                  <span className="text-lg font-bold text-blue-600">1,250 kg</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-green-900">Transferts sortants</span>
                  <span className="text-lg font-bold text-green-600">890 kg</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm font-medium text-orange-900">Pertes déclarées</span>
                  <span className="text-lg font-bold text-orange-600">45 kg</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-purple-900">Ventes réalisées</span>
                  <span className="text-lg font-bold text-purple-600">1,180 kg</span>
                </div>
              </div>
            </div>

            {/* Indicateurs de performance */}
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Indicateurs Clés</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Taux de rotation</span>
                  <span className="text-lg font-bold text-gray-900">12.5 jours</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Taux de perte</span>
                  <span className="text-lg font-bold text-red-600">3.6%</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Précision inventaire</span>
                  <span className="text-lg font-bold text-green-600">96.2%</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Délai transfert moyen</span>
                  <span className="text-lg font-bold text-blue-600">1.8 jours</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};