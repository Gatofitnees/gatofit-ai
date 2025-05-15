
import React from "react";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  onBack: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ onBack }) => {
  return (
    <div className="flex justify-center mt-4">
      <button
        onClick={onBack}
        className="flex items-center justify-center py-2 text-sm text-muted-foreground"
      >
        <ArrowLeft size={16} className="mr-2" />
        Atrás
      </button>
    </div>
  );
};

export default BackButton;
