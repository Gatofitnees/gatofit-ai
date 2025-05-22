
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface RoutineNotFoundProps {
  onBack: () => void;
}

export const RoutineNotFound: React.FC<RoutineNotFoundProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={onBack}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold">Rutina no encontrada</h1>
      </div>
      
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          La rutina que estás buscando no existe o ha sido eliminada.
        </p>
        <Button onClick={onBack}>
          Volver a Mis Rutinas
        </Button>
      </div>
    </div>
  );
};
