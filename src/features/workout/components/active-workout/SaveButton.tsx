
import React from "react";
import { Button } from "@/components/ui/button";

interface SaveButtonProps {
  isSaving: boolean;
  onClick: () => void;
  className?: string;
}

export const SaveButton: React.FC<SaveButtonProps> = ({ isSaving, onClick, className = "" }) => {
  return (
    <div className={`fixed left-0 right-0 bottom-16 px-4 py-3 bg-background/80 backdrop-blur-md z-10 border-t border-white/5 ${className}`}>
      <Button 
        variant="default"
        className="w-full"
        onClick={onClick}
        disabled={isSaving}
      >
        {isSaving ? "Guardando entrenamiento..." : "Guardar entrenamiento"}
      </Button>
    </div>
  );
};
