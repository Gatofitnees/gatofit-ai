
import { supabase } from "@/integrations/supabase/client";
import { preloadedExercises } from "@/data/preloadedExercises";

export const syncExercisesToDatabase = async () => {
  try {
    console.log("Starting exercise synchronization...");
    
    // Fetch existing exercises from the database
    const { data: existingExercises, error } = await supabase
      .from('exercises')
      .select('id, name');
    
    if (error) {
      throw error;
    }
    
    console.log(`Found ${existingExercises?.length || 0} existing exercises in database`);
    
    // Create a map of existing exercise names to their IDs for quick lookup
    const existingExerciseMap = new Map();
    existingExercises?.forEach(ex => {
      existingExerciseMap.set(ex.name, ex.id);
    });
    
    // Get the set of exercise names from preloaded exercises for checking what's valid
    const validExerciseNames = new Set(preloadedExercises.map(ex => ex.name));
    
    // Identify exercises that are no longer in the library and should be removed
    const exercisesToRemove = existingExercises?.filter(ex => !validExerciseNames.has(ex.name)) || [];
    
    // Delete exercises not in the library if any found
    if (exercisesToRemove.length > 0) {
      console.log(`Removing ${exercisesToRemove.length} exercises not in the library`);
      
      // Delete in batches for better performance
      for (const exercise of exercisesToRemove) {
        // Skip critical or special exercises
        if (exercise.id <= 100) {
          console.log(`Skipping removal of core exercise: ${exercise.name} (ID: ${exercise.id})`);
          continue;
        }
        
        // Delete the exercise
        const { error: deleteError } = await supabase
          .from('exercises')
          .delete()
          .eq('id', exercise.id);
        
        if (deleteError) {
          console.error(`Error removing exercise ${exercise.name}:`, deleteError);
        }
      }
    }
    
    // Get exercises that need to be added
    const exercisesToAdd = preloadedExercises.filter(ex => !existingExerciseMap.has(ex.name));
    
    if (exercisesToAdd.length === 0) {
      console.log("All exercises are already in the database. No need to sync.");
      return;
    }
    
    console.log(`Adding ${exercisesToAdd.length} new exercises to the database`);
    
    // Add missing exercises in batches to avoid hitting Supabase limits
    const BATCH_SIZE = 10;
    
    for (let i = 0; i < exercisesToAdd.length; i += BATCH_SIZE) {
      const batch = exercisesToAdd.slice(i, i + BATCH_SIZE);
      
      const { error: insertError } = await supabase
        .from('exercises')
        .insert(batch);
      
      if (insertError) {
        console.error("Error syncing exercises:", insertError);
        throw insertError;
      }
    }
    
    console.log("Exercise synchronization completed");
    
  } catch (error) {
    console.error("Error syncing exercises:", error);
    throw error;
  }
};
