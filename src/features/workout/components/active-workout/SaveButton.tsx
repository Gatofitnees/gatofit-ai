
import React from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface SaveButtonProps {
  isSaving: boolean;
  onClick: () => void;
  show: boolean;
}

export const SaveButton: React.FC<SaveButtonProps> = ({ isSaving, onClick, show }) => {
  if (!show) return null;

  return (
    <div className="fixed left-0 right-0 bottom-16 px-4 py-3 bg-background/80 backdrop-blur-md z-10 border-t border-white/5">
      <Button 
        variant="default"
        className="w-full"
        onClick={onClick}
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <span className="animate-pulse mr-2">•</span>
            Guardando entrenamiento...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Guardar entrenamiento
          </>
        )}
      </Button>
    </div>
  );
};
