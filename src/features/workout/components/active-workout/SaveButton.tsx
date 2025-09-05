
import React from "react";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";

interface SaveButtonProps {
  isSaving: boolean;
  onClick: () => void;
  className?: string;
}

export const SaveButton: React.FC<SaveButtonProps> = ({ isSaving, onClick, className = "" }) => {
  return (
    <div className={`fixed right-4 bottom-16 z-10 ${className}`}>
      <Button 
        variant="default"
        size="lg"
        className="h-12 w-12 rounded-full shadow-lg"
        onClick={onClick}
        disabled={isSaving}
      >
        {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
      </Button>
    </div>
  );
};
