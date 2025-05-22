
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SaveButtonProps {
  isSaving: boolean;
  onClick: () => void;
  isVisible?: boolean;
}

export const SaveButton: React.FC<SaveButtonProps> = ({ 
  isSaving, 
  onClick, 
  isVisible = true 
}) => {
  if (!isVisible) return null;
  
  return (
    <div className="px-4 py-3 mb-16 bg-background/80 backdrop-blur-md z-10 border-t border-white/5">
      <Button 
        variant="default"
        className="w-full"
        onClick={onClick}
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Guardando entrenamiento...
          </>
        ) : (
          "Guardar entrenamiento"
        )}
      </Button>
    </div>
  );
};
