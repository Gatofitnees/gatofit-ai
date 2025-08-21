import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import PortionSelector from './PortionSelector';

interface FoodSearchItemProps {
  food: {
    id: string;
    name: string;
    description: string;
    brand?: string;
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
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            <h3 className="font-medium text-sm leading-tight">{food.name}</h3>
            {food.brand && (
              <Badge variant="secondary" className="text-xs shrink-0">
                {food.brand}
              </Badge>
            )}
          </div>
          
          {food.nutrition && (
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>
                <span className="font-medium">{food.nutrition.calories}</span> kcal
              </div>
              <div>
                <span className="font-medium">{food.nutrition.protein}g</span> proteína
              </div>
              <div>
                <span className="font-medium">{food.nutrition.carbs}g</span> carbos
              </div>
              <div>
                <span className="font-medium">{food.nutrition.fat}g</span> grasa
              </div>
            </div>
          )}
          
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
            {food.description}
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleAddFood}
          className="shrink-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

export default FoodSearchItem;