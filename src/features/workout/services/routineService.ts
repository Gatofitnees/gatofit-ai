
import { supabase } from "@/integrations/supabase/client";
import { RoutineExercise } from "../types";

export async function saveRoutine(
  routineName: string,
  routineType: string,
  routineExercises: RoutineExercise[]
) {
  // Obtener usuario actual
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("Usuario no autenticado");
  }

  console.log("Guardando rutina para usuario:", user.id);

  // Insertar rutina
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
    console.error("Error creando rutina:", routineError);
    throw new Error(routineError.message);
  }

  console.log("Rutina creada:", routineData);

  // Insertar ejercicios de la rutina
  const routineExercisesData = routineExercises.flatMap((exercise, exerciseIndex) => 
    exercise.sets.map((set, setIndex) => ({
      routine_id: routineData.id,
      exercise_id: parseInt(exercise.id), // Convertir ID de string a número
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
    console.error("Error insertando datos de ejercicios:", exercisesError);
    throw new Error(exercisesError.message);
  }

  return routineData;
}

// Función auxiliar para calcular la duración estimada
function calculateEstimatedDuration(exercises: RoutineExercise[]): number {
  // Cálculo básico: 5 minutos por ejercicio de base
  const baseTime = exercises.length * 5;
  
  // Sumar tiempo adicional por cada set (estimando tiempo de descanso)
  const setCount = exercises.reduce((total, ex) => total + ex.sets.length, 0);
  const setTime = setCount * 2; // 2 minutos por set (incluyendo descanso)
  
  return baseTime + setTime;
}
