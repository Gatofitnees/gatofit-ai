
import { supabase } from "@/integrations/supabase/client";
import { RoutineExercise } from "../types";
import { toast } from "sonner";

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
    console.log("Routine data:", { routineName, routineType, exercisesCount: routineExercises.length });

    // Check if exercises exist in the database before creating routine
    if (routineExercises.length > 0) {
      const exerciseIds = routineExercises.map(e => e.id);
      
      // Check if all exercises exist
      const { data: existingExercises, error: checkError } = await supabase
        .from('exercises')
        .select('id')
        .in('id', exerciseIds);
      
      if (checkError) {
        console.error("Error checking exercises:", checkError);
        throw new Error("Error al verificar los ejercicios: " + checkError.message);
      }
      
      // Create a set of existing exercise IDs
      const existingIds = new Set(existingExercises?.map(e => e.id) || []);
      
      // Find missing exercise IDs
      const missingIds = exerciseIds.filter(id => !existingIds.has(id));
      
      if (missingIds.length > 0) {
        console.error("Some exercises don't exist in the database:", missingIds);
        throw new Error(`Algunos ejercicios no existen en la base de datos (IDs: ${missingIds.join(', ')}). Por favor, intente sincronizar los ejercicios nuevamente.`);
      }
    }

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
      // Map exercises to the format expected by the database
      const routineExercisesData = routineExercises.map((exercise, index) => ({
        routine_id: routineData.id,
        exercise_id: exercise.id,
        exercise_order: index + 1,
        sets: exercise.sets.length,
        reps_min: exercise.sets[0]?.reps_min || 0,
        reps_max: exercise.sets[0]?.reps_max || 0,
        rest_between_sets_seconds: exercise.sets[0]?.rest_seconds || 60
      }));

      console.log("Saving routine exercises:", routineExercisesData.length);
      console.log("Exercise IDs:", routineExercisesData.map(e => e.exercise_id));

      // Insert exercise data
      const { error: exercisesError } = await supabase
        .from('routine_exercises')
        .insert(routineExercisesData);

      if (exercisesError) {
        console.error("Error inserting exercise data:", exercisesError);
        console.error("Error details:", exercisesError.details, exercisesError.message);
        
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
