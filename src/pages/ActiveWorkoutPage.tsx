import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, ChevronRight, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRoutineDetail } from "@/features/workout/hooks/useRoutineDetail";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
            workout_log_id,
            workout_log:workout_logs(workout_date)
          `)
          .in('exercise_id', exerciseIds)
          .order('workout_log_id', { ascending: false });
          
        if (error) throw error;
        
        if (workoutLogDetails && workoutLogDetails.length > 0) {
          // Group by exercise_id
          const exerciseHistory: Record<number, PreviousData[]> = {};
          
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
            }
          });
          
          setPreviousData(exerciseHistory);
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
          equipment_required: ex.equipment_required
        };
      });

      setExercises(formattedExercises);
    }
  }, [exerciseDetails, previousData]);

  const handleInputChange = (
    exerciseIndex: number, 
    setIndex: number, 
    field: 'weight' | 'reps' | 'notes', 
    value: string
  ) => {
    const updatedExercises = [...exercises];
    
    if (field === 'notes') {
      updatedExercises[exerciseIndex].sets[setIndex].notes = value;
    } else {
      const numValue = value === '' ? null : Number(value);
      updatedExercises[exerciseIndex].sets[setIndex][field] = numValue;
    }
    
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
      const exerciseDetailsToSave = exercises.flatMap(exercise => 
        exercise.sets
          .filter(set => set.weight !== null || set.reps !== null) // Only save sets with data
          .map(set => ({
            workout_log_id: workoutLog.id,
            exercise_id: exercise.id,
            exercise_name_snapshot: exercise.name,
            set_number: set.set_number,
            weight_kg_used: set.weight,
            reps_completed: set.reps,
            notes: set.notes
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
      
      {/* Workout Info */}
      <div className="mb-6 p-3 bg-secondary/20 rounded-lg text-sm">
        <div className="flex items-center justify-between">
          <span>Tipo: {routine.description || "General"}</span>
          <span>Tiempo estimado: {routine.estimated_duration_minutes || 30} min</span>
        </div>
      </div>
      
      {/* Exercises */}
      <div className="space-y-6">
        {exercises.map((exercise, exerciseIndex) => (
          <Card key={`${exercise.id}-${exerciseIndex}`} className="bg-secondary/40 border border-white/5 overflow-hidden p-0">
            <div className="p-4">
              {/* Exercise Header */}
              <div className="flex items-center justify-between mb-3">
                <div 
                  className="flex-1 cursor-pointer" 
                  onClick={() => setShowExerciseDetails(exercise.id)}
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
                {exercise.sets.map((set, setIndex) => (
                  <div key={`set-${setIndex}`} className="p-3 bg-background/50 rounded-lg border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="h-6 w-6 rounded-full bg-primary/30 flex items-center justify-center text-sm mr-2">
                          {set.set_number}
                        </div>
                        <span className="text-sm font-medium">Serie {set.set_number}</span>
                      </div>
                      
                      {(set.previous_weight !== null || set.previous_reps !== null) && (
                        <div className="text-xs text-muted-foreground">
                          <span className="font-semibold">Ant: </span>
                          {set.previous_weight !== null ? `${set.previous_weight}kg` : '-'} x {set.previous_reps !== null ? set.previous_reps : '-'}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Peso (kg)</label>
                        <input
                          type="number"
                          className="w-full bg-background border border-white/10 rounded p-2 text-sm"
                          value={set.weight !== null ? set.weight : ''}
                          onChange={(e) => handleInputChange(exerciseIndex, setIndex, 'weight', e.target.value)}
                          min="0"
                          step="0.5"
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Repeticiones</label>
                        <input
                          type="number"
                          className="w-full bg-background border border-white/10 rounded p-2 text-sm"
                          value={set.reps !== null ? set.reps : ''}
                          onChange={(e) => handleInputChange(exerciseIndex, setIndex, 'reps', e.target.value)}
                          min="0"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Notas (opcional)</label>
                      <input
                        type="text"
                        className="w-full bg-background border border-white/10 rounded p-2 text-sm"
                        value={set.notes}
                        onChange={(e) => handleInputChange(exerciseIndex, setIndex, 'notes', e.target.value)}
                        placeholder="Ej: Fallé en la última rep"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
      
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
      
      {/* Exercise Details Dialog */}
      <Dialog open={showExerciseDetails !== null} onOpenChange={() => setShowExerciseDetails(null)}>
        <DialogContent className="bg-background border border-white/5 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {exercises.find(ex => ex.id === showExerciseDetails)?.name || "Detalles del ejercicio"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="aspect-video bg-secondary/30 rounded-lg mb-4 flex items-center justify-center">
              <p className="text-muted-foreground text-sm">Video del ejercicio</p>
            </div>
            
            <h4 className="font-medium mb-2">Músculos trabajados</h4>
            <p className="text-sm text-muted-foreground mb-4">
              {exercises.find(ex => ex.id === showExerciseDetails)?.muscle_group_main || "No especificado"}
            </p>
            
            <h4 className="font-medium mb-2">Equipamiento</h4>
            <p className="text-sm text-muted-foreground mb-4">
              {exercises.find(ex => ex.id === showExerciseDetails)?.equipment_required || "No requiere equipamiento específico"}
            </p>
          </div>
        </DialogContent>
      </Dialog>
      
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
                  {previousData[showStatsDialog || 0]?.reduce((max, current) => 
                    current?.weight !== null && (max === null || (current.weight > (max as number))) 
                      ? current.weight 
                      : max, 
                    null as number | null) || '-'}
                </span> kg
              </p>
              <p className="text-sm">
                <span className="font-medium">Repeticiones máximas:</span> 
                <span className="ml-2 text-primary">
                  {previousData[showStatsDialog || 0]?.reduce((max, current) => 
                    current?.reps !== null && (max === null || (current.reps > (max as number))) 
                      ? current.reps 
                      : max,
                    null as number | null) || '-'}
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
