
import { supabase } from "@/integrations/supabase/client";

// Predefined routine for chest workout
const chestRoutine = {
  name: "Rutina de Pecho y Triceps",
  description: "Rutina para desarrollar fuerza y tamaño en el pecho y tríceps",
  type: "upper_body",
  is_predefined: true,
  estimated_duration_minutes: 45,
  exercises: [
    {
      name: "Press de banca",
      muscle_group_main: "chest",
      equipment_required: "barbell",
      sets: [
        { set_number: 1, reps_min: 12, reps_max: 15, rest_between_sets_seconds: 90 },
        { set_number: 2, reps_min: 10, reps_max: 12, rest_between_sets_seconds: 90 },
        { set_number: 3, reps_min: 8, reps_max: 10, rest_between_sets_seconds: 90 }
      ]
    },
    {
      name: "Press inclinado con mancuernas",
      muscle_group_main: "chest",
      equipment_required: "dumbbell",
      sets: [
        { set_number: 1, reps_min: 12, reps_max: 15, rest_between_sets_seconds: 90 },
        { set_number: 2, reps_min: 10, reps_max: 12, rest_between_sets_seconds: 90 },
        { set_number: 3, reps_min: 8, reps_max: 10, rest_between_sets_seconds: 90 }
      ]
    },
    {
      name: "Aperturas con cable",
      muscle_group_main: "chest",
      equipment_required: "cable",
      sets: [
        { set_number: 1, reps_min: 12, reps_max: 15, rest_between_sets_seconds: 60 },
        { set_number: 2, reps_min: 12, reps_max: 15, rest_between_sets_seconds: 60 },
        { set_number: 3, reps_min: 12, reps_max: 15, rest_between_sets_seconds: 60 }
      ]
    },
    {
      name: "Extensiones de tríceps con cuerda",
      muscle_group_main: "triceps",
      equipment_required: "cable",
      sets: [
        { set_number: 1, reps_min: 12, reps_max: 15, rest_between_sets_seconds: 60 },
        { set_number: 2, reps_min: 12, reps_max: 15, rest_between_sets_seconds: 60 },
        { set_number: 3, reps_min: 12, reps_max: 15, rest_between_sets_seconds: 60 }
      ]
    },
    {
      name: "Fondos en banco",
      muscle_group_main: "triceps",
      equipment_required: "bodyweight",
      sets: [
        { set_number: 1, reps_min: 12, reps_max: 15, rest_between_sets_seconds: 60 },
        { set_number: 2, reps_min: 12, reps_max: 15, rest_between_sets_seconds: 60 },
        { set_number: 3, reps_min: 12, reps_max: 15, rest_between_sets_seconds: 60 }
      ]
    }
  ]
};

