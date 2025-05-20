
import { supabase } from "@/integrations/supabase/client";
import { RoutineExercise } from "../types";

export async function saveRoutine(
  routineName: string,
  routineType: string,
  routineExercises: RoutineExercise[]
) {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  // Insert routine
  const { data: routineData, error: routineError } = await supabase
    .from('routines')
    .insert({
      name: routineName,
      user_id: user.id,
      type: routineType,
      estimated_duration_minutes: calculateRoutineDuration(routineExercises),
    })
    .select()
    .single();

  if (routineError) {
    console.error("Error creating routine:", routineError);
    throw new Error(routineError.message);
  }

  // Insert routine exercises
  const routineExercisesData = routineExercises.flatMap((exercise, exerciseIndex) => 
    exercise.sets.map((set, setIndex) => ({
      routine_id: routineData.id,
      exercise_id: parseInt(exercise.id),
      exercise_order: exerciseIndex + 1,
      set_number: setIndex + 1,
      reps_min: set.reps_min,
      reps_max: set.reps_max,
      rest_between_sets_seconds: set.rest_seconds
    }))
  );

  const { error: exercisesError } = await supabase
    .from('routine_exercises')
    .insert(routineExercisesData);

  if (exercisesError) {
    console.error("Error inserting exercise data:", exercisesError);
    throw new Error(exercisesError.message);
  }

  return routineData;
}

// Helper function to calculate approximate routine duration
function calculateRoutineDuration(exercises: RoutineExercise[]): number {
  // Base time in minutes
  let totalMinutes = 5; // Warm-up time
  
  exercises.forEach(exercise => {
    // Count sets
    const setCount = exercise.sets.length;
    
    // Average time per set (1-2 minutes) plus rest time
    exercise.sets.forEach(set => {
      // Exercise time (average 1 minute per set)
      totalMinutes += 1;
      
      // Rest time between sets (convert from seconds to minutes)
      totalMinutes += set.rest_seconds / 60;
    });
  });
  
  // Round to nearest 5 minutes
  return Math.ceil(totalMinutes / 5) * 5;
}
