
import React from "react";
import Button from "@/components/Button";

interface FloatingActionButtonProps {
  selectedCount: number;
  onClick: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  selectedCount,
  onClick
}) => {
  if (selectedCount === 0) return null;
  
  return (
    <div className="fixed bottom-20 left-0 right-0 p-4 flex justify-center">
      <Button
        variant="primary"
        className="shadow-neu-float px-6"
        onClick={onClick}
      >
        Añadir {selectedCount} ejercicios
      </Button>
    </div>
  );
};

export default FloatingActionButton;
