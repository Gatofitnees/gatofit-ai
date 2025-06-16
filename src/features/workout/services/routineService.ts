
import { supabase } from "@/integrations/supabase/client";
import { RoutineExercise } from "../types";
import { convertRoutineTypeToDb } from "../utils/routineTypeMapping";

export const saveRoutine = async (name: string, type: string, exercises: RoutineExercise[]) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');

  // Convertir tipo de UI a formato de base de datos
  const dbType = convertRoutineTypeToDb(type);

  // Crear la rutina
  const { data: routine, error: routineError } = await supabase
    .from('routines')
    .insert({
      name,
      type: dbType,
      user_id: user.id,
      is_predefined: false,
      estimated_duration_minutes: Math.max(15, exercises.length * 3) // Estimación básica
    })
    .select()
    .single();

  if (routineError || !routine) {
    console.error("Error creating routine:", routineError);
    throw routineError || new Error("No se pudo crear la rutina");
  }

  // Crear los ejercicios de la rutina
  const routineExercises = exercises.map((exercise, index) => ({
    routine_id: routine.id,
    exercise_id: exercise.id,
    exercise_order: index + 1,
    sets: exercise.sets?.length || 1,
    reps_min: exercise.sets?.[0]?.reps_min || 8,
    reps_max: exercise.sets?.[0]?.reps_max || 12,
    rest_between_sets_seconds: exercise.sets?.[0]?.rest_seconds || 60,
    notes: exercise.notes || null
  }));

  const { error: exercisesError } = await supabase
    .from('routine_exercises')
    .insert(routineExercises);

  if (exercisesError) {
    // Si hay error, eliminar la rutina creada
    await supabase.from('routines').delete().eq('id', routine.id);
    console.error("Error creating routine exercises:", exercisesError);
    throw exercisesError;
  }

  return routine;
};

export const updateRoutine = async (routineId: number, name: string, type: string, exercises: RoutineExercise[]) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');

  // Convertir tipo de UI a formato de base de datos
  const dbType = convertRoutineTypeToDb(type);

  // Actualizar la rutina
  const { data: routine, error: routineError } = await supabase
    .from('routines')
    .update({
      name,
      type: dbType,
      estimated_duration_minutes: Math.max(15, exercises.length * 3)
    })
    .eq('id', routineId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (routineError || !routine) {
    console.error("Error updating routine:", routineError);
    throw routineError || new Error("No se pudo actualizar la rutina");
  }

  // Eliminar ejercicios existentes
  const { error: deleteError } = await supabase
    .from('routine_exercises')
    .delete()
    .eq('routine_id', routineId);

  if (deleteError) {
    console.error("Error deleting existing routine exercises:", deleteError);
    throw deleteError;
  }

  // Crear los nuevos ejercicios
  const routineExercises = exercises.map((exercise, index) => ({
    routine_id: routine.id,
    exercise_id: exercise.id,
    exercise_order: index + 1,
    sets: exercise.sets?.length || 1,
    reps_min: exercise.sets?.[0]?.reps_min || 8,
    reps_max: exercise.sets?.[0]?.reps_max || 12,
    rest_between_sets_seconds: exercise.sets?.[0]?.rest_seconds || 60,
    notes: exercise.notes || null
  }));

  const { error: exercisesError } = await supabase
    .from('routine_exercises')
    .insert(routineExercises);

  if (exercisesError) {
    console.error("Error creating routine exercises:", exercisesError);
    throw exercisesError;
  }

  return routine;
};
