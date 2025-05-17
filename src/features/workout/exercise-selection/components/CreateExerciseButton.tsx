
import React from "react";
import { Plus } from "lucide-react";
import Button from "@/components/Button";

interface CreateExerciseButtonProps {
  onClick: () => void;
}

const CreateExerciseButton: React.FC<CreateExerciseButtonProps> = ({ onClick }) => {
  return (
    <Button 
      variant="secondary"
      size="sm"
      leftIcon={<Plus className="h-4 w-4" />}
      onClick={onClick}
    >
      Crear Ejercicio
    </Button>
  );
};

export default CreateExerciseButton;
