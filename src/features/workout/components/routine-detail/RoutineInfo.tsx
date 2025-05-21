
import React from "react";
import { Clock, Play } from "lucide-react";
import Button from "@/components/Button";

interface RoutineInfoProps {
  estimatedDuration?: number;
  description?: string;
  onStartWorkout: () => void;
  isStarting: boolean;
}

const RoutineInfo: React.FC<RoutineInfoProps> = ({ 
  estimatedDuration, 
  description, 
  onStartWorkout, 
  isStarting 
}) => {
  return (
    <div className="bg-secondary/10 p-4 rounded-xl mb-6">
      <div className="flex items-center text-sm text-muted-foreground mb-2">
        <Clock className="h-4 w-4 mr-1" />
        <span>Duración estimada: {estimatedDuration || '30'} min</span>
      </div>
      
      {description && (
        <p className="text-sm">{description}</p>
      )}
      
      <div className="mt-4">
        <Button
          variant="primary"
          leftIcon={<Play className="h-4 w-4" />}
          fullWidth
          onClick={onStartWorkout}
          disabled={isStarting}
          type="button"
        >
          {isStarting ? 'Iniciando...' : 'Iniciar Entrenamiento'}
        </Button>
      </div>
    </div>
  );
};

export default RoutineInfo;
