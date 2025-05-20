
import React from "react";
import Button from "@/components/Button";
import { ArrowLeft, Save } from "lucide-react";

interface RoutinePageHeaderProps {
  onSaveClick: (e: React.MouseEvent) => void;
  onBackClick?: () => void;
  isSubmitting: boolean;
}

const RoutinePageHeader: React.FC<RoutinePageHeaderProps> = ({ 
  onSaveClick, 
  onBackClick,
  isSubmitting 
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-2">
        {onBackClick && (
          <button 
            onClick={onBackClick}
            className="p-1 rounded-full hover:bg-secondary/50"
            type="button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-xl font-bold">Crear Rutina</h1>
      </div>
      <Button 
        variant="primary" 
        size="sm"
        leftIcon={<Save className="h-4 w-4" />}
        onClick={onSaveClick}
        disabled={isSubmitting}
        type="button"
      >
        Guardar
      </Button>
    </div>
  );
};

export default RoutinePageHeader;
