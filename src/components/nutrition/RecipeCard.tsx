import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
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
  onQuantityChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-secondary/20 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              {recipeName}
            </h3>
            <div className="flex flex-wrap gap-4">
              <NutrientIcon
                type="calories"
                value={totalCalories}
                unit="kcal"
              />
              <NutrientIcon
                type="protein"
                value={totalProtein}
              />
              <NutrientIcon
                type="carbs"
                value={totalCarbs}
              />
              <NutrientIcon
                type="fat"
                value={totalFat}
              />
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 ml-4"
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border bg-secondary/10">
          <div className="p-4 space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              Ingredientes:
            </h4>
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
        </div>
      )}
    </Card>
  );
};