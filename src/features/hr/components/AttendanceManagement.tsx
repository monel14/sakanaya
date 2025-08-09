import React from 'react';
import { UserCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui';

export const AttendanceManagement: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center">
        <UserCheck className="h-6 w-6 mr-2" />
        Gestion des Présences
      </h1>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Pointage des Équipes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            Module de pointage en développement
          </div>
        </CardContent>
      </Card>
    </div>
  );
};