import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Save, X } from 'lucide-react';
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
  TableRow
} from '../../../shared/components/ui';
import { StockMovement } from '../types';
import { stockService } from '../../../shared/services';
import { useAuth } from '../../auth/hooks/useAuth';
import { toast } from 'sonner';

// Schema for arrival entry form
const ArrivalEntrySchema = z.object({
  productId: z.string().min(1, 'Produit requis'),
  quantity: z.number().positive('La quantité doit être positive'),
  reason: z.string().optional(),
  comments: z.string().optional()
});

type ArrivalEntryForm = z.infer<typeof ArrivalEntrySchema>;

interface ArrivalEntryProps {
  storeId: string;
  onArrivalRecorded?: (movement: StockMovement) => void;
}

// Mock products - in real app this would come from a service
const mockProducts = [
  { id: 'prod-1', name: 'Saumon frais', unit: 'kg' },
  { id: 'prod-2', name: 'Thon rouge', unit: 'kg' },
  { id: 'prod-3', name: 'Crevettes', unit: 'pack' },
  { id: 'prod-4', name: 'Sole', unit: 'kg' },
  { id: 'prod-5', name: 'Dorade', unit: 'kg' }
];

export const ArrivalEntry: React.FC<ArrivalEntryProps> = ({
  storeId,
  onArrivalRecorded
}) => {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentArrivals, setRecentArrivals] = useState<StockMovement[]>([]);

  const form = useForm<ArrivalEntryForm>({
    resolver: zodResolver(ArrivalEntrySchema),
    defaultValues: {
      productId: '',
      quantity: 0,
      reason: '',
      comments: ''
    }
  });

  const onSubmit = async (data: ArrivalEntryForm) => {
    if (!currentUser) {
      toast.error('Utilisateur non connecté');
      return;
    }

    setIsSubmitting(true);
    try {
      const movement = await stockService.recordArrival({
        productId: data.productId,
        storeId,
        quantity: data.quantity,
        reason: data.reason,
        comments: data.comments,
        recordedBy: currentUser.id,
        recordedAt: new Date()
      });

      // Add to recent arrivals
      setRecentArrivals(prev => [movement, ...prev.slice(0, 4)]);

      // Reset form
      form.reset();

      // Notify parent component
      onArrivalRecorded?.(movement);

      toast.success('Arrivage enregistré avec succès');
    } catch (error) {
      console.error('Error recording arrival:', error);
      toast.error('Erreur lors de l\'enregistrement de l\'arrivage');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProductName = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId);
    return product ? `${product.name} (${product.unit})` : 'Produit inconnu';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Enregistrer un Arrivage
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
                      <FormLabel>Quantité</FormLabel>
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
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motif (optionnel)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Livraison fournisseur, Réapprovisionnement..."
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
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer l\'arrivage'}
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

      {recentArrivals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Arrivages Récents</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Motif</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentArrivals.map((arrival) => (
                  <TableRow key={arrival.id}>
                    <TableCell>{getProductName(arrival.productId)}</TableCell>
                    <TableCell>{arrival.quantity}</TableCell>
                    <TableCell>{arrival.reason || '-'}</TableCell>
                    <TableCell>
                      {arrival.recordedAt.toLocaleDateString('fr-FR')} à{' '}
                      {arrival.recordedAt.toLocaleTimeString('fr-FR', {
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