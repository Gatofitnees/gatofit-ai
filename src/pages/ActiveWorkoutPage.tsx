
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, ChevronRight, BarChart2, Plus, GripVertical, Pencil, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRoutineDetail } from "@/features/workout/hooks/useRoutineDetail";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface WorkoutSet {
  set_number: number;
  weight: number | null;
  reps: number | null;
  notes: string;
  previous_weight: number | null;
  previous_reps: number | null;
}

interface WorkoutExercise {
  id: number;
  name: string;
  sets: WorkoutSet[];
  muscle_group_main?: string;
  equipment_required?: string;
  notes: string;
}

interface PreviousData {
  weight: number | null;
  reps: number | null;
}

const ActiveWorkoutPage: React.FC = () => {
  const { routineId } = useParams<{ routineId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { routine, exerciseDetails, loading } = useRoutineDetail(routineId ? parseInt(routineId) : undefined);
  
  const [workoutStartTime, setWorkoutStartTime] = useState<Date>(new Date());
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showExerciseDetails, setShowExerciseDetails] = useState<number | null>(null);
  const [showStatsDialog, setShowStatsDialog] = useState<number | null>(null);
  const [previousData, setPreviousData] = useState<Record<number, PreviousData[]>>({});
  const [isReorderMode, setIsReorderMode] = useState<boolean>(false);
  const [exerciseNotesMap, setExerciseNotesMap] = useState<Record<number, string>>({});

  // Load exercise history for each exercise
  useEffect(() => {
    if (!exerciseDetails.length) return;
    
    const fetchPreviousData = async () => {
      try {
        const exerciseIds = exerciseDetails.map(ex => ex.id);
        
        // Fetch the latest workout log for these exercises
        const { data: workoutLogDetails, error } = await supabase
          .from('workout_log_exercise_details')
          .select(`
            exercise_id,
            set_number,
            weight_kg_used,
            reps_completed,
            notes,
            workout_log_id,
            workout_log:workout_logs(workout_date)
          `)
          .in('exercise_id', exerciseIds)
          .order('workout_log_id', { ascending: false });
          
        if (error) throw error;
        
        if (workoutLogDetails && workoutLogDetails.length > 0) {
          // Group by exercise_id
          const exerciseHistory: Record<number, PreviousData[]> = {};
          const notesMap: Record<number, string> = {};
          
          workoutLogDetails.forEach(detail => {
            if (!exerciseHistory[detail.exercise_id]) {
              exerciseHistory[detail.exercise_id] = [];
            }
            
            // Add the set data if it matches the current position
            if (detail.set_number && detail.set_number <= 20) { // Limit to 20 sets
              exerciseHistory[detail.exercise_id][detail.set_number - 1] = {
                weight: detail.weight_kg_used,
                reps: detail.reps_completed
              };

              // Store notes for the exercise
              if (detail.notes && !notesMap[detail.exercise_id]) {
                notesMap[detail.exercise_id] = detail.notes;
              }
            }
          });
          
          setPreviousData(exerciseHistory);
          setExerciseNotesMap(notesMap);
        }
      } catch (error) {
        console.error("Error fetching previous workout data:", error);
      }
    };
    
    fetchPreviousData();
  }, [exerciseDetails]);

  // Initialize workout exercises from routine details
  useEffect(() => {
    if (exerciseDetails.length > 0) {
      const formattedExercises: WorkoutExercise[] = exerciseDetails.map(ex => {
        // Create formatted sets
        const formattedSets: WorkoutSet[] = Array.from(
          { length: ex.sets || 0 },
          (_, i) => ({
            set_number: i + 1,
            weight: null,
            reps: null,
            notes: "",
            previous_weight: previousData[ex.id]?.[i]?.weight || null,
            previous_reps: previousData[ex.id]?.[i]?.reps || null
          })
        );

        return {
          id: ex.id,
          name: ex.name,
          sets: formattedSets,
          muscle_group_main: ex.muscle_group_main,
          equipment_required: ex.equipment_required,
          notes: exerciseNotesMap[ex.id] || ""
        };
      });

      setExercises(formattedExercises);
    }
  }, [exerciseDetails, previousData, exerciseNotesMap]);

  const handleInputChange = (
    exerciseIndex: number, 
    setIndex: number, 
    field: 'weight' | 'reps', 
    value: string
  ) => {
    const updatedExercises = [...exercises];
    
    const numValue = value === '' ? null : Number(value);
    updatedExercises[exerciseIndex].sets[setIndex][field] = numValue;
    
    setExercises(updatedExercises);
  };

  const handleExerciseNotesChange = (exerciseIndex: number, notes: string) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].notes = notes;
    setExercises(updatedExercises);
  };

  const handleAddSet = (exerciseIndex: number) => {
    const updatedExercises = [...exercises];
    const exercise = updatedExercises[exerciseIndex];
    const lastSet = exercise.sets[exercise.sets.length - 1];
    
    // Add new set with values copied from the last set
    exercise.sets.push({
      set_number: exercise.sets.length + 1,
      weight: lastSet?.weight || null,
      reps: lastSet?.reps || null,
      notes: "",
      previous_weight: null,
      previous_reps: null
    });
    
    setExercises(updatedExercises);
  };

  const handleBack = () => {
    const confirmLeave = window.confirm(
      "¿Estás seguro de que deseas abandonar el entrenamiento? Los datos no guardados se perderán."
    );
    
    if (confirmLeave) {
      navigate("/workout");
    }
  };

  const handleReorderDrag = (result: any) => {
    if (!result.destination) return; // Dropped outside the list
    
    const items = Array.from(exercises);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setExercises(items);
  };

  const handleSaveWorkout = async () => {
    try {
      setIsSaving(true);
      
      if (!routine) {
        throw new Error("Rutina no encontrada");
      }
      
      const workoutDuration = Math.round(
        (new Date().getTime() - workoutStartTime.getTime()) / (1000 * 60)
      );
      
      // Save workout log
      const { data: workoutLog, error: workoutError } = await supabase
        .from('workout_logs')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          routine_id: routine.id,
          routine_name_snapshot: routine.name,
          duration_completed_minutes: workoutDuration,
          calories_burned_estimated: estimateCaloriesBurned(workoutDuration),
          notes: ""
        })
        .select()
        .single();
      
      if (workoutError || !workoutLog) {
        throw workoutError || new Error("No se pudo guardar el entrenamiento");
      }
      
      // Save exercise details
      const exerciseDetailsToSave = exercises.flatMap((exercise, index) => 
        exercise.sets
          .filter(set => set.weight !== null || set.reps !== null) // Only save sets with data
          .map(set => ({
            workout_log_id: workoutLog.id,
            exercise_id: exercise.id,
            exercise_name_snapshot: exercise.name,
            set_number: set.set_number,
            weight_kg_used: set.weight,
            reps_completed: set.reps,
            notes: exercise.notes // Use the exercise-level notes
          }))
      );
      
      if (exerciseDetailsToSave.length > 0) {
        const { error: detailsError } = await supabase
          .from('workout_log_exercise_details')
          .insert(exerciseDetailsToSave);
        
        if (detailsError) {
          throw detailsError;
        }
      }
      
      toast({
        title: "Entrenamiento guardado",
        description: "Tu entrenamiento ha sido registrado correctamente."
      });
      
      // Navigate to home page
      navigate("/");
      
    } catch (error: any) {
      console.error("Error al guardar entrenamiento:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el entrenamiento. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Estimate calories burned based on duration
  const estimateCaloriesBurned = (durationMinutes: number): number => {
    // Basic estimation: 5-10 calories per minute depending on intensity
    // Could be improved with more data about the workout
    const baseCaloriesPerMinute = 8;
    return Math.round(durationMinutes * baseCaloriesPerMinute);
  };

  const handleViewExerciseDetails = (exerciseId: number) => {
    navigate(`/workout/exercise-details/${exerciseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={handleBack}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <Skeleton className="h-8 w-40" />
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    );
  }
  
  if (!routine) {
    return (
      <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={handleBack}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold">Rutina no encontrada</h1>
        </div>
        
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            La rutina que estás buscando no existe o ha sido eliminada.
          </p>
          <Button onClick={() => navigate("/workout")}>
            Volver a Mis Rutinas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={handleBack}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold">{routine.name}</h1>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant={isReorderMode ? "secondary" : "outline"}
            size="sm"
            onClick={() => setIsReorderMode(!isReorderMode)}
          >
            {isReorderMode ? "Terminar" : "Reordenar"}
          </Button>
          
          <Button 
            variant="default"
            size="sm"
            onClick={handleSaveWorkout}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-1" />
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>
      
      {/* Workout Info */}
      <div className="mb-6 p-3 bg-secondary/20 rounded-lg text-sm">
        <div className="flex items-center justify-between">
          <span>Tipo: {routine.description || "General"}</span>
          <span>Tiempo estimado: {routine.estimated_duration_minutes || 30} min</span>
        </div>
      </div>
      
      {/* Reorder Mode */}
      {isReorderMode ? (
        <DragDropContext onDragEnd={handleReorderDrag}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {exercises.map((exercise, index) => (
                  <Draggable key={exercise.id.toString()} draggableId={exercise.id.toString()} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="p-3 bg-secondary/40 rounded-lg border border-white/10 flex items-center"
                      >
                        <GripVertical className="h-5 w-5 mr-3 text-muted-foreground" />
                        <span className="font-medium">{exercise.name}</span>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        /* Exercises */
        <div className="space-y-6">
          {exercises.map((exercise, exerciseIndex) => (
            <Card key={`${exercise.id}-${exerciseIndex}`} className="bg-secondary/40 border border-white/5 overflow-hidden p-0">
              <div className="p-4">
                {/* Exercise Header */}
                <div className="flex items-center justify-between mb-3">
                  <div 
                    className="flex-1 cursor-pointer" 
                    onClick={() => handleViewExerciseDetails(exercise.id)}
                  >
                    <h3 className="font-medium text-base">{exercise.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {exercise.muscle_group_main}
                      {exercise.equipment_required && ` • ${exercise.equipment_required}`}
                    </p>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowStatsDialog(exercise.id)}
                  >
                    <BarChart2 className="h-4 w-4 mr-1" />
                    Estadísticas
                  </Button>
                </div>
                
                {/* Sets */}
                <div className="space-y-3">
                  {/* Header for the table-like layout */}
                  <div className="grid grid-cols-4 gap-2 px-2">
                    <div className="text-xs font-medium text-muted-foreground">Serie</div>
                    <div className="text-xs font-medium text-muted-foreground">Ant</div>
                    <div className="text-xs font-medium text-muted-foreground">Peso</div>
                    <div className="text-xs font-medium text-muted-foreground">Reps</div>
                  </div>
                  
                  {exercise.sets.map((set, setIndex) => (
                    <div key={`set-${setIndex}`} className="bg-background/50 rounded-lg border border-white/5 p-2">
                      <div className="grid grid-cols-4 gap-2">
                        {/* Serie column */}
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-primary/30 flex items-center justify-center text-sm">
                            {set.set_number}
                          </div>
                        </div>
                        
                        {/* Anterior column */}
                        <div className="text-xs text-muted-foreground flex items-center">
                          {set.previous_weight !== null && set.previous_reps !== null 
                            ? `${set.previous_weight}kg × ${set.previous_reps}` 
                            : '-'}
                        </div>
                        
                        {/* Peso column */}
                        <div>
                          <Input
                            type="number"
                            className="w-full h-8 text-sm"
                            value={set.weight !== null ? set.weight : ''}
                            onChange={(e) => handleInputChange(exerciseIndex, setIndex, 'weight', e.target.value)}
                            min="0"
                            step="0.5"
                            placeholder="kg"
                          />
                        </div>
                        
                        {/* Reps column */}
                        <div>
                          <Input
                            type="number"
                            className="w-full h-8 text-sm"
                            value={set.reps !== null ? set.reps : ''}
                            onChange={(e) => handleInputChange(exerciseIndex, setIndex, 'reps', e.target.value)}
                            min="0"
                            placeholder="reps"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Exercise Actions */}
                <div className="mt-3 flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                    onClick={() => handleAddSet(exerciseIndex)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Añadir serie
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      // Toggle notes input visibility or focus if already visible
                      const updatedExercises = [...exercises];
                      const current = updatedExercises[exerciseIndex];
                      setExercises(updatedExercises);
                    }}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Notas
                  </Button>
                </div>
                
                {/* Notes textarea */}
                <div className="mt-2">
                  <Textarea
                    placeholder="Notas sobre este ejercicio..."
                    className="w-full text-sm"
                    value={exercise.notes}
                    onChange={(e) => handleExerciseNotesChange(exerciseIndex, e.target.value)}
                  />
                </div>
              </div>
            </Card>
          ))}
          
          {/* Add Exercise Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate(`/workout/select-exercises?returnTo=/workout/active/${routineId}`)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Añadir ejercicio
          </Button>
        </div>
      )}
      
      {/* Save button (bottom) */}
      <div className="fixed left-0 right-0 bottom-16 px-4 py-3 bg-background/80 backdrop-blur-md z-10 border-t border-white/5">
        <Button 
          variant="default"
          className="w-full"
          onClick={handleSaveWorkout}
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Guardando entrenamiento..." : "Guardar entrenamiento"}
        </Button>
      </div>
      
      {/* Statistics Dialog */}
      <Dialog open={showStatsDialog !== null} onOpenChange={() => setShowStatsDialog(null)}>
        <DialogContent className="bg-background border border-white/5 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Estadísticas: {exercises.find(ex => ex.id === showStatsDialog)?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-secondary/20 rounded-lg p-4 mb-4">
              <h4 className="font-medium mb-2">Mejores marcas</h4>
              <p className="text-sm mb-2">
                <span className="font-medium">Peso máximo:</span> 
                <span className="ml-2 text-primary">
                  {previousData[showStatsDialog || 0]?.reduce((max, current) => {
                    if (!current || current.weight === null) return max;
                    if (max === null) return current.weight;
                    return Math.max(max, current.weight);
                  }, null as number | null) || '-'}
                </span> kg
              </p>
              <p className="text-sm">
                <span className="font-medium">Repeticiones máximas:</span> 
                <span className="ml-2 text-primary">
                  {previousData[showStatsDialog || 0]?.reduce((max, current) => {
                    if (!current || current.reps === null) return max;
                    if (max === null) return current.reps;
                    return Math.max(max, current.reps);
                  }, null as number | null) || '-'}
                </span>
              </p>
            </div>
            
            <h4 className="font-medium mb-2">Historial reciente</h4>
            <p className="text-sm text-muted-foreground">
              No hay suficientes datos para mostrar el historial.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActiveWorkoutPage;
