
import React from "react";
import { useNavigate } from "react-router-dom";
import { Clock, ChevronRight, Dumbbell, Edit, Trash2 } from "lucide-react";
import Button from "@/components/Button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface WorkoutRoutine {
  id: number;
  name: string;
  type?: string;
  description?: string;
  estimated_duration_minutes?: number;
  exercise_count?: number;
  created_at: string;
  is_predefined?: boolean;
}

interface WorkoutListItemProps {
  routine: WorkoutRoutine;
  onStartWorkout: (id: number) => void;
  onRoutineDeleted?: () => void;
}

const WorkoutListItem: React.FC<WorkoutListItemProps> = ({
  routine,
  onStartWorkout,
  onRoutineDeleted
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id, name, type, estimated_duration_minutes: estimatedDurationMinutes, exercise_count: exerciseCount, is_predefined } = routine;
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  
  const handleItemClick = () => {
    navigate(`/workout/routine/${id}`);
  };
  
  const handleStartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartWorkout(id);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/workout/edit/${id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleDeleteRoutine = async () => {
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('routines')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Rutina eliminada",
        description: `La rutina "${name}" ha sido eliminada correctamente.`
      });
      
      if (onRoutineDeleted) {
        onRoutineDeleted();
      }
    } catch (error: any) {
      console.error('Error al eliminar rutina:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la rutina. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div 
        className="bg-secondary/40 border border-white/5 rounded-xl shadow-neu-button p-4 mb-4 hover:shadow-neu-button-hover transition-all cursor-pointer backdrop-blur-sm"
        onClick={handleItemClick}
      >
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-1">
              <h3 className="font-medium text-base mb-1">{name}</h3>
              {is_predefined && (
                <Badge className="ml-1 text-xs bg-primary/30 text-primary-foreground px-2 py-0.5 rounded-full">
                  Predefinida
                </Badge>
              )}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>{estimatedDurationMinutes || 30} min</span>
              {exerciseCount !== undefined && (
                <span className="ml-2">• {exerciseCount} ejercicios</span>
              )}
              {type && (
                <span className="ml-2">• {type}</span>
              )}
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <div className="mt-3 flex gap-2">
          <Button 
            variant="primary" 
            size="sm"
            onClick={handleStartClick}
            type="button"
            className="flex-1"
          >
            <Dumbbell className="w-4 h-4 mr-1" />
            Iniciar
          </Button>
          
          {!is_predefined && (
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleEditClick}
                type="button"
              >
                <Edit className="w-4 h-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDeleteClick}
                type="button"
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card border border-white/5">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar rutina?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar la rutina "{name}"? Esta acción no se puede deshacer.
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
