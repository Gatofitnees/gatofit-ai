
import React, { useState } from 'react';
import { Clock, Dumbbell, MoreVertical, Play, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useNavigate } from 'react-router-dom';
import { deleteRoutine } from '@/features/workout/services/routineService';
import { useToast } from '@/hooks/use-toast';
import { translateRoutineType } from '@/utils/routineTypeTranslations';

interface Routine {
  id: number;
  name: string;
  description?: string;
  estimated_duration_minutes?: number;
  exercise_count?: number; // Made optional to match WorkoutRoutine type
  type?: string;
}

interface WorkoutListItemProps {
  routine: Routine;
  onStartWorkout: (routineId: number) => void;
  onRoutineDeleted?: () => void;
}

const WorkoutListItem: React.FC<WorkoutListItemProps> = ({ 
  routine, 
  onStartWorkout, 
  onRoutineDeleted 
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleViewRoutine = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/workout/routine/${routine.id}`);
  };

  const handleDeleteRoutine = async () => {
    try {
      setIsDeleting(true);
      await deleteRoutine(routine.id);
      
      toast({
        title: "Rutina eliminada",
        description: "La rutina ha sido eliminada exitosamente",
      });
      
      onRoutineDeleted?.();
    } catch (error: any) {
      console.error('Error deleting routine:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la rutina",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <>
      <div 
        className="bg-white rounded-xl p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onStartWorkout(routine.id)}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{routine.name}</h3>
            {routine.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {routine.description}
              </p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={stopPropagation}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={stopPropagation}>
              <DropdownMenuItem onClick={handleViewRoutine}>
                <Eye className="h-4 w-4 mr-2" />
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Dumbbell className="h-4 w-4" />
              <span>{routine.exercise_count} ejercicios</span>
            </div>
            
            {routine.estimated_duration_minutes && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{routine.estimated_duration_minutes} min</span>
              </div>
            )}

            {routine.type && (
              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                {translateRoutineType(routine.type)}
              </span>
            )}
          </div>

          <Button size="sm" className="gap-2" onClick={stopPropagation}>
            <Play className="h-4 w-4" />
            Iniciar
          </Button>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar rutina?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La rutina "{routine.name}" será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteRoutine}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default WorkoutListItem;
