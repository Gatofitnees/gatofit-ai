
import React from "react";
import { Plus } from "lucide-react";
import RoutineCard, { WorkoutRoutine } from "./RoutineCard";
import Button from "@/components/Button";

interface RoutinesListProps {
  routines: WorkoutRoutine[];
  loading: boolean;
  onStartRoutine: (routineId: string | number) => void;
  onCreateRoutine: () => void;
}

const RoutinesList: React.FC<RoutinesListProps> = ({
  routines,
  loading,
  onStartRoutine,
  onCreateRoutine,
}) => {
  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-pulse text-primary">Cargando rutinas...</div>
        </div>
      ) : routines.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No tienes rutinas guardadas</p>
          <Button variant="primary" onClick={onCreateRoutine}>
            Crear tu primera rutina
          </Button>
        </div>
      ) : (
        <>
          {routines.map((routine) => (
            <RoutineCard 
              key={routine.id} 
              routine={routine} 
              onStart={onStartRoutine} 
            />
          ))}

          <Button
            variant="secondary"
            fullWidth
            className="mt-4"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={onCreateRoutine}
          >
            Crear Nueva Rutina
          </Button>
        </>
      )}
    </div>
  );
};

export default RoutinesList;
