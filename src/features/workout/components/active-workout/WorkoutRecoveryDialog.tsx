import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Clock, Dumbbell } from 'lucide-react';
import type { WorkoutCacheData } from '../../hooks/useWorkoutCache';

interface WorkoutRecoveryDialogProps {
  open: boolean;
  cacheData: WorkoutCacheData | null;
  onContinue: () => void;
  onDiscard: () => void;
}

export const WorkoutRecoveryDialog: React.FC<WorkoutRecoveryDialogProps> = ({
  open,
  cacheData,
  onContinue,
  onDiscard,
}) => {
  if (!cacheData) return null;

  const getTimeSinceLastSave = () => {
    const lastSaved = new Date(cacheData.lastSaved);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastSaved.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'hace menos de un minuto';
    if (diffMinutes < 60) return `hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  };

  const getTotalExercisesWithData = () => {
    const baseCount = Object.values(cacheData.baseExercises).filter(ex => 
      ex.sets.some(set => set.weight || set.reps)
    ).length;
    const tempCount = cacheData.temporaryExercises.filter(ex =>
      ex.sets?.some((set: any) => set.weight || set.reps)
    ).length;
    return baseCount + tempCount;
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Dumbbell className="h-5 w-5 text-primary" />
            </div>
            <AlertDialogTitle className="text-xl">
              Entrenamiento en progreso
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base space-y-3 pt-2">
            <p>
              Tienes un entrenamiento sin finalizar de <strong>{cacheData.routineName}</strong>
            </p>
            
            <div className="flex flex-col gap-2 p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Último guardado: {getTimeSinceLastSave()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Dumbbell className="h-4 w-4 text-muted-foreground" />
                <span>{getTotalExercisesWithData()} ejercicio{getTotalExercisesWithData() !== 1 ? 's' : ''} con datos</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              ¿Deseas continuar donde lo dejaste o descartar este progreso?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel onClick={onDiscard}>
            Descartar
          </AlertDialogCancel>
          <AlertDialogAction onClick={onContinue} className="bg-primary">
            Continuar entrenamiento
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
