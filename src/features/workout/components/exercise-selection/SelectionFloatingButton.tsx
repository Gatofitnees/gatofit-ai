
import React from "react";
import Button from "@/components/Button";

interface SelectionFloatingButtonProps {
  selectedCount: number;
  onAddExercises: () => void;
}

const SelectionFloatingButton: React.FC<SelectionFloatingButtonProps> = ({
  selectedCount,
  onAddExercises,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 p-4 flex justify-center">
      <Button
        variant="primary"
        className="shadow-neu-float px-6 bg-blue-500 hover:bg-blue-600"
        onClick={onAddExercises}
        type="button"
      >
        Añadir {selectedCount} ejercicios
      </Button>
    </div>
  );
};

export default SelectionFloatingButton;
