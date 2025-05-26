
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { EditableIngredient } from './EditableIngredient';

interface Ingredient {
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface IngredientsSectionProps {
  ingredients: Ingredient[];
  showIngredients: boolean;
  onToggleShow: () => void;
  onIngredientUpdate: (index: number, data: Ingredient) => void;
}

export const IngredientsSection: React.FC<IngredientsSectionProps> = ({
  ingredients,
  showIngredients,
  onToggleShow,
  onIngredientUpdate
}) => {
  return (
    <div className="neu-card p-4 mb-4">
      <button
        onClick={onToggleShow}
        className="flex items-center justify-between w-full text-sm font-medium"
      >
        <div className="flex items-center gap-2">
          <span>Ingredientes</span>
          {ingredients.length > 0 && (
            <span className="text-xs text-muted-foreground bg-secondary/20 px-2 py-1 rounded-full">
              {ingredients.length}
            </span>
          )}
        </div>
        {showIngredients ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      
      {showIngredients && (
        <div className="mt-3 space-y-3">
          {ingredients.map((ingredient, index) => (
            <EditableIngredient
              key={index}
              {...ingredient}
              onUpdate={(data) => onIngredientUpdate(index, data)}
            />
          ))}
          
          {ingredients.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <p className="text-sm">No hay ingredientes detectados</p>
              <p className="text-xs mt-1">Los ingredientes aparecerán aquí cuando la IA analice la comida</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
