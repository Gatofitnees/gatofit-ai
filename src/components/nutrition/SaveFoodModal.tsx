import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Save, X } from 'lucide-react';
import NutrientIcon from './NutrientIcon';

interface FoodSearchResult {
  id: string;
  name: string;
  brand?: string;
  nutrition?: {
    calories: number;
    fat: number;
    carbs: number;
    protein: number;
  };
}

interface SaveFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customName?: string) => void;
  foods: FoodSearchResult[];
  quantities: Record<string, number>;
  isSaving?: boolean;
}

const SaveFoodModal: React.FC<SaveFoodModalProps> = ({
  isOpen,
  onClose,
  onSave,
  foods,
  quantities,
  isSaving = false
}) => {
  const [customName, setCustomName] = useState('');

  const handleSave = () => {
    onSave(customName.trim() || undefined);
    setCustomName('');
  };

  const handleClose = () => {
    setCustomName('');
    onClose();
  };

  // Calculate total nutrition
  const totals = foods.reduce((acc, food) => {
    const quantity = quantities[food.id] || 100;
    const multiplier = quantity / 100;

    if (food.nutrition) {
      acc.calories += food.nutrition.calories * multiplier;
      acc.protein += food.nutrition.protein * multiplier;
      acc.carbs += food.nutrition.carbs * multiplier;
      acc.fat += food.nutrition.fat * multiplier;
    }
    
    acc.totalWeight += quantity;
    return acc;
  }, {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    totalWeight: 0
  });

  if (foods.length <= 1) {
    // For single food, auto-save without modal
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Guardar comida personalizada</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Custom name input */}
          <div>
            <Label htmlFor="meal-name">Nombre de la comida</Label>
            <Input
              id="meal-name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Ej: Mi desayuno especial"
              className="mt-1"
            />
          </div>

          {/* Food list */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Alimentos incluidos ({foods.length})
            </Label>
            <div className="space-y-2 max-h-32 overflow-y-auto border rounded-lg p-2">
              {foods.map((food) => (
                <div key={food.id} className="flex items-center justify-between text-sm">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{food.name}</span>
                    {food.brand && (
                      <span className="text-muted-foreground ml-1">({food.brand})</span>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {quantities[food.id] || 100}g
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Total nutrition */}
          <div className="bg-muted rounded-lg p-3">
            <Label className="text-sm font-medium mb-2 block">
              Total nutricional ({totals.totalWeight}g)
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between">
                <NutrientIcon 
                  type="calories" 
                  value={totals.calories} 
                  unit="kcal"
                  className="text-xs"
                />
              </div>
              <div className="flex items-center justify-between">
                <NutrientIcon 
                  type="protein" 
                  value={totals.protein} 
                  className="text-xs"
                />
              </div>
              <div className="flex items-center justify-between">
                <NutrientIcon 
                  type="carbs" 
                  value={totals.carbs} 
                  className="text-xs"
                />
              </div>
              <div className="flex items-center justify-between">
                <NutrientIcon 
                  type="fat" 
                  value={totals.fat} 
                  className="text-xs"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSaving}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Guardando...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SaveFoodModal;