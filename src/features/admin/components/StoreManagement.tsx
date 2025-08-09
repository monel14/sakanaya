import React, { useState } from 'react';
import { Store, Plus, Edit, Shield, ShieldOff, Users, MapPin } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../../../shared/components/ui';
import { useStoreManagement } from '../hooks/useStoreManagement';
import { StoreCreationForm } from './StoreCreationForm';
import { StoreEditForm } from './StoreEditForm';
import { StoreEmployeeManagement } from './StoreEmployeeManagement';
import { Store as StoreType } from '../../../shared/types';

export const StoreManagement: React.FC = () => {
  const {
    stores,
    loading,
    error,
    deactivateStore,
    activateStore,
    refreshData
  } = useStoreManagement();

  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false);

  const handleToggleStoreStatus = async (store: StoreType) => {
    try {
      if (store.isActive) {
        await deactivateStore(store.id);
      } else {
        await activateStore(store.id);
      }
    } catch (err) {
      console.error('Erreur lors du changement de statut:', err);
    }
  };

  const handleEditStore = (store: StoreType) => {
    setSelectedStore(store);
    setShowEditDialog(true);
  };

  const handleManageEmployees = (store: StoreType) => {
    setSelectedStore(store);
    setShowEmployeeDialog(true);
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'hub':
        return 'bg-orange-100 text-orange-800';
      case 'retail':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'hub':
        return 'Entrepôt';
      case 'retail':
        return 'Magasin';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-slate-500">Chargement des magasins...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center">
          <Store className="h-6 w-6 mr-2" />
          Gestion des Magasins
        </h1>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Magasin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Créer un Magasin</DialogTitle>
            </DialogHeader>
            <StoreCreationForm 
              onSuccess={() => {
                setShowCreateDialog(false);
                refreshData();
              }}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-800 text-sm">{error}</div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.map((store) => (
          <Card key={store.id} className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{store.name}</CardTitle>
                  <div className="flex items-center mt-2 space-x-2">
                    <Badge className={getTypeBadgeColor(store.type)}>
                      {getTypeLabel(store.type)}
                    </Badge>
                    <Badge 
                      className={store.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                      }
                    >
                      {store.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-slate-600">{store.address}</div>
              </div>
              
              <div className="text-sm text-slate-600">
                <strong>Téléphone:</strong> {store.phone}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Users className="h-4 w-4" />
                <span>{store.employees.length} employé(s)</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditStore(store)}
                    title="Modifier"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStoreStatus(store)}
                    title={store.isActive ? 'Désactiver' : 'Activer'}
                  >
                    {store.isActive ? (
                      <ShieldOff className="h-4 w-4 text-red-500" />
                    ) : (
                      <Shield className="h-4 w-4 text-green-500" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleManageEmployees(store)}
                    title="Gérer les employés"
                  >
                    <Users className="h-4 w-4 text-blue-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stores.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center py-8 text-slate-500">
              Aucun magasin trouvé
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Store Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le Magasin</DialogTitle>
          </DialogHeader>
          {selectedStore && (
            <StoreEditForm
              store={selectedStore}
              onSuccess={() => {
                setShowEditDialog(false);
                setSelectedStore(null);
                refreshData();
              }}
              onCancel={() => {
                setShowEditDialog(false);
                setSelectedStore(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Employee Management Dialog */}
      <Dialog open={showEmployeeDialog} onOpenChange={setShowEmployeeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gestion des Employés - {selectedStore?.name}</DialogTitle>
          </DialogHeader>
          {selectedStore && (
            <StoreEmployeeManagement
              store={selectedStore}
              onClose={() => {
                setShowEmployeeDialog(false);
                setSelectedStore(null);
                refreshData();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};