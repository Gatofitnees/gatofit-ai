
import React from 'react';
import { FlatIcon } from '../ui/FlatIcon';

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
        <FlatIcon name="sr-drumstick" className="mx-auto mb-2" style={{ color: '#dd6969' }} size={20} />
        <div className="text-lg font-bold">{protein}g</div>
        <div className="text-xs text-muted-foreground">Proteína</div>
      </div>
      
      <div 
        className="neu-card p-4 text-center cursor-pointer hover:bg-secondary/10 transition-colors"
        onClick={() => onMacroEdit('carbs_g')}
      >
        <FlatIcon name="br-wheat" className="mx-auto mb-2" style={{ color: '#EB9F6D' }} size={20} />
        <div className="text-lg font-bold">{carbs}g</div>
        <div className="text-xs text-muted-foreground">Carbos</div>
      </div>
      
      <div 
        className="neu-card p-4 text-center cursor-pointer hover:bg-secondary/10 transition-colors"
        onClick={() => onMacroEdit('fat_g')}
      >
        <FlatIcon name="sr-avocado" className="text-yellow-400 mx-auto mb-2" size={20} />
        <div className="text-lg font-bold">{fat}g</div>
        <div className="text-xs text-muted-foreground">Grasas</div>
      </div>
    </div>
  );
};
