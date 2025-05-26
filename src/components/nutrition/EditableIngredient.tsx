
import React, { useState } from 'react';
import { Flame, Zap, Wheat, Droplet } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface EditableIngredientProps {
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  onUpdate: (data: {
    name: string;
    grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }) => void;
}

export const EditableIngredient: React.FC<EditableIngredientProps> = ({
  name,
  grams,
  calories,
  protein,
  carbs,
  fat,
  onUpdate
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');

  const handleEditStart = (field: string, currentValue: string | number) => {
    setEditingField(field);
    setTempValue(currentValue.toString());
  };

  const handleEditSave = () => {
    if (!editingField) return;

    const updatedData = {
      name,
      grams,
      calories,
      protein,
      carbs,
      fat
    };

    if (editingField === 'name') {
      updatedData.name = tempValue;
    } else {
      const numValue = parseFloat(tempValue) || 0;
      (updatedData as any)[editingField] = numValue;
    }

    onUpdate(updatedData);
    setEditingField(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSave();
    } else if (e.key === 'Escape') {
      setEditingField(null);
    }
  };

  return (
    <div className="neu-card p-4 space-y-3">
      {/* Nombre e ingrediente con gramos */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {editingField === 'name' ? (
            <Input
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={handleEditSave}
              onKeyDown={handleKeyPress}
              className="text-sm font-medium"
              autoFocus
            />
          ) : (
            <button
              onClick={() => handleEditStart('name', name)}
              className="text-sm font-medium text-left hover:text-primary transition-colors"
            >
              {name}
            </button>
          )}
          <div className="text-xs text-muted-foreground mt-1">
            {editingField === 'grams' ? (
              <Input
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onBlur={handleEditSave}
                onKeyDown={handleKeyPress}
                className="text-xs h-6"
                autoFocus
              />
            ) : (
              <button
                onClick={() => handleEditStart('grams', grams)}
                className="hover:text-primary transition-colors"
              >
                {grams}g
              </button>
            )}
          </div>
        </div>

        {/* Macros a la derecha */}
        <div className="flex flex-col gap-2">
          {/* Fila superior: Calorías */}
          <div className="flex items-center gap-2">
            <Flame className="h-3 w-3 text-orange-400" />
            {editingField === 'calories' ? (
              <Input
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onBlur={handleEditSave}
                onKeyDown={handleKeyPress}
                className="text-xs h-6 w-16"
                autoFocus
              />
            ) : (
              <button
                onClick={() => handleEditStart('calories', calories)}
                className="text-xs font-medium hover:text-primary transition-colors"
              >
                {calories}
              </button>
            )}
            <span className="text-xs text-muted-foreground">kcal</span>
          </div>

          {/* Fila inferior: Macros */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-blue-400" />
              {editingField === 'protein' ? (
                <Input
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onBlur={handleEditSave}
                  onKeyDown={handleKeyPress}
                  className="text-xs h-5 w-12"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => handleEditStart('protein', protein)}
                  className="text-xs hover:text-primary transition-colors"
                >
                  {protein}g
                </button>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Wheat className="h-3 w-3 text-green-400" />
              {editingField === 'carbs' ? (
                <Input
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onBlur={handleEditSave}
                  onKeyDown={handleKeyPress}
                  className="text-xs h-5 w-12"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => handleEditStart('carbs', carbs)}
                  className="text-xs hover:text-primary transition-colors"
                >
                  {carbs}g
                </button>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Droplet className="h-3 w-3 text-yellow-400" />
              {editingField === 'fat' ? (
                <Input
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onBlur={handleEditSave}
                  onKeyDown={handleKeyPress}
                  className="text-xs h-5 w-12"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => handleEditStart('fat', fat)}
                  className="text-xs hover:text-primary transition-colors"
                >
                  {fat}g
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
