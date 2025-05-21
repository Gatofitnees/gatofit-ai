
import { supabase } from "@/integrations/supabase/client";

// Sample predefined routines
const predefinedRoutines = [
  {
    name: "Pecho y Tríceps",
    type: "strength",
    description: "Rutina de entrenamiento enfocada en pecho y tríceps",
    estimated_duration_minutes: 45,
    is_predefined: true,
    exercises: [
      {
        name: "Press inclinado en Smith",
        sets: 3,
        reps_min: 8,
        reps_max: 12,
        rest_seconds: 60,
        order: 1
      },
      {
        name: "Press banca plano",
        sets: 3,
        reps_min: 8,
        reps_max: 12,
        rest_seconds: 60,
        order: 2
      },
      {
        name: "Aperturas en máquina",
        sets: 3,
        reps_min: 10,
        reps_max: 15,
        rest_seconds: 60,
        order: 3
      },
      {
        name: "Extensión de tríceps",
        sets: 3,
        reps_min: 10,
        reps_max: 15,
        rest_seconds: 60,
        order: 4
      },
      {
        name: "Elevaciones laterales",
        sets: 3,
        reps_min: 12,
        reps_max: 15,
        rest_seconds: 60,
        order: 5
      }
    ]
  }
];

/**
 * Initialize predefined routines in the database
 */
export const initPredefinedRoutines = async (): Promise<void> => {
  try {
    // Check if we already have predefined routines
    const { data: existingRoutines, error: checkError } = await supabase
      .from('routines')
      .select('id')
      .eq('is_predefined', true)
      .limit(1);
    
    if (checkError) {
      console.error('Error checking predefined routines:', checkError);
      return;
    }
    
    // If predefined routines exist, return early
    if (existingRoutines && existingRoutines.length > 0) {
      console.log('Predefined routines already exist');
      return;
    }
    
    console.log('Creating predefined routines...');
    
    // Process each predefined routine
    for (const routine of predefinedRoutines) {
      // Step 1: Create the routine entry
      const { data: routineData, error: routineError } = await supabase
        .from('routines')
        .insert({
          name: routine.name,
          type: routine.type,
          description: routine.description,
          estimated_duration_minutes: routine.estimated_duration_minutes,
          is_predefined: true
        })
        .select()
        .single();
      
      if (routineError || !routineData) {
        console.error('Error creating predefined routine:', routineError);
        continue;
      }
      
      console.log(`Created routine: ${routine.name} with ID: ${routineData.id}`);
      
      // Step 2: Find or create exercises
      for (const exerciseItem of routine.exercises) {
        // Check if exercise exists
        let { data: existingExercise, error: searchError } = await supabase
          .from('exercises')
          .select('id')
          .eq('name', exerciseItem.name)
          .limit(1)
          .single();
        
        let exerciseId;
        
        if (searchError || !existingExercise) {
          // Create the exercise if it doesn't exist
          const { data: newExercise, error: createError } = await supabase
            .from('exercises')
            .insert({
              name: exerciseItem.name,
              muscle_group_main: 'general'  // Default muscle group
            })
            .select()
            .single();
          
          if (createError || !newExercise) {
            console.error(`Error creating exercise ${exerciseItem.name}:`, createError);
            continue;
          }
          
          exerciseId = newExercise.id;
        } else {
          exerciseId = existingExercise.id;
        }
        
        // Step 3: Create routine_exercises entries
        const { error: linkError } = await supabase
          .from('routine_exercises')
          .insert({
            routine_id: routineData.id,
            exercise_id: exerciseId,
            sets: exerciseItem.sets,
            reps_min: exerciseItem.reps_min,
            reps_max: exerciseItem.reps_max,
            rest_between_sets_seconds: exerciseItem.rest_seconds,
            exercise_order: exerciseItem.order
          });
        
        if (linkError) {
          console.error(`Error linking exercise ${exerciseItem.name} to routine:`, linkError);
        }
      }
    }
    
    console.log('Predefined routines created successfully');
    
  } catch (error) {
    console.error('Error initializing predefined routines:', error);
  }
};

// Let's initialize the sample routine when the app loads
try {
  initPredefinedRoutines();
} catch (error) {
  console.error('Failed to initialize predefined routines:', error);
}
