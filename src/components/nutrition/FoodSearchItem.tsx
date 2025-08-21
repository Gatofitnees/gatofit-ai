import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PortionSelector from './PortionSelector';
import NutrientIcon from './NutrientIcon';
import FoodCategoryBadge from './FoodCategoryBadge';

interface FoodSearchItemProps {
  food: {
    id: string;
    name: string;
    description: string;
    brand?: string;
    category?: string;
    subcategory?: string;
    categoryIcon?: string;
    categoryColor?: string;
    nutrition?: {
      calories: number;
      fat: number;
      carbs: number;
      protein: number;
      serving_size: string;
    };
  };
}

const FoodSearchItem: React.FC<FoodSearchItemProps> = ({ food }) => {
  const [showPortionSelector, setShowPortionSelector] = useState(false);

  const handleAddFood = () => {
    setShowPortionSelector(true);
  };

  if (showPortionSelector) {
    return (
      <PortionSelector
        food={food}
        onCancel={() => setShowPortionSelector(false)}
        onConfirm={() => {
          setShowPortionSelector(false);
          // This will be handled in PortionSelector
        }}
      />
    );
  }

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header with name and category */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-base leading-tight text-foreground">
                {food.name}
              </h3>
              {food.brand && (
                <span className="text-xs text-muted-foreground shrink-0 font-medium">
                  {food.brand}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {food.category && (
                <FoodCategoryBadge
                  category={food.category}
                  subcategory={food.subcategory}
                  icon={food.categoryIcon}
                  color={food.categoryColor}
                />
              )}
            </div>
          </div>
          
          {/* Nutrition information */}
          {food.nutrition && (
            <div className="grid grid-cols-2 gap-3">
              <NutrientIcon
                type="calories"
                value={food.nutrition.calories}
                unit="kcal"
              />
              <NutrientIcon
                type="protein"
                value={food.nutrition.protein}
              />
              <NutrientIcon
                type="carbs"
                value={food.nutrition.carbs}
              />
              <NutrientIcon
                type="fat"
                value={food.nutrition.fat}
              />
            </div>
          )}
          
          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-2">
            {food.description}
          </p>
          
          {/* Serving size */}
          {food.nutrition?.serving_size && (
            <p className="text-xs text-muted-foreground font-medium">
              Por {food.nutrition.serving_size}
            </p>
          )}
        </div>

        <Button
          size="sm"
          onClick={handleAddFood}
          className="shrink-0 h-9 w-9 p-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

export default FoodSearchItem;