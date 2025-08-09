import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../../../shared/components/ui';

export const ProductManagement: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Gestion des Produits & Prix</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Produit
        </Button>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Liste des Produits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3">Produit</th>
                  <th className="text-left py-3">Catégorie</th>
                  <th className="text-right py-3">Prix Unitaire</th>
                  <th className="text-left py-3">Unité</th>
                  <th className="text-center py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-3">Thon Rouge</td>
                  <td className="py-3">Poisson</td>
                  <td className="text-right py-3">6 500 CFA</td>
                  <td className="py-3">kg</td>
                  <td className="py-3 text-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};