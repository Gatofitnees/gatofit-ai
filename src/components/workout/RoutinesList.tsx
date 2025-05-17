
import React from "react";
import { Card } from "@/components/Card";
import RoutineListItem from "./RoutineListItem";

interface WorkoutRoutine {
  id: string;
  name: string;
  type: string;
  duration: string;
  exercises: number;
}

interface RoutinesListProps {
  routines: WorkoutRoutine[];
  onStartRoutine: (routineId: string) => void;
}

const RoutinesList: React.FC<RoutinesListProps> = ({ routines, onStartRoutine }) => {
  if (routines.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No tienes rutinas guardadas</p>
        <p className="text-sm mt-2">Crea tu primera rutina usando el botón de abajo</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {routines.map((routine) => (
        <Card key={routine.id} className="hover:scale-[1.01] transition-transform duration-300">
          <RoutineListItem
            id={routine.id}
            name={routine.name}
            type={routine.type}
            duration={routine.duration}
            exercises={routine.exercises}
            onStartRoutine={onStartRoutine}
          />
        </Card>
      ))}
    </div>
  );
};

export default RoutinesList;
