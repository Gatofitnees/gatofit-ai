
import React from "react";
import { ArrowLeft, Save } from "lucide-react";
import Button from "@/components/Button";

interface CreateExerciseHeaderProps {
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
}

const CreateExerciseHeader: React.FC<CreateExerciseHeaderProps> = ({ onCancel, onSave, saving }) => {
  return (
    <div className="sticky top-0 z-10 bg-background p-4 flex items-center justify-between border-b border-muted/20">
      <div className="flex items-center">
        <button 
          onClick={onCancel}
          className="mr-3 p-1 rounded-full hover:bg-secondary/50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Crear Ejercicio</h1>
      </div>
      <Button 
        variant="primary"
        size="sm"
        leftIcon={<Save className="h-4 w-4" />}
        onClick={onSave}
        disabled={saving}
      >
        {saving ? "Guardando..." : "Guardar"}
      </Button>
    </div>
  );
};

export default CreateExerciseHeader;
