
import React from "react";
import { ArrowLeft } from "lucide-react";
import Button from "@/components/Button";

interface RoutineNotFoundProps {
  onBack: () => void;
}

const RoutineNotFound: React.FC<RoutineNotFoundProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-background text-foreground pt-6 pb-24 px-4 max-w-md mx-auto">
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack}
          className="mr-3 p-1 rounded-full hover:bg-secondary/50 text-foreground"
          type="button"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Rutina no encontrada</h1>
      </div>
      
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-6">La rutina que estás buscando no existe o ha sido eliminada.</p>
        <Button 
          variant="primary" 
          onClick={onBack}
          type="button"
        >
          Volver a mis rutinas
        </Button>
      </div>
    </div>
  );
};

export default RoutineNotFound;
