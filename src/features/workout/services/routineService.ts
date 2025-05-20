
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
      type: routineType, // Add routine type field
      estimated_duration_minutes: routineExercises.length * 5, // Rough estimate
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
