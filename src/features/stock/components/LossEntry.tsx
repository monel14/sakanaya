import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle, Save, X } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge
} from '../../../shared/components/ui';
import { StockMovement } from '../types';
import { stockService } from '../../../shared/services';
import { useAuth } from '../../auth/hooks/useAuth';
import { toast } from 'sonner';

// Schema for loss entry form
const LossEntrySchema = z.object({
  productId: z.string().min(1, 'Produit requis'),
  quantity: z.number().positive('La quantité doit être positive'),
  lossCategory: z.enum(['spoilage', 'damage', 'promotion'], {
    required_error: 'Catégorie de perte requise'
  }),
  reason: z.string().min(1, 'Motif requis'),
  comments: z.string().optional()
});

type LossEntryForm = z.infer<typeof LossEntrySchema>;

interface LossEntryProps {
  storeId: string;
  onLossRecorded?: (movement: StockMovement) => void;
}

// Mock products - in real app this would come from a service
const mockProducts = [
  { id: 'prod-1', name: 'Saumon frais', unit: 'kg' },
  { id: 'prod-2', name: 'Thon rouge', unit: 'kg' },
  { id: 'prod-3', name: 'Crevettes', unit: 'pack' },
  { id: 'prod-4', name: 'Sole', unit: 'kg' },
  { id: 'prod-5', name: 'Dorade', unit: 'kg' }
];

const lossCategories = [
  { value: 'spoilage', label: 'Avarie/Péremption', color: 'destructive' as const },
  { value: 'damage', label: 'Casse/Dommage', color: 'secondary' as const },
  { value: 'promotion', label: 'Démarque/Promotion', color: 'default' as const }
];

export const LossEntry: React.FC<LossEntryProps> = ({ 
  storeId, 
  onLossRecorded 
}) => {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentLosses, setRecentLosses] = useState<StockMovement[]>([]);

  const form = useForm<LossEntryForm>({
    resolver: zodResolver(LossEntrySchema),
    defaultValues: {
      productId: '',
      quantity: 0,
      lossCategory: undefined,
      reason: '',
      comments: ''
    }
  });

  const onSubmit = async (data: LossEntryForm) => {
    if (!currentUser) {
      toast.error('Utilisateur non connecté');
      return;
    }

    setIsSubmitting(true);
    try {
      const movement = await stockService.recordLoss({
        productId: data.productId,
        storeId,
        quantity: data.quantity,
        reason: data.reason,
        comments: data.comments,
        recordedBy: currentUser.id,
        recordedAt: new Date()
      }, data.lossCategory);

      // Add to recent losses
      setRecentLosses(prev => [movement, ...prev.slice(0, 4)]);
      
      // Reset form
      form.reset();
      
      // Notify parent component
      onLossRecorded?.(movement);
      
      toast.success('Perte enregistrée avec succès');
    } catch (error) {
      console.error('Error recording loss:', error);
      toast.error('Erreur lors de l\'enregistrement de la perte');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProductName = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId);
    return product ? `${product.name} (${product.unit})` : 'Produit inconnu';
  };



  const getCategoryBadge = (category: string) => {
    const cat = lossCategories.find(c => c.value === category);
    return cat ? (
      <Badge variant={cat.color}>
        {cat.label}
      </Badge>
    ) : (
      <Badge>{category}</Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="h-5 w-5" />
            Déclarer une Perte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Produit</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un produit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockProducts.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} ({product.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantité perdue</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="0.0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="lossCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie de perte</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {lossCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motif détaillé</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Produit périmé, cassé pendant transport..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commentaires (optionnel)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Commentaires additionnels..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting} variant="destructive">
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer la perte'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => form.reset()}
                >
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {recentLosses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pertes Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Motif</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLosses.map((loss) => (
                  <TableRow key={loss.id}>
                    <TableCell>{getProductName(loss.productId)}</TableCell>
                    <TableCell className="text-red-600 font-medium">
                      {Math.abs(loss.quantity)}
                    </TableCell>
                    <TableCell>
                      {loss.lossCategory && getCategoryBadge(loss.lossCategory)}
                    </TableCell>
                    <TableCell>{loss.reason || '-'}</TableCell>
                    <TableCell>
                      {loss.recordedAt.toLocaleDateString('fr-FR')} à{' '}
                      {loss.recordedAt.toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};