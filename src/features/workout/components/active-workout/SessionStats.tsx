
import React from "react";
import { ExerciseSession } from "@/hooks/types/exerciseHistory";
import { Separator } from "@/components/ui/separator";

interface SessionStatsProps {
  session: ExerciseSession;
}

export const SessionStats: React.FC<SessionStatsProps> = ({ session }) => {
  return (
    <div className="space-y-6">
      {/* Daily Summary */}
      <div className="py-4">
        <h5 className="text-sm font-medium mb-4 text-primary">Resumen del día</h5>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Peso máximo:</span>
            <span className="font-medium text-primary">
              {session.dailyMaxWeight ? `${session.dailyMaxWeight} kg` : '-'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total repeticiones:</span>
            <span className="font-medium text-primary">{session.dailyTotalReps}</span>
          </div>
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* Individual Workouts */}
      <div className="space-y-6">
        {session.workouts.map((workout, workoutIndex) => (
          <div key={workout.workout_log_id}>
            <div className="py-4">
              <div className="flex justify-between items-center mb-4">
                <h6 className="text-sm font-medium text-primary">
                  Entreno {workout.workout_number}
                </h6>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Peso máx: {workout.maxWeight ? `${workout.maxWeight} kg` : '-'}</span>
                  <span>Total reps: {workout.totalReps}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {workout.sets.map((set, setIndex) => (
                  <div key={set.set_number}>
                    <div className="flex justify-between items-center text-sm py-2">
                      <span className="font-medium">Serie {set.set_number}</span>
                      <span className="font-medium">
                        {set.weight_kg_used ? `${set.weight_kg_used} kg` : '-'} × {set.reps_completed || 0}
                      </span>
                    </div>
                    {setIndex < workout.sets.length - 1 && (
                      <Separator className="bg-white/5" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {workoutIndex < session.workouts.length - 1 && (
              <Separator className="bg-white/10" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
