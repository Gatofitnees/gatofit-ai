
import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Button from '@/components/Button';

interface FoodNameAndPortionProps {
  foodName: string;
  quantity: number;
  onFoodNameChange: (name: string) => void;
  onQuantityChange: (delta: number) => void;
}

export const FoodNameAndPortion: React.FC<FoodNameAndPortionProps> = ({
  foodName,
  quantity,
  onFoodNameChange,
  onQuantityChange
}) => {
  return (
    <div className="neu-card p-4 mb-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 mr-4">
          <Input
            value={foodName}
            onChange={(e) => onFoodNameChange(e.target.value)}
            placeholder="Nombre del alimento"
            className="text-base font-medium border-none p-0 bg-transparent leading-tight h-auto"
            style={{ 
              minHeight: '2.5rem',
              lineHeight: '1.25rem'
            }}
          />
        </div>
        
        {/* Portion Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onQuantityChange(-0.5)}
            className="h-7 w-7 p-0"
          >
            <Minus className="h-3 w-3" />
          </Button>
          
          <div className="min-w-[50px] text-center">
            <span className="text-sm font-medium">
              {quantity}
            </span>
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onQuantityChange(0.5)}
            className="h-7 w-7 p-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
