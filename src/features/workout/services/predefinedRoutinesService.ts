
import { supabase } from "@/integrations/supabase/client";
import { Exercise } from "@/data/exercises/exerciseTypes";
import { preloadedExercises } from "@/data/preloadedExercises";

// Find exercises by name
const findExerciseByName = (name: string): Exercise | undefined => {
  return preloadedExercises.find(exercise => 
    exercise.name.toLowerCase().includes(name.toLowerCase())
  );
};

// Create predefined Pecho y Tríceps routine
export const createPredefinedChestRoutine = async () => {
  try {
    // Check if the routine already exists
    const { data: existingRoutines } = await supabase
      .from('routines')
      .select('*')
      .eq('name', 'Pecho y Tríceps')
      .eq('is_predefined', true)
      .maybeSingle();
    
    // If the routine already exists, don't create it again
    if (existingRoutines) {
      console.log('Predefined chest routine already exists');
      return;
    }
    
    // Create the routine
    const { data: routineData, error: routineError } = await supabase
      .from('routines')
      .insert({
        name: 'Pecho y Tríceps',
        description: 'Rutina predefinida para trabajar pecho y tríceps',
        is_predefined: true,
        type: 'strength',
        estimated_duration_minutes: 45
      })
      .select()
      .single();
    
    if (routineError) {
      throw routineError;
    }
    
    // List of exercises to add
    const exercisesToAdd = [
      { name: 'Press inclinado en Smith', sets: 3 },
      { name: 'Press banca plano', sets: 3 },
      { name: 'Aperturas en máquina', sets: 3 },
      { name: 'Extensión de tríceps', sets: 3 },
      { name: 'Elevaciones laterales', sets: 3 }
    ];
    
    // Prepare exercises data for batch insert
    const exercisesData = [];
    
    for (let i = 0; i < exercisesToAdd.length; i++) {
      const exerciseInfo = exercisesToAdd[i];
      const exercise = findExerciseByName(exerciseInfo.name);
      
      if (exercise) {
        // Add sets for this exercise
        for (let setNum = 1; setNum <= exerciseInfo.sets; setNum++) {
          exercisesData.push({
            routine_id: routineData.id,
            exercise_id: exercise.id.toString(), // Convertimos a string para asegurarnos de que coincida el tipo
            exercise_order: i + 1,
            set_number: setNum,
            reps_min: 8,
            reps_max: 12,
            rest_between_sets_seconds: 60
          });
        }
      } else {
        console.warn(`Exercise not found: ${exerciseInfo.name}`);
      }
    }
    
    // Insert routine exercises if we found any
    if (exercisesData.length > 0) {
      const { error: exercisesError } = await supabase
        .from('routine_exercises')
        .insert(exercisesData);
      
      if (exercisesError) {
        throw exercisesError;
      }
    }
    
    console.log('Predefined chest routine created successfully');
    return routineData;
    
  } catch (error) {
    console.error('Error creating predefined chest routine:', error);
    throw error;
  }
};

// Initialize predefined routines
export const initPredefinedRoutines = async () => {
  try {
    await createPredefinedChestRoutine();
  } catch (error) {
    console.error('Error initializing predefined routines:', error);
  }
};
