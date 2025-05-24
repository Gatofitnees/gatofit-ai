
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WorkoutExercise } from "../types/workout";

export function useSaveWorkout(
  routine: any | null, 
  workoutStartTime: Date, 
  exercises: WorkoutExercise[],
  clearTemporaryExercises?: () => void
) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const estimateCaloriesBurned = (durationMinutes: number): number => {
    // Basic estimation: 5-10 calories per minute depending on intensity
    // Could be improved with more data about the workout
    const baseCaloriesPerMinute = 8;
    return Math.round(durationMinutes * baseCaloriesPerMinute);
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
      
      // Save exercise details - including manually added sets
      const exerciseDetailsToSave = exercises.flatMap((exercise) => 
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
      
      // Navigate to home page first
      navigate("/home", { replace: true });
      
      // Clear temporary exercises only after successful navigation
      // Add a small delay to ensure navigation is complete
      setTimeout(() => {
        if (clearTemporaryExercises) {
          clearTemporaryExercises();
          console.log("Temporary exercises cleared after successful save and navigation");
        }
      }, 100);
      
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

  return {
    isSaving,
    handleSaveWorkout
  };
}
