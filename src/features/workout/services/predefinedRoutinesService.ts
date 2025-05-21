
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
            exercise_id: parseInt(exercise.id.toString()), // Convertimos a número explícitamente
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

// Create predefined Full Body Workout routine
export const createPredefinedFullBodyRoutine = async () => {
  try {
    // Check if the routine already exists
    const { data: existingRoutines } = await supabase
      .from('routines')
      .select('*')
      .eq('name', 'Full Body Workout')
      .eq('is_predefined', true)
      .maybeSingle();
    
    // If the routine already exists, don't create it again
    if (existingRoutines) {
      console.log('Predefined full body routine already exists');
      return;
    }
    
    // Create the routine
    const { data: routineData, error: routineError } = await supabase
      .from('routines')
      .insert({
        name: 'Full Body Workout',
        description: 'Rutina completa para trabajar todo el cuerpo en una sesión',
        is_predefined: true,
        type: 'strength',
        estimated_duration_minutes: 60
      })
      .select()
      .single();
    
    if (routineError) {
      throw routineError;
    }
    
    // List of exercises to add with more variety
    const exercisesToAdd = [
      { name: 'Sentadilla', sets: 4 },
      { name: 'Press banca plano', sets: 3 },
      { name: 'Peso muerto', sets: 4 },
      { name: 'Dominadas', sets: 3 },
      { name: 'Curl Biceps', sets: 3 },
      { name: 'Extensión de tríceps', sets: 3 },
      { name: 'Elevaciones laterales', sets: 3 },
      { name: 'Abdominal crunch', sets: 3 }
    ];
    
    // Prepare exercises data for batch insert
    const exercisesData = [];
    
    for (let i = 0; i < exercisesToAdd.length; i++) {
      const exerciseInfo = exercisesToAdd[i];
      const exercise = findExerciseByName(exerciseInfo.name);
      
      if (exercise) {
        // Add sets for this exercise
        for (let setNum = 1; setNum <= exerciseInfo.sets; setNum++) {
          // Vary the reps and rest for more realism
          const repsMin = exercise.name.includes('Sentadilla') || exercise.name.includes('Peso muerto') ? 5 : 8;
          const repsMax = exercise.name.includes('Sentadilla') || exercise.name.includes('Peso muerto') ? 8 : 12;
          const rest = exercise.name.includes('Sentadilla') || exercise.name.includes('Peso muerto') ? 120 : 60;
          
          exercisesData.push({
            routine_id: routineData.id,
            exercise_id: parseInt(exercise.id.toString()),
            exercise_order: i + 1,
            set_number: setNum,
            reps_min: repsMin,
            reps_max: repsMax,
            rest_between_sets_seconds: rest
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
    
    console.log('Predefined full body routine created successfully');
    return routineData;
    
  } catch (error) {
    console.error('Error creating predefined full body routine:', error);
    throw error;
  }
};

// Create a predefined HIIT Cardio routine
export const createPredefinedHiitRoutine = async () => {
  try {
    // Check if the routine already exists
    const { data: existingRoutines } = await supabase
      .from('routines')
      .select('*')
      .eq('name', 'HIIT Quemagrasa')
      .eq('is_predefined', true)
      .maybeSingle();
    
    // If the routine already exists, don't create it again
    if (existingRoutines) {
      console.log('Predefined HIIT routine already exists');
      return;
    }
    
    // Create the routine
    const { data: routineData, error: routineError } = await supabase
      .from('routines')
      .insert({
        name: 'HIIT Quemagrasa',
        description: 'Rutina de alta intensidad para quemar grasa en poco tiempo',
        is_predefined: true,
        type: 'cardio',
        estimated_duration_minutes: 30
      })
      .select()
      .single();
    
    if (routineError) {
      throw routineError;
    }
    
    // List of exercises to add - focusing on cardio exercises
    const exercisesToAdd = [
      { name: 'Burpees', sets: 4 },
      { name: 'Mountain climbers', sets: 4 },
      { name: 'Jumping jacks', sets: 4 },
      { name: 'High knees', sets: 4 },
      { name: 'Jumping rope', sets: 4 },
      { name: 'Sprints', sets: 4 }
    ];
    
    // Prepare exercises data for batch insert
    const exercisesData = [];
    
    for (let i = 0; i < exercisesToAdd.length; i++) {
      const exerciseInfo = exercisesToAdd[i];
      const exercise = findExerciseByName(exerciseInfo.name);
      
      if (exercise) {
        // For HIIT, we'll use time-based sets instead of reps
        for (let setNum = 1; setNum <= exerciseInfo.sets; setNum++) {
          exercisesData.push({
            routine_id: routineData.id,
            exercise_id: parseInt(exercise.id.toString()),
            exercise_order: i + 1,
            set_number: setNum,
            reps_min: 0, // For time-based exercises
            reps_max: 0, // For time-based exercises
            rest_between_sets_seconds: 30 // Short rest for HIIT
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
    
    console.log('Predefined HIIT routine created successfully');
    return routineData;
    
  } catch (error) {
    console.error('Error creating predefined HIIT routine:', error);
    throw error;
  }
};

// Initialize predefined routines
export const initPredefinedRoutines = async () => {
  try {
    // Create all predefined routines
    await createPredefinedChestRoutine();
    await createPredefinedFullBodyRoutine();
    await createPredefinedHiitRoutine();
    console.log("All predefined routines initialized successfully");
  } catch (error) {
    console.error('Error initializing predefined routines:', error);
  }
};
