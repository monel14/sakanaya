import React, { useState } from 'react';
import { Settings, Save, RotateCcw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label } from '@/components/ui';
import { StockThresholds } from '../hooks/useStockLevels';
import { toast } from 'sonner';

interface StockThresholdConfigProps {
  currentThresholds: StockThresholds;
  onThresholdsChange: (thresholds: StockThresholds) => void;
  onSave?: (thresholds: StockThresholds) => Promise<void>;
}

const DEFAULT_THRESHOLDS: StockThresholds = {
  critical: 2,
  low: 7,
  overstock: 30
};

export const StockThresholdConfig: React.FC<StockThresholdConfigProps> = ({
  currentThresholds,
  onThresholdsChange,
  onSave
}) => {
  const [thresholds, setThresholds] = useState<StockThresholds>(currentThresholds);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleThresholdChange = (key: keyof StockThresholds, value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0) return;

    const newThresholds = { ...thresholds, [key]: numValue };
    setThresholds(newThresholds);
    setHasChanges(true);
    onThresholdsChange(newThresholds);
  };

  const handleSave = async () => {
    if (!onSave) return;

    // Validate thresholds
    if (thresholds.critical >= thresholds.low) {
      toast.error('Le seuil critique doit être inférieur au seuil faible');
      return;
    }

    if (thresholds.low >= thresholds.overstock) {
      toast.error('Le seuil faible doit être inférieur au seuil de surstock');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(thresholds);
      setHasChanges(false);
      toast.success('Seuils de stock mis à jour avec succès');
    } catch (error) {
      console.error('Error saving thresholds:', error);
      toast.error('Erreur lors de la sauvegarde des seuils');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setThresholds(DEFAULT_THRESHOLDS);
    setHasChanges(true);
    onThresholdsChange(DEFAULT_THRESHOLDS);
    toast.info('Seuils réinitialisés aux valeurs par défaut');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuration des Seuils de Stock
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Critical Stock Threshold */}
          <div className="space-y-2">
            <Label htmlFor="critical-threshold" className="text-red-700 font-medium">
              Stock Critique (jours)
            </Label>
            <Input
              id="critical-threshold"
              type="number"
              min="0"
              max="30"
              value={thresholds.critical}
              onChange={(e) => handleThresholdChange('critical', e.target.value)}
              className="border-red-200 focus:border-red-400"
            />
            <p className="text-xs text-red-600">
              Alerte critique quand il reste moins de {thresholds.critical} jour{thresholds.critical > 1 ? 's' : ''} de stock
            </p>
          </div>

          {/* Low Stock Threshold */}
          <div className="space-y-2">
            <Label htmlFor="low-threshold" className="text-orange-700 font-medium">
              Stock Faible (jours)
            </Label>
            <Input
              id="low-threshold"
              type="number"
              min="0"
              max="30"
              value={thresholds.low}
              onChange={(e) => handleThresholdChange('low', e.target.value)}
              className="border-orange-200 focus:border-orange-400"
            />
            <p className="text-xs text-orange-600">
              Alerte faible quand il reste moins de {thresholds.low} jour{thresholds.low > 1 ? 's' : ''} de stock
            </p>
          </div>

          {/* Overstock Threshold */}
          <div className="space-y-2">
            <Label htmlFor="overstock-threshold" className="text-blue-700 font-medium">
              Surstock (jours)
            </Label>
            <Input
              id="overstock-threshold"
              type="number"
              min="0"
              max="365"
              value={thresholds.overstock}
              onChange={(e) => handleThresholdChange('overstock', e.target.value)}
              className="border-blue-200 focus:border-blue-400"
            />
            <p className="text-xs text-blue-600">
              Alerte surstock quand il reste plus de {thresholds.overstock} jour{thresholds.overstock > 1 ? 's' : ''} de stock
            </p>
          </div>
        </div>

        {/* Validation Rules */}
        <div className="bg-slate-50 p-4 rounded-lg">
          <h4 className="font-medium text-slate-900 mb-2">Règles de Validation</h4>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• Le seuil critique doit être inférieur au seuil faible</li>
            <li>• Le seuil faible doit être inférieur au seuil de surstock</li>
            <li>• Tous les seuils doivent être des nombres positifs</li>
          </ul>
        </div>

        {/* Current Configuration Summary */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Configuration Actuelle</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Critique: ≤ {thresholds.critical} jour{thresholds.critical > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Faible: ≤ {thresholds.low} jour{thresholds.low > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Surstock: &gt; {thresholds.overstock} jour{thresholds.overstock > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Réinitialiser
          </Button>

          {onSave && (
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};