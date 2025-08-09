import React, { useState } from 'react';
import { Users, Plus, Edit, Shield, ShieldOff, Key, Clock } from 'lucide-react';
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
} from '@/components/ui';
import { useUserManagement } from '../hooks/useUserManagement';
import { UserCreationForm } from './UserCreationForm';
import { UserEditForm } from './UserEditForm';
import { PasswordResetForm } from './PasswordResetForm';
import { TemporaryAccessForm } from './TemporaryAccessForm';
import { UserWithEmployee } from '../types';

export const UserManagement: React.FC = () => {
  const {
    users,
    loading,
    error,
    deactivateUser,
    activateUser,
    refreshData
  } = useUserManagement();

  const [selectedUser, setSelectedUser] = useState<UserWithEmployee | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showAccessDialog, setShowAccessDialog] = useState(false);

  const handleToggleUserStatus = async (user: UserWithEmployee) => {
    try {
      if (user.isActive) {
        await deactivateUser(user.id);
      } else {
        await activateUser(user.id);
      }
    } catch (err) {
      console.error('Erreur lors du changement de statut:', err);
    }
  };

  const handleEditUser = (user: UserWithEmployee) => {
    setSelectedUser(user);
    setShowEditDialog(true);
  };

  const handleResetPassword = (user: UserWithEmployee) => {
    setSelectedUser(user);
    setShowPasswordDialog(true);
  };

  const handleTemporaryAccess = (user: UserWithEmployee) => {
    setSelectedUser(user);
    setShowAccessDialog(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'director':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'director':
        return 'Directeur';
      case 'manager':
        return 'Magasin';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-slate-500">Chargement des utilisateurs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center">
          <Users className="h-6 w-6 mr-2" />
          Gestion des Utilisateurs
        </h1>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel Utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Créer un Utilisateur</DialogTitle>
            </DialogHeader>
            <UserCreationForm 
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

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Liste des Utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3">Utilisateur</th>
                  <th className="text-left py-3">Rôle</th>
                  <th className="text-left py-3">Employé Associé</th>
                  <th className="text-left py-3">Magasin</th>
                  <th className="text-center py-3">Statut</th>
                  <th className="text-center py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100">
                    <td className="py-3">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-slate-500 text-xs">@{user.username}</div>
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </td>
                    <td className="py-3">
                      {user.employee ? (
                        <div>
                          <div className="font-medium">
                            {user.employee.firstName} {user.employee.lastName}
                          </div>
                          <div className="text-slate-500 text-xs">
                            {user.employee.role}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Non associé</span>
                      )}
                    </td>
                    <td className="py-3">
                      {user.storeName ? (
                        <span className="text-slate-700">{user.storeName}</span>
                      ) : (
                        <span className="text-slate-400">Tous magasins</span>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      <Badge 
                        className={user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                        }
                      >
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleUserStatus(user)}
                          title={user.isActive ? 'Désactiver' : 'Activer'}
                        >
                          {user.isActive ? (
                            <ShieldOff className="h-4 w-4 text-red-500" />
                          ) : (
                            <Shield className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResetPassword(user)}
                          title="Réinitialiser mot de passe"
                        >
                          <Key className="h-4 w-4 text-blue-500" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTemporaryAccess(user)}
                          title="Accès temporaire"
                        >
                          <Clock className="h-4 w-4 text-orange-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {users.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                Aucun utilisateur trouvé
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'Utilisateur</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <UserEditForm
              user={selectedUser}
              onSuccess={() => {
                setShowEditDialog(false);
                setSelectedUser(null);
                refreshData();
              }}
              onCancel={() => {
                setShowEditDialog(false);
                setSelectedUser(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Réinitialiser le Mot de Passe</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <PasswordResetForm
              user={selectedUser}
              onSuccess={() => {
                setShowPasswordDialog(false);
                setSelectedUser(null);
              }}
              onCancel={() => {
                setShowPasswordDialog(false);
                setSelectedUser(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Temporary Access Dialog */}
      <Dialog open={showAccessDialog} onOpenChange={setShowAccessDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Accès Temporaire</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <TemporaryAccessForm
              user={selectedUser}
              onSuccess={() => {
                setShowAccessDialog(false);
                setSelectedUser(null);
              }}
              onCancel={() => {
                setShowAccessDialog(false);
                setSelectedUser(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};