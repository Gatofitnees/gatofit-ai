import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import NutrientIcon from '@/components/nutrition/NutrientIcon';
import { EditableIngredientItem } from './EditableIngredientItem';

interface RecipeCardProps {
  recipeName: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  ingredients: any[];
  checkedIngredients: Record<string, boolean>;
  ingredientQuantities: Record<string, number>;
  onIngredientCheck: (ingredientId: string, checked: boolean) => void;
  onQuantityChange: (ingredientId: string, quantity: number) => void;
  onSaveRecipeIngredients?: () => void;
  recipeImageUrl?: string;
  recipeDescription?: string;
  recipeInstructions?: string;
}

export const RecipeCard: React.FC<RecipeCardProps> = React.memo(({
  recipeName,
  totalCalories,
  totalProtein,
  totalCarbs,
  totalFat,
  ingredients,
  checkedIngredients,
  ingredientQuantities,
  onIngredientCheck,
  onQuantityChange,
  onSaveRecipeIngredients,
  recipeImageUrl,
  recipeDescription,
  recipeInstructions
}) => {
  const hasSelectedIngredients = useMemo(() => 
    ingredients.some(ingredient => checkedIngredients[ingredient.id]),
    [ingredients, checkedIngredients]
  );

  // Memoize rounded values to prevent recalculation
  const roundedCalories = useMemo(() => Math.round(totalCalories), [totalCalories]);
  const roundedProtein = useMemo(() => Math.round(totalProtein), [totalProtein]);
  const roundedCarbs = useMemo(() => Math.round(totalCarbs), [totalCarbs]);
  const roundedFat = useMemo(() => Math.round(totalFat), [totalFat]);
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="p-0 cursor-pointer hover:bg-secondary/20 transition-colors overflow-hidden h-32">
          <div className="flex h-full">
            {/* Recipe Image */}
            <div className="w-32 h-full bg-muted flex-shrink-0">
              {recipeImageUrl ? (
                <img 
                  src={recipeImageUrl} 
                  alt={recipeName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                  <span className="text-2xl">🍽️</span>
                </div>
              )}
            </div>

            {/* Recipe Info */}
            <div className="flex-1 p-4 min-w-0">
              <h3 className="font-semibold text-foreground truncate mb-3">
                {recipeName}
              </h3>
              {/* Calories prominent */}
              <div className="mb-2 -mt-1">
                <NutrientIcon
                  type="calories"
                  value={roundedCalories}
                  unit="kcal"
                  className="text-base font-semibold"
                />
              </div>
              {/* Macros below */}
              <div className="flex flex-wrap gap-3 -mt-2">
                <NutrientIcon
                  type="protein"
                  value={roundedProtein}
                  className="text-[11px]"
                />
                <NutrientIcon
                  type="carbs"
                  value={roundedCarbs}
                  className="text-[11px]"
                />
                <NutrientIcon
                  type="fat"
                  value={roundedFat}
                  className="text-[11px]"
                />
              </div>
            </div>
          </div>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{recipeName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recipe Image */}
          {recipeImageUrl && (
            <div className="w-full h-48 rounded-lg overflow-hidden">
              <img 
                src={recipeImageUrl} 
                alt={recipeName}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Recipe Description */}
          {recipeDescription && (
            <div>
              <h4 className="font-semibold text-foreground mb-2">Descripción</h4>
              <p className="text-muted-foreground">{recipeDescription}</p>
            </div>
          )}

          {/* Macros Summary */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Información Nutricional</h4>
            <div className="flex flex-wrap gap-4">
              <NutrientIcon
                type="calories"
                value={roundedCalories}
                unit="kcal"
              />
              <NutrientIcon
                type="protein"
                value={roundedProtein}
              />
              <NutrientIcon
                type="carbs"
                value={roundedCarbs}
              />
              <NutrientIcon
                type="fat"
                value={roundedFat}
              />
            </div>
          </div>

          {/* Instructions */}
          {recipeInstructions && (
            <div>
              <h4 className="font-semibold text-foreground mb-2">Preparación</h4>
              <p className="text-muted-foreground whitespace-pre-line">{recipeInstructions}</p>
            </div>
          )}

          {/* Ingredients */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Ingredientes</h4>
            <div className="space-y-2">
              {ingredients.map((ingredient) => (
                <EditableIngredientItem
                  key={ingredient.id}
                  ingredient={ingredient}
                  checked={checkedIngredients[ingredient.id] || false}
                  quantity={ingredientQuantities[ingredient.id] || ingredient.quantity_grams}
                  onCheck={(checked) => onIngredientCheck(ingredient.id, checked)}
                  onQuantityChange={(quantity) => onQuantityChange(ingredient.id, quantity)}
                />
              ))}
            </div>
            
            {/* Save Recipe Ingredients Button */}
            {hasSelectedIngredients && onSaveRecipeIngredients && (
              <div className="mt-4 pt-4 border-t">
                <Button
                  onClick={onSaveRecipeIngredients}
                  className="w-full"
                  size="lg"
                >
                  Guardar Ingredientes Seleccionados
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.recipeName === nextProps.recipeName &&
    prevProps.totalCalories === nextProps.totalCalories &&
    prevProps.totalProtein === nextProps.totalProtein &&
    prevProps.totalCarbs === nextProps.totalCarbs &&
    prevProps.totalFat === nextProps.totalFat &&
    prevProps.ingredients === nextProps.ingredients &&
    prevProps.checkedIngredients === nextProps.checkedIngredients &&
    prevProps.ingredientQuantities === nextProps.ingredientQuantities &&
    prevProps.recipeImageUrl === nextProps.recipeImageUrl
  );
});