import React, { useState } from 'react';
import { Settings, Users, Store, Package } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { UserManagement } from './UserManagement';
import { StoreManagement } from './StoreManagement';
import { ProductCatalog } from './ProductCatalog';

type AdminSection = 'overview' | 'users' | 'stores' | 'products';

export const AdminView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <UserManagement />;
      case 'stores':
        return <StoreManagement />;
      case 'products':
        return <ProductCatalog />;
      default:
        return (
          <div className="space-y-4 sm:space-y-6">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center">
              <Settings className="h-6 w-6 mr-2" />
              Administration Système
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card 
                className="border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setActiveSection('users')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    Utilisateurs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 text-sm">
                    Gérer les comptes utilisateurs, associations employés, et accès temporaires
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setActiveSection('stores')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Store className="h-5 w-5 mr-2 text-green-600" />
                    Magasins
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 text-sm">
                    Créer et paramétrer les points de vente, associer employés et utilisateurs
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setActiveSection('products')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2 text-purple-600" />
                    Produits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 text-sm">
                    Gérer le catalogue produits, prix fixes/variables, et catégorisation
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  if (activeSection !== 'overview') {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => setActiveSection('overview')}
          className="mb-4"
        >
          ← Retour à l'administration
        </Button>
        {renderContent()}
      </div>
    );
  }

  return renderContent();
};