
import React from "react";
import WorkoutListItem from "./WorkoutListItem";
import { RoutineData } from "@/features/workout/types";

interface WorkoutListProps {
  routines: RoutineData[];
  loading: boolean;
  onStartWorkout: (id: number) => void;
}

const WorkoutList: React.FC<WorkoutListProps> = ({ routines, loading, onStartWorkout }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {routines.length > 0 ? (
        routines.map((routine) => (
          <WorkoutListItem 
            key={routine.id} 
            routine={routine} 
            onStartWorkout={onStartWorkout} 
          />
        ))
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No se encontraron rutinas
        </div>
      )}
    </div>
  );
};

export default WorkoutList;