// Predefined routine for full body workout
const fullBodyRoutine = {
  name: "Entrenamiento Full Body",
  description: "Entrenamiento completo para todo el cuerpo en una sesión",
  type: "full_body",
  is_predefined: true,
  estimated_duration_minutes: 60,
  exercises: [
    {
      name: "Sentadillas",
      muscle_group_main: "quadriceps",
      equipment_required: "barbell",
      sets: [
        { set_number: 1, reps_min: 10, reps_max: 12, rest_between_sets_seconds: 90 },
        { set_number: 2, reps_min: 10, reps_max: 12, rest_between_sets_seconds: 90 },
        { set_number: 3, reps_min: 10, reps_max: 12, rest_between_sets_seconds: 90 }
      ]
    },
    {
      name: "Press militar",
      muscle_group_main: "shoulders",
      equipment_required: "barbell",
      sets: [
        { set_number: 1, reps_min: 10, reps_max: 12, rest_between_sets_seconds: 90 },
        { set_number: 2, reps_min: 10, reps_max: 12, rest_between_sets_seconds: 90 },
        { set_number: 3, reps_min: 10, reps_max: 12, rest_between_sets_seconds: 90 }
      ]
    },
    {
      name: "Remo con barra",
      muscle_group_main: "back",
      equipment_required: "barbell",
      sets: [
        { set_number: 1, reps_min: 10, reps_max: 12, rest_between_sets_seconds: 90 },
        { set_number: 2, reps_min: 10, reps_max: 12, rest_between_sets_seconds: 90 },
        { set_number: 3, reps_min: 10, reps_max: 12, rest_between_sets_seconds: 90 }
      ]
    },
    {
      name: "Peso muerto",
      muscle_group_main: "lower_back",
      equipment_required: "barbell",
      sets: [
        { set_number: 1, reps_min: 8, reps_max: 10, rest_between_sets_seconds: 120 },
        { set_number: 2, reps_min: 8, reps_max: 10, rest_between_sets_seconds: 120 },
        { set_number: 3, reps_min: 8, reps_max: 10, rest_between_sets_seconds: 120 }
      ]
    },
    {
      name: "Curl de bíceps con barra",
      muscle_group_main: "biceps",
      equipment_required: "barbell",
      sets: [
        { set_number: 1, reps_min: 12, reps_max: 15, rest_between_sets_seconds: 60 },
        { set_number: 2, reps_min: 12, reps_max: 15, rest_between_sets_seconds: 60 },
        { set_number: 3, reps_min: 12, reps_max: 15, rest_between_sets_seconds: 60 }
      ]
    },
    {
      name: "Abdominales",
      muscle_group_main: "abs",
      equipment_required: "bodyweight",
      sets: [
        { set_number: 1, reps_min: 15, reps_max: 20, rest_between_sets_seconds: 60 },
        { set_number: 2, reps_min: 15, reps_max: 20, rest_between_sets_seconds: 60 },
        { set_number: 3, reps_min: 15, reps_max: 20, rest_between_sets_seconds: 60 }
      ]
    }
  ]
};

// Predefined routine for HIIT cardio workout
const hiitCardioRoutine = {
  name: "HIIT Cardio",
  description: "Entrenamiento de alta intensidad para mejorar la resistencia cardiovascular",
  type: "cardio",
  is_predefined: true,
  estimated_duration_minutes: 30,
  exercises: [
    {
      name: "Burpees",
      muscle_group_main: "full_body",
      equipment_required: "bodyweight",
      sets: [
        { set_number: 1, reps_min: 10, reps_max: 15, rest_between_sets_seconds: 30 },
        { set_number: 2, reps_min: 10, reps_max: 15, rest_between_sets_seconds: 30 },
        { set_number: 3, reps_min: 10, reps_max: 15, rest_between_sets_seconds: 30 },
        { set_number: 4, reps_min: 10, reps_max: 15, rest_between_sets_seconds: 30 }
      ]
    },
    {
      name: "Mountain climbers",
      muscle_group_main: "core",
      equipment_required: "bodyweight",
      sets: [
        { set_number: 1, reps_min: 20, reps_max: 30, rest_between_sets_seconds: 30 },
        { set_number: 2, reps_min: 20, reps_max: 30, rest_between_sets_seconds: 30 },
        { set_number: 3, reps_min: 20, reps_max: 30, rest_between_sets_seconds: 30 },
        { set_number: 4, reps_min: 20, reps_max: 30, rest_between_sets_seconds: 30 }
      ]
    },
    {
      name: "Jumping jacks",
      muscle_group_main: "full_body",
      equipment_required: "bodyweight",
      sets: [
        { set_number: 1, reps_min: 30, reps_max: 40, rest_between_sets_seconds: 30 },
        { set_number: 2, reps_min: 30, reps_max: 40, rest_between_sets_seconds: 30 },
        { set_number: 3, reps_min: 30, reps_max: 40, rest_between_sets_seconds: 30 },
        { set_number: 4, reps_min: 30, reps_max: 40, rest_between_sets_seconds: 30 }
      ]
    },
    {
      name: "High knees",
      muscle_group_main: "legs",
      equipment_required: "bodyweight",
      sets: [
        { set_number: 1, reps_min: 30, reps_max: 40, rest_between_sets_seconds: 30 },
        { set_number: 2, reps_min: 30, reps_max: 40, rest_between_sets_seconds: 30 },
        { set_number: 3, reps_min: 30, reps_max: 40, rest_between_sets_seconds: 30 },
        { set_number: 4, reps_min: 30, reps_max: 40, rest_between_sets_seconds: 30 }
      ]
    }
  ]
};

