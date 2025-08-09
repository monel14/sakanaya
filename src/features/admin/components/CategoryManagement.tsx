import React, { useState } from 'react';
import { Tag, Plus, Edit, Shield, ShieldOff } from 'lucide-react';
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
  DialogTrigger,
  Input,
  Textarea
} from '@/components/ui';
import { useProductCatalog } from '../hooks/useProductCatalog';

interface CategoryFormData {
  name: string;
  description: string;
}

export const CategoryManagement: React.FC = () => {
  const {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deactivateCategory
  } = useProductCatalog();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState<CategoryFormData>({ name: '', description: '' });

  const handleCreateCategory = async () => {
    if (!formData.name.trim()) return;
    
    try {
      await createCategory(formData.name, formData.description);
      setShowCreateDialog(false);
      setFormData({ name: '', description: '' });
    } catch (err) {
      console.error('Erreur lors de la création:', err);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !formData.name.trim()) return;
    
    try {
      await updateCategory(editingCategory.id, {
        name: formData.name,
        description: formData.description
      });
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
    }
  };

  const handleToggleCategoryStatus = async (category: any) => {
    try {
      if (category.isActive) {
        await deactivateCategory(category.id);
      } else {
        await updateCategory(category.id, { isActive: true });
      }
    } catch (err) {
      console.error('Erreur lors du changement de statut:', err);
    }
  };

  const startEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold flex items-center">
          <Tag className="h-5 w-5 mr-2" />
          Gestion des Catégories
        </h2>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Catégorie
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Créer une Catégorie</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom de la catégorie</label>
                <Input
                  placeholder="Ex: Poisson frais"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description (optionnel)</label>
                <Textarea
                  placeholder="Description de la catégorie..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false);
                    setFormData({ name: '', description: '' });
                  }}
                >
                  Annuler
                </Button>
                <Button onClick={handleCreateCategory} disabled={loading}>
                  Créer
                </Button>
              </div>
            </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {editingCategory?.id === category.id ? (
                    <div className="space-y-2">
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="font-medium"
                      />
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                  ) : (
                    <>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      {category.description && (
                        <p className="text-sm text-slate-600 mt-1">{category.description}</p>
                      )}
                    </>
                  )}
                  <div className="mt-2">
                    <Badge 
                      className={category.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                      }
                    >
                      {category.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                {editingCategory?.id === category.id ? (
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={handleUpdateCategory} disabled={loading}>
                      Sauvegarder
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                      Annuler
                    </Button>
                  </div>
                ) : (
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(category)}
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleCategoryStatus(category)}
                      title={category.isActive ? 'Désactiver' : 'Activer'}
                    >
                      {category.isActive ? (
                        <ShieldOff className="h-4 w-4 text-red-500" />
                      ) : (
                        <Shield className="h-4 w-4 text-green-500" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center py-8 text-slate-500">
              Aucune catégorie trouvée
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};