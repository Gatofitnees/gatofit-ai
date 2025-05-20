
import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/Button";
import { Save, ArrowLeft } from "lucide-react";

interface RoutinePageHeaderProps {
  onSaveClick: (e: React.MouseEvent) => void;
  isSubmitting: boolean;
}

const RoutinePageHeader: React.FC<RoutinePageHeaderProps> = ({ onSaveClick, isSubmitting }) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    // We don't need to handle confirmation here, as the navigation protection in CreateRoutinePage will catch it
    navigate("/workout");
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center">
        <button 
          onClick={handleBackClick}
          className="mr-3 p-1 rounded-full hover:bg-secondary/50 transition-colors"
          type="button"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Crear Rutina</h1>
      </div>
      <Button 
        variant="primary" 
        size="sm"
        leftIcon={isSubmitting ? null : <Save className="h-4 w-4" />}
        onClick={onSaveClick}
        disabled={isSubmitting}
        type="button"
      >
        {isSubmitting ? 'Guardando...' : 'Guardar'}
      </Button>
    </div>
  );
};

export default RoutinePageHeader;
