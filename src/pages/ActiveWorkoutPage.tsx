
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoutineDetail } from "@/features/workout/hooks/useRoutineDetail";
import { WorkoutSet, WorkoutExercise, PreviousData } from "@/features/workout/types/workout";
import { 
  WorkoutHeader,
  ExerciseList,
  ExerciseStatistics
} from "@/features/workout/components/active-workout";

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

  const handleAddExercise = () => {
    navigate(`/workout/select-exercises?returnTo=/workout/active/${routineId}`);
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

  // Find the exercise that matches the current statistics dialog
  const currentStatsExercise = exercises.find(ex => ex.id === showStatsDialog);

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* Header */}
      <WorkoutHeader 
        routineName={routine.name}
        isReorderMode={isReorderMode}
        isSaving={isSaving}
        onBack={handleBack}
        onToggleReorder={() => setIsReorderMode(!isReorderMode)}
        onSave={handleSaveWorkout}
      />
      
      {/* Workout Info */}
      <div className="mb-6 p-3 bg-secondary/20 rounded-lg text-sm">
        <div className="flex items-center justify-between">
          <span>Tipo: {routine.description || "General"}</span>
          <span>Tiempo estimado: {routine.estimated_duration_minutes || 30} min</span>
        </div>
      </div>
      
      {/* Exercise List */}
      <ExerciseList 
        exercises={exercises}
        isReorderMode={isReorderMode}
        routineId={routineId}
        onReorderDrag={handleReorderDrag}
        onInputChange={handleInputChange}
        onAddSet={handleAddSet}
        onNotesChange={handleExerciseNotesChange}
        onViewDetails={handleViewExerciseDetails}
        onShowStats={(exerciseId) => setShowStatsDialog(exerciseId)}
        onAddExercise={handleAddExercise}
      />
      
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
      {currentStatsExercise && (
        <ExerciseStatistics 
          exerciseName={currentStatsExercise.name}
          showStatsDialog={showStatsDialog !== null}
          onCloseDialog={() => setShowStatsDialog(null)}
          previousData={previousData[showStatsDialog || 0] || []}
        />
      )}
    </div>
  );
};

export default ActiveWorkoutPage;
