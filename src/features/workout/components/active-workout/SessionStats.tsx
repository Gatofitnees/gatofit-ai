
import React from "react";
import { ExerciseSession } from "@/hooks/types/exerciseHistory";

interface SessionStatsProps {
  session: ExerciseSession;
}

export const SessionStats: React.FC<SessionStatsProps> = ({ session }) => {
  return (
    <div className="space-y-4">
      {/* Daily Summary */}
      <div className="bg-background/40 rounded-lg border border-white/10 p-4">
        <h5 className="text-sm font-medium mb-3 text-primary">Resumen del día</h5>
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

      {/* Individual Workouts - Sin marco exterior */}
      <div className="space-y-4">
        {session.workouts.map((workout) => (
          <div key={workout.workout_log_id} className="bg-background/40 rounded-lg border border-white/10 p-4">
            <div className="flex justify-between items-center mb-4">
              <h6 className="text-sm font-medium text-primary">
                Entreno {workout.workout_number}
              </h6>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Peso máx: {workout.maxWeight ? `${workout.maxWeight} kg` : '-'}</span>
                <span>Total reps: {workout.totalReps}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              {workout.sets.map((set) => (
                <div 
                  key={set.set_number}
                  className="flex justify-between items-center text-sm p-3 bg-background/30 rounded-md border border-white/5"
                >
                  <span className="font-medium">Serie {set.set_number}</span>
                  <span className="font-medium">
                    {set.weight_kg_used ? `${set.weight_kg_used} kg` : '-'} × {set.reps_completed || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
