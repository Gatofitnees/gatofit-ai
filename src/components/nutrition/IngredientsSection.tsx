
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { EditableIngredient } from './EditableIngredient';

interface IngredientDetail {
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface IngredientsSectionProps {
  ingredients: IngredientDetail[];
  showIngredients: boolean;
  onToggleShow: () => void;
  onIngredientUpdate: (index: number, data: IngredientDetail) => void;
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
        <span>Ingredientes ({ingredients.length})</span>
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
            <p className="text-sm text-muted-foreground text-center py-4">
              No se han detectado ingredientes específicos
            </p>
          )}
        </div>
      )}
    </div>
  );
};
