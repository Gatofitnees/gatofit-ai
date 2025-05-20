
import React, { useState } from "react";
import { X, Calendar, LineChart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Button from "@/components/Button";
import { useExerciseHistory } from "@/hooks/useExerciseHistory";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ExerciseHistoryDialogProps {
  exerciseId: number;
  exerciseName: string;
  trigger?: React.ReactNode;
}

const ExerciseHistoryDialog: React.FC<ExerciseHistoryDialogProps> = ({
  exerciseId,
  exerciseName,
  trigger
}) => {
  const [open, setOpen] = useState(false);
  const { history, loading, isEmpty } = useExerciseHistory({ exerciseId });
  
  // Group history entries by date
  const historyByDate: Record<string, typeof history> = {};
  
  history.forEach(entry => {
    // Convert date string to a simple date format for grouping
    const dateKey = typeof entry.date === 'string' ? entry.date.split('T')[0] : format(entry.date, 'yyyy-MM-dd');
    if (!historyByDate[dateKey]) {
      historyByDate[dateKey] = [];
    }
    historyByDate[dateKey].push(entry);
  });
  
  // Get sorted dates (most recent first)
  const dates = Object.keys(historyByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            variant="outline"
            leftIcon={<LineChart className="h-4 w-4" />}
            className="mr-2"
            fullWidth
          >
            Ver Historial
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-full max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg">Historial de {exerciseName}</DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </Button>
        </DialogHeader>
        
        <div className="mt-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center p-6">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : isEmpty ? (
            <div className="text-center py-12 px-4">
              <LineChart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay historial disponible</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Aún no has realizado este ejercicio o no hay registros guardados.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {dates.map(dateStr => {
                const displayDate = format(new Date(dateStr), "d 'de' MMMM, yyyy", { locale: es });
                const entries = historyByDate[dateStr];
                
                return (
                  <div key={dateStr} className="border border-border rounded-lg overflow-hidden">
                    <div className="bg-muted/30 px-4 py-2 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-primary" />
                      <span className="text-sm font-medium">{displayDate}</span>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-3 gap-2 mb-2 text-xs text-muted-foreground">
                        <div>Set</div>
                        <div>Peso (kg)</div>
                        <div>Reps</div>
                      </div>
                      <div className="space-y-2">
                        {entries.sort((a, b) => (a.sets || 0) - (b.sets || 0)).map(entry => (
                          <div key={entry.id} className="grid grid-cols-3 gap-2 text-sm py-1 border-t border-border first:border-0">
                            <div>{entry.sets || "—"}</div>
                            <div>{entry.weight_kg || "—"}</div>
                            <div>{entry.reps || "—"}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseHistoryDialog;
