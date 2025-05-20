
import React from "react";
import { Check, ArrowLeft } from "lucide-react";
import Button from "@/components/Button";

interface RoutinePageHeaderProps {
  isSubmitting: boolean;
  onSaveClick: (e: React.MouseEvent) => void;
  onBackClick?: () => void;
}

const RoutinePageHeader: React.FC<RoutinePageHeaderProps> = ({ 
  onSaveClick, 
  onBackClick,
  isSubmitting 
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        {onBackClick && (
          <button
            onClick={onBackClick}
            className="mr-3 p-2 rounded-full hover:bg-secondary/50 transition-colors"
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
        leftIcon={<Check className="h-4 w-4" />}
        onClick={onSaveClick}
        disabled={isSubmitting}
        type="button"
        className="rounded-full px-4"
      >
        {isSubmitting ? "Guardando..." : "Guardar"}
      </Button>
    </div>
  );
};

export default RoutinePageHeader;
