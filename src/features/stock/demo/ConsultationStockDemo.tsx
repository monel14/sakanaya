import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { StockDirectorView } from '../components/ConsultationStock/StockDirectorView';
import { StockHistory } from '../components/ConsultationStock/StockHistory';
import { StockLevelDisplay } from '../components/StockLevelDisplay';

type DemoView = 'manager' | 'director' | 'history';

export const ConsultationStockDemo: React.FC = () => {
  const [activeView, setActiveView] = useState<DemoView>('manager');

  const renderContent = () => {
    switch (activeView) {
      case 'manager':
        return (
          <StockLevelDisplay 
            storeId="store-1"
            showFilters={true}
            showHistory={true}
          />
        );
      case 'director':
        return <StockDirectorView />;
      case 'history':
        return <StockHistory showFilters={true} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Démonstration - Extension Consultation des Stocks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeView === 'manager' ? 'default' : 'outline'}
              onClick={() => setActiveView('manager')}
            >
              Vue Gérant Améliorée
            </Button>
            <Button
              variant={activeView === 'director' ? 'default' : 'outline'}
              onClick={() => setActiveView('director')}
            >
              Vue Directeur Avancée
            </Button>
            <Button
              variant={activeView === 'history' ? 'default' : 'outline'}
              onClick={() => setActiveView('history')}
            >
              Traçabilité Complète
            </Button>
          </div>
          
          <div className="border rounded-lg p-4">
            {renderContent()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};