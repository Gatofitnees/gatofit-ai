
import { supabase } from "@/integrations/supabase/client";
import { RoutineExercise } from "../types";
import { toast } from "@/hooks/use-toast";

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

    // Check if the user has a profile - this is critical to avoid RLS errors
    const { data: profileData, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();
      
    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      console.error("Error checking user profile:", profileCheckError);
    }
      
    // If the user doesn't have a profile, create a basic one
    if (!profileData) {
      console.log("Creating user profile");
      
      // Use the RPC function to create a profile
      const { data: insertResult, error: insertError } = await supabase
        .rpc('create_user_profile', { user_id: user.id });
        
      if (insertError) {
        console.error("Error creating profile via RPC:", insertError);
        
        // Fallback to direct insert if RPC fails
        console.log("Falling back to direct insert for profile");
        const { error: directInsertError } = await supabase
          .from('profiles')
          .insert({ id: user.id })
          .select();
          
        if (directInsertError) {
          console.error("Error creating user profile:", directInsertError);
          throw new Error("No se pudo crear el perfil de usuario: " + directInsertError.message);
        }
      } else {
        console.log("Profile created via RPC:", insertResult);
      }
    }

    // Insert routine with better error handling
    console.log("Creating routine:", { routineName, routineType, exercises: routineExercises.length });
    
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

    // Insert routine exercises
    if (routineExercises.length > 0) {
      console.log("Preparing to insert routine exercises");
      const routineExercisesData = [];
      
      // Prepare data for inserting into the routine_exercises table
      for (let exerciseIndex = 0; exerciseIndex < routineExercises.length; exerciseIndex++) {
        const exercise = routineExercises[exerciseIndex];
        
        for (let setIndex = 0; setIndex < exercise.sets.length; setIndex++) {
          const set = exercise.sets[setIndex];
          routineExercisesData.push({
            routine_id: routineData.id,
            exercise_id: parseInt(exercise.id),
            exercise_order: exerciseIndex + 1,
            set_number: setIndex + 1,
            reps_min: set.reps_min || 0,
            reps_max: set.reps_max || 0,
            rest_between_sets_seconds: set.rest_seconds || 60
          });
        }
      }

      console.log("Exercise data prepared:", routineExercisesData.length, "sets");

      // Insert all exercise data with better error handling
      const { error: exercisesError } = await supabase
        .from('routine_exercises')
        .insert(routineExercisesData);

      if (exercisesError) {
        console.error("Error inserting exercise data:", exercisesError);
        
        // Try to clean up the incomplete routine
        console.log("Cleaning up incomplete routine:", routineData.id);
        await supabase
          .from('routines')
          .delete()
          .eq('id', routineData.id);
          
        throw new Error("Error al guardar los ejercicios de la rutina: " + exercisesError.message);
      }
      
      console.log("Routine exercises saved successfully");
    } else {
      console.log("No exercises to save");
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
  
  // Add additional time for each set (including rest time)
  const setCount = exercises.reduce((total, ex) => total + ex.sets.length, 0);
  
  // Calculate rest time more accurately based on actual rest seconds
  const totalRestSeconds = exercises.reduce((total, ex) => {
    return total + ex.sets.reduce((setTotal, set) => setTotal + (set.rest_seconds || 60), 0);
  }, 0);
  
  // Convert rest seconds to minutes and add to base time
  const restMinutes = Math.ceil(totalRestSeconds / 60);
  
  return baseTime + restMinutes;
}
