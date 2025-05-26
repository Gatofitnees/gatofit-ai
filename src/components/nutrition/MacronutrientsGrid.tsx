
import React from 'react';
import { Zap, Wheat, Droplet } from 'lucide-react';

interface MacronutrientsGridProps {
  protein: number;
  carbs: number;
  fat: number;
  onMacroEdit: (type: string) => void;
}

export const MacronutrientsGrid: React.FC<MacronutrientsGridProps> = ({
  protein,
  carbs,
  fat,
  onMacroEdit
}) => {
  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      <div 
        className="neu-card p-4 text-center cursor-pointer hover:bg-secondary/10 transition-colors"
        onClick={() => onMacroEdit('protein_g')}
      >
        <Zap className="h-5 w-5 text-blue-400 mx-auto mb-2" />
        <div className="text-lg font-bold">{protein}g</div>
        <div className="text-xs text-muted-foreground">Proteína</div>
      </div>
      
      <div 
        className="neu-card p-4 text-center cursor-pointer hover:bg-secondary/10 transition-colors"
        onClick={() => onMacroEdit('carbs_g')}
      >
        <Wheat className="h-5 w-5 text-green-400 mx-auto mb-2" />
        <div className="text-lg font-bold">{carbs}g</div>
        <div className="text-xs text-muted-foreground">Carbos</div>
      </div>
      
      <div 
        className="neu-card p-4 text-center cursor-pointer hover:bg-secondary/10 transition-colors"
        onClick={() => onMacroEdit('fat_g')}
      >
        <Droplet className="h-5 w-5 text-yellow-400 mx-auto mb-2" />
        <div className="text-lg font-bold">{fat}g</div>
        <div className="text-xs text-muted-foreground">Grasas</div>
      </div>
    </div>
  );
};
