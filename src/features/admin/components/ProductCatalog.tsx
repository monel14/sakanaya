import React, { useState } from 'react';
import { Package, Plus, Edit, Shield, ShieldOff, History, Tag } from 'lucide-react';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '../../../shared/components/ui';
import { useProductCatalog } from '../hooks/useProductCatalog';
import { ProductCreationForm } from './ProductCreationForm';
import { ProductEditForm } from './ProductEditForm';
import { PriceHistoryDialog } from './PriceHistoryDialog';
import { CategoryManagement } from './CategoryManagement';
import { Product } from '../../sales/types';

export const ProductCatalog: React.FC = () => {
  const {
    products,
    loading,
    error,
    deactivateProduct,
    activateProduct,
    refreshData
  } = useProductCatalog();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);

  const handleToggleProductStatus = async (product: Product) => {
    try {
      if (product.isActive) {
        await deactivateProduct(product.id);
      } else {
        await activateProduct(product.id);
      }
    } catch (err) {
      console.error('Erreur lors du changement de statut:', err);
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowEditDialog(true);
  };

  const handleViewHistory = (product: Product) => {
    setSelectedProduct(product);
    setShowHistoryDialog(true);
  };

  const getPriceTypeBadgeColor = (priceType: string) => {
    switch (priceType) {
      case 'variable':
        return 'bg-orange-100 text-orange-800';
      case 'fixed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriceTypeLabel = (priceType: string) => {
    switch (priceType) {
      case 'variable':
        return 'Variable';
      case 'fixed':
        return 'Fixe';
      default:
        return priceType;
    }
  };

  const getUnitLabel = (unit: string) => {
    switch (unit) {
      case 'kg':
        return 'Kilogramme';
      case 'pack':
        return 'Pack';
      case 'unit':
        return 'Unité';
      default:
        return unit;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-slate-500">Chargement du catalogue...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center">
          <Package className="h-6 w-6 mr-2" />
          Catalogue Produits
        </h1>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Produit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Créer un Produit</DialogTitle>
            </DialogHeader>
            <ProductCreationForm 
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

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="categories">Catégories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Liste des Produits ({products.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3">Produit</th>
                      <th className="text-left py-3">Catégorie</th>
                      <th className="text-right py-3">Prix</th>
                      <th className="text-left py-3">Unité</th>
                      <th className="text-left py-3">Type Prix</th>
                      <th className="text-center py-3">Statut</th>
                      <th className="text-center py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-slate-100">
                        <td className="py-3">
                          <div className="font-medium">{product.name}</div>
                        </td>
                        <td className="py-3">
                          <Badge variant="outline">
                            {product.category}
                          </Badge>
                        </td>
                        <td className="text-right py-3 font-medium">
                          {product.unitPrice.toLocaleString()} CFA
                        </td>
                        <td className="py-3">
                          {getUnitLabel(product.unit)}
                        </td>
                        <td className="py-3">
                          <Badge className={getPriceTypeBadgeColor(product.priceType)}>
                            {getPriceTypeLabel(product.priceType)}
                          </Badge>
                        </td>
                        <td className="py-3 text-center">
                          <Badge 
                            className={product.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                            }
                          >
                            {product.isActive ? 'Actif' : 'Inactif'}
                          </Badge>
                        </td>
                        <td className="py-3 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleProductStatus(product)}
                              title={product.isActive ? 'Désactiver' : 'Activer'}
                            >
                              {product.isActive ? (
                                <ShieldOff className="h-4 w-4 text-red-500" />
                              ) : (
                                <Shield className="h-4 w-4 text-green-500" />
                              )}
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewHistory(product)}
                              title="Historique des prix"
                            >
                              <History className="h-4 w-4 text-blue-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {products.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    Aucun produit trouvé
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories">
          <CategoryManagement />
        </TabsContent>
      </Tabs>

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le Produit</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <ProductEditForm
              product={selectedProduct}
              onSuccess={() => {
                setShowEditDialog(false);
                setSelectedProduct(null);
                refreshData();
              }}
              onCancel={() => {
                setShowEditDialog(false);
                setSelectedProduct(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Price History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Historique des Prix - {selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <PriceHistoryDialog
              product={selectedProduct}
              onClose={() => {
                setShowHistoryDialog(false);
                setSelectedProduct(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};