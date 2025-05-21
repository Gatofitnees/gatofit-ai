
import React from "react";
import WorkoutListItem from "./WorkoutListItem";

interface WorkoutRoutine {
  id: number;
  name: string;
  type?: string;
  description?: string;
  estimated_duration_minutes?: number;
  exercise_count?: number;
  created_at: string;
}

interface WorkoutListProps {
  routines: WorkoutRoutine[];
  loading: boolean;
  onStartWorkout: (id: number) => void;
  onRoutineDeleted?: () => void;
}

const WorkoutList: React.FC<WorkoutListProps> = ({ 
  routines, 
  loading, 
  onStartWorkout,
  onRoutineDeleted
}) => {
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
            onRoutineDeleted={onRoutineDeleted}
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
