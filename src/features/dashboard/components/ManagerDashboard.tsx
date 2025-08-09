import React from 'react';
import { 
  Calendar, 
  Bell, 
  Truck, 
  CheckCircle,
  DollarSign as CashRegister,
  Package,
  UserCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '../../../shared/components/ui';
import { User } from '../../../shared/types';

interface ManagerDashboardProps {
  currentUser: User | null;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ currentUser }) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Mon Magasin: <span className="block sm:inline text-blue-600">{currentUser?.store}</span>
        </h1>
        <Badge variant="outline" className="text-xs w-fit">
          <Calendar className="h-3 w-3 mr-1" />
          Aujourd'hui
        </Badge>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group active:scale-95">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
              <CashRegister className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <h3 className="font-semibold text-base sm:text-lg mb-2">Saisir les Ventes</h3>
            <p className="text-sm text-slate-600">Enregistrer les ventes du jour</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group active:scale-95">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
              <Package className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <h3 className="font-semibold text-base sm:text-lg mb-2">Gérer le Stock</h3>
            <p className="text-sm text-slate-600">Contrôler les inventaires</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group active:scale-95 sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
              <UserCheck className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <h3 className="font-semibold text-base sm:text-lg mb-2">Pointer les Présences</h3>
            <p className="text-sm text-slate-600">Gérer les équipes</p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
            Notifications & Informations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Truck className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-blue-900 mb-1">Arrivage en attente de validation</h4>
              <p className="text-sm text-blue-700 mb-3">
                Bon de transfert #BT-0128 du Hub. 15kg de Thon, 10kg de Crevettes.
              </p>
              <Button size="sm" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 h-10">
                <CheckCircle className="h-4 w-4 mr-2" />
                Valider la réception
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};