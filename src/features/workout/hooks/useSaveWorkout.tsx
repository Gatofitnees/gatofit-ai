
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WorkoutExercise } from "../types/workout";
import { useLocalTimezone } from "@/hooks/useLocalTimezone";

export function useSaveWorkout(
  routine: any | null, 
  workoutStartTime: Date, 
  exercises: WorkoutExercise[],
  clearTemporaryExercises?: () => void,
  routineId?: number
) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const { createLocalDateAsUTC } = useLocalTimezone();

  const estimateCaloriesBurned = (durationMinutes: number): number => {
    const baseCaloriesPerMinute = 8;
    return Math.round(durationMinutes * baseCaloriesPerMinute);
  };

  // Helper function to validate a set before saving - improved validation
  const isValidSet = (set: any) => {
    const hasValidSetNumber = set.set_number !== null && 
                             set.set_number !== undefined && 
                             set.set_number > 0 && 
                             Number.isInteger(set.set_number);
    
    // Allow sets with either weight OR reps (or both)
    const hasData = (set.weight !== null && set.weight !== undefined && set.weight > 0) || 
                   (set.reps !== null && set.reps !== undefined && set.reps > 0);
    
    if (!hasValidSetNumber) {
      console.warn("Invalid set_number:", set.set_number);
      return false;
    }
    
    if (!hasData) {
      console.warn("Set has no weight or reps data:", set);
      return false;
    }
    
    return true;
  };

  // Helper function to clear stored data after successful save
  const clearStoredData = () => {
    if (routineId) {
      const baseStorageKey = `base_exercise_data_${routineId}`;
      const tempStorageKey = `temp_exercises_${routineId}`;
      
      sessionStorage.removeItem(baseStorageKey);
      sessionStorage.removeItem(tempStorageKey);
      console.log("Cleared all stored exercise data after successful save");
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
      
      console.log("Saving workout with exercises:", exercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        setsCount: ex.sets.length,
        setsWithData: ex.sets.filter(s => (s.weight !== null && s.weight > 0) || (s.reps !== null && s.reps > 0)).length,
        validSets: ex.sets.filter(isValidSet).length
      })));
      
      // Usar la hora local del usuario para el registro
      const localWorkoutDate = createLocalDateAsUTC(new Date());
      console.log("Saving workout with local date:", localWorkoutDate);
      
      // Save workout log
      const { data: workoutLog, error: workoutError } = await supabase
        .from('workout_logs')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          routine_id: routine.id,
          routine_name_snapshot: routine.name,
          duration_completed_minutes: workoutDuration,
          calories_burned_estimated: estimateCaloriesBurned(workoutDuration),
          notes: "",
          workout_date: localWorkoutDate // Usar fecha local en lugar de now()
        })
        .select()
        .single();
      
      if (workoutError || !workoutLog) {
        throw workoutError || new Error("No se pudo guardar el entrenamiento");
      }
      
      // Prepare exercise details with improved validation
      const exerciseDetailsToSave = exercises.flatMap((exercise) => {
        const validSets = exercise.sets.filter(isValidSet);
        
        if (validSets.length === 0) {
          console.warn(`Exercise ${exercise.name} has no valid sets, skipping`);
          return [];
        }
        
        return validSets.map(set => {
          const detail = {
            workout_log_id: workoutLog.id,
            exercise_id: exercise.id,
            exercise_name_snapshot: exercise.name,
            set_number: set.set_number,
            weight_kg_used: set.weight || null,
            reps_completed: set.reps || null,
            notes: exercise.notes || ""
          };
          
          console.log(`Preparing to save: Exercise ${exercise.id}, Set ${set.set_number}`, detail);
          return detail;
        });
      });
      
      console.log("Exercise details to save (total valid sets):", exerciseDetailsToSave.length);
      console.log("Details preview:", exerciseDetailsToSave.slice(0, 3));
      
      if (exerciseDetailsToSave.length > 0) {
        const { error: detailsError } = await supabase
          .from('workout_log_exercise_details')
          .insert(exerciseDetailsToSave);
        
        if (detailsError) {
          console.error("Error saving exercise details:", detailsError);
          throw detailsError;
        }
        
        console.log("Successfully saved all exercise details");
      } else {
        console.warn("No valid exercise details to save");
      }
      
      toast({
        title: "Entrenamiento guardado",
        description: "Tu entrenamiento ha sido registrado correctamente."
      });
      
      // Navigate to home page first
      navigate("/home", { replace: true });
      
      // Clear all stored data after successful save and navigation
      setTimeout(() => {
        clearStoredData();
        if (clearTemporaryExercises) {
          clearTemporaryExercises();
          console.log("All exercise data cleared after successful save and navigation");
        }
      }, 100);
      
    } catch (error: any) {
      console.error("Error al guardar entrenamiento:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el entrenamiento. Inténtalo de nuevo.",
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
