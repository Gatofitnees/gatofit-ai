
import React from "react";
import Button from "@/components/Button";
import { Save } from "lucide-react";

interface RoutinePageHeaderProps {
  onSaveClick: (e: React.MouseEvent) => void;
  isSubmitting: boolean;
}

const RoutinePageHeader: React.FC<RoutinePageHeaderProps> = ({ onSaveClick, isSubmitting }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-xl font-bold">Crear Rutina</h1>
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
