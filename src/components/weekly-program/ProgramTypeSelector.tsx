
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Dumbbell, Zap } from "lucide-react";

interface ProgramTypeSelectorProps {
  selectedType: 'simple' | 'advanced';
  onTypeChange: (type: 'simple' | 'advanced') => void;
}

const ProgramTypeSelector: React.FC<ProgramTypeSelectorProps> = ({
  selectedType,
  onTypeChange
}) => {
  return (
    <div className="flex gap-3 mb-6">
      <Button
        variant={selectedType === 'simple' ? 'default' : 'outline'}
        onClick={() => onTypeChange('simple')}
        className="flex-1 flex items-center gap-2 h-12"
      >
        <Dumbbell className="h-4 w-4" />
        <div className="text-left">
          <div className="font-medium">Simple</div>
          <div className="text-xs opacity-70">Rutinas semanales</div>
        </div>
      </Button>
      
      <Button
        variant={selectedType === 'advanced' ? 'default' : 'outline'}
        onClick={() => onTypeChange('advanced')}
        className="flex-1 flex items-center gap-2 h-12"
      >
        <Zap className="h-4 w-4" />
        <div className="text-left">
          <div className="font-medium">Avanzada</div>
          <div className="text-xs opacity-70">Múltiples semanas</div>
        </div>
      </Button>
    </div>
  );
};

export default ProgramTypeSelector;
