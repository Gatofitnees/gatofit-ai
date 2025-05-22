
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";

interface WorkoutHeaderProps {
  routineName: string;
  isReorderMode: boolean;
  isSaving: boolean;
  onBack: () => void;
  onToggleReorder: () => void;
  onSave: () => void;
}

export const WorkoutHeader: React.FC<WorkoutHeaderProps> = ({
  routineName,
  isReorderMode,
  isSaving,
  onBack,
  onToggleReorder,
  onSave
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={onBack}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold">{routineName}</h1>
      </div>
      
      <div className="flex space-x-2">
        <Button 
          variant={isReorderMode ? "secondary" : "outline"}
          size="sm"
          onClick={onToggleReorder}
        >
          {isReorderMode ? "Terminar" : "Reordenar"}
        </Button>
        
        <Button 
          variant="default"
          size="sm"
          onClick={onSave}
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-1" />
          {isSaving ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </div>
  );
};
