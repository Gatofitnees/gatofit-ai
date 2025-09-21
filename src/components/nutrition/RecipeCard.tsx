import React, { useState } from 'react';
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

export const RecipeCard: React.FC<RecipeCardProps> = ({
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
  const hasSelectedIngredients = ingredients.some(ingredient => checkedIngredients[ingredient.id]);
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
              <div className="mb-2">
                <NutrientIcon
                  type="calories"
                  value={Math.round(totalCalories)}
                  unit="kcal"
                  className="text-sm font-semibold"
                />
              </div>
              {/* Macros below */}
              <div className="flex flex-wrap gap-3">
                <NutrientIcon
                  type="protein"
                  value={Math.round(totalProtein)}
                  className="text-xs"
                />
                <NutrientIcon
                  type="carbs"
                  value={Math.round(totalCarbs)}
                  className="text-xs"
                />
                <NutrientIcon
                  type="fat"
                  value={Math.round(totalFat)}
                  className="text-xs"
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
                value={Math.round(totalCalories)}
                unit="kcal"
              />
              <NutrientIcon
                type="protein"
                value={Math.round(totalProtein)}
              />
              <NutrientIcon
                type="carbs"
                value={Math.round(totalCarbs)}
              />
              <NutrientIcon
                type="fat"
                value={Math.round(totalFat)}
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
};