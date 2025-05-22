
import React from "react";
import { ArrowLeft, Save } from "lucide-react";

interface RoutinePageHeaderProps {
  onBackClick: () => void;
  onSaveClick: (e: React.MouseEvent) => void;
  isSubmitting: boolean;
  isEditing?: boolean;
}

const RoutinePageHeader: React.FC<RoutinePageHeaderProps> = ({ 
  onBackClick,
  onSaveClick,
  isSubmitting,
  isEditing = false
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <button onClick={onBackClick} className="p-2 rounded-full hover:bg-secondary/40">
        <ArrowLeft className="h-5 w-5 text-primary" />
      </button>
      
      <h1 className="text-xl font-semibold">
        {isEditing ? 'Editar Rutina' : 'Nueva Rutina'}
      </h1>
      
      <button 
        onClick={onSaveClick}
        disabled={isSubmitting}
        className={`p-2 rounded-full ${isSubmitting ? 'opacity-50' : 'hover:bg-secondary/40'}`}
      >
        <Save className="h-5 w-5 text-primary" />
      </button>
    </div>
  );
};

export default RoutinePageHeader;
