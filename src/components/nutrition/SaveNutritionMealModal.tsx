import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Save, X } from 'lucide-react';
import NutrientIcon from './NutrientIcon';
import { AdminNutritionIngredient } from '@/hooks/useAdminNutritionProgram';

interface SaveNutritionMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customName?: string) => void;
  ingredients: AdminNutritionIngredient[];
  quantities: Record<string, number>;
  isSaving?: boolean;
}

const SaveNutritionMealModal: React.FC<SaveNutritionMealModalProps> = ({
  isOpen,
  onClose,
  onSave,
  ingredients,
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
  const totals = ingredients.reduce((acc, ingredient) => {
    const quantity = quantities[ingredient.id] || ingredient.quantity_grams || 0;
    const baseQuantity = ingredient.quantity_grams || 1;
    const multiplier = quantity / baseQuantity;

    acc.calories += (ingredient.calories_per_serving || 0) * multiplier;
    acc.protein += (ingredient.protein_g_per_serving || 0) * multiplier;
    acc.carbs += (ingredient.carbs_g_per_serving || 0) * multiplier;
    acc.fat += (ingredient.fats_g_per_serving || 0) * multiplier;
    acc.totalWeight += quantity;
    
    return acc;
  }, {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    totalWeight: 0
  });

  const getIngredientDisplayName = (ingredient: AdminNutritionIngredient) => {
    return ingredient.custom_food_name || 
           ingredient.food_items?.name || 
           ingredient.recipe_name || 
           'Ingrediente del plan';
  };

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

          {/* Ingredients list */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Ingredientes incluidos ({ingredients.length})
            </Label>
            <div className="space-y-2 max-h-32 overflow-y-auto border rounded-lg p-2">
              {ingredients.map((ingredient) => (
                <div key={ingredient.id} className="flex items-center justify-between text-sm">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{getIngredientDisplayName(ingredient)}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {quantities[ingredient.id] || ingredient.quantity_grams || 0}g
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Total nutrition */}
          <div className="bg-muted rounded-lg p-3">
            <Label className="text-sm font-medium mb-2 block">
              Total nutricional ({Math.round(totals.totalWeight)}g)
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between">
                <NutrientIcon 
                  type="calories" 
                  value={Math.round(totals.calories)} 
                  unit="kcal"
                  className="text-xs"
                />
              </div>
              <div className="flex items-center justify-between">
                <NutrientIcon 
                  type="protein" 
                  value={Math.round(totals.protein)} 
                  className="text-xs"
                />
              </div>
              <div className="flex items-center justify-between">
                <NutrientIcon 
                  type="carbs" 
                  value={Math.round(totals.carbs)} 
                  className="text-xs"
                />
              </div>
              <div className="flex items-center justify-between">
                <NutrientIcon 
                  type="fat" 
                  value={Math.round(totals.fat)} 
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

export default SaveNutritionMealModal;