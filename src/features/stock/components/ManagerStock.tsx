import React from 'react';
import { CheckCircle, Package } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';

export const ManagerStock: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Mon Stock</h1>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-500" />
            Réception en attente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 border border-blue-300 rounded-lg bg-blue-50">
            <p className="font-medium mb-2">Bon de Transfert #BT-0128 (depuis Hub)</p>
            <p className="text-sm mb-3">Thon: 15kg | Crevettes: 10kg</p>
            <Button className="w-full">
              <CheckCircle className="h-4 w-4 mr-2" />
              Contrôler & Valider la Réception
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};