// Get or create a predefined exercise
const getOrCreateExercise = async (exerciseName: string, muscleGroup: string, equipment: string) => {
  // Try to find the exercise first
  const { data: existingExercise, error: searchError } = await supabase
    .from('exercises')
    .select('id')
    .eq('name', exerciseName)
    .eq('muscle_group_main', muscleGroup)
    .single();

  if (searchError && searchError.code !== 'PGRST116') {
    throw searchError;
  }

  if (existingExercise) {
    return existingExercise.id;
  }

  // If exercise doesn't exist, create it
  const { data: newExercise, error: insertError } = await supabase
    .from('exercises')
    .insert({
      name: exerciseName,
      muscle_group_main: muscleGroup,
      equipment_required: equipment
    })
    .select('id')
    .single();

  if (insertError) {
    console.error("Error creating exercise", insertError);
    throw insertError;
  }

  return newExercise.id;
};

// Create a predefined routine
const createPredefinedRoutine = async (routine: any) => {
  try {
    // Check if routine already exists
    const { data: existingRoutine, error: searchError } = await supabase
      .from('routines')
      .select('id')
      .eq('name', routine.name)
      .eq('is_predefined', true)
      .maybeSingle();

    if (searchError) {
      console.error("Error checking existing routine", searchError);
      throw searchError;
    }

    // If routine already exists, don't recreate it
    if (existingRoutine) {
      console.log(`Routine "${routine.name}" already exists with id ${existingRoutine.id}`);
      return existingRoutine.id;
    }

    // Create the routine
    const { data: newRoutine, error: routineError } = await supabase
      .from('routines')
      .insert({
        name: routine.name,
        description: routine.description,
        type: routine.type,
        is_predefined: routine.is_predefined,
        estimated_duration_minutes: routine.estimated_duration_minutes
      })
      .select('id')
      .single();

    if (routineError) {
      console.error(`Error creating predefined ${routine.name} routine:`, routineError);
      throw routineError;
    }

    console.log(`Created routine "${routine.name}" with id ${newRoutine.id}`);

    // Process exercises
    for (let i = 0; i < routine.exercises.length; i++) {
      const exercise = routine.exercises[i];
      
      // Get or create exercise
      const exerciseId = await getOrCreateExercise(
        exercise.name,
        exercise.muscle_group_main,
        exercise.equipment_required
      );

      // Add sets for this exercise
      for (const set of exercise.sets) {
        const { error: setError } = await supabase
          .from('routine_exercises')
          .insert({
            routine_id: newRoutine.id,
            exercise_id: exerciseId,
            exercise_order: i + 1,
            set_number: set.set_number,
            reps_min: set.reps_min,
            reps_max: set.reps_max,
            rest_between_sets_seconds: set.rest_between_sets_seconds
          });

        if (setError) {
          console.error("Error creating exercise set", setError);
          throw setError;
        }
      }
    }

    return newRoutine.id;
  } catch (error) {
    console.error("Error in createPredefinedRoutine:", error);
    throw error;
  }
};

// Initialize all predefined routines
export const initPredefinedRoutines = async () => {
  try {
    await createPredefinedRoutine(chestRoutine);
    await createPredefinedRoutine(fullBodyRoutine);
    await createPredefinedRoutine(hiitCardioRoutine);
    console.log("All predefined routines initialized successfully");
  } catch (error) {
    console.error("Error initializing predefined routines:", error);
    throw error;
  }
};
