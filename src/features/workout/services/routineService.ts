
import { supabase } from "@/integrations/supabase/client";
import { RoutineExercise } from "../types";

export async function saveRoutine(
  routineName: string,
  routineType: string,
  routineExercises: RoutineExercise[]
) {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Error getting user:", userError);
      throw new Error("No se pudo obtener información del usuario");
    }
    
    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    console.log("Saving routine for user:", user.id);

    // Create the routine
    const { data: routineData, error: routineError } = await supabase
      .from('routines')
      .insert({
        name: routineName,
        user_id: user.id,
        type: routineType,
        estimated_duration_minutes: calculateEstimatedDuration(routineExercises),
      })
      .select()
      .single();

    if (routineError) {
      console.error("Error creating routine:", routineError);
      throw new Error(routineError.message || "Error al crear la rutina");
    }

    if (!routineData) {
      throw new Error("No se recibieron datos de la rutina creada");
    }

    console.log("Routine created successfully:", routineData);

    // Insert routine exercises if any
    if (routineExercises.length > 0) {
      console.log("Preparing to insert routine exercises");
      
      // Simplified structure for routine_exercises
      const routineExercisesData = routineExercises.map((exercise, index) => ({
        routine_id: routineData.id,
        exercise_id: parseInt(exercise.id),
        exercise_order: index + 1,
        sets: exercise.sets.length,
        reps_min: exercise.sets[0]?.reps_min || 0,
        reps_max: exercise.sets[0]?.reps_max || 0,
        rest_between_sets_seconds: exercise.sets[0]?.rest_seconds || 60
      }));

      console.log("Exercise data prepared:", routineExercisesData.length);
      console.log("Sample exercise data:", JSON.stringify(routineExercisesData[0]));

      // Insert exercise data
      const { error: exercisesError } = await supabase
        .from('routine_exercises')
        .insert(routineExercisesData);

      if (exercisesError) {
        console.error("Error inserting exercise data:", exercisesError);
        
        // Try to clean up the incomplete routine
        await supabase
          .from('routines')
          .delete()
          .eq('id', routineData.id);
          
        throw new Error("Error al guardar los ejercicios de la rutina: " + exercisesError.message);
      }
      
      console.log("Routine exercises saved successfully");
    }

    return routineData;
  } catch (error: any) {
    console.error("Error in saveRoutine:", error);
    throw error instanceof Error ? error : new Error("Error desconocido al guardar la rutina");
  }
}

// Function to calculate estimated duration
function calculateEstimatedDuration(exercises: RoutineExercise[]): number {
  // Base time: 5 minutes per exercise
  const baseTime = exercises.length * 5;
  
  // Add additional time for rest
  const totalRestSeconds = exercises.reduce((total, ex) => {
    return total + ex.sets.reduce((setTotal, set) => setTotal + (set.rest_seconds || 60), 0);
  }, 0);
  
  // Convert rest seconds to minutes and add to base time
  const restMinutes = Math.ceil(totalRestSeconds / 60);
  
  return baseTime + restMinutes;
}
