
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
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <Input
            value={foodName}
            onChange={(e) => onFoodNameChange(e.target.value)}
            placeholder="Nombre del alimento"
            className="text-base font-medium border-none p-0 bg-transparent leading-tight h-auto max-h-[3.25rem] overflow-y-hidden"
            style={{ 
              minHeight: '2.5rem',
              lineHeight: '1.25rem',
              display: '-webkit-box',
              WebkitLineClamp: '2',
              WebkitBoxOrient: 'vertical',
              textOverflow: 'ellipsis'
            }}
          />
        </div>
        
        {/* Portion Controls - más compactos y centrados */}
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onQuantityChange(-0.5)}
            className="h-6 w-6 p-0 rounded-full"
          >
            <Minus className="h-3 w-3" />
          </Button>
          
          <div className="w-8 text-center">
            <span className="text-sm font-medium">
              {quantity}
            </span>
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onQuantityChange(0.5)}
            className="h-6 w-6 p-0 rounded-full"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
