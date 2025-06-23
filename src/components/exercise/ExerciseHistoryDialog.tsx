import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useExerciseHistory } from "@/hooks/useExerciseHistory";
import Button from "@/components/Button";
import { Calendar, Dumbbell } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ExerciseHistoryDialogProps {
  exerciseId: number;
  exerciseName: string;
}

const ExerciseHistoryDialog: React.FC<ExerciseHistoryDialogProps> = ({
  exerciseId,
  exerciseName,
}) => {
  const [open, setOpen] = useState(false);
  const { stats, loading, isEmpty } = useExerciseHistory({ exerciseId });

  // Group stats.sessions by date (use the new structure with workouts)
  const historyByDate = stats.sessions.reduce<{[key: string]: typeof stats.sessions}>((acc, session) => {
    const dateStr = session.date;
    
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(session);
    return acc;
  }, {});

  return (
    <>
      <Button 
        variant="outline"
        leftIcon={<Calendar className="h-4 w-4" />}
        onClick={() => setOpen(true)}
        className="w-full"
      >
        Ver historial de entrenamiento
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              Historial de {exerciseName}
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
              </div>
            ) : isEmpty ? (
              <div className="text-center py-8 text-muted-foreground">
                <Dumbbell className="mx-auto h-12 w-12 mb-3 opacity-20" />
                <p>No hay historial registrado para este ejercicio</p>
                <p className="text-sm mt-2">
                  Cuando registres un entrenamiento con este ejercicio, el historial aparecerá aquí
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.keys(historyByDate).sort().reverse().map((dateStr) => (
                  <div key={dateStr} className="border rounded-lg p-4">
                    <h3 className="text-sm font-medium border-b pb-2 mb-3">
                      {dateStr}
                    </h3>
                    
                    <div className="space-y-4">
                      {historyByDate[dateStr][0].workouts.map((workout) => (
                        <div key={workout.workout_log_id} className="space-y-2">
                          <h4 className="text-xs font-medium text-muted-foreground">
                            Entreno {workout.workout_number}
                          </h4>
                          <div className="space-y-1">
                            {workout.sets.map((set) => (
                              <div 
                                key={set.set_number} 
                                className="flex justify-between items-center py-1 border-b last:border-0"
                              >
                                <div className="text-sm">
                                  <span className="font-medium">Serie {set.set_number}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm bg-secondary/40 px-2 py-1 rounded">
                                    {set.weight_kg_used || 0} kg
                                  </span>
                                  <span className="text-sm bg-secondary/40 px-2 py-1 rounded">
                                    {set.reps_completed || 0} reps
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExerciseHistoryDialog;
