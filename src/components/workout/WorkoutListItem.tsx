import React, { useState, useEffect } from "react";
import { Edit, MoreVertical, PlayCircle, Trash, Share2, EyeOff } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/Card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSharedRoutines } from "@/hooks/useSharedRoutines";
import { toast } from "sonner";

interface WorkoutListItemProps {
  routine: {
    id: number;
    name: string;
    type?: string;
    description?: string;
    exercise_count?: number;
    estimated_duration_minutes?: number;
    is_predefined?: boolean;
  };
  onStartWorkout: (routineId: number) => void;
  onRoutineDeleted: () => void;
}

const WorkoutListItem: React.FC<WorkoutListItemProps> = ({
  routine,
  onStartWorkout,
  onRoutineDeleted
}) => {
  const { toast: uiToast } = useToast();
  const { publishRoutine, unpublishRoutine, checkIfPublished, isPublishing } = useSharedRoutines();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  
  // Check if routine is published on mount
  useEffect(() => {
    const checkStatus = async () => {
      const published = await checkIfPublished(routine.id);
      setIsPublished(published);
    };
    checkStatus();
  }, [routine.id, checkIfPublished]);
  
  // Determina los textos a mostrar según el tipo de rutina
  const typeLabel = routine.type 
    ? routine.type.charAt(0).toUpperCase() + routine.type.slice(1) 
    : "General";
  
  const exerciseLabel = routine.exercise_count === 1 
    ? "1 ejercicio"
    : `${routine.exercise_count} ejercicios`;
  
  const timeLabel = routine.estimated_duration_minutes
    ? `${routine.estimated_duration_minutes} min`
    : "15-30 min";
    
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      toast.loading("Eliminando rutina...");
      
      // With cascade deletion configured, we only need to delete the routine
      // The database will automatically delete related workout_logs, routine_exercises, and exercise_details
      const { error: routineError } = await supabase
        .from('routines')
        .delete()
        .eq('id', routine.id);
        
      if (routineError) {
        console.error("Error deleting routine:", routineError);
        throw routineError;
      }
      
      toast.dismiss();
      uiToast({
        title: "Rutina eliminada",
        description: "La rutina y todos sus datos asociados han sido eliminados correctamente",
        variant: "success"
      });
      
      onRoutineDeleted();
    } catch (error: any) {
      console.error("Error deleting routine:", error);
      toast.dismiss();
      uiToast({
        title: "Error",
        description: "No se pudo eliminar la rutina. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleEditRoutine = () => {
    window.location.href = `/workout/edit/${routine.id}`;
  };

  const handlePublishToggle = async () => {
    if (isPublished) {
      await unpublishRoutine(routine.id);
      setIsPublished(false);
    } else {
      await publishRoutine(routine.id);
      setIsPublished(true);
    }
  };

  // Use a wrapper div with the onClick handler instead of putting it directly on the Card
  return (
    <div onClick={() => onStartWorkout(routine.id)} className="cursor-pointer">
      <Card className="hover:shadow-lg transition-shadow border-none">
        <div className="p-4">
          {/* Título y Menú */}
          <div className="flex justify-between mb-1">
            <h3 className="font-bold text-lg truncate">
              {routine.name}
            </h3>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <button className="p-1 rounded-full hover:bg-secondary/30">
                  <MoreVertical className="h-5 w-5 text-gray-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-sm border border-secondary">
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditRoutine();
                  }}
                  disabled={routine.is_predefined || isDeleting}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePublishToggle();
                  }}
                  disabled={routine.is_predefined || isPublishing}
                  className="cursor-pointer"
                >
                  {isPublished ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Despublicar
                    </>
                  ) : (
                    <>
                      <Share2 className="mr-2 h-4 w-4" />
                      Publicar rutina
                    </>
                  )}
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  disabled={routine.is_predefined || isDeleting}
                  className="text-destructive cursor-pointer focus:text-destructive"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Detalles */}
          <div className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
            <span>{typeLabel} • {exerciseLabel}</span>
            {isPublished && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                Publicada
              </span>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              Duración: {timeLabel}
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onStartWorkout(routine.id);
              }}
              className="flex items-center justify-center gap-1 text-sm font-medium text-primary"
            >
              <PlayCircle className="h-4 w-4" />
              <span>Empezar</span>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WorkoutListItem;
